import { createPool } from "mysql2/promise";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));

const curriculumPath = path.join(
  here,
  "..",
  "data",
  "curriculum.json"
);

const curriculum = JSON.parse(
  await readFile(curriculumPath, "utf8")
);

const pool = createPool({
  host: process.env.DB_HOST ?? "127.0.0.1",
  port: Number(process.env.DB_PORT ?? "3306"),
  user: process.env.DB_USER ?? "",
  password: process.env.DB_PASSWORD ?? "",
  database: process.env.DB_NAME ?? "school",
  waitForConnections: true,
  connectionLimit: 4,
  queueLimit: 0,
  charset: "utf8mb4",
  timezone: "Z",
});

const slugify = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const text = (value) =>
  value == null ? "" : String(value).trim();

/* =========================================================
   CURRICULUM VALIDATION
   ========================================================= */

function validateCurriculum() {
  if (!curriculum || typeof curriculum !== "object") {
    throw new Error("Invalid curriculum.json");
  }

  if (!Array.isArray(curriculum.subjects)) {
    throw new Error("curriculum.json has no subjects array");
  }

  if (!Array.isArray(curriculum.courses)) {
    throw new Error("curriculum.json has no courses array");
  }

  if (curriculum.courses.length !== 75) {
    throw new Error(
      `Expected 75 courses, found ${curriculum.courses.length}`
    );
  }

  const slugSet = new Set();

  for (const course of curriculum.courses) {
    if (!course.title) {
      throw new Error("Course without title detected");
    }

    if (!course.subject && !course.subjectSlug) {
      throw new Error(
        `${course.title}: missing subject`
      );
    }

    if (!Array.isArray(course.modules)) {
      throw new Error(
        `${course.title}: modules missing`
      );
    }

    const baseSlug = slugify(
      course.slug ?? course.title
    );

    if (slugSet.has(baseSlug)) {
      console.log(
        `⚠ Duplicate curriculum slug detected: ${baseSlug} — will be resolved automatically`
      );
    }

    slugSet.add(baseSlug);

    for (const module of course.modules) {
      if (!Array.isArray(module.lessons)) {
        throw new Error(
          `${course.title} / ${module.title}: lessons missing`
        );
      }

      for (const lesson of module.lessons) {
        if (!lesson.title) {
          throw new Error(
            `${course.title}: lesson without title`
          );
        }

        if (!lesson.content) {
          throw new Error(
            `${course.title} / ${lesson.title}: content missing`
          );
        }
      }
    }
  }
}

/* =========================================================
   SUBJECT RESOLUTION
   ========================================================= */

function subjectAliases(value) {
  const s = slugify(value);

  const aliases = {
    science: "biology",
    "computer-science": "computer-studies",
    computing: "computer-studies",
    ict: "computer-studies",
    computer: "computer-studies",

    math: "mathematics",
    mathematics: "mathematics",

    english: "english-studies",
    "english-language": "english-studies",

    agric: "agricultural-science",
    agriculture: "agricultural-science",

    civic: "civic-education",

    "physical-education": "physical-and-health-education",
    "physical-health-education":
      "physical-and-health-education",
  };

  return aliases[s] ?? s;
}

async function findSubject(connection, course) {
  const value =
    course.subjectSlug ??
    course.subject ??
    course.subjectName;

  const raw = text(value);
  const slug = slugify(raw);
  const alias = subjectAliases(raw);

  const [rows] = await connection.execute(
    `
    SELECT id
    FROM subjects
    WHERE slug IN (?, ?)
       OR LOWER(name) = ?
       OR LOWER(code) = ?
    LIMIT 1
    `,
    [
      slug,
      alias,
      raw.toLowerCase(),
      raw.toLowerCase(),
    ]
  );

  if (!rows.length) {
    throw new Error(
      `Subject not found for course "${course.title}": ${raw}`
    );
  }

  return Number(rows[0].id);
}

/* =========================================================
   UNIQUE COURSE SLUG
   ========================================================= */

async function getUniqueSlug(
  connection,
  requestedSlug,
  courseId,
  level,
  title
) {
  const base = slugify(
    requestedSlug || title
  );

  let candidate = base;

  const [rows] = await connection.execute(
    `
    SELECT id
    FROM courses
    WHERE slug = ?
    LIMIT 1
    `,
    [candidate]
  );

  if (
    !rows.length ||
    Number(rows[0].id) === Number(courseId)
  ) {
    return candidate;
  }

  const levelPart = slugify(level);

  if (levelPart) {
    candidate = `${base}-${levelPart}`;

    const [levelRows] =
      await connection.execute(
        `
        SELECT id
        FROM courses
        WHERE slug = ?
        LIMIT 1
        `,
        [candidate]
      );

    if (
      !levelRows.length ||
      Number(levelRows[0].id) === Number(courseId)
    ) {
      return candidate;
    }
  }

  const titlePart = slugify(title)
    .split("-")
    .slice(0, 2)
    .join("-");

  if (titlePart) {
    candidate = `${base}-${titlePart}`;

    const [titleRows] =
      await connection.execute(
        `
        SELECT id
        FROM courses
        WHERE slug = ?
        LIMIT 1
        `,
        [candidate]
      );

    if (
      !titleRows.length ||
      Number(titleRows[0].id) === Number(courseId)
    ) {
      return candidate;
    }
  }

  let number = 2;

  while (true) {
    candidate = `${base}-${number}`;

    const [numberRows] =
      await connection.execute(
        `
        SELECT id
        FROM courses
        WHERE slug = ?
        LIMIT 1
        `,
        [candidate]
      );

    if (
      !numberRows.length ||
      Number(numberRows[0].id) === Number(courseId)
    ) {
      return candidate;
    }

    number++;
  }
}

/* =========================================================
   UNIQUE COURSE CODE
   ========================================================= */

async function getUniqueCourseCode(
  connection,
  requestedCode,
  courseId,
  level,
  title
) {
  if (!requestedCode) {
    return null;
  }

  const base = text(requestedCode);

  /* First: can the course keep its original code? */

  const [ownerRows] = await connection.execute(
    `
    SELECT id
    FROM courses
    WHERE course_code = ?
    LIMIT 1
    `,
    [base]
  );

  if (
    !ownerRows.length ||
    Number(ownerRows[0].id) === Number(courseId)
  ) {
    return base;
  }

  /*
   * Another course owns the code.
   * Build a deterministic unique code.
   */

  const levelPart = slugify(level)
    .replace(/-/g, "")
    .toUpperCase();

  if (levelPart) {
    let candidate = `${base}-${levelPart}`;

    if (candidate.length <= 80) {
      const [rows] =
        await connection.execute(
          `
          SELECT id
          FROM courses
          WHERE course_code = ?
          LIMIT 1
          `,
          [candidate]
        );

      if (
        !rows.length ||
        Number(rows[0].id) === Number(courseId)
      ) {
        return candidate;
      }
    }
  }

  /*
   * Use a short title identifier.
   */

  const titlePart = slugify(title)
    .split("-")
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  if (titlePart) {
    let candidate = `${base}-${titlePart}`;

    if (candidate.length <= 80) {
      const [rows] =
        await connection.execute(
          `
          SELECT id
          FROM courses
          WHERE course_code = ?
          LIMIT 1
          `,
          [candidate]
        );

      if (
        !rows.length ||
        Number(rows[0].id) === Number(courseId)
      ) {
        return candidate;
      }
    }
  }

  /*
   * Guaranteed numeric fallback.
   */

  let number = 2;

  while (true) {
    const suffix = `-${number}`;
    const candidate =
      base.slice(0, 80 - suffix.length) +
      suffix;

    const [rows] =
      await connection.execute(
        `
        SELECT id
        FROM courses
        WHERE course_code = ?
        LIMIT 1
        `,
        [candidate]
      );

    if (
      !rows.length ||
      Number(rows[0].id) === Number(courseId)
    ) {
      return candidate;
    }

    number++;
  }
}

/* =========================================================
   ASSESSMENT QUESTIONS
   ========================================================= */

function questionFromLesson(lesson) {
  const seed = lesson.assessmentSeed;

  if (
    !seed?.prompt ||
    !seed?.correct ||
    !Array.isArray(seed.distractors) ||
    seed.distractors.length < 3
  ) {
    return null;
  }

  return {
    prompt: text(seed.prompt),

    explanation:
      text(seed.explanation) ||
      `This question checks understanding of ${lesson.title}.`,

    options: [
      {
        key: "A",
        text: text(seed.correct),
        correct: true,
      },
      {
        key: "B",
        text: text(seed.distractors[0]),
        correct: false,
      },
      {
        key: "C",
        text: text(seed.distractors[1]),
        correct: false,
      },
      {
        key: "D",
        text: text(seed.distractors[2]),
        correct: false,
      },
    ],
  };
}

/* =========================================================
   INSERT MANY
   ========================================================= */

async function insertMany(
  connection,
  table,
  columns,
  rows
) {
  if (!rows.length) return;

  const placeholder =
    "(" +
    columns.map(() => "?").join(",") +
    ")";

  const sql = `
    INSERT INTO ${table}
    (${columns.join(",")})
    VALUES ${rows.map(() => placeholder).join(",")}
  `;

  await connection.execute(
    sql,
    rows.flat()
  );
}

/* =========================================================
   DELETE OLD COURSE CONTENT
   ========================================================= */

async function clearCourseContent(
  connection,
  courseId
) {
  /*
   * Questions/options first.
   */

  await connection.execute(
    `
    DELETE ao
    FROM answer_options ao
    INNER JOIN questions q
      ON q.id = ao.question_id
    INNER JOIN assessments a
      ON a.id = q.assessment_id
    WHERE a.course_id = ?
    `,
    [courseId]
  );

  await connection.execute(
    `
    DELETE q
    FROM questions q
    INNER JOIN assessments a
      ON a.id = q.assessment_id
    WHERE a.course_id = ?
    `,
    [courseId]
  );

  await connection.execute(
    `
    DELETE FROM assessments
    WHERE course_id = ?
    `,
    [courseId]
  );

  /*
   * Lessons before modules.
   */

  await connection.execute(
    `
    DELETE l
    FROM lessons l
    INNER JOIN modules m
      ON m.id = l.module_id
    WHERE m.course_id = ?
    `,
    [courseId]
  );

  await connection.execute(
    `
    DELETE FROM modules
    WHERE course_id = ?
    `,
    [courseId]
  );
}

/* =========================================================
   INSERT ASSESSMENT
   ========================================================= */

async function insertAssessment(
  connection,
  {
    courseId,
    moduleId = null,
    lessonId = null,
    type,
    title,
    description,
    duration,
    passingScore,
    questions,
  }
) {
  if (!questions.length) {
    return {
      questions: 0,
      options: 0,
    };
  }

  const [result] =
    await connection.execute(
      `
      INSERT INTO assessments
      (
        course_id,
        module_id,
        lesson_id,
        type,
        title,
        description,
        duration_minutes,
        passing_score,
        max_attempts,
        randomize_questions,
        is_published
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 3, 1, 1)
      `,
      [
        courseId,
        moduleId,
        lessonId,
        type,
        title,
        description,
        duration,
        passingScore,
      ]
    );

  const assessmentId =
    Number(result.insertId);

  let questionCount = 0;
  let optionCount = 0;

  for (
    let index = 0;
    index < questions.length;
    index++
  ) {
    const question = questions[index];

    const [questionResult] =
      await connection.execute(
        `
        INSERT INTO questions
        (
          assessment_id,
          question_text,
          explanation,
          question_type,
          points,
          position
        )
        VALUES (?, ?, ?, 'multiple_choice', 1, ?)
        `,
        [
          assessmentId,
          question.prompt,
          question.explanation,
          index + 1,
        ]
      );

    const questionId =
      Number(questionResult.insertId);

    const optionRows =
      question.options.map(
        (option, optionIndex) => [
          questionId,
          option.key,
          option.text,
          option.correct ? 1 : 0,
          optionIndex + 1,
        ]
      );

    await insertMany(
      connection,
      "answer_options",
      [
        "question_id",
        "option_key",
        "option_text",
        "is_correct",
        "position",
      ],
      optionRows
    );

    questionCount++;
    optionCount += optionRows.length;
  }

  return {
    questions: questionCount,
    options: optionCount,
  };
}

/* =========================================================
   SEED
   ========================================================= */

async function seed() {
  console.log("");
  console.log(
    "======================================"
  );
  console.log(
    "   E-LEARNING COURSE DATABASE SEED"
  );
  console.log(
    "======================================"
  );
  console.log("");

  validateCurriculum();

  console.log(
    `📚 Curriculum subjects: ${curriculum.subjects.length}`
  );

  console.log(
    `📘 Curriculum courses: ${curriculum.courses.length}`
  );

  console.log("");

  const connection =
    await pool.getConnection();

  const stats = {
    subjects: 0,
    courses: 0,
    modules: 0,
    lessons: 0,
    lessonQuizzes: 0,
    moduleTests: 0,
    finalExams: 0,
    questions: 0,
    options: 0,
  };

  try {
    await connection.beginTransaction();

    /* =====================================================
       SUBJECTS
       ===================================================== */

    for (
      let i = 0;
      i < curriculum.subjects.length;
      i++
    ) {
      const subject =
        curriculum.subjects[i];

      const subjectSlug =
        subject.slug ||
        slugify(subject.name);

      await connection.execute(
        `
        INSERT INTO subjects
        (
          name,
          slug,
          code,
          description,
          category,
          education_level,
          is_active,
          display_order
        )
        VALUES (?, ?, ?, ?, ?, ?, 1, ?)
        ON DUPLICATE KEY UPDATE
          name = VALUES(name),
          code = VALUES(code),
          description = VALUES(description),
          category = VALUES(category),
          education_level = VALUES(education_level),
          is_active = 1,
          display_order = VALUES(display_order)
        `,
        [
          text(subject.name),
          subjectSlug,
          subject.code ?? null,
          subject.description ?? null,
          subject.category ?? null,
          subject.educationLevel ??
            subject.education_level ??
            "all",
          i,
        ]
      );

      stats.subjects++;
    }

    /* =====================================================
       HIDE OLD COURSES
       ===================================================== */

    await connection.execute(
      `
      UPDATE courses
      SET is_published = 0
      `
    );

    /* =====================================================
       COURSES
       ===================================================== */

    for (
      let courseIndex = 0;
      courseIndex < curriculum.courses.length;
      courseIndex++
    ) {
      const course =
        curriculum.courses[courseIndex];

      const requestedSlug =
        course.slug ||
        slugify(course.title);

      /*
       * Find existing course by ORIGINAL slug.
       */

      const [existingRows] =
        await connection.execute(
          `
          SELECT id
          FROM courses
          WHERE slug = ?
          LIMIT 1
          `,
          [requestedSlug]
        );

      const courseId =
        existingRows.length
          ? Number(existingRows[0].id)
          : null;

      /*
       * Resolve both unique fields BEFORE
       * performing INSERT/UPDATE.
       */

      const finalSlug =
        await getUniqueSlug(
          connection,
          requestedSlug,
          courseId,
          course.level,
          course.title
        );

      const finalCode =
        await getUniqueCourseCode(
          connection,
          course.code,
          courseId,
          course.level,
          course.title
        );

      const subjectId =
        await findSubject(
          connection,
          course
        );

      const duration =
        Number(
          course.durationMinutes ??
          course.duration_minutes ??
          0
        );

      const passingScore =
        Number(
          course.passingScore ??
          course.passing_score ??
          50
        );

      let actualCourseId =
        courseId;

      /*
       * UPDATE existing course
       */

      if (actualCourseId) {
        await connection.execute(
          `
          UPDATE courses
          SET
            subject_id = ?,
            title = ?,
            slug = ?,
            course_code = ?,
            level = ?,
            description = ?,
            duration_minutes = ?,
            passing_score = ?,
            is_published = 1,
            display_order = ?
          WHERE id = ?
          `,
          [
            subjectId,
            text(course.title),
            finalSlug,
            finalCode,
            course.level ?? "beginner",
            course.description ?? null,
            duration,
            passingScore,
            courseIndex,
            actualCourseId,
          ]
        );
      } else {
        /*
         * INSERT new course
         */

        const [result] =
          await connection.execute(
            `
            INSERT INTO courses
            (
              subject_id,
              title,
              slug,
              course_code,
              level,
              description,
              duration_minutes,
              passing_score,
              is_published,
              display_order
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
            `,
            [
              subjectId,
              text(course.title),
              finalSlug,
              finalCode,
              course.level ?? "beginner",
              course.description ?? null,
              duration,
              passingScore,
              courseIndex,
            ]
          );

        actualCourseId =
          Number(result.insertId);
      }

      /*
       * Now clear only this course's old
       * generated learning content.
       */

      await clearCourseContent(
        connection,
        actualCourseId
      );

      stats.courses++;

      /* ===================================================
         MODULES
         =================================================== */

      for (
        let moduleIndex = 0;
        moduleIndex < course.modules.length;
        moduleIndex++
      ) {
        const module =
          course.modules[moduleIndex];

        const moduleCode =
          text(
            module.code ??
            module.module_code ??
            `${moduleIndex + 1}.0`
          );

        const moduleNumber =
          Number(
            module.moduleNumber ??
            module.module_number ??
            moduleIndex + 1
          );

        const moduleDuration =
          Number(
            module.durationMinutes ??
            module.duration_minutes ??
            0
          );

        const [moduleResult] =
          await connection.execute(
            `
            INSERT INTO modules
            (
              course_id,
              module_number,
              module_code,
              title,
              description,
              position,
              duration_minutes,
              is_published
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, 1)
            `,
            [
              actualCourseId,
              moduleNumber,
              moduleCode,
              text(module.title),
              module.description ?? null,
              moduleIndex + 1,
              moduleDuration,
            ]
          );

        const moduleId =
          Number(moduleResult.insertId);

        stats.modules++;

        /* ===============================================
           LESSONS
           =============================================== */

        for (
          let lessonIndex = 0;
          lessonIndex < module.lessons.length;
          lessonIndex++
        ) {
          const lesson =
            module.lessons[lessonIndex];

          /*
           * Guaranteed unique lesson code.
           *
           * NEVER truncate this.
           */

          const lessonCode =
            `C${actualCourseId}-M${moduleId}-L${lessonIndex + 1}`;

          const lessonDuration =
            Number(
              lesson.durationMinutes ??
              lesson.duration_minutes ??
              0
            );

          const [lessonResult] =
            await connection.execute(
              `
              INSERT INTO lessons
              (
                module_id,
                lesson_code,
                title,
                objective,
                content,
                summary,
                duration_minutes,
                position,
                is_free,
                is_published
              )
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
              `,
              [
                moduleId,
                lessonCode,
                text(lesson.title),
                lesson.objective ?? null,
                lesson.content ?? "",
                lesson.summary ?? null,
                lessonDuration,
                lessonIndex + 1,
                lessonIndex < 2 ? 1 : 0,
              ]
            );

          const lessonId =
            Number(lessonResult.insertId);

          stats.lessons++;

          /*
           * Lesson quiz from existing
           * assessmentSeed.
           */

          const question =
            questionFromLesson(lesson);

          if (question) {
            const quiz =
              await insertAssessment(
                connection,
                {
                  courseId:
                    actualCourseId,
                  moduleId,
                  lessonId,
                  type: "lesson_quiz",
                  title:
                    `${lesson.title} — Lesson Quiz`,
                  description:
                    `Quiz for ${course.title}: ${lesson.title}.`,
                  duration: 10,
                  passingScore: 50,
                  questions: [question],
                }
              );

            if (quiz.questions) {
              stats.lessonQuizzes++;
              stats.questions +=
                quiz.questions;
              stats.options +=
                quiz.options;
            }
          }
        }

        /* ===============================================
           MODULE TEST
           =============================================== */

        const moduleQuestions =
          module.lessons
            .map(questionFromLesson)
            .filter(Boolean);

        if (moduleQuestions.length) {
          const result =
            await insertAssessment(
              connection,
              {
                courseId:
                  actualCourseId,
                moduleId,
                type: "module_test",
                title:
                  `${module.title} — Module Test`,
                description:
                  `Test covering the lessons in ${module.title}.`,
                duration: 30,
                passingScore: 50,
                questions:
                  moduleQuestions,
              }
            );

          if (result.questions) {
            stats.moduleTests++;
            stats.questions +=
              result.questions;
            stats.options +=
              result.options;
          }
        }
      }

      /* ===================================================
         FINAL EXAM
         =================================================== */

      const finalQuestions = [];

      for (const module of course.modules) {
        for (const lesson of module.lessons) {
          const question =
            questionFromLesson(lesson);

          if (question) {
            finalQuestions.push(question);
          }
        }
      }

      if (finalQuestions.length) {
        const result =
          await insertAssessment(
            connection,
            {
              courseId:
                actualCourseId,
              type: "final_exam",
              title:
                `${course.title} — Final Examination`,
              description:
                `Final examination covering ${course.title}.`,
              duration: 60,
              passingScore,
              questions:
                finalQuestions,
            }
          );

        if (result.questions) {
          stats.finalExams++;
          stats.questions +=
            result.questions;
          stats.options +=
            result.options;
        }
      }

      console.log(
        `  ✓ ${course.title}`
      );
    }

    await connection.commit();

    console.log("");
    console.log(
      "======================================"
    );
    console.log(
      "   ✅ COURSE SEED COMPLETED"
    );
    console.log(
      "======================================"
    );
    console.log("");

    console.table(stats);

    console.log("");
    console.log(
      `✅ ${stats.courses} courses`
    );
    console.log(
      `✅ ${stats.modules} modules`
    );
    console.log(
      `✅ ${stats.lessons} lessons`
    );
    console.log(
      `✅ ${stats.lessonQuizzes} lesson quizzes`
    );
    console.log(
      `✅ ${stats.moduleTests} module tests`
    );
    console.log(
      `✅ ${stats.finalExams} final exams`
    );
    console.log(
      `✅ ${stats.questions} questions`
    );
    console.log(
      `✅ ${stats.options} answer options`
    );
    console.log("");
  } catch (error) {
    await connection.rollback();

    console.error("");
    console.error(
      "❌ COURSE SEED FAILED"
    );
    console.error(
      "Code:",
      error?.code ?? "NO_ERROR_CODE"
    );
    console.error(
      "Message:",
      error?.message ?? error
    );

    if (error?.sqlMessage) {
      console.error(
        "SQL Message:",
        error.sqlMessage
      );
    }

    throw error;
  } finally {
    connection.release();
    await pool.end();
  }
}

seed().catch(() => {
  process.exit(1);
}); 