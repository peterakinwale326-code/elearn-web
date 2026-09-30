import { createHash, createHmac, randomBytes, randomInt, timingSafeEqual } from "node:crypto";
import { createPool } from "mysql2/promise";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";

const port = Number(process.env.API_PORT ?? "4000");
const sessionCookie = "fieldnote_session";
const sessionLifetimeSeconds = 60 * 60 * 24 * 7;
const loginCodeLifetimeMinutes = 10;
const maxLoginCodeAttempts = 5;
let mailTransporter;
const pool = createPool({
  host: process.env.DB_HOST ?? "127.0.0.1",
  port: Number(process.env.DB_PORT ?? "3306"),
  user: process.env.DB_USER ?? "",
  password: process.env.DB_PASSWORD ?? "",
  database: process.env.DB_NAME ?? "school",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const app = express();
app.disable("x-powered-by");
app.use(helmet());
app.use(express.json({ limit: "16kb" }));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
});

const courseSummaryQuery = `
  SELECT
    c.id,
    c.title,
    c.subject,
    c.level,
    c.description,
    c.duration_minutes,
    (SELECT COUNT(*) FROM lessons l WHERE l.course_id = c.id) AS lesson_count,
    (
      SELECT COUNT(*)
      FROM assessments a
      WHERE a.assessment_type = 'lesson_quiz'
        AND a.lesson_id IN (SELECT l.id FROM lessons l WHERE l.course_id = c.id)
    ) AS quiz_count,
    (
      SELECT COUNT(q.id)
      FROM assessments a
      LEFT JOIN questions q ON q.assessment_id = a.id
      WHERE a.course_id = c.id AND a.assessment_type = 'final_exam'
    ) AS exam_question_count,
    (
      SELECT a.passing_score
      FROM assessments a
      WHERE a.course_id = c.id AND a.assessment_type = 'final_exam'
      ORDER BY a.id
      LIMIT 1
    ) AS exam_passing_score
  FROM courses c`;

function mapCourseSummary(row) {
  return {
    id: Number(row.id),
    title: row.title,
    subject: row.subject,
    level: row.level,
    description: row.description,
    durationMinutes: Number(row.duration_minutes),
    lessonCount: Number(row.lesson_count),
    quizCount: Number(row.quiz_count),
    examQuestionCount: Number(row.exam_question_count),
    examPassingScore: row.exam_passing_score === null ? null : Number(row.exam_passing_score),
  };
}

async function getCourseSummaries() {
  const [rows] = await pool.query(`${courseSummaryQuery} ORDER BY c.subject, c.title`);
  return rows.map(mapCourseSummary);
}

async function getCourseDetails(courseId) {
  const id = Number(courseId);
  if (!Number.isSafeInteger(id) || id < 1) return null;

  const [courseRows] = await pool.query(`${courseSummaryQuery} WHERE c.id = ? LIMIT 1`, [id]);
  const courseRow = courseRows[0];
  if (!courseRow) return null;

  const [lessonRows] = await pool.query(
    `SELECT id, course_id, position, title, duration_minutes, objective, content
     FROM lessons
     WHERE course_id = ?
     ORDER BY position, id`,
    [id]
  );
  const [assessmentRows] = await pool.query(
    `SELECT id, lesson_id, course_id, assessment_type, title, duration_minutes, passing_score
     FROM assessments
     WHERE course_id = ?
        OR lesson_id IN (SELECT id FROM lessons WHERE course_id = ?)
     ORDER BY id`,
    [id, id]
  );
  const [questionRows] = await pool.query(
    `SELECT
       q.id AS question_id,
       q.assessment_id,
       q.position,
       q.prompt,
       q.explanation,
       ao.id AS option_id,
       ao.option_text,
       ao.is_correct
     FROM questions q
     LEFT JOIN answer_options ao ON ao.question_id = q.id
     JOIN assessments a ON a.id = q.assessment_id
     WHERE a.course_id = ?
        OR a.lesson_id IN (SELECT id FROM lessons WHERE course_id = ?)
     ORDER BY q.assessment_id, q.position, ao.id`,
    [id, id]
  );

  const assessmentById = new Map();
  for (const row of assessmentRows) {
    assessmentById.set(Number(row.id), {
      id: Number(row.id),
      lessonId: row.lesson_id === null ? null : Number(row.lesson_id),
      courseId: row.course_id === null ? null : Number(row.course_id),
      type: row.assessment_type,
      title: row.title,
      durationMinutes: row.duration_minutes === null ? null : Number(row.duration_minutes),
      passingScore: Number(row.passing_score),
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
        prompt: row.prompt,
        explanation: row.explanation,
        options: [],
      };
      questionById.set(questionId, question);
      assessmentById.get(Number(row.assessment_id))?.questions.push(question);
    }

    if (row.option_id !== null && row.option_text !== null) {
      question.options.push({
        id: Number(row.option_id),
        text: row.option_text,
        isCorrect: Boolean(row.is_correct),
      });
    }
  }

  const assessments = [...assessmentById.values()];
  return {
    ...mapCourseSummary(courseRow),
    lessons: lessonRows.map((lesson) => ({
      id: Number(lesson.id),
      position: Number(lesson.position),
      title: lesson.title,
      durationMinutes: Number(lesson.duration_minutes),
      objective: lesson.objective,
      content: lesson.content,
      quiz: assessments.find((assessment) => assessment.lessonId === Number(lesson.id) && assessment.type === "lesson_quiz") ?? null,
    })),
    exam: assessments.find((assessment) => assessment.courseId === id && assessment.type === "final_exam") ?? null,
  };
}

function getSessionSecret() {
  const secret = process.env.AUTH_SESSION_SECRET;
  return secret && secret.length >= 32 ? secret : null;
}

function createSessionToken(user) {
  const secret = getSessionSecret();
  if (!secret) return null;

  const encodedPayload = Buffer.from(JSON.stringify({
    sub: Number(user.id),
    email: user.email,
    name: user.name,
    exp: Math.floor(Date.now() / 1000) + sessionLifetimeSeconds,
  })).toString("base64url");
  const signature = createHmac("sha256", secret).update(encodedPayload).digest("base64url");
  return `${encodedPayload}.${signature}`;
}

function readSessionToken(token) {
  const secret = getSessionSecret();
  if (!secret || !token) return null;

  const [encodedPayload, signature, extra] = token.split(".");
  if (!encodedPayload || !signature || extra) return null;

  const expected = createHmac("sha256", secret).update(encodedPayload).digest();
  let received;
  try {
    received = Buffer.from(signature, "base64url");
  } catch {
    return null;
  }
  if (received.length !== expected.length || !timingSafeEqual(received, expected)) return null;

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8"));
    if (!Number.isSafeInteger(payload.sub) || payload.exp <= Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

function setSessionCookie(response, user) {
  const token = createSessionToken(user);
  if (!token) return false;

  response.cookie(sessionCookie, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: sessionLifetimeSeconds * 1000,
  });
  return true;
}

function getCookie(request, name) {
  const cookieHeader = request.headers.cookie ?? "";
  const entry = cookieHeader.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${name}=`));
  return entry ? decodeURIComponent(entry.slice(name.length + 1)) : null;
}

function getMailTransporter() {
  const host = process.env.SMTP_HOST?.trim();
  const from = process.env.SMTP_FROM?.trim();
  const port = Number(process.env.SMTP_PORT ?? "587");
  if (!host || !from || !Number.isInteger(port) || port < 1 || port > 65535) return null;

  if (!mailTransporter) {
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASSWORD;
    mailTransporter = nodemailer.createTransport({
      host,
      port,
      secure: process.env.SMTP_SECURE === "true" || port === 465,
      ...(user && pass ? { auth: { user, pass } } : {}),
    });
  }
  return mailTransporter;
}

function hashChallengeToken(token) {
  return createHash("sha256").update(token).digest("hex");
}

function hashLoginCode(token, code) {
  return createHmac("sha256", getSessionSecret()).update(`${token}:${code}`).digest("hex");
}

function loginCodeMatches(token, code, expectedHash) {
  const candidate = Buffer.from(hashLoginCode(token, code), "hex");
  const expected = Buffer.from(expectedHash, "hex");
  return candidate.length === expected.length && timingSafeEqual(candidate, expected);
}

async function sendLoginCode(email, code) {
  const transporter = getMailTransporter();
  if (!transporter) throw new Error("SMTP_NOT_CONFIGURED");

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: "Your Fieldnote sign-in code",
    text: `Your Fieldnote sign-in code is ${code}. It expires in ${loginCodeLifetimeMinutes} minutes. If you did not request this code, you can ignore this email.`,
    html: `<p>Your Fieldnote sign-in code is:</p><p style="font-size:28px;font-weight:700;letter-spacing:8px">${code}</p><p>It expires in ${loginCodeLifetimeMinutes} minutes. If you did not request this code, you can ignore this email.</p>`,
  });
}

app.get("/health", async (_request, response, next) => {
  try {
    const [rows] = await pool.query("SELECT 1 AS ok");
    response.json({ status: "ok", database: Number(rows[0].ok) === 1 });
  } catch (error) {
    next(error);
  }
});

app.get("/api/courses", async (_request, response, next) => {
  try {
    response.set("Cache-Control", "no-store").json(await getCourseSummaries());
  } catch (error) {
    next(error);
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
    const name = typeof request.body?.name === "string" ? request.body.name.trim().replace(/\s+/g, " ") : "";
    const email = typeof request.body?.email === "string" ? request.body.email.trim().toLowerCase() : "";
    const password = typeof request.body?.password === "string" ? request.body.password : "";
    if (
      name.length < 2 || name.length > 120 ||
      email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      password.length < 8 || password.length > 200 ||
      !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password)
    ) {
      return response.status(400).json({ message: "Check the highlighted fields and password requirements." });
    }
    if (!getSessionSecret()) {
      return response.status(503).json({ message: "Set AUTH_SESSION_SECRET to a random value of at least 32 characters." });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const [result] = await pool.execute(
      "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
      [name, email, passwordHash]
    );
    const user = { id: Number(result.insertId), name, email };
    if (!setSessionCookie(response, user)) return response.status(503).json({ message: "Session signing is not configured." });
    return response.status(201).json({ message: "Your account was created." });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") return response.status(409).json({ message: "An account with this email already exists." });
    return next(error);
  }
});

app.post("/auth/login", authLimiter, async (request, response, next) => {
  try {
    const email = typeof request.body?.email === "string" ? request.body.email.trim().toLowerCase() : "";
    const password = typeof request.body?.password === "string" ? request.body.password : "";
    if (!email || !password || password.length > 200) {
      return response.status(400).json({ message: "Enter your email address and password." });
    }
    if (!getSessionSecret()) {
      return response.status(503).json({ message: "Set AUTH_SESSION_SECRET to a random value of at least 32 characters." });
    }
    if (!getMailTransporter()) {
      return response.status(503).json({ message: "Email verification is not configured. Set the SMTP environment variables." });
    }

    const [rows] = await pool.execute(
      "SELECT id, name, email, password_hash FROM users WHERE email = ? LIMIT 1",
      [email]
    );
    const user = rows[0];
    const validPassword = user?.password_hash ? await bcrypt.compare(password, user.password_hash) : false;
    if (!user || !validPassword) return response.status(401).json({ message: "Email or password is incorrect." });

    const userId = Number(user.id);
    const [sentRows] = await pool.execute(
      "SELECT COUNT(*) AS total FROM email_2fa_challenges WHERE user_id = ? AND sent_at >= DATE_SUB(UTC_TIMESTAMP(), INTERVAL 1 HOUR)",
      [userId]
    );
    if (Number(sentRows[0].total) >= 5) {
      return response.status(429).json({ message: "Too many sign-in codes requested. Try again later." });
    }

    const challengeToken = randomBytes(32).toString("base64url");
    const code = randomInt(0, 1_000_000).toString().padStart(6, "0");
    await pool.execute(
      "UPDATE email_2fa_challenges SET used_at = UTC_TIMESTAMP() WHERE user_id = ? AND used_at IS NULL",
      [userId]
    );
    const [challengeResult] = await pool.execute(
      "INSERT INTO email_2fa_challenges (user_id, token_hash, code_hash, expires_at) VALUES (?, ?, ?, DATE_ADD(UTC_TIMESTAMP(), INTERVAL 10 MINUTE))",
      [userId, hashChallengeToken(challengeToken), hashLoginCode(challengeToken, code)]
    );

    try {
      await sendLoginCode(user.email, code);
    } catch (error) {
      await pool.execute("UPDATE email_2fa_challenges SET used_at = UTC_TIMESTAMP() WHERE id = ?", [challengeResult.insertId]);
      console.error("2FA email delivery failed:", error.code ?? "SMTP_ERROR");
      return response.status(503).json({ message: "Could not send a sign-in code. Check the email service settings." });
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
  const challengeToken = typeof request.body?.challengeToken === "string" ? request.body.challengeToken : "";
  const code = typeof request.body?.code === "string" ? request.body.code.trim() : "";
  if (!challengeToken || challengeToken.length > 100 || !/^\d{6}$/.test(code)) {
    return response.status(400).json({ message: "Enter the six-digit code from your email." });
  }
  if (!getSessionSecret()) {
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
         u.name,
         u.email
       FROM email_2fa_challenges c
       JOIN users u ON u.id = c.user_id
       WHERE c.token_hash = ?
       LIMIT 1
       FOR UPDATE`,
      [hashChallengeToken(challengeToken)]
    );
    const challenge = rows[0];
    if (!challenge || challenge.used_at || !Number(challenge.is_active) || Number(challenge.attempts) >= maxLoginCodeAttempts) {
      await connection.rollback();
      return response.status(400).json({ message: "This sign-in code is invalid or expired. Start again." });
    }

    if (!loginCodeMatches(challengeToken, code, challenge.code_hash)) {
      await connection.execute("UPDATE email_2fa_challenges SET attempts = attempts + 1 WHERE id = ?", [challenge.id]);
      await connection.commit();
      return response.status(401).json({ message: "That code is incorrect. Check your email and try again." });
    }

    await connection.execute("UPDATE email_2fa_challenges SET used_at = UTC_TIMESTAMP() WHERE id = ?", [challenge.id]);
    await connection.commit();

    const user = { id: Number(challenge.user_id), name: challenge.name, email: challenge.email };
    if (!setSessionCookie(response, user)) return response.status(503).json({ message: "Session signing is not configured." });
    return response.json({ message: "You are logged in." });
  } catch (error) {
    await connection.rollback();
    return next(error);
  } finally {
    connection.release();
  }
});

app.post("/auth/resend-2fa", authLimiter, async (request, response, next) => {
  const challengeToken = typeof request.body?.challengeToken === "string" ? request.body.challengeToken : "";
  if (!challengeToken || challengeToken.length > 100) {
    return response.status(400).json({ message: "Start sign-in again to request a new code." });
  }
  if (!getMailTransporter() || !getSessionSecret()) {
    return response.status(503).json({ message: "Email verification is not configured." });
  }

  const connection = await pool.getConnection();
  let newToken;
  let newCode;
  let newChallengeId;
  let userEmail;
  try {
    await connection.beginTransaction();
    const [rows] = await connection.execute(
      `SELECT c.id, c.user_id, c.sent_at, c.attempts, c.used_at,
              (c.expires_at > UTC_TIMESTAMP()) AS is_active,
              TIMESTAMPDIFF(SECOND, c.sent_at, CURRENT_TIMESTAMP()) AS seconds_since_sent,
              u.email
       FROM email_2fa_challenges c
       JOIN users u ON u.id = c.user_id
       WHERE c.token_hash = ?
       LIMIT 1
       FOR UPDATE`,
      [hashChallengeToken(challengeToken)]
    );
    const previous = rows[0];
    if (!previous || previous.used_at || !Number(previous.is_active) || Number(previous.attempts) >= maxLoginCodeAttempts) {
      await connection.rollback();
      return response.status(400).json({ message: "This sign-in challenge is invalid or expired. Start again." });
    }

    if (Number(previous.seconds_since_sent) < 60) {
      await connection.rollback();
      return response.status(429).json({ message: "Wait one minute before requesting another code." });
    }

    const [sentRows] = await connection.execute(
      "SELECT COUNT(*) AS total FROM email_2fa_challenges WHERE user_id = ? AND sent_at >= DATE_SUB(UTC_TIMESTAMP(), INTERVAL 1 HOUR)",
      [previous.user_id]
    );
    if (Number(sentRows[0].total) >= 5) {
      await connection.rollback();
      return response.status(429).json({ message: "Too many sign-in codes requested. Try again later." });
    }

    newToken = randomBytes(32).toString("base64url");
    newCode = randomInt(0, 1_000_000).toString().padStart(6, "0");
    await connection.execute("UPDATE email_2fa_challenges SET used_at = UTC_TIMESTAMP() WHERE id = ?", [previous.id]);
    const [insertResult] = await connection.execute(
      "INSERT INTO email_2fa_challenges (user_id, token_hash, code_hash, expires_at) VALUES (?, ?, ?, DATE_ADD(UTC_TIMESTAMP(), INTERVAL 10 MINUTE))",
      [previous.user_id, hashChallengeToken(newToken), hashLoginCode(newToken, newCode)]
    );
    newChallengeId = insertResult.insertId;
    userEmail = previous.email;
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    return next(error);
  } finally {
    connection.release();
  }

  try {
    await sendLoginCode(userEmail, newCode);
    return response.json({ challengeToken: newToken, message: "A new sign-in code was sent to your email." });
  } catch (error) {
    await pool.execute("UPDATE email_2fa_challenges SET used_at = UTC_TIMESTAMP() WHERE id = ?", [newChallengeId]);
    console.error("2FA email delivery failed:", error.code ?? "SMTP_ERROR");
    return response.status(503).json({ message: "Could not send a sign-in code. Check the email service settings." });
  }
});

app.get("/auth/me", (request, response) => {
  const session = readSessionToken(getCookie(request, sessionCookie));
  if (!session) return response.status(401).json({ message: "Not authenticated" });
  return response.json({ user: { id: session.sub, name: session.name, email: session.email } });
});

app.post("/auth/logout", (_request, response) => {
  response.clearCookie(sessionCookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
  return response.json({ message: "You are logged out." });
});

app.use((error, _request, response, _next) => {
  console.error("API request failed:", error.code ?? error.message);
  response.status(500).json({ message: "The API could not complete the request." });
});

const server = app.listen(port, process.env.API_HOST ?? "127.0.0.1", () => {
  console.log(`Fieldnote API listening at http://${process.env.API_HOST ?? "127.0.0.1"}:${port}`);
});

async function shutdown() {
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
