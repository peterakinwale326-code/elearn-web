import { createHash, createHmac, randomBytes, randomInt, timingSafeEqual } from "node:crypto";
import { createPool } from "mysql2/promise";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import bcrypt from "bcryptjs";
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
const loginCodeLifetimeMinutes = 10;
const maxLoginCodeAttempts = 5;
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

  await transporter.verify();
  console.log("✅ Gmail SMTP connection successful");
}

async function initializeDatabase() {
  const connection = await pool.getConnection();
  try {
    await connection.query("SELECT 1 AS ok");

    // The original auth server expects this table. Creating it here prevents
    // login/OTP from failing just because the table was omitted from an import.
    await connection.query(`
      CREATE TABLE IF NOT EXISTS email_2fa_challenges (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        user_id BIGINT UNSIGNED NOT NULL,
        token_hash CHAR(64) NOT NULL,
        code_hash CHAR(64) NOT NULL,
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

function hashChallengeToken(token) {
  return createHash("sha256").update(token).digest("hex");
}

function hashLoginCode(token, code) {
  return createHmac("sha256", requireSessionSecret())
    .update(`${token}:${code}`)
    .digest("hex");
}

function loginCodeMatches(token, code, expectedHash) {
  if (typeof expectedHash !== "string" || !/^[a-f0-9]{64}$/i.test(expectedHash)) return false;
  const candidate = Buffer.from(hashLoginCode(token, code), "hex");
  const expected = Buffer.from(expectedHash, "hex");
  return candidate.length === expected.length && timingSafeEqual(candidate, expected);
}

async function sendLoginCode(email, code) {
  const transporter = getMailTransporter();
  if (!transporter) throw new Error("SMTP_NOT_CONFIGURED");

  const from = process.env.SMTP_FROM?.trim() || process.env.SMTP_USER?.trim();
  if (!from) throw new Error("SMTP_FROM_NOT_CONFIGURED");

  await transporter.sendMail({
    from,
    to: email,
    subject: "Your Fieldnote sign-in code",
    text: `Your Fieldnote sign-in code is ${code}. It expires in ${loginCodeLifetimeMinutes} minutes. If you did not request this code, you can ignore this email.`,
    html: `<p>Your Fieldnote sign-in code is:</p><p style="font-size:28px;font-weight:700;letter-spacing:8px">${code}</p><p>It expires in ${loginCodeLifetimeMinutes} minutes. If you did not request this code, you can ignore this email.</p>`,
  });
}

async function countRecentCodes(userId) {
  const [rows] = await pool.execute(
    `SELECT COUNT(*) AS total
     FROM email_2fa_challenges
     WHERE user_id = ?
       AND sent_at >= DATE_SUB(UTC_TIMESTAMP(), INTERVAL 1 HOUR)`,
    [userId]
  );
  return Number(rows[0]?.total ?? 0);
}

function mapCourseSummary(row) {
  return {
    id: Number(row.id),
    title: row.title,
    subject: row.subject,
    subjectId: row.subject_id === null ? null : Number(row.subject_id),
    level: row.level,
    description: row.description,
    thumbnailUrl: row.thumbnail_url,
    instructorName: row.instructor_name,
    durationMinutes: Number(row.duration_minutes ?? 0),
    lessonCount: Number(row.lesson_count ?? 0),
    quizCount: Number(row.quiz_count ?? 0),
    examQuestionCount: Number(row.exam_question_count ?? 0),
    examPassingScore: row.exam_passing_score === null ? null : Number(row.exam_passing_score),
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
  const lessons = lessonRows.map((lesson) => ({
    id: Number(lesson.id),
    moduleId: Number(lesson.module_id),
    moduleNumber: Number(lesson.module_number),
    moduleCode: lesson.module_code,
    lessonCode: lesson.lesson_code,
    position: Number(lesson.position),
    title: lesson.title,
    durationMinutes: Number(lesson.duration_minutes ?? 0),
    objective: lesson.objective,
    content: lesson.content,
    summary: lesson.summary,
    videoUrl: lesson.video_url,
    documentUrl: lesson.document_url,
    isFree: Boolean(lesson.is_free),
    isPublished: Boolean(lesson.is_published),
  }));

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

    let secret;
    try {
      secret = requireSessionSecret();
    } catch {
      return response.status(503).json({ message: "Session signing is not configured." });
    }
    void secret;

    const passwordHash = await bcrypt.hash(password, 12);
    const [result] = await pool.execute(
      `INSERT INTO users (full_name, email, password_hash)
       VALUES (?, ?, ?)`,
      [name, email, passwordHash]
    );

    const user = { id: Number(result.insertId), name, email };
    if (!setSessionCookie(response, user)) {
      return response.status(503).json({ message: "Session signing is not configured." });
    }

    return response.status(201).json({
      message: "Your account was created.",
      user: { id: user.id, name: user.name, email: user.email },
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

    if (!getMailTransporter()) {
      return response.status(503).json({ message: "Email verification is not configured." });
    }

    const [rows] = await pool.execute(
      `SELECT id, full_name, email, password_hash
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

    const userId = Number(user.id);
    if (await countRecentCodes(userId) >= maxCodesPerHour) {
      return response.status(429).json({ message: "Too many sign-in codes requested. Try again later." });
    }

    const challengeToken = randomBytes(32).toString("base64url");
    const code = randomInt(0, 1_000_000).toString().padStart(6, "0");
    const tokenHash = hashChallengeToken(challengeToken);
    const codeHash = hashLoginCode(challengeToken, code);

    await pool.execute(
      `UPDATE email_2fa_challenges
       SET used_at = UTC_TIMESTAMP()
       WHERE user_id = ? AND used_at IS NULL`,
      [userId]
    );

    const [challengeResult] = await pool.execute(
      `INSERT INTO email_2fa_challenges
         (user_id, token_hash, code_hash, expires_at, sent_at)
       VALUES
         (?, ?, ?, DATE_ADD(UTC_TIMESTAMP(), INTERVAL 10 MINUTE), UTC_TIMESTAMP())`,
      [userId, tokenHash, codeHash]
    );

    try {
      await sendLoginCode(user.email, code);
    } catch (error) {
      await pool.execute(
        `UPDATE email_2fa_challenges
         SET used_at = UTC_TIMESTAMP()
         WHERE id = ?`,
        [challengeResult.insertId]
      );
      console.error("2FA email delivery failed:", error?.code ?? error?.message ?? "SMTP_ERROR");
      return response.status(503).json({
        message: "Could not send a sign-in code. Check the email service settings.",
      });
    }

    return response.status(202).json({
      challengeToken,
      message: "A sign-in code was sent to your email. It expires in 10 minutes.",
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
         c.attempts,
         c.used_at,
         (c.expires_at > UTC_TIMESTAMP()) AS is_active,
         u.full_name,
         u.email
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
      challenge.used_at ||
      !Number(challenge.is_active) ||
      Number(challenge.attempts) >= maxLoginCodeAttempts
    ) {
      await connection.rollback();
      return response.status(400).json({ message: "This sign-in code is invalid or expired. Start again." });
    }

    if (!loginCodeMatches(challengeToken, code, challenge.code_hash)) {
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
    await connection.commit();

    const user = {
      id: Number(challenge.user_id),
      name: challenge.full_name,
      email: challenge.email,
    };

    if (!setSessionCookie(response, user)) {
      return response.status(503).json({ message: "Session signing is not configured." });
    }

    return response.json({ message: "You are logged in." });
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
    return response.status(400).json({ message: "Start sign-in again to request a new code." });
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
  let userEmail = null;

  try {
    await connection.beginTransaction();

    const [rows] = await connection.execute(
      `SELECT
         c.id,
         c.user_id,
         c.sent_at,
         c.attempts,
         c.used_at,
         (c.expires_at > UTC_TIMESTAMP()) AS is_active,
         TIMESTAMPDIFF(SECOND, c.sent_at, UTC_TIMESTAMP()) AS seconds_since_sent,
         u.email
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
      previous.used_at ||
      !Number(previous.is_active) ||
      Number(previous.attempts) >= maxLoginCodeAttempts
    ) {
      await connection.rollback();
      return response.status(400).json({ message: "This sign-in challenge is invalid or expired. Start again." });
    }

    if (Number(previous.seconds_since_sent) < 60) {
      await connection.rollback();
      return response.status(429).json({ message: "Wait one minute before requesting another code." });
    }

    const [sentRows] = await connection.execute(
      `SELECT COUNT(*) AS total
       FROM email_2fa_challenges
       WHERE user_id = ?
         AND sent_at >= DATE_SUB(UTC_TIMESTAMP(), INTERVAL 1 HOUR)`,
      [previous.user_id]
    );

    if (Number(sentRows[0]?.total ?? 0) >= maxCodesPerHour) {
      await connection.rollback();
      return response.status(429).json({ message: "Too many sign-in codes requested. Try again later." });
    }

    newToken = randomBytes(32).toString("base64url");
    newCode = randomInt(0, 1_000_000).toString().padStart(6, "0");

    await connection.execute(
      `UPDATE email_2fa_challenges
       SET used_at = UTC_TIMESTAMP()
       WHERE id = ?`,
      [previous.id]
    );

    const [insertResult] = await connection.execute(
      `INSERT INTO email_2fa_challenges
         (user_id, token_hash, code_hash, expires_at, sent_at)
       VALUES
         (?, ?, ?, DATE_ADD(UTC_TIMESTAMP(), INTERVAL 10 MINUTE), UTC_TIMESTAMP())`,
      [previous.user_id, hashChallengeToken(newToken), hashLoginCode(newToken, newCode)]
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
    await sendLoginCode(userEmail, newCode);
    return response.json({
      challengeToken: newToken,
      message: "A new sign-in code was sent to your email.",
    });
  } catch (error) {
    await pool.execute(
      `UPDATE email_2fa_challenges
       SET used_at = UTC_TIMESTAMP()
       WHERE id = ?`,
      [newChallengeId]
    );
    console.error("2FA email delivery failed:", error?.code ?? error?.message ?? "SMTP_ERROR");
    return response.status(503).json({
      message: "Could not send a sign-in code. Check the email service settings.",
    });
  }
});

app.get("/auth/me", (request, response) => {
  const session = readSessionToken(getCookie(request, sessionCookie));
  if (!session) return response.status(401).json({ message: "Not authenticated" });
  return response.json({
    user: {
      id: Number(session.sub),
      name: session.name,
      email: session.email,
    },
  });
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
