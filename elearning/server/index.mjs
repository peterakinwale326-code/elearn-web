import { createHmac, timingSafeEqual } from "node:crypto";
import { createPool } from "mysql2/promise";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import bcrypt from "bcryptjs";

const port = Number(process.env.API_PORT ?? "4000");
const sessionCookie = "fieldnote_session";
const sessionLifetimeSeconds = 60 * 60 * 24 * 7;
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
    const name = typeof request.body?.name === "string" ? request.body.name.trim() : "";
    const email = typeof request.body?.email === "string" ? request.body.email.trim().toLowerCase() : "";
    const password = typeof request.body?.password === "string" ? request.body.password : "";
    if (name.length < 2 || name.length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 8 || password.length > 200) {
      return response.status(400).json({ message: "Enter a name, valid email, and password between 8 and 200 characters." });
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

    const [rows] = await pool.execute(
      "SELECT id, name, email, password_hash FROM users WHERE email = ? LIMIT 1",
      [email]
    );
    const user = rows[0];
    const validPassword = user?.password_hash ? await bcrypt.compare(password, user.password_hash) : false;
    if (!user || !validPassword) return response.status(401).json({ message: "Email or password is incorrect." });

    const sessionUser = { id: Number(user.id), name: user.name, email: user.email };
    if (!setSessionCookie(response, sessionUser)) return response.status(503).json({ message: "Session signing is not configured." });
    return response.json({ message: "You are logged in." });
  } catch (error) {
    return next(error);
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
