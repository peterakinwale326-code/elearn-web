import fs from "node:fs/promises";
import path from "node:path";
import mysql from "mysql2/promise";

const curriculumPath = path.resolve(process.cwd(), "data", "curriculum.json");
const curriculum = JSON.parse(await fs.readFile(curriculumPath, "utf8"));
const applyChanges = process.argv.includes("--apply");
const minimumLessonWords = 100;
const genericFillerPattern =
  /Worked example: consider a familiar Nigerian school or community situation|Key points: define the main terms accurately|Practice: write a short explanation of the concept|At this stage the emphasis is on clear definitions|The important result is not simply knowing what .+ is called|construct a realistic .+ situation in which .+ matters|create your own example of .+, annotate the important features|should be understood through people, institutions, rules and consequences|Case study: take a school, community or Nigerian public-life situation involving|Activity: investigate a local example related to .+; record two pieces of evidence|Course distinction: In this .+ course|is a core topic in .+; learners should understand its meaning, social effects, examples and practical use/i;

const pool = mysql.createPool({
  host: process.env.DB_HOST ?? "127.0.0.1",
  port: Number(process.env.DB_PORT ?? 3306),
  user: process.env.DB_USER ?? "",
  password: process.env.DB_PASSWORD ?? "",
  database: process.env.DB_NAME ?? "school",
  waitForConnections: true,
  connectionLimit: 2,
  queueLimit: 0,
  charset: "utf8mb4",
  connectTimeout: 5000,
});

function normalize(value) {
  const original = String(value ?? "").normalize("NFKC").trim().toLocaleLowerCase();
  if (original === "c++") return "cplusplus";
  if (original === "c#") return "csharp";

  return original
    .replace(/^\d+(?:\.\d+)?\s*/, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

function contentText(value) {
  if (Array.isArray(value)) return value.map((part) => String(part).trim()).filter(Boolean).join("\n\n");
  return String(value ?? "").trim();
}

try {
  const [courseRows] = await pool.query("SELECT id, title, level FROM courses");
  const [moduleRows] = await pool.query("SELECT id, course_id, title FROM modules");
  const [lessonRows] = await pool.query("SELECT id, module_id, title FROM lessons");

  const updates = [];
  const misses = [];
  let matchedCourses = 0;
  let matchedModules = 0;
  let matchedLessons = 0;
  let skippedThinLessons = 0;

  for (const sourceCourse of curriculum.courses ?? []) {
    const sourceLevel = normalize(sourceCourse.level);
    const matchingCourses = courseRows.filter((row) => {
      if (normalize(row.title) !== normalize(sourceCourse.title)) return false;
      if (sourceLevel === "programming" && !normalize(row.level)) return true;
      return normalize(row.level) === sourceLevel;
    });

    if (matchingCourses.length !== 1) {
      misses.push(`Course ${sourceCourse.title} (${sourceCourse.level}): ${matchingCourses.length} matches`);
      continue;
    }

    matchedCourses += 1;
    const course = matchingCourses[0];

    for (const sourceModule of sourceCourse.modules ?? []) {
      const matchingModules = moduleRows.filter(
        (row) => row.course_id === course.id && normalize(row.title) === normalize(sourceModule.title),
      );

      if (matchingModules.length !== 1) {
        misses.push(`Module ${sourceCourse.title} / ${sourceModule.title}: ${matchingModules.length} matches`);
        continue;
      }

      matchedModules += 1;
      const module = matchingModules[0];

      for (const sourceLesson of sourceModule.lessons ?? []) {
        const matchingLessons = lessonRows.filter(
          (row) => row.module_id === module.id && normalize(row.title) === normalize(sourceLesson.title),
        );

        if (matchingLessons.length !== 1) {
          misses.push(`Lesson ${sourceCourse.title} / ${sourceModule.title} / ${sourceLesson.title}: ${matchingLessons.length} matches`);
          continue;
        }

        matchedLessons += 1;
        const content = contentText(sourceLesson.content);
        const wordCount = (content.match(/[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu) ?? []).length;
        const paragraphs = content.split(/\n{2,}/).filter((paragraph) => paragraph.trim());
        if (
          wordCount < minimumLessonWords ||
          content.length < 240 ||
          paragraphs.length < 2 ||
          genericFillerPattern.test(content)
        ) {
          skippedThinLessons += 1;
          continue;
        }

        updates.push({
          id: matchingLessons[0].id,
          content,
          objective: String(
            sourceLesson.objective ?? sourceLesson.learningObjective ??
              `Explain ${sourceLesson.title} in ${sourceCourse.title}, identify its key ideas, and apply them to an accurate example.`,
          ).trim(),
          summary: String(
            sourceLesson.summary ?? sourceLesson.recap ?? contentText(sourceLesson.content).split(/\n+/)[0],
          ).trim().slice(0, 320),
        });
      }
    }
  }

  const sourceLessonCount = (curriculum.courses ?? []).reduce(
    (courseTotal, course) => courseTotal + (course.modules ?? []).reduce(
      (moduleTotal, module) => moduleTotal + (module.lessons ?? []).length,
      0,
    ),
    0,
  );

  console.log(JSON.stringify({
    mode: applyChanges ? "apply" : "dry-run",
    sourceLessons: sourceLessonCount,
    matchedCourses,
    matchedModules,
    matchedLessons,
    eligibleLessons: updates.length,
    skippedThinLessons,
    unmatched: misses.length,
    examples: misses.slice(0, 12),
  }, null, 2));

  if (matchedLessons !== sourceLessonCount || misses.length) {
    throw new Error("Refusing to update: every course, module, and lesson must have exactly one database match.");
  }

  if (applyChanges) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      for (const update of updates) {
        await connection.execute(
          `UPDATE lessons
           SET content = ?,
               objective = ?,
               summary = ?
           WHERE id = ?`,
          [
            update.content,
            update.objective,
            update.summary,
            update.id,
          ],
        );
      }
      await connection.commit();
      console.log(
        `Updated ${updates.length} lesson rows; left ${skippedThinLessons} short or generic lessons unchanged. ` +
        "No course, module, assessment, enrollment, or progress rows were changed.",
      );
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
} finally {
  await pool.end();
}