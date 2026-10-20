import { createHash, createHmac, randomBytes, randomInt, randomUUID, timingSafeEqual } from "node:crypto";
import { mkdir, unlink } from "node:fs/promises";
import path from "node:path";
import { createPool } from "mysql2/promise";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import bcrypt from "bcryptjs";
import multer from "multer";
import nodemailer from "nodemailer";

/*
 * Fieldnote API
 *
 * Compatible with the new e-learning schema:
 * users.full_name
 * subjects -> courses -> modules -> lessons
 * assessments.type
 * questions.question_text
 * answer_options.option_key / option_text / is_correct
 *
 * SMTP credentials are intentionally read from .env.local.
 * Do NOT hard-code your Gmail App Password in this file.
 */

const port = getPositiveInt(process.env.API_PORT, 4000);
const host = process.env.API_HOST?.trim() || "127.0.0.1";
const sessionCookie = "fieldnote_session";
const sessionLifetimeSeconds = 60 * 60 * 24 * 7;
const verificationCodeLifetimeMinutes = 10;
const maxVerificationCodeAttempts = 5;
const maxCodesPerHour = 5;
const clientOrigin = process.env.CLIENT_ORIGIN?.trim() || "http://localhost:3000";

let mailTransporter = null;
let server = null;

const pool = createPool({
  host: process.env.DB_HOST ?? "127.0.0.1",
  port: getPositiveInt(process.env.DB_PORT, 3306),
  user: process.env.DB_USER ?? "",
  password: process.env.DB_PASSWORD ?? "",
  database: process.env.DB_NAME ?? "school",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  charset: "utf8mb4",
  timezone: "Z",
});

const app = express();
const ALLOWED_ADMIN_FILE_TYPES = {
  PDF: [".pdf"],
  Video: [".mp4", ".webm"],
  Quiz: [".json", ".csv", ".pdf"],
};
const adminUpload = multer({
  storage: multer.diskStorage({
    destination: (_request, _file, callback) => {
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      mkdir(uploadDir, { recursive: true })
        .then(() => callback(null, uploadDir))
        .catch(callback);
    },
    filename: (_request, file, callback) => {
      const ext = path.extname(file.originalname).toLowerCase();
      callback(null, `${randomUUID()}${ext}`);
    },
  }),
  limits: { fileSize: 25 * 1024 * 1024 },
});

app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use(helmet());
app.use((request, response, next) => {
  response.header("Access-Control-Allow-Origin", clientOrigin);
  response.header("Access-Control-Allow-Credentials", "true");
  response.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  response.header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  if (request.method === "OPTIONS") return response.sendStatus(204);
  return next();
});
app.use(express.json({ limit: "16kb" }));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { message: "Too many authentication requests. Try again later." },
});

function getPositiveInt(value, fallback) {
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function requireSessionSecret() {
  const secret = process.env.AUTH_SESSION_SECRET?.trim();
  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SESSION_SECRET must be set to at least 32 characters.");
  }
  return secret;
}

function validateRuntimeConfig() {
  const required = [
    ["DB_HOST", process.env.DB_HOST],
    ["DB_USER", process.env.DB_USER],
    ["DB_NAME", process.env.DB_NAME],
    ["AUTH_SESSION_SECRET", process.env.AUTH_SESSION_SECRET],
    ["SMTP_USER", process.env.SMTP_USER],
    ["SMTP_PASSWORD", process.env.SMTP_PASSWORD],
    ["SMTP_FROM", process.env.SMTP_FROM],
  ];

  const missing = required.filter(([, value]) => !String(value ?? "").trim()).map(([key]) => key);
  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }

  requireSessionSecret();

  const smtpPort = getPositiveInt(process.env.SMTP_PORT, 587);
  if (smtpPort < 1 || smtpPort > 65535) {
    throw new Error("SMTP_PORT must be between 1 and 65535.");
  }
}

function getMailTransporter() {
  const hostName = process.env.SMTP_HOST?.trim() || "smtp.gmail.com";
  const from = process.env.SMTP_FROM?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASSWORD?.trim();
  const smtpPort = getPositiveInt(process.env.SMTP_PORT, 587);
  const secure = process.env.SMTP_SECURE === "true" || smtpPort === 465;

  if (!from || !user || !pass) return null;

  if (!mailTransporter) {
    mailTransporter = nodemailer.createTransport({
      host: hostName,
      port: smtpPort,
      secure,
      auth: { user, pass },
      connectionTimeout: 15_000,
      greetingTimeout: 15_000,
      socketTimeout: 20_000,
    });
  }

  return mailTransporter;
}

async function verifyMailConnection() {
  const transporter = getMailTransporter();
  if (!transporter) {
    throw new Error("SMTP is not configured. Check SMTP_USER, SMTP_PASSWORD and SMTP_FROM.");
  }

  try {
    await transporter.verify();
    console.log("✅ Gmail SMTP connection successful");
  } catch (error) {
    console.warn("⚠️ SMTP verification failed. The API will still start, but email sign-in may not work until credentials are fixed.");
    console.warn(error?.message ?? error);
  }
}

async function initializeDatabase() {
  const connection = await pool.getConnection();
  try {
    await connection.query("SELECT 1 AS ok");

    // Keep signup verification available when the auth table is not imported.
    await connection.query(`
      CREATE TABLE IF NOT EXISTS email_2fa_challenges (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        user_id BIGINT UNSIGNED NOT NULL,
        token_hash CHAR(64) NOT NULL,
        code_hash CHAR(64) NOT NULL,
        purpose ENUM('login', 'signup') NOT NULL DEFAULT 'login',
        expires_at DATETIME NOT NULL,
        sent_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        attempts INT NOT NULL DEFAULT 0,
        used_at DATETIME NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY uq_2fa_token_hash (token_hash),
        KEY idx_2fa_user_id (user_id),
        KEY idx_2fa_expires_at (expires_at),
        CONSTRAINT fk_2fa_user
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    console.log("✅ MySQL database connection successful");
    console.log("✅ 2FA table is ready");
  } finally {
    connection.release();
  }
}

function setSessionCookie(response, user) {
  const token = createSessionToken(user);
  if (!token) return false;

  const parts = [
    `${sessionCookie}=${encodeURIComponent(token)}`,
    "Path=/",
    `Max-Age=${sessionLifetimeSeconds}`,
    "HttpOnly",
    "SameSite=Lax",
  ];
  if (process.env.NODE_ENV === "production") parts.push("Secure");

  response.setHeader("Set-Cookie", parts.join("; "));
  return true;
}

function clearSessionCookie(response) {
  const parts = [
    `${sessionCookie}=`,
    "Path=/",
    "Max-Age=0",
    "HttpOnly",
    "SameSite=Lax",
  ];
  if (process.env.NODE_ENV === "production") parts.push("Secure");
  response.setHeader("Set-Cookie", parts.join("; "));
}

function getCookie(request, name) {
  const cookieHeader = request.headers.cookie ?? "";
  const entry = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`));

  if (!entry) return null;

  try {
    return decodeURIComponent(entry.slice(name.length + 1));
  } catch {
    return null;
  }
}

function createSessionToken(user) {
  let secret;
  try {
    secret = requireSessionSecret();
  } catch {
    return null;
  }

  const encodedPayload = Buffer.from(JSON.stringify({
    sub: Number(user.id),
    email: user.email,
    name: user.name,
    exp: Math.floor(Date.now() / 1000) + sessionLifetimeSeconds,
  })).toString("base64url");

  const signature = createHmac("sha256", secret)
    .update(encodedPayload)
    .digest("base64url");

  return `${encodedPayload}.${signature}`;
}

function readSessionToken(token) {
  let secret;
  try {
    secret = requireSessionSecret();
  } catch {
    return null;
  }

  if (!token) return null;

  const [encodedPayload, signature, extra] = token.split(".");
  if (!encodedPayload || !signature || extra) return null;

  const expected = createHmac("sha256", secret).update(encodedPayload).digest();
  let received;
  try {
    received = Buffer.from(signature, "base64url");
  } catch {
    return null;
  }

  if (received.length !== expected.length || !timingSafeEqual(received, expected)) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8"));
    if (!Number.isSafeInteger(payload.sub) || payload.exp <= Math.floor(Date.now() / 1000)) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

async function requireAdmin(request, response, next) {
  try {
    const session = readSessionToken(
      getCookie(request, sessionCookie)
    );

    if (!session) {
      return response.status(401).json({
        message: "Not authenticated",
      });
    }

    const [rows] = await pool.execute(
      `SELECT id, full_name, email, role, is_active
       FROM users
       WHERE id = ?
       LIMIT 1`,
      [Number(session.sub)]
    );

    const user = rows[0];

    if (!user || Number(user.is_active) !== 1) {
      clearSessionCookie(response);

      return response.status(401).json({
        message: "Your session is invalid or your account is inactive.",
      });
    }

    if (user.role !== "admin") {
      return response.status(403).json({
        message: "Administrator access required.",
      });
    }

    request.authUser = {
      id: Number(user.id),
      name: user.full_name,
      email: user.email,
      role: user.role,
    };

    return next();
  } catch (error) {
    return next(error);
  }
}

function hashChallengeToken(token) {
  return createHash("sha256").update(token).digest("hex");
}

function hashVerificationCode(token, code) {
  return createHmac("sha256", requireSessionSecret())
    .update(`${token}:${code}`)
    .digest("hex");
}

function verificationCodeMatches(token, code, expectedHash) {
  if (typeof expectedHash !== "string" || !/^[a-f0-9]{64}$/i.test(expectedHash)) return false;
  const candidate = Buffer.from(hashVerificationCode(token, code), "hex");
  const expected = Buffer.from(expectedHash, "hex");
  return candidate.length === expected.length && timingSafeEqual(candidate, expected);
}

async function sendVerificationCode(email, code) {
  const transporter = getMailTransporter();
  if (!transporter) throw new Error("SMTP_NOT_CONFIGURED");

  const from = process.env.SMTP_FROM?.trim() || process.env.SMTP_USER?.trim();
  if (!from) throw new Error("SMTP_FROM_NOT_CONFIGURED");

  await transporter.sendMail({
    from,
    to: email,
    subject: "Verify your Fieldnote account",
    text: `Your Fieldnote account verification code is ${code}. It expires in ${verificationCodeLifetimeMinutes} minutes. If you did not request this code, you can ignore this email.`,
    html: `<p>Your Fieldnote account verification code is:</p><p style="font-size:28px;font-weight:700;letter-spacing:8px">${code}</p><p>It expires in ${verificationCodeLifetimeMinutes} minutes. If you did not request this code, you can ignore this email.</p>`,
  });
}

function mapCourseSummary(row) {
  return {
    id: Number(row.id),
    title: row.title,
    subject: getCourseSubject(row.title, row.subject),
    subjectId: row.subject_id === null ? null : Number(row.subject_id),
    level: row.level,
    description: row.description,
    thumbnailUrl: row.thumbnail_url || getCourseImage(row),
    instructorName: row.instructor_name,
    durationMinutes: Number(row.duration_minutes ?? 0),
    lessonCount: Number(row.lesson_count ?? 0),
    quizCount: Number(row.quiz_count ?? 0),
    examQuestionCount: Number(row.exam_question_count ?? 0),
    examPassingScore: row.exam_passing_score === null ? null : Number(row.exam_passing_score),
  };
}

const subjectImages = {
  Science: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=900&q=80",
  Mathematics: "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=900&q=80",
  English: "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&w=900&q=80",
  History: "https://images.unsplash.com/photo-1461360228754-6e81c478b882?auto=format&fit=crop&w=900&q=80",
  Technology: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80",
  Business: "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=900&q=80",
  Art: "https://images.unsplash.com/photo-1561214115-f2f134cc4912?auto=format&fit=crop&w=900&q=80",
  Languages: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=900&q=80",
  Geography: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=900&q=80",
  "Computer Science": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80",
  Health: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=900&q=80",
  Music: "https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?auto=format&fit=crop&w=900&q=80",
};
const fallbackSubjectImage =
  "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1000&q=80";

function getSubjectImage(subject) {
  return subjectImages[subject] ?? fallbackSubjectImage;
}

const courseBannerImages = [
  "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1461360228754-6e81c478b882?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1561214115-f2f134cc4912?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1524666041070-9cffc8c7a4d0?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=85",
];

function getCourseImage(course) {
  const title = String(course.title ?? "").toLowerCase();
  const imageIndex = /agricultural science/.test(title) ? 13
    : /basic science|biology/.test(title) ? 14
      : /chemistry/.test(title) ? 3
        : /physics/.test(title) ? 15
          : /mathematics/.test(title) ? 4
            : /accounting|business studies|economics/.test(title) ? 7
              : /civic education|government|social studies/.test(title) ? 5
                : /english studies|literature in english/.test(title) ? 6
                  : /physical and health education|physical education/.test(title) ? 16
                    : /basic technology/.test(title) ? 17
                      : /computer studies|^(c\+\+|c#|cobol|css|dart|html|java|javascript|php|python|ruby|typescript)$/.test(title) ? 1
                        : -1;
  return imageIndex >= 0 ? courseBannerImages[imageIndex] : getSubjectImage(course.subject);
}

function getCourseSubject(title, subject) {
  const name = String(title ?? "").toLowerCase();
  if (/agricultural science/.test(name)) return "Agriculture";
  if (/basic science|biology|chemistry|physics/.test(name)) return "Science";
  if (/mathematics/.test(name)) return "Mathematics";
  if (/accounting|business studies|economics/.test(name)) return "Business";
  if (/civic education|government|social studies/.test(name)) return "Social Studies";
  if (/english studies|literature in english/.test(name)) return "English";
  if (/physical and health education|physical education/.test(name)) return "Health & PE";
  if (/basic technology/.test(name)) return "Technology";
  if (/computer studies|^(c\+\+|c#|cobol|css|dart|html|java|javascript|php|python|ruby|typescript)$/.test(name)) return "Computer Science";
  return subject;
}

function cleanLessonTitle(title) {
  return String(title ?? "")
    .replace(/^\d+(?:\.\d+)?\s*/, "")
    .trim();
}

function htmlLessonContent(title) {
  const topic = cleanLessonTitle(title);
  const lower = topic.toLowerCase();

  if (lower === "html document structure") {
    return {
      objective:
        "Explain the purpose of the HTML document structure, identify the role of doctype, html, head, title, meta and body elements, and create a valid basic web page.",
      content: `# HTML document structure

### Learning Objectives

By the end of this lesson, you should be able to:

- explain what HTML document structure means;
- identify the purpose of the doctype, html, head, title, meta and body elements;
- create a basic HTML document and open it in a browser;
- make a small change to the document and predict the result.

### Introduction

Every HTML page has a structure. The browser reads that structure from top to bottom and uses the elements to build the document that the user sees. Learning the structure first makes later topics such as headings, links, images and forms much easier.

### Detailed Explanation

An HTML document normally has a document type declaration, one root html element, a head section and a body section.

- **DOCTYPE** tells the browser that the document uses modern HTML.
- **html** is the root element that contains the whole document.
- **head** contains information about the page that is not normally displayed as page content.
- **meta charset** tells the browser which character encoding to use.
- **title** supplies the text shown in the browser tab.
- **body** contains the visible page content.

### Code Example

\`\`\`html
<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>My School</title>
</head>
<body>
  <h1>Welcome to my school</h1>
</body>
</html>
\`\`\`

### Line-by-Line Walkthrough

1. **<code><!doctype html></code>** — Declares the document as an HTML5 document. It is a declaration, not a normal HTML element.
2. **<code><html lang="en"></code>** — Starts the root HTML element. The <code>lang</code> attribute tells browsers and assistive technologies that the main language is English.
3. **<code><head></code>** — Starts the head section, where document information such as the title and metadata is placed.
4. **<code><meta charset="UTF-8"></code>** — Sets the character encoding to UTF-8 so the browser can correctly handle a wide range of characters.
5. **<code><title>My School</title></code>** — Sets the page title displayed in the browser tab or window title.
6. **<code></head></code>** — Closes the head section.
7. **<code><body></code>** — Starts the section containing the content displayed on the page.
8. **<code><h1>Welcome to my school</h1></code>** — Creates the main heading visible on the page. The <code>h1</code> element represents the page's primary heading.
9. **<code></body></code>** — Closes the visible page-content section.
10. **<code></html></code>** — Closes the root HTML element and therefore ends the document.

### What the Browser Does

The browser does not display the tags themselves as ordinary text. It interprets the markup and builds a document tree. In this example, the browser tab shows **My School**, while the page displays **Welcome to my school** as the main heading.

### Change the Code

Change the title and heading:

\`\`\`html
<title>PStacks Secondary School</title>
<h1>Welcome to PStacks Secondary School</h1>
\`\`\`

Save the file, refresh the browser and explain which change affected the browser tab and which change affected the page.

### Common Mistakes

- forgetting to close an element that requires a closing tag;
- placing visible page content inside the head instead of the body;
- using a different character encoding without understanding the effect;
- confusing the document title with the visible <code>h1</code> heading;
- forgetting the <code>lang</code> attribute on the root element.

### Practical Activity

Create a school home page containing a page title, the school's name as an <code>h1</code>, one short paragraph and a second heading for **Our Subjects**. Open it in a browser and inspect the HTML structure with the browser developer tools.

### Quick Check

1. What is the purpose of <code><!doctype html></code>?
2. What belongs inside <code><head></code>?
3. Where should visible page content be placed?
4. What is the difference between <code><title></code> and <code><h1></code>?
5. Why is <code>lang="en"</code> useful?

### Summary

HTML structure gives the browser a clear hierarchy for the page. Once you understand the relationship between the document declaration, root element, head and body, you have a foundation for building complete web pages.`,
    };
  }

  const topicMap = [
    ["text, headings and paragraphs", "Use heading elements to create a clear hierarchy and paragraph elements for blocks of text. A page should normally have one main h1 and then use h2 and h3 headings according to the content structure."],
    ["links and navigation", "Links use the anchor element. The href attribute identifies the destination, while meaningful link text tells users where the link leads. Navigation should connect related pages without relying on vague labels such as 'click here'."],
    ["lists", "HTML provides unordered lists for items where order does not matter and ordered lists where sequence matters. List items belong inside ul or ol elements rather than being separated with manual hyphens."],
    ["images and image alternatives", "Images are inserted with the img element. The src attribute identifies the image resource and alt provides a text alternative. Informative images need meaningful alternatives; decorative images can use an empty alt attribute."],
    ["tables", "Tables represent relationships between rows and columns of data. Use table, thead, tbody, tr, th and td according to their roles, and use th for headings rather than using bold text to imitate a table heading."],
    ["forms and form controls", "Forms collect user input. Labels should be connected to their controls, names identify submitted values, and appropriate input types help browsers validate and present controls correctly."],
    ["semantic html", "Semantic elements communicate the purpose of content. Elements such as header, nav, main, section, article, aside and footer make the document easier for browsers, search engines and assistive technologies to understand."],
    ["html validation and debugging", "Validation and browser developer tools help you find structural problems. Check nesting, missing closing tags, invalid attributes and incorrect paths before changing several parts of a page at once."],
    ["audio and video", "The audio and video elements provide native controls for media. Include controls when users need playback controls and provide useful fallback text or source formats when appropriate."],
    ["embedding external content", "The iframe element can embed another document, such as a trusted map or video player. External content should be selected carefully and given an accessible title."],
    ["form labels and accessibility", "A form control needs a clear label. The label element can reference a control through its for and id attributes, making the form easier to use with keyboards and assistive technologies."],
    ["page metadata", "Metadata describes the document to browsers, search engines and sharing systems. Common examples include charset, viewport and a useful title."],
    ["responsive images", "Responsive image techniques allow a browser to choose an appropriate image resource for the available space and screen resolution. The picture element and srcset are useful when different image versions are needed."],
    ["accessible navigation", "Navigation should have a clear structure, meaningful link names and a predictable keyboard order. A nav element identifies a major navigation area."],
    ["content organization", "Good HTML separates content into meaningful sections instead of using empty div elements for everything. Structure the page according to the information users need to understand."],
    ["web page structure planning", "Plan the page before writing markup. Identify the main content, navigation, supporting information and footer, then choose semantic elements that match those roles."],
    ["multi-section school page", "A school page can combine header, navigation, main content, sections for subjects or announcements, and a footer. Each section should have a clear purpose and appropriate heading."],
    ["article and news page", "An article page should identify the article itself, its heading, author or publication information where relevant, and the main content. The article element is appropriate for a self-contained piece of content."],
    ["contact and registration form", "A registration form should collect only necessary information, use labels and suitable input types, and provide clear instructions. Required fields should be marked with the required attribute when appropriate."],
    ["student profile page", "A student profile can use headings, paragraphs, lists and semantic sections to present a name, class, interests, subjects and achievements in a readable hierarchy."],
    ["media-rich lesson page", "A media-rich lesson combines explanatory text with images, audio or video. Keep the text understandable on its own and provide alternatives for important media."],
    ["accessible course page", "An accessible course page uses semantic landmarks, logical headings, visible focus states and meaningful labels so learners can navigate it with different input methods."],
    ["mini website assembly", "A small website is easier to maintain when common structure is planned consistently across pages. Keep navigation labels, headings and document structure predictable."],
    ["reviewing html with browser tools", "Browser developer tools let you inspect the live DOM, attributes, styles and accessibility information. Use the inspector to understand what the browser actually built from your source."],
    ["html project cleanup", "Project cleanup means removing invalid markup, unnecessary wrappers, duplicate content and unclear labels. Check paths, indentation and heading order before considering the page finished."],
    ["html project review", "Review the final page for valid structure, readable content, useful navigation, accessible labels and appropriate alternatives for images and media."]
  ];

  const match = topicMap.find(([name]) => lower.includes(name));
  const explanation = match?.[1] ??
    `This lesson focuses on **${topic}**. Read the topic as a practical HTML skill: identify the element or attribute involved, understand what it represents, use it in a small page, and inspect the result in a browser.`;

  return {
    objective: `Explain ${topic.toLowerCase()}, use the appropriate HTML elements and attributes, and apply the idea in a small school web page.`,
    content: `# ${topic}

### Introduction

HTML describes the structure and meaning of web content. In this lesson, the focus is **${topic}**. The goal is not to memorise tags in isolation, but to understand why an element is appropriate and how the browser interprets it.

### Detailed Explanation

${explanation}

### Example

\`\`\`html
<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>School Example</title>
</head>
<body>
  <main>
    <h1>Our School</h1>
    <section>
      <h2>${topic}</h2>
      <p>Practice this HTML idea with a small, meaningful page.</p>
    </section>
  </main>
</body>
</html>
\`\`\`

### How to Read the Example

Start at the document root, identify the head and body, then find the element that represents the lesson topic. Change one element at a time and refresh the browser so you can see exactly what changed.

### Common Mistakes

- choosing an element because of how it looks instead of what it means;
- forgetting required attributes or closing tags;
- changing several parts of the page before checking the first error;
- using vague text when a meaningful heading or label would be clearer.

### Practical Activity

Create a small school page that demonstrates **${topic}**. Use realistic school information, open the page in a browser and inspect the resulting HTML.

### Quick Check

1. What problem does **${topic}** solve?
2. Which HTML element or attribute is most important in this lesson?
3. What would happen if you changed one part of the example?
4. Name one common mistake.
5. Explain the topic in your own words.

### Summary

A strong understanding of **${topic}** means knowing the correct HTML structure, understanding why it is used and being able to apply it in a small page.`,
  };
}

function programmingLessonContent(subject, title) {
  const topic = cleanLessonTitle(title);
  const language = subject.toLowerCase();
  const isPython = language.includes("python");
  const isJavaScript = language.includes("javascript");
  const isTypeScript = language.includes("typescript");
  const isJava = language === "java";
  const isCSharp = language === "c#";
  const isPHP = language === "php";
  const isDart = language === "dart";
  const isRuby = language === "ruby";
  const isC = language === "c";
  const isCpp = language.includes("c++");

  let code = "";
  let walkthrough = "";

  if (isPython) {
    code = `name = "Amina"
score = 82

print(name)
print("Score:", score)`;
    walkthrough = "The first line stores the student's name, the second stores a numeric score, and the print statements send those values to the console.";
  } else if (isJavaScript || isTypeScript) {
    code = `const student = "Amina";
const score = 82;

console.log(student);
console.log("Score:", score);`;
    walkthrough = "The const declarations create values that the program can use. console.log displays those values in the browser console or runtime output.";
  } else if (isPHP) {
    code = `<?php
$student = "Amina";
$score = 82;

echo $student;
echo "Score: " . $score;
?>`;
    walkthrough = "The dollar-prefixed variables store the student's data. echo sends the values to the generated page output.";
  } else if (isJava || isCSharp || isDart || isRuby || isC || isCpp) {
    code = isJava
      ? `public class Main {
  public static void main(String[] args) {
    String student = "Amina";
    int score = 82;
    System.out.println(student);
    System.out.println("Score: " + score);
  }
}`
      : isCSharp
        ? `string student = "Amina";
int score = 82;

Console.WriteLine(student);
Console.WriteLine("Score: " + score);`
        : isDart
          ? `void main() {
  String student = "Amina";
  int score = 82;
  print(student);
  print("Score: $score");
}`
          : isRuby
            ? `student = "Amina"
score = 82

puts student
puts "Score: #{score}"`
            : isC || isCpp
              ? `#include <stdio.h>

int main(void) {
  char student[] = "Amina";
  int score = 82;
  printf("%s\\n", student);
  printf("Score: %d\\n", score);
  return 0;
}`
              : `student = "Amina"
score = 82`;
    walkthrough = "The example creates values for a student record and then displays them. Read each declaration first, then trace the output statements in the same order the runtime executes them.";
  } else {
    code = `const student = "Amina";
const score = 82;

console.log(student, score);`;
    walkthrough = "The example stores two pieces of student data and then displays them. Trace the values from their declaration to the output.";
  }

  return {
    objective: `Explain ${topic.toLowerCase()}, write a small ${subject} example, trace the code line by line, and modify it without breaking the program.`,
    content: `# ${topic}

### Learning Objectives

By the end of this lesson, you should be able to explain **${topic}**, read the example from top to bottom, predict its result and make a controlled change.

### Introduction

${subject} is learned most effectively by connecting syntax to a real problem. In this lesson, **${topic}** is demonstrated with a small student-record example so that each line has a clear purpose.

### Concept

Focus on what the language is doing rather than copying punctuation. Identify the values, statements, expressions and output involved in the example.

### Code Example

\`\`\`
${code}
\`\`\`

### Line-by-Line Walkthrough

${walkthrough}

Read the example again and identify what data exists before each line and what changes after it runs. This tracing habit is useful when debugging larger programs.

### Expected Behaviour

The program displays the student's name and score. Before running it, predict the exact output. Then execute it and compare the result with your prediction.

### Change the Code

Change the student name to your own name and change the score to another value. Run the program again and explain why the output changed.

### Common Mistakes

- confusing a value with the name used to store it;
- changing several lines at once and losing track of the cause of an error;
- ignoring the compiler, interpreter or runtime error message;
- using syntax from another programming language by mistake.

### Practical Activity

Create a small record for two students. Store their names and scores, display the records and explain each line before moving to the next change.

### Quick Check

1. What concept is this lesson teaching?
2. What value is stored first?
3. What line produces the output?
4. What happens if the score changes?
5. Describe one mistake you would check first when the program fails.

### Summary

The goal is to understand **${topic}**, not simply reproduce the example. You should be able to read the code, predict its behaviour, run it and make a small change confidently.`,
  };
}

function wrapLessonLines(items, wordsPerLine = 14) {
  return items.map((item) => {
    const words = String(item).trim().split(/\s+/).filter(Boolean);
    const lines = [];
    for (let i = 0; i < words.length; i += wordsPerLine) {
      lines.push(words.slice(i, i + wordsPerLine).join(" "));
    }
    return lines.join("\n");
  }).join("\n");
}

function getLessonProfile(subject) {
  const name = String(subject ?? "").trim();
  const lower = name.toLowerCase();
  const profiles = [
    [/cobol/, "business programming and record processing", "a school fee record", "program divisions, data items, PIC clauses, procedures, files and reports"],
    [/accounting/, "financial records and business transactions", "a school shop sale", "debit, credit, journals, ledgers, balances, revenue and expenses"],
    [/biology/, "living organisms and their life processes", "a plant observed during practical work", "cells, tissues, organs, systems, processes and adaptations"],
    [/chemistry/, "matter and chemical change", "a controlled school laboratory experiment", "atoms, elements, compounds, mixtures, reactions and energy"],
    [/physics/, "matter, forces, motion and energy", "a classroom experiment measuring movement", "force, mass, distance, time, speed, energy and measurement"],
    [/mathematics|maths/, "numbers, patterns, relationships and mathematical reasoning", "a school calculation using real values", "values, operations, formulas, units, patterns and logical reasoning"],
    [/statistics/, "collecting, organising, analysing and interpreting data", "a class survey", "data, frequency, mean, median, mode, range and interpretation"],
    [/economics/, "choices, resources, production and markets", "a student deciding how to spend limited money", "scarcity, choice, opportunity cost, demand, supply and markets"],
    [/government/, "government institutions, political systems and public administration", "a community decision", "constitution, legislature, executive, judiciary, elections and citizenship"],
    [/civic/, "citizenship, rights, responsibilities and community values", "students solving a school community problem", "rights, duties, values, responsibility, participation and cooperation"],
    [/geography/, "places, people, environments and spatial relationships", "a community studying rainfall and settlement", "location, climate, population, resources, environment and spatial patterns"],
    [/agricultural/, "crop production, animal production and farm management", "a school garden", "soil, crops, livestock, pests, nutrients and farm management"],
    [/business/, "business activities, customers, management and entrepreneurship", "a small student business", "customers, products, finance, marketing, management and profit"],
    [/english/, "language, communication, reading and effective expression", "a school announcement", "grammar, vocabulary, sentence structure, meaning and context"],
    [/literature/, "stories, drama, poetry and literary expression", "a classroom discussion of a literary scene", "character, setting, theme, conflict, imagery, tone and plot"],
    [/computer|technology|ict|basic technology/, "computing systems and digital problem solving", "a computer laboratory task", "hardware, software, data, networks, users, security and processes"],
    [/social studies/, "people, society, culture and responsible community life", "a local community problem", "family, culture, society, relationships, values and social responsibility"],
    [/physical|health|phe/, "health, fitness, movement and safe living", "a school fitness activity", "fitness, nutrition, exercise, safety, movement and healthy habits"],
  ];
  const match = profiles.find(([pattern]) => pattern.test(lower));
  return match
    ? { name, domain: match[1], example: match[2], terms: match[3] }
    : { name, domain: name + " concepts, skills and practical applications", example: "a realistic secondary-school situation involving " + name, terms: "definitions, important ideas, examples, relationships and practical applications" };
}

function programmingLessonCode(subject, topic = "") {
  const lower = subject.toLowerCase();
  const lesson = String(topic).toLowerCase();

  if (lower.includes("cobol")) {
    if (lesson.includes("display") || lesson.includes("accept") || lesson.includes("input") || lesson.includes("output")) {
      return "       IDENTIFICATION DIVISION.\n       PROGRAM-ID. INPUT-DEMO.\n       DATA DIVISION.\n       WORKING-STORAGE SECTION.\n       01 STUDENT-NAME PIC A(20).\n       01 SCORE PIC 9(3).\n       PROCEDURE DIVISION.\n           DISPLAY 'Enter student name: '.\n           ACCEPT STUDENT-NAME.\n           DISPLAY 'Enter student score: '.\n           ACCEPT SCORE.\n           DISPLAY 'Student: ' STUDENT-NAME.\n           DISPLAY 'Score: ' SCORE.\n           STOP RUN.";
    }
    if (lesson.includes("if") || lesson.includes("condition") || lesson.includes("evaluate")) {
      return "       IDENTIFICATION DIVISION.\n       PROGRAM-ID. RESULT-CHECK.\n       DATA DIVISION.\n       WORKING-STORAGE SECTION.\n       01 SCORE PIC 9(3) VALUE 72.\n       PROCEDURE DIVISION.\n           IF SCORE >= 50\n               DISPLAY 'PASS'\n           ELSE\n               DISPLAY 'FAIL'\n           END-IF.\n           STOP RUN.";
    }
    if (lesson.includes("perform") || lesson.includes("loop")) {
      return "       IDENTIFICATION DIVISION.\n       PROGRAM-ID. COUNTING-DEMO.\n       DATA DIVISION.\n       WORKING-STORAGE SECTION.\n       01 COUNT-NUM PIC 9 VALUE 1.\n       PROCEDURE DIVISION.\n           PERFORM VARYING COUNT-NUM FROM 1 BY 1 UNTIL COUNT-NUM > 5\n               DISPLAY COUNT-NUM\n           END-PERFORM.\n           STOP RUN.";
    }
    if (lesson.includes("pic") || lesson.includes("data") || lesson.includes("type")) {
      return "       DATA DIVISION.\n       WORKING-STORAGE SECTION.\n       01 STUDENT-NAME PIC A(20) VALUE 'AMINA'.\n       01 SCORE PIC 9(3) VALUE 82.\n       01 FEES-PAID PIC 9(5)V99 VALUE 45000.00.\n       PROCEDURE DIVISION.\n           DISPLAY STUDENT-NAME.\n           DISPLAY SCORE.\n           DISPLAY FEES-PAID.\n           STOP RUN.";
    }
    return "       IDENTIFICATION DIVISION.\n       PROGRAM-ID. STUDENT-SCORE.\n       DATA DIVISION.\n       WORKING-STORAGE SECTION.\n       01 STUDENT-NAME PIC A(20) VALUE 'AMINA'.\n       01 SCORE PIC 9(3) VALUE 82.\n       PROCEDURE DIVISION.\n           DISPLAY 'STUDENT: ' STUDENT-NAME.\n           DISPLAY 'SCORE: ' SCORE.\n           STOP RUN.";
  }

  if (lower.includes("python")) return "name = \"Amina\"\nscore = 82\nprint(\"Student:\", name)\nprint(\"Score:\", score)";
  if (lower.includes("javascript")) return "const name = \"Amina\";\nconst score = 82;\nconsole.log(\"Student:\", name);\nconsole.log(\"Score:\", score);";
  if (lower.includes("typescript")) return "const name: string = \"Amina\";\nconst score: number = 82;\nconsole.log(\"Student:\", name);\nconsole.log(\"Score:\", score);";
  if (lower === "java") return "public class Main {\n  public static void main(String[] args) {\n    String name = \"Amina\";\n    int score = 82;\n    System.out.println(\"Student: \" + name);\n    System.out.println(\"Score: \" + score);\n  }\n}";
  if (lower.includes("c#")) return "string name = \"Amina\";\nint score = 82;\nConsole.WriteLine(\"Student: \" + name);\nConsole.WriteLine(\"Score: \" + score);";
  if (lower.includes("c++")) return "#include <iostream>\nusing namespace std;\nint main() {\n  string name = \"Amina\";\n  int score = 82;\n  cout << \"Student: \" << name << endl;\n  cout << \"Score: \" << score << endl;\n  return 0;\n}";
  if (lower.includes("dart")) return "void main() {\n  String name = \"Amina\";\n  int score = 82;\n  print(\"Student: $name\");\n  print(\"Score: $score\");\n}";
  if (lower.includes("ruby")) return "name = \"Amina\"\nscore = 82\nputs \"Student: #{name}\"\nputs \"Score: #{score}\"";
  if (lower.includes("php")) return "<?php\n$name = \"Amina\";\n$score = 82;\necho \"Student: \" . $name;\necho \"Score: \" . $score;\n?>";
  if (lower.includes("c programming") || lower === "c") return "#include <stdio.h>\nint main(void) {\n  char name[] = \"Amina\";\n  int score = 82;\n  printf(\"Student: %s\\n\", name);\n  printf(\"Score: %d\\n\", score);\n  return 0;\n}";
  return "";
}


function buildLessonContent(subject, title, courseTitle) {
  const profile = getLessonProfile(subject || courseTitle);
  const topic = cleanLessonTitle(title);
  const subjectName = profile.name || courseTitle || "this subject";
  const lowerTopic = topic.toLowerCase();
  const programming = /python|javascript|typescript|java|c#|c\+\+|c programming|^c$|dart|ruby|php|cobol/i.test(subjectName);
  const code = programming ? programmingLessonCode(subjectName, topic) : "";

  const lines = {
    intro: [
      topic + " is an important " + subjectName + " topic because it connects classroom knowledge with practical situations.",
      "The goal is to understand how " + lowerTopic + " works instead of memorising one short definition.",
      "In " + subjectName + ", this lesson belongs to " + profile.domain + ", so its ideas have practical meaning.",
      "Start by learning the meaning of each important word used when discussing this topic.",
      "Then identify the parts, stages, rules or relationships that make the topic work.",
      "A familiar example makes the lesson easier to understand and easier to remember.",
      "The example for this lesson is " + profile.example + ", because students can recognise the situation.",
      "Always ask what happens first, what happens next, and why each step matters.",
      "When solving questions, show enough reasoning for another student to follow your method.",
      "By the end, you should explain the topic without copying the original note.",
    ],
    explanation: [
      "First, know exactly what " + lowerTopic + " means in " + subjectName + ".",
      "Second, recognise the main terms connected with the topic.",
      "Important terms include " + profile.terms + ", and each term should have a clear meaning.",
      "Third, understand how the different parts work together.",
      "Fourth, know when this knowledge should be used in questions.",
      "Fifth, choose the correct rule, process or method before acting.",
      "Sixth, explain why your chosen method fits the problem.",
      "Seventh, check the result against the information given.",
      "Eighth, find the exact step when an answer becomes incorrect.",
      "Ninth, practise with a new example rather than copying one.",
      "Tenth, connect this lesson with related topics studied earlier.",
      "These habits turn " + lowerTopic + " from a definition into usable knowledge.",
    ],
    worked: [
      "Begin with the situation: " + profile.example + ".",
      "First, write down the information that is given in the question.",
      "Next, identify the part of " + lowerTopic + " that controls the situation.",
      "Choose the correct rule, process, formula, structure or procedure for that situation.",
      "Apply the chosen method carefully and keep important steps visible.",
      "Explain what each step changes instead of jumping directly to the final answer.",
      "Check whether the result makes sense for the original situation.",
      "If the result looks wrong, return to the first step and check assumptions.",
      "State the final answer clearly and explain why it is reasonable.",
      "Use the same reasoning pattern when a different question tests this concept.",
    ],
    application: [
      "In real life, " + lowerTopic + " helps people understand situations and make better decisions.",
      "A student can recognise the topic when its important terms appear in a question.",
      "The main skill is selecting the correct idea instead of using every idea available.",
      "For practical work, record observations before deciding what those observations mean.",
      "For calculations, write values, units, operations and the final interpretation clearly.",
      "For processes, arrange the stages in order and explain the purpose of each stage.",
      "For written subjects, support explanations with relevant examples and accurate terminology.",
      "For programming, trace the input, processing and output before changing code.",
      "For science, separate what you observe from what you conclude from evidence.",
      "For business and social topics, connect decisions with their effects on people.",
      "This reasoning habit makes later lessons easier because knowledge becomes connected.",
    ],
    mistakes: [
      "A common mistake is memorising a definition without understanding the words.",
      "Another mistake is choosing a method before identifying the information given.",
      "Students also lose marks when important reasoning steps are skipped.",
      "Using an unrelated example can make a correct idea appear poorly understood.",
      "Mixing similar terms is dangerous when their meanings or purposes are different.",
      "For calculations, ignoring units can produce an answer with the wrong meaning.",
      "For practical work, ignoring instructions can make an otherwise correct method fail.",
      "For programming, changing many lines at once makes errors harder to locate.",
      "For science, never claim a conclusion that the available evidence cannot support.",
      "When unsure, return to the definition and reconnect it with the example.",
    ],
    activity: [
      "Write the topic name and explain it using your own simple words.",
      "List five important terms connected with the lesson and define each term.",
      "Create one school example where this topic would be useful.",
      "Write the information given in your example before attempting the solution.",
      "Apply the correct process and show every important step clearly.",
      "Explain why your chosen method is suitable for the example.",
      "Change one condition and predict what should happen next.",
      "Compare your prediction with the actual result and explain any difference.",
      "Ask another student to read your explanation and identify anything unclear.",
      "Rewrite the unclear part using simpler words and a familiar example.",
    ],
    summary: [
      "You should now understand " + lowerTopic + " as a useful " + subjectName + " concept.",
      "You should explain the topic without depending on memorised sentences.",
      "You should recognise important terms and explain how they connect.",
      "You should identify the correct method when a practical question presents the topic.",
      "You should show reasoning clearly instead of giving unexplained final answers.",
      "You should use examples to test your understanding beyond one question.",
      "You should check calculations, evidence, processes, code or explanations carefully.",
      "You should correct mistakes by locating the exact step causing the problem.",
      "You should connect this lesson with earlier knowledge and related topics.",
      "Most importantly, you should use " + lowerTopic + " confidently in new situations.",
    ],
  };

  const codeSection = (structuredCore() ? structuredCore() + "\n\n" : "") + (code
    ? "### Practical Code Example\n\n~~~\n" + code + "\n~~~\n\n### Code Walkthrough\n\n" +
      wrapLessonLines([
        "The program demonstrates " + lowerTopic + " using a small student record example.",
        "The first data item represents the student's name used throughout the example.",
        "The second data item stores the student's score for later output.",
        "The declaration or assignment gives each value a clear place in the program.",
        "The output instruction displays information so the programmer can inspect the result.",
        "In COBOL, divisions organise program information and executable procedure instructions.",
        "In other languages, declarations and statements execute according to language rules.",
        "Read each line from top to bottom and predict what the program produces.",
        "Change the student name and score, then run the program again.",
        "Compare the new output with your prediction and explain why it changed.",
      ]) + "\n\n"
    : "");

  function structuredCore() {
    const subjectLower = subjectName.toLowerCase();
    const t = lowerTopic;

    if (subjectLower.includes("cobol") && t.includes("program layout")) {
      return [
        "### What a COBOL Program Looks Like",
        wrapLessonLines([
          "A COBOL program is organised into clear divisions so each part has a specific responsibility.",
          "The traditional layout moves from identification to environment details, data definitions, and procedures.",
          "IDENTIFICATION DIVISION identifies the program and normally contains the PROGRAM-ID paragraph.",
          "ENVIRONMENT DIVISION describes environment information needed by the program.",
          "DATA DIVISION describes information that the program stores, receives, calculates, or displays.",
          "PROCEDURE DIVISION contains executable instructions that perform the actual work.",
          "This separation makes large business programs easier to read, maintain, test, and understand.",
          "A beginner should understand the purpose of each division before memorising individual statements."
        ]),
        "### Four Main Divisions",
        wrapLessonLines([
          "IDENTIFICATION DIVISION gives the program its identity and descriptive information.",
          "ENVIRONMENT DIVISION describes the relationship between the program and its operating environment.",
          "DATA DIVISION defines files and working data items used while the program runs.",
          "PROCEDURE DIVISION contains statements, paragraphs, sections, calculations, decisions, and processing.",
          "Not every small example needs every possible paragraph or file description.",
          "The important idea is that each division has a clear job and should not be mixed randomly."
        ]),
        "### Complete Example",
        "~~~cobol\n       IDENTIFICATION DIVISION.\n       PROGRAM-ID. STUDENT-SCORE.\n       DATA DIVISION.\n       WORKING-STORAGE SECTION.\n       01 STUDENT-NAME PIC A(20) VALUE 'AMINA'.\n       01 SCORE PIC 9(3) VALUE 82.\n       PROCEDURE DIVISION.\n           DISPLAY 'STUDENT: ' STUDENT-NAME.\n           DISPLAY 'SCORE: ' SCORE.\n           STOP RUN.\n       ~~~",
        "### Line-by-Line Explanation",
        wrapLessonLines([
          "IDENTIFICATION DIVISION starts the identification part of the program.",
          "PROGRAM-ID names the program so its source has a clear identity.",
          "DATA DIVISION begins the area where program data is described.",
          "WORKING-STORAGE SECTION contains values needed while the program is running.",
          "STUDENT-NAME stores the student's name and PIC A(20) describes its character positions.",
          "SCORE stores a numeric value and PIC 9(3) describes three numeric positions.",
          "PROCEDURE DIVISION begins the executable part of the program.",
          "DISPLAY sends information to the screen or program output.",
          "STOP RUN tells the program to finish execution.",
          "The structure lets a reader identify data definitions separately from executable instructions."
        ]),
        "### Why the Layout Matters",
        wrapLessonLines([
          "Clear layout helps another programmer find definitions without searching through executable statements.",
          "It also makes errors easier to locate because data and procedures have separate areas.",
          "Business systems often process many records, so readable organisation is especially important.",
          "Sections and paragraphs provide additional structure when a program becomes larger.",
          "Learning the layout now makes later lessons about files, conditions, loops, and reports easier."
        ])
      ].join("\n\n");
    }

    if (subjectLower.includes("python") && (t.includes("print") || t.includes("hello"))) {
      return [
        "### First Python Program",
        wrapLessonLines([
          "A first Python program should be small enough that every symbol can be explained clearly.",
          "The print() function is commonly used to send information to the console.",
          "Text inside quotation marks is a string, so Python treats it as text data.",
          "Parentheses contain the argument supplied to the function in this example.",
          "The program executes instructions in order unless another control structure changes that flow."
        ]),
        "~~~python\nprint(\"Hello, Python!\")\n~~~",
        "### Understanding print()",
        wrapLessonLines([
          "print is the function name Python uses for displaying information.",
          "The parentheses show that the function is being called.",
          "The string inside the parentheses is the argument passed to print().",
          "Quotation marks tell Python that Hello, Python! should be treated as text.",
          "When the program runs, the text appears in the console.",
          "An empty print() produces a blank line because its default ending is a newline.",
          "Several arguments can be passed to print() and Python normally separates them with spaces.",
          "The sep argument changes the separator between multiple printed arguments.",
          "The end argument changes what print() writes after its arguments."
        ]),
        "### Practice",
        wrapLessonLines([
          "Change the message to your name and run the program.",
          "Add another print() instruction containing your department.",
          "Use sep=\"***\" with several arguments and observe the result.",
          "Use end=\" \" and place two print() calls on the same output line.",
          "Remove a quotation mark deliberately, run the program, and read the error message."
        ])
      ].join("\n\n");
    }

    return "";
  }

  const learningObjectives = [
    "Explain " + lowerTopic + " using simple language and accurate " + subjectName + " terminology.",
    "Identify the important ideas, terms, stages or structures connected with this lesson.",
    "Apply the lesson to a realistic secondary-school example without guessing information.",
    "Explain your reasoning clearly enough for another student to follow.",
    "Check answers using evidence, rules, calculations, observations or expected behaviour.",
    "Correct common mistakes by finding the exact point where reasoning changed.",
    "Use the knowledge in a new question instead of copying the example.",
    "Connect this lesson with earlier topics and prepare for related lessons.",
    "Practise until you can explain the idea without reading the note.",
    "Use the final activity and questions to test your understanding honestly.",
  ];

  const questions = [
    "What does " + lowerTopic + " mean in " + subjectName + "?",
    "Why is " + lowerTopic + " important when studying " + subjectName + "?",
    "Which important terms should you know before answering questions about this topic?",
    "What should you identify first when applying this topic to a problem?",
    "What happens next, and why does that step matter?",
    "Give one realistic school example where this knowledge can be applied.",
    "What mistake could produce an incorrect answer even when the definition is remembered?",
    "How would you check whether your answer is reasonable and supported?",
    "Explain the topic to a classmate without reading the note.",
    "What related lesson would you study next to strengthen your understanding?",
  ];

  return {
    objective: "Explain " + lowerTopic + " in " + subjectName + ", apply it to a practical example, and clearly explain each important step.",
    content:
      "# " + topic + "\n\n" +
      "### Learning Objectives\n\n" + wrapLessonLines(learningObjectives) + "\n\n" +
      "### Introduction\n\n" + wrapLessonLines(lines.intro) + "\n\n" +
      "### Detailed Explanation\n\n" + wrapLessonLines(lines.explanation) + "\n\n" +
      "### Worked Example\n\n" + wrapLessonLines(lines.worked) + "\n\n" +
      codeSection +
      "### Real-Life Application\n\n" + wrapLessonLines(lines.application) + "\n\n" +
      "### Common Mistakes\n\n" + wrapLessonLines(lines.mistakes) + "\n\n" +
      "### Practical Activity\n\n" + wrapLessonLines(lines.activity) + "\n\n" +
      "### Quick Check\n\n" + questions.map((question, index) => (index + 1) + ". " + question).join("\n") + "\n\n" +
      "### Summary\n\n" + wrapLessonLines(lines.summary) + "\n",
  };
}

const courseSummaryQuery = `
  SELECT
    c.id,
    c.title,
    s.id AS subject_id,
    s.name AS subject,
    c.level,
    c.description,
    c.thumbnail_url,
    c.instructor_name,
    c.duration_minutes,
    (
      SELECT COUNT(*)
      FROM lessons l
      JOIN modules m ON m.id = l.module_id
      WHERE m.course_id = c.id
    ) AS lesson_count,
    (
      SELECT COUNT(*)
      FROM assessments a
      WHERE a.course_id = c.id
        AND a.type IN ('lesson_quiz', 'module_test')
    ) AS quiz_count,
    (
      SELECT COUNT(q.id)
      FROM assessments a
      LEFT JOIN questions q ON q.assessment_id = a.id
      WHERE a.course_id = c.id
        AND a.type = 'final_exam'
    ) AS exam_question_count,
    (
      SELECT a.passing_score
      FROM assessments a
      WHERE a.course_id = c.id
        AND a.type = 'final_exam'
      ORDER BY a.id
      LIMIT 1
    ) AS exam_passing_score
  FROM courses c
  JOIN subjects s ON s.id = c.subject_id
  WHERE c.is_published = 1
`;

async function getCourseSummaries() {
  const [rows] = await pool.query(`${courseSummaryQuery} ORDER BY s.name, c.title`);
  return rows.map(mapCourseSummary);
}

async function getCourseDetails(courseId) {
  const id = Number(courseId);
  if (!Number.isSafeInteger(id) || id < 1) return null;

  const [courseRows] = await pool.query(`${courseSummaryQuery} AND c.id = ? LIMIT 1`, [id]);
  const courseRow = courseRows[0];
  if (!courseRow) return null;

  const [moduleRows] = await pool.query(
    `SELECT id, course_id, module_number, module_code, title, description,
            position, duration_minutes, is_published
     FROM modules
     WHERE course_id = ?
     ORDER BY position, id`,
    [id]
  );

  const [lessonRows] = await pool.query(
    `SELECT l.id, m.id AS module_id, m.module_number, m.module_code,
            l.lesson_code, l.title, l.objective, l.content, l.summary,
            l.video_url, l.document_url, l.duration_minutes,
            l.position, l.is_free, l.is_published
     FROM lessons l
     JOIN modules m ON m.id = l.module_id
     WHERE m.course_id = ?
     ORDER BY m.position, l.position, l.id`,
    [id]
  );

  const [assessmentRows] = await pool.query(
    `SELECT id, course_id, module_id, lesson_id, type, title, description,
            duration_minutes, passing_score, max_attempts,
            randomize_questions, is_published
     FROM assessments
     WHERE course_id = ?
     ORDER BY
       CASE type
         WHEN 'lesson_quiz' THEN 1
         WHEN 'module_test' THEN 2
         WHEN 'final_exam' THEN 3
         ELSE 4
       END,
       module_id,
       lesson_id,
       id`,
    [id]
  );

  const [questionRows] = await pool.query(
    `SELECT
       q.id AS question_id,
       q.assessment_id,
       q.question_text,
       q.explanation,
       q.question_type,
       q.points,
       q.position,
       ao.id AS option_id,
       ao.option_key,
       ao.option_text,
       ao.is_correct,
       ao.position AS option_position
     FROM questions q
     LEFT JOIN answer_options ao ON ao.question_id = q.id
     JOIN assessments a ON a.id = q.assessment_id
     WHERE a.course_id = ?
     ORDER BY q.assessment_id, q.position, ao.position, ao.id`,
    [id]
  );

  const assessmentById = new Map();
  for (const row of assessmentRows) {
    assessmentById.set(Number(row.id), {
      id: Number(row.id),
      courseId: Number(row.course_id),
      moduleId: row.module_id === null ? null : Number(row.module_id),
      lessonId: row.lesson_id === null ? null : Number(row.lesson_id),
      type: row.type,
      title: row.title,
      description: row.description,
      durationMinutes: row.duration_minutes === null ? null : Number(row.duration_minutes),
      passingScore: row.passing_score === null ? null : Number(row.passing_score),
      maxAttempts: row.max_attempts === null ? null : Number(row.max_attempts),
      randomizeQuestions: Boolean(row.randomize_questions),
      isPublished: Boolean(row.is_published),
      questions: [],
    });
  }

  const questionById = new Map();
  for (const row of questionRows) {
    const questionId = Number(row.question_id);
    let question = questionById.get(questionId);

    if (!question) {
      question = {
        id: questionId,
        position: Number(row.position),
        prompt: row.question_text,
        questionText: row.question_text,
        questionType: row.question_type,
        points: Number(row.points ?? 1),
        explanation: row.explanation,
        options: [],
      };
      questionById.set(questionId, question);
      assessmentById.get(Number(row.assessment_id))?.questions.push(question);
    }

    if (row.option_id !== null && row.option_text !== null) {
      question.options.push({
        id: Number(row.option_id),
        key: row.option_key,
        text: row.option_text,
        isCorrect: Boolean(row.is_correct),
      });
    }
  }

  const assessments = [...assessmentById.values()];

  // The curriculum JSON is the source of truth for lesson teaching material.
  // Do not replace carefully authored lesson notes with the generic fallback
  // generator. The generator is only used when an older/incomplete database
  // row does not contain usable curriculum content.
  const hasLessonContent = (value) => {
    const text = String(value ?? "").trim();
    const paragraphs = text.split(/\n{2,}/).filter((paragraph) => paragraph.trim().length > 40);
    return text.length >= 240 && paragraphs.length >= 2;
  };

  const lessons = lessonRows.map((lesson) => {
    const generated = buildLessonContent(
      courseRow.subject,
      lesson.title,
      courseRow.title,
    );

    const storedContent = String(lesson.content ?? "").trim();
    const storedObjective = String(lesson.objective ?? "").trim();
    const storedSummary = String(lesson.summary ?? "").trim();

    return {
      id: Number(lesson.id),
      moduleId: Number(lesson.module_id),
      moduleNumber: Number(lesson.module_number),
      moduleCode: lesson.module_code,
      lessonCode: lesson.lesson_code,
      position: Number(lesson.position),
      title: lesson.title,
      durationMinutes: Number(lesson.duration_minutes ?? 0),
      objective: storedObjective || generated.objective,
      content: hasLessonContent(storedContent) ? storedContent : generated.content,
      summary: storedSummary || generated.objective,
      videoUrl: lesson.video_url,
      documentUrl: lesson.document_url,
      isFree: Boolean(lesson.is_free),
      isPublished: Boolean(lesson.is_published),
    };
  });

  const modules = moduleRows.map((module) => {
    const moduleId = Number(module.id);
    const moduleLessons = lessons.filter((lesson) => lesson.moduleId === moduleId);
    const moduleTest = assessments.find(
      (assessment) => assessment.moduleId === moduleId && assessment.type === "module_test"
    ) ?? null;

    return {
      id: moduleId,
      courseId: Number(module.course_id),
      moduleNumber: Number(module.module_number),
      moduleCode: module.module_code,
      title: module.title,
      description: module.description,
      position: Number(module.position),
      durationMinutes: Number(module.duration_minutes ?? 0),
      isPublished: Boolean(module.is_published),
      lessons: moduleLessons,
      test: moduleTest,
    };
  });

  return {
    ...mapCourseSummary(courseRow),
    modules,
    lessons,
    assessments,
    exam: assessments.find((assessment) => assessment.type === "final_exam") ?? null,
  };
}

app.get("/health", async (_request, response, next) => {
  try {
    const [rows] = await pool.query("SELECT 1 AS ok");
    return response.json({
      status: "ok",
      database: Number(rows[0]?.ok) === 1,
      smtp: Boolean(getMailTransporter()),
    });
  } catch (error) {
    return next(error);
  }
});

app.get("/api/courses", async (_request, response, next) => {
  try {
    const courses = await getCourseSummaries();
    return response.set("Cache-Control", "no-store").json(courses);
  } catch (error) {
    return next(error);
  }
});

app.get("/api/courses/:courseId", async (request, response, next) => {
  try {
    const course = await getCourseDetails(request.params.courseId);
    if (!course) return response.status(404).json({ message: "Course not found" });
    return response.set("Cache-Control", "no-store").json(course);
  } catch (error) {
    return next(error);
  }
});

app.post("/auth/signup", authLimiter, async (request, response, next) => {
  try {
    const name = typeof request.body?.name === "string"
      ? request.body.name.trim().replace(/\s+/g, " ")
      : "";
    const email = typeof request.body?.email === "string"
      ? request.body.email.trim().toLowerCase()
      : "";
    const password = typeof request.body?.password === "string" ? request.body.password : "";

    if (
      name.length < 2 || name.length > 120 ||
      email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      password.length < 8 || password.length > 200 ||
      !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password)
    ) {
      return response.status(400).json({ message: "Check the highlighted fields and password requirements." });
    }

    try {
      requireSessionSecret();
    } catch {
      return response.status(503).json({ message: "Session signing is not configured." });
    }
    if (!getMailTransporter()) {
      return response.status(503).json({ message: "Email verification is not configured." });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const connection = await pool.getConnection();
    let userId;
    let challengeId;
    const challengeToken = randomBytes(32).toString("base64url");
    const code = randomInt(0, 1_000_000).toString().padStart(6, "0");

    try {
      await connection.beginTransaction();
      const [userResult] = await connection.execute(
        `INSERT INTO users (full_name, email, password_hash, email_verified_at)
         VALUES (?, ?, ?, NULL)`,
        [name, email, passwordHash]
      );
      userId = Number(userResult.insertId);
      const [challengeResult] = await connection.execute(
        `INSERT INTO email_2fa_challenges
           (user_id, token_hash, code_hash, purpose, expires_at, sent_at)
         VALUES
           (?, ?, ?, 'signup', DATE_ADD(UTC_TIMESTAMP(), INTERVAL ${verificationCodeLifetimeMinutes} MINUTE), UTC_TIMESTAMP())`,
        [userId, hashChallengeToken(challengeToken), hashVerificationCode(challengeToken, code)]
      );
      challengeId = Number(challengeResult.insertId);
      await connection.commit();
    } catch (error) {
      try {
        await connection.rollback();
      } catch {
        // Ignore rollback failure.
      }
      throw error;
    } finally {
      connection.release();
    }

    try {
      await sendVerificationCode(email, code);
    } catch (error) {
      try {
        await pool.execute(
          `UPDATE email_2fa_challenges
           SET used_at = UTC_TIMESTAMP()
           WHERE id = ?`,
          [challengeId]
        );
        await pool.execute(
          `DELETE FROM users
           WHERE id = ? AND email_verified_at IS NULL`,
          [userId]
        );
      } catch (cleanupError) {
        console.error("Failed to clean up an unverified signup:", cleanupError?.code ?? cleanupError?.message ?? "SIGNUP_CLEANUP_ERROR");
      }
      console.error("Signup verification email delivery failed:", error?.code ?? error?.message ?? "SMTP_ERROR");
      return response.status(503).json({
        message: "Could not send an account verification code. Check the email service settings.",
      });
    }

    return response.status(202).json({
      challengeToken,
      message: "A verification code was sent to your email. It expires in 10 minutes.",
    });
  } catch (error) {
    if (error?.code === "ER_DUP_ENTRY") {
      return response.status(409).json({ message: "An account with this email already exists." });
    }
    return next(error);
  }
});

app.post("/auth/login", authLimiter, async (request, response, next) => {
  try {
    const email = typeof request.body?.email === "string"
      ? request.body.email.trim().toLowerCase()
      : "";
    const password = typeof request.body?.password === "string" ? request.body.password : "";

    if (!email || !password || password.length > 200) {
      return response.status(400).json({ message: "Enter your email address and password." });
    }

    try {
      requireSessionSecret();
    } catch {
      return response.status(503).json({ message: "Session signing is not configured." });
    }

    const [rows] = await pool.execute(
      `SELECT id, full_name, email, password_hash, email_verified_at, is_active, role
       FROM users
       WHERE email = ?
       LIMIT 1`,
      [email]
    );

    const user = rows[0];
    const validPassword = user?.password_hash
      ? await bcrypt.compare(password, user.password_hash)
      : false;

    if (!user || !validPassword) {
      return response.status(401).json({ message: "Email or password is incorrect." });
    }
    if (Number(user.is_active) !== 1) {
      return response.status(403).json({
        message: "This account is inactive. Contact an administrator.",
      });
    }

    if (!user.email_verified_at) {
      return response.status(403).json({
        message: "Verify your email address before logging in.",
      });
    }

    const sessionUser = {
      id: Number(user.id),
      name: user.full_name,
      email: user.email,
      role: user.role,
    };
    if (!setSessionCookie(response, sessionUser)) {
      return response.status(503).json({ message: "Session signing is not configured." });
    }

    return response.json({
      message: "You are logged in.",
      user: { id: sessionUser.id, name: sessionUser.name, email: sessionUser.email },
    });
  } catch (error) {
    return next(error);
  }
});

app.post("/auth/verify-2fa", authLimiter, async (request, response, next) => {
  const challengeToken = typeof request.body?.challengeToken === "string"
    ? request.body.challengeToken
    : "";
  const code = typeof request.body?.code === "string"
    ? request.body.code.trim()
    : "";

  if (!challengeToken || challengeToken.length > 200 || !/^\d{6}$/.test(code)) {
    return response.status(400).json({ message: "Enter the six-digit code from your email." });
  }

  try {
    requireSessionSecret();
  } catch {
    return response.status(503).json({ message: "Session signing is not configured." });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [rows] = await connection.execute(
      `SELECT
         c.id,
         c.user_id,
         c.code_hash,
         c.purpose,
         c.attempts,
         c.used_at,
         (c.expires_at > UTC_TIMESTAMP()) AS is_active,
         u.full_name,
         u.email,
         u.role,
         u.is_active AS user_is_active,
         u.email_verified_at
       FROM email_2fa_challenges c
       JOIN users u ON u.id = c.user_id
       WHERE c.token_hash = ?
       LIMIT 1
       FOR UPDATE`,
      [hashChallengeToken(challengeToken)]
    );

    const challenge = rows[0];
    if (
      !challenge ||
      challenge.purpose !== "signup" ||
      challenge.used_at ||
      !Number(challenge.is_active) ||
      Number(challenge.attempts) >= maxVerificationCodeAttempts ||
      challenge.email_verified_at ||
      Number(challenge.user_is_active) !== 1
    ) {
      await connection.rollback();
      return response.status(400).json({ message: "This verification code is invalid or expired. Request a new code." });
    }

    if (!verificationCodeMatches(challengeToken, code, challenge.code_hash)) {
      await connection.execute(
        `UPDATE email_2fa_challenges
         SET attempts = attempts + 1
         WHERE id = ?`,
        [challenge.id]
      );
      await connection.commit();
      return response.status(401).json({ message: "That code is incorrect. Check your email and try again." });
    }

    await connection.execute(
      `UPDATE email_2fa_challenges
       SET used_at = UTC_TIMESTAMP()
       WHERE id = ?`,
      [challenge.id]
    );
    await connection.execute(
      `UPDATE users
       SET email_verified_at = COALESCE(email_verified_at, UTC_TIMESTAMP())
       WHERE id = ?`,
      [challenge.user_id]
    );
    await connection.commit();

    const user = {
  id: Number(challenge.user_id),
  name: challenge.full_name,
  email: challenge.email,
  role: challenge.role,
};

    if (!setSessionCookie(response, user)) {
      return response.status(503).json({ message: "Session signing is not configured." });
    }

    return response.json({ message: "Your email is verified and your account is ready." });
  } catch (error) {
    try {
      await connection.rollback();
    } catch {
      // Transaction may already have been rolled back/committed.
    }
    return next(error);
  } finally {
    connection.release();
  }
});

app.post("/auth/resend-2fa", authLimiter, async (request, response, next) => {
  const challengeToken = typeof request.body?.challengeToken === "string"
    ? request.body.challengeToken
    : "";

  if (!challengeToken || challengeToken.length > 200) {
    return response.status(400).json({ message: "Start account verification again to request a new code." });
  }

  if (!getMailTransporter()) {
    return response.status(503).json({ message: "Email verification is not configured." });
  }

  try {
    requireSessionSecret();
  } catch {
    return response.status(503).json({ message: "Session signing is not configured." });
  }

  const connection = await pool.getConnection();
  let newToken = null;
  let newCode = null;
  let newChallengeId = null;
  let previousChallengeId = null;
  let userEmail = null;

  try {
    await connection.beginTransaction();

    const [rows] = await connection.execute(
      `SELECT
         c.id,
         c.user_id,
         c.purpose,
         c.sent_at,
         c.used_at,
         c.attempts,
         (c.expires_at > UTC_TIMESTAMP()) AS is_active,
         TIMESTAMPDIFF(SECOND, c.sent_at, UTC_TIMESTAMP()) AS seconds_since_sent,
         u.email,
         u.email_verified_at,
         u.is_active AS user_is_active
       FROM email_2fa_challenges c
       JOIN users u ON u.id = c.user_id
       WHERE c.token_hash = ?
       LIMIT 1
       FOR UPDATE`,
      [hashChallengeToken(challengeToken)]
    );

    const previous = rows[0];
    if (
      !previous ||
      previous.purpose !== "signup" ||
      previous.used_at ||
      previous.email_verified_at ||
      !Number(previous.is_active) ||
      Number(previous.attempts) >= maxVerificationCodeAttempts ||
      Number(previous.user_is_active) !== 1
    ) {
      await connection.rollback();
      return response.status(400).json({ message: "This verification challenge is invalid. Start account creation again." });
    }

    if (Number(previous.seconds_since_sent) < 60) {
      await connection.rollback();
      return response.status(429).json({ message: "Wait one minute before requesting another code." });
    }

    const [sentRows] = await connection.execute(
      `SELECT COUNT(*) AS total
       FROM email_2fa_challenges
       WHERE user_id = ?
         AND purpose = 'signup'
         AND sent_at >= DATE_SUB(UTC_TIMESTAMP(), INTERVAL 1 HOUR)`,
      [previous.user_id]
    );

    if (Number(sentRows[0]?.total ?? 0) >= maxCodesPerHour) {
      await connection.rollback();
      return response.status(429).json({ message: "Too many verification codes requested. Try again later." });
    }

    newToken = randomBytes(32).toString("base64url");
    newCode = randomInt(0, 1_000_000).toString().padStart(6, "0");
    previousChallengeId = Number(previous.id);

    await connection.execute(
      `UPDATE email_2fa_challenges
       SET used_at = UTC_TIMESTAMP()
       WHERE id = ?`,
      [previous.id]
    );

    const [insertResult] = await connection.execute(
      `INSERT INTO email_2fa_challenges
         (user_id, token_hash, code_hash, purpose, expires_at, sent_at)
       VALUES
         (?, ?, ?, 'signup', DATE_ADD(UTC_TIMESTAMP(), INTERVAL ${verificationCodeLifetimeMinutes} MINUTE), UTC_TIMESTAMP())`,
      [previous.user_id, hashChallengeToken(newToken), hashVerificationCode(newToken, newCode)]
    );

    newChallengeId = insertResult.insertId;
    userEmail = previous.email;
    await connection.commit();
  } catch (error) {
    try {
      await connection.rollback();
    } catch {
      // Ignore rollback failure.
    }
    return next(error);
  } finally {
    connection.release();
  }

  try {
    await sendVerificationCode(userEmail, newCode);
    return response.json({
      challengeToken: newToken,
      message: "A new verification code was sent to your email.",
    });
  } catch (error) {
    try {
      await pool.execute(
        `UPDATE email_2fa_challenges
         SET used_at = UTC_TIMESTAMP()
         WHERE id = ?`,
        [newChallengeId]
      );
      await pool.execute(
        `UPDATE email_2fa_challenges
         SET used_at = NULL
         WHERE id = ? AND purpose = 'signup'`,
        [previousChallengeId]
      );
    } catch (cleanupError) {
      console.error("Failed to restore a signup verification challenge:", cleanupError?.code ?? cleanupError?.message ?? "CHALLENGE_RESTORE_ERROR");
    }
    console.error("Signup verification email delivery failed:", error?.code ?? error?.message ?? "SMTP_ERROR");
    return response.status(503).json({
      message: "Could not send a verification code. Check the email service settings.",
    });
  }
});


app.get("/auth/me", async (request, response, next) => {
  try {
    const session = readSessionToken(
      getCookie(request, sessionCookie)
    );

    if (!session) {
      return response.status(401).json({
        message: "Not authenticated",
      });
    }

    const [rows] = await pool.execute(
      `SELECT id, full_name, email, role, is_active
       FROM users
       WHERE id = ?
       LIMIT 1`,
      [Number(session.sub)]
    );

    const user = rows[0];

    if (!user || Number(user.is_active) !== 1) {
      clearSessionCookie(response);

      return response.status(401).json({
        message: "Your session is invalid or your account is inactive.",
      });
    }

    return response.json({
      user: {
        id: Number(user.id),
        name: user.full_name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return next(error);
  }
});


app.post("/api/feedback", async (request, response, next) => {
  try {
    const session = readSessionToken(getCookie(request, sessionCookie));
    if (!session) {
      return response.status(401).json({ message: "Sign in to submit feedback." });
    }

    const [users] = await pool.execute(
      "SELECT id, role, is_active FROM users WHERE id = ? LIMIT 1",
      [Number(session.sub)],
    );
    const user = users[0];
    if (!user || Number(user.is_active) !== 1) {
      clearSessionCookie(response);
      return response.status(401).json({ message: "Your session is invalid or your account is inactive." });
    }
    if (user.role !== "student") {
      return response.status(403).json({ message: "Student accounts can submit feedback." });
    }

    const category = String(request.body?.category ?? "").trim();
    const rating = Number(request.body?.rating);
    const message = String(request.body?.message ?? "").trim();
    const categories = new Set(["Course content", "Platform usability", "Technical issue", "Other"]);

    if (!categories.has(category)) {
      return response.status(400).json({ message: "Choose a feedback category." });
    }
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return response.status(400).json({ message: "Choose a rating from 1 to 5 stars." });
    }
    if (message.length < 10 || message.length > 1000) {
      return response.status(400).json({ message: "Feedback must be between 10 and 1,000 characters." });
    }

    const [result] = await pool.execute(
      "INSERT INTO feedback (user_id, category, rating, message) VALUES (?, ?, ?, ?)",
      [Number(user.id), category, rating, message],
    );
    return response.status(201).json({ id: Number(result.insertId), message: "Thank you. Your feedback was sent for review." });
  } catch (error) {
    return next(error);
  }
});


app.get("/api/admin/stats", async (request, response, next) => {
  try {
    await requireAdmin(request, response, async () => {
      const [[students]] = await pool.query("SELECT COUNT(*) AS n FROM users WHERE role = 'student'");
      const [[courses]] = await pool.query("SELECT COUNT(*) AS n FROM courses");
      const [[pending]] = await pool.query("SELECT COUNT(*) AS n FROM feedback WHERE status = 'pending'");

      return response.json({
        totalStudents: students.n,
        activeCourses: courses.n,
        pendingFeedback: pending.n,
      });
    });
  } catch (error) {
    return next(error);
  }
});

app.get("/api/admin/courses", async (request, response, next) => {
  try {
    await requireAdmin(request, response, async () => {
      const [rows] = await pool.query("SELECT id, title FROM courses ORDER BY title");
      return response.json(rows);
    });
  } catch (error) {
    return next(error);
  }
});

app.get("/api/admin/content", async (request, response, next) => {
  try {
    await requireAdmin(request, response, async () => {
      const q = typeof request.query.q === "string" ? request.query.q.trim() : "";
      const type = typeof request.query.type === "string" ? request.query.type : "";
      const course = typeof request.query.course === "string" ? request.query.course : "";

      const where = ["1=1"];
      const params = [];
      if (q) {
        where.push("ci.title LIKE ?");
        params.push(`%${q}%`);
      }
      if (ALLOWED_ADMIN_FILE_TYPES[type]) {
        where.push("ci.type = ?");
        params.push(type);
      }
      if (course) {
        where.push("ci.course_id = ?");
        params.push(course);
      }

      const [rows] = await pool.query(
        `SELECT ci.id, ci.title, ci.type, ci.status, ci.file_path, ci.created_at, c.title AS course
           FROM content_items ci
           LEFT JOIN courses c ON c.id = ci.course_id
          WHERE ${where.join(" AND ")}
          ORDER BY ci.created_at DESC
          LIMIT 100`,
        params
      );

      return response.json(rows);
    });
  } catch (error) {
    return next(error);
  }
});

app.post("/api/admin/content", adminUpload.single("file"), async (request, response, next) => {
  try {
    await requireAdmin(request, response, async () => {
      const title = typeof request.body?.title === "string" ? request.body.title.trim() : "";
      const description = typeof request.body?.description === "string" ? request.body.description.trim() : "";
      const type = typeof request.body?.type === "string" ? request.body.type : "";
      const courseId = request.body?.course_id ? Number(request.body.course_id) : null;
      const uploadedFile = request.file;

      if (!title) return response.status(400).json({ error: "Title is required" });
      if (!ALLOWED_ADMIN_FILE_TYPES[type]) return response.status(400).json({ error: "Choose PDF, Video or Quiz" });
      if (!uploadedFile) return response.status(400).json({ error: "Attach a file" });

      const ext = path.extname(uploadedFile.originalname).toLowerCase();
      if (!ALLOWED_ADMIN_FILE_TYPES[type].includes(ext)) {
        await unlink(uploadedFile.path).catch(() => {});
        return response.status(400).json({ error: `A ${type} must be ${ALLOWED_ADMIN_FILE_TYPES[type].join(", ")}` });
      }

      const [result] = await pool.execute(
        "INSERT INTO content_items (course_id, title, description, type, file_path) VALUES (?, ?, ?, ?, ?)",
        [courseId || null, title, description || null, type, `/uploads/${uploadedFile.filename}`]
      );

      return response.status(201).json({ ok: true, id: result.insertId });
    });
  } catch (error) {
    return next(error);
  }
});

app.delete("/api/admin/content/:id", async (request, response, next) => {
  try {
    await requireAdmin(request, response, async () => {
      const itemId = Number(request.params.id);
      if (!Number.isFinite(itemId)) {
        return response.status(400).json({ error: "Invalid content id" });
      }

      const [rows] = await pool.execute(
        "SELECT file_path FROM content_items WHERE id = ? LIMIT 1",
        [itemId]
      );
      const filePath = rows[0]?.file_path;

      await pool.execute("DELETE FROM content_items WHERE id = ?", [itemId]);
      if (filePath) {
        const localPath = path.join(process.cwd(), "public", filePath.replace(/^\//, ""));
        await unlink(localPath).catch(() => {});
      }

      return response.json({ ok: true });
    });
  } catch (error) {
    return next(error);
  }
});

app.get("/api/admin/students", async (request, response, next) => {
  try {
    await requireAdmin(request, response, async () => {
      const q = typeof request.query.q === "string" ? request.query.q.trim() : "";
      const status = typeof request.query.status === "string" ? request.query.status : "";

      const where = ["u.role = 'student'"];
      const params = [];
      if (q) {
        where.push("(u.name LIKE ? OR u.email LIKE ?)");
        params.push(`%${q}%`, `%${q}%`);
      }
      if (["active", "suspended"].includes(status)) {
        where.push("u.status = ?");
        params.push(status);
      }

      const [rows] = await pool.query(
        `SELECT u.id, u.name, u.email, u.status, u.created_at,
                (SELECT COUNT(*) FROM enrollments e WHERE e.user_id = u.id) AS courses_enrolled
           FROM users u
          WHERE ${where.join(" AND ")}
          ORDER BY u.created_at DESC
          LIMIT 100`,
        params
      );

      return response.json(rows);
    });
  } catch (error) {
    return next(error);
  }
});

app.patch("/api/admin/students/:id", async (request, response, next) => {
  try {
    await requireAdmin(request, response, async () => {
      const userId = Number(request.params.id);
      const nextStatus = typeof request.body?.status === "string" ? request.body.status : "";

      if (!Number.isFinite(userId) || !["active", "suspended"].includes(nextStatus)) {
        return response.status(400).json({ error: "Invalid student status" });
      }

      const [result] = await pool.execute("UPDATE users SET status = ? WHERE id = ?", [nextStatus, userId]);
      if (result.affectedRows === 0) {
        return response.status(404).json({ error: "Student not found" });
      }

      return response.json({ ok: true });
    });
  } catch (error) {
    return next(error);
  }
});

app.get("/api/admin/feedback", async (request, response, next) => {
  try {
    await requireAdmin(request, response, async () => {
      const [[sum]] = await pool.query(
        `SELECT SUM(status = 'pending') AS pending,
                SUM(status = 'reviewed') AS reviewed,
                ROUND(AVG(rating), 1) AS avgRating
           FROM feedback`
      );
      const [items] = await pool.query(
        `SELECT f.id, f.category, f.rating, f.message, f.status, f.created_at, u.name, u.email
           FROM feedback f
           JOIN users u ON u.id = f.user_id
          ORDER BY f.status = 'pending' DESC, f.created_at DESC
          LIMIT 200`
      );

      return response.json({
        pending: Number(sum.pending || 0),
        reviewed: Number(sum.reviewed || 0),
        avgRating: sum.avgRating,
        items,
      });
    });
  } catch (error) {
    return next(error);
  }
});

app.patch("/api/admin/feedback/:id", async (request, response, next) => {
  try {
    await requireAdmin(request, response, async () => {
      const feedbackId = Number(request.params.id);
      if (!Number.isFinite(feedbackId)) {
        return response.status(400).json({ error: "Invalid feedback id" });
      }

      const [result] = await pool.execute(
        "UPDATE feedback SET status = 'reviewed' WHERE id = ?",
        [feedbackId]
      );
      if (result.affectedRows === 0) {
        return response.status(404).json({ error: "Feedback not found" });
      }

      return response.json({ ok: true });
    });
  } catch (error) {
    return next(error);
  }
});

app.post("/auth/logout", (_request, response) => {
  clearSessionCookie(response);
  return response.json({ message: "You are logged out." });
});

// Final error handler. It logs the actual MySQL/Node error while returning a safe message to the browser.
app.use((error, request, response, _next) => {
  console.error("\n❌ API request failed");
  console.error("   Method:", request.method);
  console.error("   Path:", request.originalUrl);
  console.error("   Code:", error?.code ?? "NO_ERROR_CODE");
  console.error("   Message:", error?.message ?? error);
  if (process.env.NODE_ENV !== "production" && error?.stack) {
    console.error(error.stack);
  }

  if (response.headersSent) return;
  return response.status(500).json({
    message: "The API could not complete the request.",
  });
});

async function start() {
  try {
    validateRuntimeConfig();
    await initializeDatabase();
    await verifyMailConnection();

    server = app.listen(port, host, () => {
      console.log(`Fieldnote API listening at http://${host}:${port}`);
    });

    server.on("error", (error) => {
      console.error("❌ HTTP server error:", error?.message ?? error);
      process.exitCode = 1;
    });
  } catch (error) {
    console.error("\n❌ API startup failed");
    console.error("   Code:", error?.code ?? "NO_ERROR_CODE");
    console.error("   Message:", error?.message ?? error);
    if (error?.stack) console.error(error.stack);
    await pool.end().catch(() => {});
    process.exit(1);
  }
}

async function shutdown(signal) {
  console.log(`\n${signal} received. Shutting down...`);

  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }

  await pool.end().catch((error) => {
    console.error("❌ Error closing MySQL pool:", error?.message ?? error);
  });

  process.exit(0);
}

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("unhandledRejection", (reason) => {
  console.error("❌ Unhandled promise rejection:", reason);
});
process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught exception:", error?.stack ?? error);
  process.exitCode = 1;
});

await start();
