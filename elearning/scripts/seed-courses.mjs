import { createPool } from "mysql2/promise";
import { courseCatalog } from "./courseCatalog.mjs";

const pool = createPool({
  host: process.env.DB_HOST ?? "127.0.0.1",
  port: Number(process.env.DB_PORT ?? "3306"),
  user: process.env.DB_USER ?? "",
  password: process.env.DB_PASSWORD ?? "",
  database: process.env.DB_NAME ?? "school",
  waitForConnections: true,
  connectionLimit: 1,
  queueLimit: 0,
});

async function insertMany(connection, table, columns, rows) {
  if (rows.length === 0) return;

  const batchSize = 250;
  const columnSql = columns.join(", ");
  const rowPlaceholder = `(${columns.map(() => "?").join(", ")})`;

  for (let index = 0; index < rows.length; index += batchSize) {
    const batch = rows.slice(index, index + batchSize);
    const placeholders = batch.map(() => rowPlaceholder).join(", ");
    await connection.execute(
      `INSERT INTO ${table} (${columnSql}) VALUES ${placeholders}`,
      batch.flat()
    );
  }
}

async function seedCourse(connection, course) {
  const [existingRows] = await connection.execute(
    "SELECT id FROM courses WHERE title = ? AND subject = ? LIMIT 1",
    [course.title, course.subject]
  );
  if (existingRows.length > 0) return false;

  await connection.beginTransaction();
  try {
    const [courseResult] = await connection.execute(
      "INSERT INTO courses (title, subject, level, description, duration_minutes) VALUES (?, ?, ?, ?, ?)",
      [course.title, course.subject, course.level, course.description, course.durationMinutes]
    );
    const courseId = Number(courseResult.insertId);

    await insertMany(
      connection,
      "lessons",
      ["course_id", "position", "title", "duration_minutes", "objective", "content"],
      course.lessons.map((lesson) => [
        courseId,
        lesson.position,
        lesson.title,
        lesson.durationMinutes,
        lesson.objective,
        lesson.content,
      ])
    );

    const [lessonRows] = await connection.execute(
      "SELECT id, position FROM lessons WHERE course_id = ? ORDER BY position, id",
      [courseId]
    );
    const lessonIdByPosition = new Map(lessonRows.map((lesson) => [lesson.position, Number(lesson.id)]));

    const assessmentRows = course.lessons.map((lesson) => [
      lessonIdByPosition.get(lesson.position),
      null,
      "lesson_quiz",
      lesson.quiz.title,
      12,
      lesson.quiz.passingScore,
    ]);
    assessmentRows.push([null, courseId, "final_exam", course.exam.title, course.exam.durationMinutes, course.exam.passingScore]);

    await insertMany(
      connection,
      "assessments",
      ["lesson_id", "course_id", "assessment_type", "title", "duration_minutes", "passing_score"],
      assessmentRows
    );

    const [assessmentRowsFromDb] = await connection.execute(
      `SELECT id, lesson_id, assessment_type
       FROM assessments
       WHERE course_id = ? OR lesson_id IN (SELECT id FROM lessons WHERE course_id = ?)
       ORDER BY id`,
      [courseId, courseId]
    );
    const lessonAssessmentId = new Map(
      assessmentRowsFromDb
        .filter((assessment) => assessment.assessment_type === "lesson_quiz")
        .map((assessment) => [Number(assessment.lesson_id), Number(assessment.id)])
    );
    const examAssessment = assessmentRowsFromDb.find((assessment) => assessment.assessment_type === "final_exam");
    if (!examAssessment) throw new Error(`Final exam assessment was not created for ${course.title}`);

    const questionRows = [];
    for (const lesson of course.lessons) {
      const assessmentId = lessonAssessmentId.get(lessonIdByPosition.get(lesson.position));
      if (!assessmentId) throw new Error(`Quiz assessment was not created for ${lesson.title}`);
      for (const question of lesson.quiz.questions) {
        questionRows.push([assessmentId, question.position, question.prompt, question.explanation]);
      }
    }
    for (const question of course.exam.questions) {
      questionRows.push([Number(examAssessment.id), question.position, question.prompt, question.explanation]);
    }

    await insertMany(connection, "questions", ["assessment_id", "position", "prompt", "explanation"], questionRows);

    const assessmentIds = assessmentRowsFromDb.map((assessment) => Number(assessment.id));
    const assessmentPlaceholders = assessmentIds.map(() => "?").join(", ");
    const [questionRowsFromDb] = await connection.execute(
      `SELECT id, assessment_id, position FROM questions WHERE assessment_id IN (${assessmentPlaceholders})`,
      assessmentIds
    );
    const seedQuestions = new Map();
    for (const lesson of course.lessons) {
      const assessmentId = lessonAssessmentId.get(lessonIdByPosition.get(lesson.position));
      for (const question of lesson.quiz.questions) {
        seedQuestions.set(`${assessmentId}:${question.position}`, question);
      }
    }
    for (const question of course.exam.questions) {
      seedQuestions.set(`${Number(examAssessment.id)}:${question.position}`, question);
    }

    const answerRows = [];
    for (const question of questionRowsFromDb) {
      const seedQuestion = seedQuestions.get(`${Number(question.assessment_id)}:${question.position}`);
      if (!seedQuestion) throw new Error(`Answer options could not be mapped for question ${question.id}`);
      for (const option of seedQuestion.options) {
        answerRows.push([Number(question.id), option.text, option.isCorrect ? 1 : 0]);
      }
    }

    await insertMany(connection, "answer_options", ["question_id", "option_text", "is_correct"], answerRows);
    await connection.commit();
    return true;
  } catch (error) {
    await connection.rollback();
    throw error;
  }
}

async function main() {
  const connection = await pool.getConnection();
  let seeded = 0;
  let skipped = 0;

  try {
    for (const course of courseCatalog) {
      if (await seedCourse(connection, course)) {
        seeded += 1;
        console.log(`Added ${course.title}`);
      } else {
        skipped += 1;
      }
    }

    const [counts] = await connection.query(
      `SELECT
         (SELECT COUNT(*) FROM courses) AS courses,
         (SELECT COUNT(*) FROM lessons) AS lessons,
         (SELECT COUNT(*) FROM assessments) AS assessments,
         (SELECT COUNT(*) FROM questions) AS questions,
         (SELECT COUNT(*) FROM answer_options) AS answer_options`
    );

    console.log(`Seed complete: ${seeded} added, ${skipped} already present.`);
    console.log(`Database totals: ${JSON.stringify(counts[0])}`);
  } finally {
    connection.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(`Course seed failed: ${error.code ?? error.message}`);
  process.exitCode = 1;
});