import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import mysql from "mysql2/promise";

const root = process.cwd();

const dataPath = path.resolve(
  root,
  "data",
  "curriculum.json"
);

const sourcesPath = path.resolve(
  root,
  "data",
  "lesson-sources.json"
);

const db = mysql.createPool({
  host: process.env.DB_HOST ?? "127.0.0.1",
  port: Number(process.env.DB_PORT ?? 3306),
  user: process.env.DB_USER ?? "",
  password: process.env.DB_PASSWORD ?? "",
  database: process.env.DB_NAME ?? "school",
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
  charset: "utf8mb4",
});

/* =========================================================
   GENERAL HELPERS
========================================================= */

function text(value, fallback = "") {
  if (
    value === undefined ||
    value === null
  ) {
    return fallback;
  }

  return String(value).trim();
}

function slug(value) {
  return text(value)
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-");
}

function code(value) {
  return text(value)
    .toUpperCase()
    .replace(/&/g, "AND")
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-");
}

function uniqueValue(
  value,
  used,
  fallback = "ITEM"
) {
  const base =
    code(value) ||
    code(fallback) ||
    "ITEM";

  if (!used.has(base)) {
    used.add(base);
    return base;
  }

  let counter = 2;
  let candidate = `${base}-${counter}`;

  while (used.has(candidate)) {
    counter += 1;
    candidate = `${base}-${counter}`;
  }

  used.add(candidate);

  return candidate;
}

function uniqueSlug(
  value,
  used,
  fallback = "item"
) {
  const base =
    slug(value) ||
    slug(fallback) ||
    "item";

  if (!used.has(base)) {
    used.add(base);
    return base;
  }

  let counter = 2;
  let candidate = `${base}-${counter}`;

  while (used.has(candidate)) {
    counter += 1;
    candidate = `${base}-${counter}`;
  }

  used.add(candidate);

  return candidate;
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function numberOr(
  value,
  fallback = 0
) {
  const n = Number(value);

  return Number.isFinite(n)
    ? n
    : fallback;
}

function firstDefined(...values) {
  for (const value of values) {
    if (
      value !== undefined &&
      value !== null &&
      value !== ""
    ) {
      return value;
    }
  }

  return undefined;
}

/* =========================================================
   SUBJECT / COURSE HELPERS
========================================================= */

function getCourseLevel(course) {
  return text(
    firstDefined(
      course.level,
      course.classLevel,
      course.grade,
      course.educationLevel,
      ""
    )
  );
}

function normalizeLevel(value) {
  return text(value)
    .toUpperCase()
    .replace(/\s+/g, "")
    .replace(/[^A-Z0-9]/g, "");
}

function getCourseTitle(course) {
  return text(
    firstDefined(
      course.title,
      course.name,
      course.courseTitle
    ),
    "Untitled Course"
  );
}

function getCourseSubject(course) {
  return text(
    firstDefined(
      course.subject,
      course.subjectName,
      course.category,
      course.department,
      "General"
    ),
    "General"
  );
}

function getCourseDescription(course) {
  return text(
    firstDefined(
      course.description,
      course.overview,
      course.summary,
      course.introduction,
      ""
    )
  );
}

function getSubjectCode(subject) {
  return text(
    firstDefined(
      subject.code,
      subject.subjectCode,
      ""
    )
  );
}

function getCourseSourceCode(course) {
  return text(
    firstDefined(
      course.courseCode,
      course.code,
      ""
    )
  );
}

function getDatabaseCourseCode(
  course,
  usedCodes
) {
  const titleCode = code(
    getCourseTitle(course)
  );

  const sourceCode = code(
    getCourseSourceCode(course)
  );

  const level = code(
    normalizeLevel(
      getCourseLevel(course)
    )
  );

  /*
   * IMPORTANT:
   *
   * course_code is globally unique in the DB.
   *
   * The source curriculum legitimately contains
   * the same subject/course across different school
   * levels, e.g. English Studies JSS1/JSS2/JSS3.
   *
   * Therefore level is included whenever possible.
   */

  let preferred;

  if (sourceCode) {
    preferred = sourceCode;

    if (level) {
      preferred = `${sourceCode}-${level}`;
    }
  } else {
    preferred = titleCode;

    if (level) {
      preferred = `${titleCode}-${level}`;
    }
  }

  return uniqueValue(
    preferred,
    usedCodes,
    `${titleCode}-${level || "COURSE"}`
  );
}

/* =========================================================
   MODULE / LESSON HELPERS
========================================================= */

function getModules(course) {
  return Array.isArray(course.modules)
    ? course.modules
    : [];
}

function getLessons(module) {
  return Array.isArray(module.lessons)
    ? module.lessons
    : [];
}

function getModuleNumber(
  module,
  index
) {
  const candidate = Number(
    firstDefined(
      module.moduleNumber,
      module.number,
      module.position,
      index + 1
    )
  );

  return Number.isFinite(candidate) &&
    candidate > 0
    ? candidate
    : index + 1;
}

function getLessonNumber(
  lesson,
  index
) {
  const candidate = Number(
    firstDefined(
      lesson.lessonNumber,
      lesson.number,
      lesson.position,
      index + 1
    )
  );

  return Number.isFinite(candidate) &&
    candidate > 0
    ? candidate
    : index + 1;
}

function getModuleTitle(
  module,
  number
) {
  return text(
    firstDefined(
      module.title,
      module.name,
      module.moduleTitle,
      `Module ${number}`
    )
  );
}

function getLessonTitle(
  lesson,
  number
) {
  return text(
    firstDefined(
      lesson.title,
      lesson.name,
      lesson.lessonTitle,
      `Lesson ${number}`
    )
  );
}

function getModuleCode(
  module,
  number,
  used
) {
  const sourceCode = text(
    firstDefined(
      module.moduleCode,
      module.code,
      ""
    )
  );

  /*
   * Module uniqueness is scoped by course in the
   * current schema, but we still normalize missing
   * source codes.
   */
  const preferred =
    sourceCode ||
    `M${String(number).padStart(2, "0")}`;

  return uniqueValue(
    preferred,
    used,
    `M${String(number).padStart(2, "0")}`
  );
}

function getLessonCode(
  lesson,
  number,
  used
) {
  const sourceCode = text(
    firstDefined(
      lesson.lessonCode,
      lesson.code,
      ""
    )
  );

  const preferred =
    sourceCode ||
    `L${String(number).padStart(2, "0")}`;

  return uniqueValue(
    preferred,
    used,
    `L${String(number).padStart(2, "0")}`
  );
}

/* =========================================================
   CONTENT RENDERING
========================================================= */

function renderValue(value) {
  if (
    value === undefined ||
    value === null
  ) {
    return "";
  }

  if (typeof value === "string") {
    return value.trim();
  }

  if (
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value
      .map(renderValue)
      .filter(Boolean)
      .join("\n\n");
  }

  if (typeof value === "object") {
    return Object.entries(value)
      .map(([key, child]) => {
        const rendered =
          renderValue(child);

        return rendered
          ? `${key}: ${rendered}`
          : "";
      })
      .filter(Boolean)
      .join("\n\n");
  }

  return String(value);
}

function renderKeyTerms(
  terms
) {
  if (!Array.isArray(terms)) {
    return "";
  }

  if (!terms.length) {
    return "";
  }

  const lines = [
    "## Key Terms",
    "",
  ];

  for (const term of terms) {
    if (typeof term === "string") {
      lines.push(`- ${term}`);
      continue;
    }

    if (
      term &&
      typeof term === "object"
    ) {
      const name = text(
        firstDefined(
          term.term,
          term.word,
          term.name,
          ""
        )
      );

      const definition = text(
        firstDefined(
          term.definition,
          term.meaning,
          term.description,
          ""
        )
      );

      if (name && definition) {
        lines.push(
          `- **${name}:** ${definition}`
        );
      } else if (name) {
        lines.push(`- ${name}`);
      }
    }
  }

  return lines.join("\n");
}

function renderActivities(
  activities
) {
  if (!activities) {
    return "";
  }

  return [
    "## Activities",
    "",
    renderValue(activities),
  ].join("\n");
}

function renderMistakes(
  mistakes
) {
  if (!Array.isArray(mistakes)) {
    return "";
  }

  if (!mistakes.length) {
    return "";
  }

  return [
    "## Common Mistakes",
    "",
    ...mistakes.map(
      (mistake) =>
        `- ${renderValue(mistake)}`
    ),
  ].join("\n");
}

function normalizeQuestion(
  question
) {
  if (
    !question ||
    typeof question !== "object"
  ) {
    return null;
  }

  const prompt = text(
    firstDefined(
      question.question,
      question.prompt,
      question.text,
      question.questionText,
      ""
    )
  );

  if (!prompt) {
    return null;
  }

  let options = [];

  if (
    Array.isArray(
      question.options
    )
  ) {
    options =
      question.options.map(
        (option, index) => {
          if (
            typeof option ===
            "string"
          ) {
            return {
              key: String.fromCharCode(
                65 + index
              ),
              text: option,
            };
          }

          return {
            key:
              text(
                firstDefined(
                  option.key,
                  option.id,
                  option.label,
                  ""
                )
              ) ||
              String.fromCharCode(
                65 + index
              ),

            text: text(
              firstDefined(
                option.text,
                option.option,
                option.value,
                option.answer,
                ""
              )
            ),
          };
        }
      );
  }

  /*
   * Old source format:
   *
   * {
   *   prompt,
   *   correct,
   *   distractors: []
   * }
   */

  if (
    !options.length &&
    Array.isArray(
      question.distractors
    )
  ) {
    const correct = text(
      firstDefined(
        question.correct,
        question.answer,
        ""
      )
    );

    const values = [
      correct,
      ...question.distractors.map(
        (value) => text(value)
      ),
    ].filter(Boolean);

    options = values.map(
      (value, index) => ({
        key: String.fromCharCode(
          65 + index
        ),
        text: value,
      })
    );
  }

  const rawAnswer = firstDefined(
    question.answer,
    question.correct,
    question.correctAnswer,
    question.answerKey
  );

  let correctKey = "";

  if (
    typeof rawAnswer ===
    "number"
  ) {
    correctKey =
      options[rawAnswer]?.key ||
      options[
        rawAnswer - 1
      ]?.key ||
      "";
  } else {
    const answerText =
      text(rawAnswer);

    const keyMatch =
      options.find(
        (option) =>
          option.key.toLowerCase() ===
          answerText.toLowerCase()
      );

    if (keyMatch) {
      correctKey =
        keyMatch.key;
    } else {
      const textMatch =
        options.find(
          (option) =>
            option.text.toLowerCase() ===
            answerText.toLowerCase()
        );

      if (textMatch) {
        correctKey =
          textMatch.key;
      }
    }
  }

  return {
    prompt,
    options,
    correctKey,
    explanation: text(
      firstDefined(
        question.explanation,
        question.rationale,
        question.feedback,
        ""
      )
    ),
    points:
      numberOr(
        question.points,
        1
      ) || 1,
  };
}

function normalizeQuestions(
  value
) {
  const source =
    Array.isArray(value)
      ? value
      : value?.questions;

  if (!Array.isArray(source)) {
    return [];
  }

  return source
    .map(normalizeQuestion)
    .filter(Boolean);
}

function renderQuiz(
  quiz
) {
  const questions =
    normalizeQuestions(quiz);

  if (!questions.length) {
    return "";
  }

  const lines = [
    "## Lesson Quiz",
    "",
  ];

  questions.forEach(
    (question, index) => {
      lines.push(
        `### ${index + 1}. ${question.prompt}`
      );

      question.options.forEach(
        (option) => {
          lines.push(
            `${option.key}. ${option.text}`
          );
        }
      );

      lines.push("");

      if (
        question.explanation
      ) {
        lines.push(
          `**Explanation:** ${question.explanation}`
        );
        lines.push("");
      }
    }
  );

  return lines.join("\n").trim();
}

function renderLessonContent(
  lesson
) {
  const sections = [];

  const content =
    firstDefined(
      lesson.content,
      lesson.body,
      lesson.material,
      lesson.text,
      lesson.lessonContent
    );

  if (content) {
    sections.push(
      renderValue(content)
    );
  }

  const objective =
    firstDefined(
      lesson.objective,
      lesson.objectives,
      lesson.learningObjective,
      lesson.learningObjectives
    );

  if (objective) {
    sections.push(
      [
        "## Learning Objectives",
        "",
        renderValue(objective),
      ].join("\n")
    );
  }

  const keyTerms =
    renderKeyTerms(
      firstDefined(
        lesson.keyTerms,
        lesson.key_terms,
        lesson.terms
      )
    );

  if (keyTerms) {
    sections.push(keyTerms);
  }

  const activities =
    renderActivities(
      firstDefined(
        lesson.activities,
        lesson.activity,
        lesson.classActivity,
        lesson.practice
      )
    );

  if (activities) {
    sections.push(
      activities
    );
  }

  const mistakes =
    renderMistakes(
      firstDefined(
        lesson.commonMistakes,
        lesson.common_mistakes,
        lesson.mistakes
      )
    );

  if (mistakes) {
    sections.push(mistakes);
  }

  const summary =
    firstDefined(
      lesson.summary,
      lesson.summaries,
      lesson.recap,
      lesson.conclusion
    );

  if (summary) {
    sections.push(
      [
        "## Summary",
        "",
        renderValue(summary),
      ].join("\n")
    );
  }

  const quiz =
    renderQuiz(
      lesson.quiz
    );

  if (quiz) {
    sections.push(quiz);
  }

  /*
   * Source-first metadata is retained.
   */
  if (lesson.sourceFirst) {
    const source =
      typeof lesson.sourceFirst ===
      "string"
        ? lesson.sourceFirst
        : firstDefined(
            lesson.sourceFirst.url,
            lesson.sourceFirst.sourceUrl,
            lesson.sourceFirst.reference,
            ""
          );

    if (source) {
      sections.push(
        [
          "## Source Reference",
          "",
          source,
        ].join("\n")
      );
    }
  }

  return sections
    .map((section) =>
      text(section)
    )
    .filter(Boolean)
    .join("\n\n");
}

/* =========================================================
   QUESTION / ASSESSMENT HELPERS
========================================================= */

function getModuleQuestions(
  module
) {
  const test =
    module.test ||
    module.moduleTest ||
    module.module_test ||
    module.assessment;

  return normalizeQuestions(
    test
  );
}

function getFinalQuestions(
  course
) {
  const exam =
    course.finalExam ||
    course.final_exam ||
    course.exam;

  return normalizeQuestions(
    exam
  );
}

/* =========================================================
   DURATION
========================================================= */

function totalLessonMinutes(
  course
) {
  return getModules(course)
    .reduce(
      (courseTotal, module) =>
        courseTotal +
        getLessons(module)
          .reduce(
            (moduleTotal, lesson) =>
              moduleTotal +
              numberOr(
                firstDefined(
                  lesson.durationMinutes,
                  lesson.duration,
                  0
                ),
                0
              ),
            0
          ),
      0
    );
}

/* =========================================================
   SOURCE VALIDATION
========================================================= */

function validateCurriculum(
  curriculum
) {
  assert(
    curriculum &&
      typeof curriculum ===
        "object",
    "curriculum.json is not a valid JSON object."
  );

  assert(
    Array.isArray(
      curriculum.courses
    ),
    "curriculum.courses must be an array."
  );

  assert(
    curriculum.courses.length > 0,
    "curriculum.json contains no courses."
  );

  for (
    let i = 0;
    i < curriculum.courses.length;
    i += 1
  ) {
    const course =
      curriculum.courses[i];

    assert(
      getCourseTitle(course),
      `Course ${i + 1} has no title.`
    );

    assert(
      getModules(course).length >
        0,
      `Course "${getCourseTitle(course)}" has no modules.`
    );

    for (
      let mi = 0;
      mi <
      getModules(course).length;
      mi += 1
    ) {
      const module =
        getModules(course)[mi];

      assert(
        getLessons(module).length >
          0,
        `Course "${getCourseTitle(course)}" module ${mi + 1} has no lessons.`
      );
    }
  }
}

/* =========================================================
   PRE-FLIGHT DUPLICATE AUDIT
========================================================= */

function preflightAudit(
  curriculum
) {
  console.log("");
  console.log(
    "============================================"
  );
  console.log(
    "🔎 PRE-FLIGHT CURRICULUM AUDIT"
  );
  console.log(
    "============================================"
  );

  const courses =
    curriculum.courses;

  /*
   * Subjects
   */
  const subjectNames =
    new Map();

  for (const subject of
    curriculum.subjects ?? []) {
    const name =
      text(
        firstDefined(
          subject.name,
          subject.title,
          subject
        )
      );

    const key =
      name.toLowerCase();

    subjectNames.set(
      key,
      (subjectNames.get(key) ??
        0) + 1
    );
  }

  const duplicateSubjects =
    [...subjectNames.entries()]
      .filter(
        ([, count]) =>
          count > 1
      );

  console.log(
    duplicateSubjects.length
      ? `⚠️ Subject name duplicates: ${duplicateSubjects.length}`
      : "✅ Subject names are unique."
  );

  /*
   * Course source codes.
   */
  const sourceCourseCodes =
    new Map();

  for (const course of courses) {
    const source =
      code(
        getCourseSourceCode(
          course
        )
      );

    if (!source) continue;

    sourceCourseCodes.set(
      source,
      (sourceCourseCodes.get(
        source
      ) ?? 0) + 1
    );
  }

  const duplicateCourseCodes =
    [...sourceCourseCodes.entries()]
      .filter(
        ([, count]) =>
          count > 1
      );

  if (
    duplicateCourseCodes.length
  ) {
    console.log(
      `⚠️ Duplicate source course codes: ${duplicateCourseCodes.length}`
    );

    for (const [
      duplicate,
      count,
    ] of duplicateCourseCodes) {
      console.log(
        `   ${duplicate} × ${count}`
      );
    }

    console.log(
      "   → Level-qualified database codes will be generated."
    );
  } else {
    console.log(
      "✅ Source course codes are unique."
    );
  }

  /*
   * Database course codes.
   */
  const usedCourseCodes =
    new Set();

  let courseCodeAdjustments = 0;

  for (const course of courses) {
    const original =
      code(
        getCourseSourceCode(
          course
        )
      );

    const level =
      code(
        normalizeLevel(
          getCourseLevel(
            course
          )
        )
      );

    const preferred =
      original
        ? level
          ? `${original}-${level}`
          : original
        : level
          ? `${code(
              getCourseTitle(
                course
              )
            )}-${level}`
          : code(
              getCourseTitle(
                course
              )
            );

    const generated =
      uniqueValue(
        preferred,
        usedCourseCodes,
        preferred
      );

    if (
      original &&
      generated !== original
    ) {
      courseCodeAdjustments += 1;
    }
  }

  console.log(
    `✅ Database course-code audit passed: ${courses.length} courses`
  );

  if (
    courseCodeAdjustments
  ) {
    console.log(
      `   ℹ️ ${courseCodeAdjustments} course code(s) will be qualified for database uniqueness.`
    );
  }

  /*
   * Module codes.
   *
   * Uniqueness is scoped to each course.
   */
  let moduleCount = 0;
  let moduleCodeAdjustments = 0;

  for (const course of courses) {
    const usedModules =
      new Set();

    for (
      let i = 0;
      i < getModules(course).length;
      i += 1
    ) {
      const module =
        getModules(course)[i];

      const number =
        getModuleNumber(
          module,
          i
        );

      const source =
        text(
          firstDefined(
            module.moduleCode,
            module.code,
            ""
          )
        );

      const generated =
        getModuleCode(
          module,
          number,
          usedModules
        );

      moduleCount += 1;

      if (
        source &&
        generated !==
          uniqueCodePreview(
            source,
            number,
            moduleCount
          )
      ) {
        moduleCodeAdjustments += 1;
      }
    }
  }

  console.log(
    `✅ Module audit passed: ${moduleCount} modules`
  );

  /*
   * Lessons.
   */
  let lessonCount = 0;

  for (const course of courses) {
    for (const module of
      getModules(course)) {
      const usedLessons =
        new Set();

      for (
        let i = 0;
        i <
        getLessons(module).length;
        i += 1
      ) {
        const lesson =
          getLessons(module)[i];

        const number =
          getLessonNumber(
            lesson,
            i
          );

        getLessonCode(
          lesson,
          number,
          usedLessons
        );

        lessonCount += 1;
      }
    }
  }

  console.log(
    `✅ Lesson audit passed: ${lessonCount} lessons`
  );

  /*
   * Assessments.
   */
  let moduleTests = 0;
  let finalExams = 0;

  for (const course of courses) {
    for (const module of
      getModules(course)) {
      if (
        getModuleQuestions(
          module
        ).length
      ) {
        moduleTests += 1;
      }
    }

    if (
      getFinalQuestions(
        course
      ).length
    ) {
      finalExams += 1;
    }
  }

  console.log(
    `✅ Assessment audit passed: ${moduleTests} module tests + ${finalExams} final exams`
  );

  /*
   * Question structure.
   */
  let questions = 0;
  let invalidQuestions = 0;

  function inspectQuestions(
    list,
    location
  ) {
    for (
      let i = 0;
      i < list.length;
      i += 1
    ) {
      const question =
        list[i];

      questions += 1;

      if (
        !question.options ||
        question.options.length <
          2 ||
        !question.correctKey
      ) {
        invalidQuestions += 1;

        console.log(
          `   ⚠️ Question structure issue at ${location} #${i + 1}`
        );
      }
    }
  }

  for (const course of courses) {
    for (const module of
      getModules(course)) {
      inspectQuestions(
        getModuleQuestions(
          module
        ),
        `${getCourseTitle(
          course
        )} / ${getModuleTitle(
          module,
          1
        )}`
      );

      for (const lesson of
        getLessons(module)) {
        inspectQuestions(
          normalizeQuestions(
            lesson.quiz
          ),
          `${getCourseTitle(
            course
          )} / lesson ${getLessonTitle(
            lesson,
            1
          )}`
        );
      }
    }

    inspectQuestions(
      getFinalQuestions(course),
      `${getCourseTitle(
        course
      )} / final exam`
    );
  }

  if (invalidQuestions) {
    throw new Error(
      `Pre-flight failed: ${invalidQuestions} question(s) have invalid answer structures.`
    );
  }

  console.log(
    `✅ Question audit passed: ${questions} questions`
  );

  console.log("");
  console.log(
    "✅ PRE-FLIGHT AUDIT PASSED"
  );
  console.log(
    "============================================"
  );
  console.log("");

  return {
    courses: courses.length,
    modules: moduleCount,
    lessons: lessonCount,
    moduleTests,
    finalExams,
    questions,
  };
}

/*
 * Only used for comparing whether a source code
 * needs normalization. Does not control insertion.
 */
function uniqueCodePreview(
  source,
  number,
  index
) {
  return (
    code(source) ||
    `M${String(
      number
    ).padStart(2, "0")}-${index}`
  );
}

/* =========================================================
   DATABASE CLEANUP
========================================================= */

async function cleanCurriculum(
  connection
) {
  const tables = [
    "answer_options",
    "attempt_answers",
    "attempts",
    "course_completions",
    "lesson_resources",
    "lesson_progress",
    "enrollments",
    "questions",
    "assessments",
    "lessons",
    "modules",
    "courses",
    "subjects",
  ];

  for (const table of
    tables) {
    console.log(
      `   deleting ${table}...`
    );

    await connection.query(
      `DELETE FROM \`${table}\``
    );
  }
}

/* =========================================================
   INSERT SUBJECT
========================================================= */

async function insertSubject(
  connection,
  subject,
  subjectSlug,
  subjectCode,
  position
) {
  const name =
    text(
      firstDefined(
        subject.name,
        subject.title,
        subject
      )
    );

  const [result] =
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
      `,
      [
        name,
        subjectSlug,
        subjectCode,
        text(
          firstDefined(
            subject.description,
            `${name} secondary-school subject.`
          )
        ),
        text(
          firstDefined(
            subject.category,
            "Academic"
          )
        ),
        text(
          firstDefined(
            subject.educationLevel,
            "junior_secondary"
          )
        ),
        position,
      ]
    );

  return Number(
    result.insertId
  );
}

/* =========================================================
   INSERT COURSE
========================================================= */

async function insertCourse(
  connection,
  course,
  subjectId,
  position,
  courseSlug,
  courseCode
) {
  const title =
    getCourseTitle(course);

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
        thumbnail_url,
        instructor_name,
        duration_minutes,
        passing_score,
        is_published,
        display_order
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
      `,
      [
        subjectId,
        title,
        courseSlug,
        courseCode,
        getCourseLevel(
          course
        ),
        getCourseDescription(
          course
        ),

        /*
         * No generic image is used as
         * instructional content.
         */
        text(
          firstDefined(
            course.thumbnailUrl,
            course.thumbnail,
            ""
          )
        ) || null,

        text(
          firstDefined(
            course.instructor,
            course.instructorName,
            "PStacks Academic Curriculum Team"
          )
        ),

        totalLessonMinutes(
          course
        ),

        numberOr(
          firstDefined(
            course.finalExam
              ?.passingScore,
            course.passingScore,
            50
          ),
          50
        ),

        position,
      ]
    );

  return Number(
    result.insertId
  );
}

/* =========================================================
   INSERT MODULE
========================================================= */

async function insertModule(
  connection,
  courseId,
  module,
  moduleNumber,
  moduleCode,
  position
) {
  const duration =
    getLessons(module)
      .reduce(
        (sum, lesson) =>
          sum +
          numberOr(
            firstDefined(
              lesson.durationMinutes,
              lesson.duration,
              0
            ),
            0
          ),
        0
      );

  const [result] =
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
        courseId,
        moduleNumber,
        moduleCode,
        getModuleTitle(
          module,
          moduleNumber
        ),
        text(
          firstDefined(
            module.description,
            module.overview,
            module.summary,
            ""
          )
        ),
        position,
        duration,
      ]
    );

  return Number(
    result.insertId
  );
}

/* =========================================================
   INSERT LESSON
========================================================= */

async function insertLesson(
  connection,
  moduleId,
  lesson,
  lessonNumber,
  lessonCode,
  lessonPosition
) {
  const content =
    renderLessonContent(
      lesson
    );

  const [result] =
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
        video_url,
        document_url,
        duration_minutes,
        position,
        is_free,
        is_published
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 1)
      `,
      [
        moduleId,
        lessonCode,
        getLessonTitle(
          lesson,
          lessonNumber
        ),
        text(
          firstDefined(
            lesson.objective,
            lesson.objectives,
            lesson.learningObjective,
            lesson.learningObjectives,
            ""
          )
        ),
        content,
        text(
          firstDefined(
            lesson.summary,
            lesson.summaries,
            lesson.recap,
            lesson.conclusion,
            ""
          )
        ),
        text(
          firstDefined(
            lesson.videoUrl,
            lesson.video_url,
            lesson.video,
            ""
          )
        ) || null,
        text(
          firstDefined(
            lesson.documentUrl,
            lesson.document_url,
            lesson.document,
            ""
          )
        ) || null,
        numberOr(
          firstDefined(
            lesson.durationMinutes,
            lesson.duration,
            35
          ),
          35
        ),
        lessonPosition,
      ]
    );

  return Number(
    result.insertId
  );
}

/* =========================================================
   INSERT ASSESSMENT
========================================================= */

async function insertAssessment(
  connection,
  courseId,
  moduleId,
  lessonId,
  assessment
) {
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
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
      `,
      [
        courseId,
        moduleId,
        lessonId,
        assessment.type,
        assessment.title,
        text(
          firstDefined(
            assessment.description,
            "Assessment for the source curriculum."
          )
        ),
        numberOr(
          firstDefined(
            assessment.durationMinutes,
            assessment.duration,
            15
          ),
          15
        ),
        numberOr(
          firstDefined(
            assessment.passingScore,
            50
          ),
          50
        ),
        numberOr(
          firstDefined(
            assessment.maxAttempts,
            3
          ),
          3
        ),
        assessment.randomizeQuestions
          ? 1
          : 0,
      ]
    );

  return Number(
    result.insertId
  );
}

/* =========================================================
   INSERT QUESTION
========================================================= */

async function insertQuestion(
  connection,
  assessmentId,
  question,
  position
) {
  const [result] =
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
      VALUES (?, ?, ?, 'multiple_choice', ?, ?)
      `,
      [
        assessmentId,
        question.prompt,
        question.explanation ||
          null,
        numberOr(
          question.points,
          1
        ),
        position,
      ]
    );

  const questionId =
    Number(result.insertId);

  assert(
    question.options.length >=
      2,
    `Question "${question.prompt}" has fewer than two options.`
  );

  for (
    let i = 0;
    i <
    question.options.length;
    i += 1
  ) {
    const option =
      question.options[i];

    await connection.execute(
      `
      INSERT INTO answer_options
      (
        question_id,
        option_key,
        option_text,
        is_correct,
        position
      )
      VALUES (?, ?, ?, ?, ?)
      `,
      [
        questionId,
        option.key ||
          String.fromCharCode(
            65 + i
          ),
        option.text,
        option.key ===
        question.correctKey
          ? 1
          : 0,
        i + 1,
      ]
    );
  }
}

/* =========================================================
   MAIN SEED
========================================================= */

async function seed() {
  console.log("");
  console.log(
    "============================================"
  );
  console.log(
    "📚 SOURCE-FIRST CURRICULUM SEED"
  );
  console.log(
    "============================================"
  );

  console.log(
    `📄 ${dataPath}`
  );

  const raw =
    await fs.readFile(
      dataPath,
      "utf8"
    );

  const curriculum =
    JSON.parse(raw);

  validateCurriculum(
    curriculum
  );

  console.log(
    `📊 Courses in source: ${curriculum.courses.length}`
  );

  const [
    dbRows,
  ] =
    await db.query(
      "SELECT DATABASE() AS db"
    );

  console.log(
    `🗄️ Database: ${dbRows[0]?.db ?? "unknown"}`
  );

  /*
   * Source-first validation.
   */
  console.log(
    "✅ Source validation passed."
  );

  /*
   * This happens BEFORE touching the DB.
   */
  const audit =
    preflightAudit(
      curriculum
    );

  /*
   * Load lesson source map if present.
   */
  let lessonSources = {};

  try {
    const sourceRaw =
      await fs.readFile(
        sourcesPath,
        "utf8"
      );

    const sourceData =
      JSON.parse(sourceRaw);

    lessonSources =
      sourceData.sources ??
      {};
  } catch {
    /*
     * Optional file.
     */
    lessonSources = {};
  }

  const connection =
    await db.getConnection();

  try {
    await connection.beginTransaction();

    console.log("");
    console.log(
      "🧹 Removing previous curriculum data..."
    );

    await cleanCurriculum(
      connection
    );

    /*
     * -----------------------------------------------------
     * SUBJECTS
     * -----------------------------------------------------
     */

    const subjectIds =
      new Map();

    const usedSubjectSlugs =
      new Set();

    const usedSubjectCodes =
      new Set();

    const subjects =
      Array.isArray(
        curriculum.subjects
      )
        ? curriculum.subjects
        : [];

    /*
     * If the source has an incomplete subjects
     * array, derive subjects from courses.
     */
    const derivedSubjects =
      subjects.length
        ? subjects
        : [
            ...new Map(
              curriculum.courses.map(
                (course) => {
                  const name =
                    getCourseSubject(
                      course
                    );

                  return [
                    name,
                    {
                      name,
                      code:
                        code(name),
                      description:
                        `${name} secondary-school subject.`,
                      category:
                        "Academic",
                      educationLevel:
                        "secondary",
                    },
                  ];
                }
              )
            ).values(),
          ];

    console.log("");
    console.log(
      `📚 Importing ${derivedSubjects.length} subjects...`
    );

    for (
      let i = 0;
      i <
      derivedSubjects.length;
      i += 1
    ) {
      const subject =
        derivedSubjects[i];

      const subjectName =
        text(
          firstDefined(
            subject.name,
            subject.title,
            subject
          )
        );

      const subjectSlug =
        uniqueSlug(
          firstDefined(
            subject.slug,
            subjectName
          ),
          usedSubjectSlugs,
          subjectName
        );

      const subjectCode =
        uniqueValue(
          firstDefined(
            getSubjectCode(
              subject
            ),
            code(
              subjectName
            )
          ),
          usedSubjectCodes,
          `SUBJECT-${i + 1}`
        );

      const id =
        await insertSubject(
          connection,
          subject,
          subjectSlug,
          subjectCode,
          i + 1
        );

      subjectIds.set(
        subjectName.toLowerCase(),
        id
      );
    }

    /*
     * -----------------------------------------------------
     * COURSES
     * -----------------------------------------------------
     */

    const usedCourseSlugs =
      new Set();

    const usedCourseCodes =
      new Set();

    let courseCount = 0;
    let moduleCount = 0;
    let lessonCount = 0;
    let assessmentCount = 0;
    let questionCount = 0;

    console.log("");
    console.log(
      `🎓 Importing ${curriculum.courses.length} courses...`
    );

    for (
      let courseIndex = 0;
      courseIndex <
      curriculum.courses.length;
      courseIndex += 1
    ) {
      const course =
        curriculum.courses[
          courseIndex
        ];

      const title =
        getCourseTitle(
          course
        );

      const subjectName =
        getCourseSubject(
          course
        );

      let subjectId =
        subjectIds.get(
          subjectName.toLowerCase()
        );

      /*
       * Handle source courses whose subject
       * wasn't explicitly present in curriculum.subjects.
       */
      if (!subjectId) {
        const [rows] =
          await connection.execute(
            `
            SELECT id
            FROM subjects
            WHERE LOWER(name) = LOWER(?)
            LIMIT 1
            `,
            [subjectName]
          );

        subjectId =
          rows[0]
            ? Number(rows[0].id)
            : null;
      }

      assert(
        subjectId,
        `No subject row exists for course "${title}" with subject "${subjectName}".`
      );

      const courseSlug =
        uniqueSlug(
          firstDefined(
            course.slug,
            title
          ),
          usedCourseSlugs,
          title
        );

      const courseCode =
        getDatabaseCourseCode(
          course,
          usedCourseCodes
        );

      console.log(
        `   📘 ${courseIndex + 1}/${curriculum.courses.length} ${title} [${courseCode}]`
      );

      const courseId =
        await insertCourse(
          connection,
          course,
          subjectId,
          courseIndex + 1,
          courseSlug,
          courseCode
        );

      courseCount += 1;

      /*
       * ---------------------------------------------------
       * MODULES
       * ---------------------------------------------------
       */

      const modules =
        getModules(course);

      const usedModuleCodes =
        new Set();

      for (
        let moduleIndex = 0;
        moduleIndex <
        modules.length;
        moduleIndex += 1
      ) {
        const module =
          modules[
            moduleIndex
          ];

        const moduleNumber =
          getModuleNumber(
            module,
            moduleIndex
          );

        const moduleCode =
          getModuleCode(
            module,
            moduleNumber,
            usedModuleCodes
          );

        const moduleId =
          await insertModule(
            connection,
            courseId,
            module,
            moduleNumber,
            moduleCode,
            moduleIndex + 1
          );

        moduleCount += 1;

        /*
         * -----------------------------------------------
         * LESSONS
         * -----------------------------------------------
         */

        const lessons =
          getLessons(module);

        const usedLessonCodes =
          new Set();

        for (
          let lessonIndex = 0;
          lessonIndex <
          lessons.length;
          lessonIndex += 1
        ) {
          const lesson =
            lessons[
              lessonIndex
            ];

          const lessonNumber =
            getLessonNumber(
              lesson,
              lessonIndex
            );

          const lessonCode =
            getLessonCode(
              lesson,
              lessonNumber,
              usedLessonCodes
            );

          await insertLesson(
            connection,
            moduleId,
            lesson,
            lessonNumber,
            lessonCode,
            lessonIndex + 1
          );

          lessonCount += 1;
        }

        /*
         * -----------------------------------------------
         * MODULE TEST
         * -----------------------------------------------
         */

        const moduleTest =
          module.test ||
          module.moduleTest ||
          module.module_test ||
          module.assessment;

        const moduleQuestions =
          getModuleQuestions(
            module
          );

        if (
          moduleTest &&
          moduleQuestions.length
        ) {
          const assessment =
            {
              ...moduleTest,
              type:
                moduleTest.type ??
                "module_test",
              title:
                moduleTest.title ??
                `${getModuleTitle(
                  module,
                  moduleNumber
                )} Test`,
            };

          const assessmentId =
            await insertAssessment(
              connection,
              courseId,
              moduleId,
              null,
              assessment
            );

          assessmentCount += 1;

          for (
            let qi = 0;
            qi <
            moduleQuestions.length;
            qi += 1
          ) {
            await insertQuestion(
              connection,
              assessmentId,
              moduleQuestions[
                qi
              ],
              qi + 1
            );

            questionCount += 1;
          }
        }
      }

      /*
       * ---------------------------------------------------
       * FINAL EXAM
       * ---------------------------------------------------
       */

      const finalExam =
        course.finalExam ||
        course.final_exam ||
        course.exam;

      const finalQuestions =
        getFinalQuestions(
          course
        );

      if (
        finalExam &&
        finalQuestions.length
      ) {
        const assessment =
          {
            ...finalExam,
            type:
              finalExam.type ??
              "final_exam",
            title:
              finalExam.title ??
              `${title} Final Examination`,
          };

        const assessmentId =
          await insertAssessment(
            connection,
            courseId,
            null,
            null,
            assessment
          );

        assessmentCount += 1;

        for (
          let qi = 0;
          qi <
          finalQuestions.length;
          qi += 1
        ) {
          await insertQuestion(
            connection,
            assessmentId,
            finalQuestions[
              qi
            ],
            qi + 1
          );

          questionCount += 1;
        }
      }
    }

    /*
     * -----------------------------------------------------
     * COMMIT
     * -----------------------------------------------------
     */

    await connection.commit();

    /*
     * Verify actual DB totals.
     */
    const [[summary]] =
      await connection.query(
        `
        SELECT
          (SELECT COUNT(*)
             FROM subjects) AS subjects,

          (SELECT COUNT(*)
             FROM courses
             WHERE is_published = 1) AS courses,

          (SELECT COUNT(*)
             FROM modules
             WHERE is_published = 1) AS modules,

          (SELECT COUNT(*)
             FROM lessons
             WHERE is_published = 1) AS lessons,

          (SELECT COUNT(*)
             FROM assessments
             WHERE is_published = 1
             AND type = 'module_test')
             AS module_tests,

          (SELECT COUNT(*)
             FROM assessments
             WHERE is_published = 1
             AND type = 'final_exam')
             AS final_exams,

          (SELECT COUNT(*)
             FROM questions) AS questions,

          (SELECT COUNT(*)
             FROM answer_options)
             AS answer_options
        `
      );

    console.log("");
    console.log(
      "============================================"
    );
    console.log(
      "✅ SOURCE-FIRST CURRICULUM SEED COMPLETE"
    );
    console.log(
      "============================================"
    );

    console.log(
      `Subjects:       ${summary.subjects}`
    );

    console.log(
      `Courses:        ${summary.courses}`
    );

    console.log(
      `Modules:        ${summary.modules}`
    );

    console.log(
      `Lessons:        ${summary.lessons}`
    );

    console.log(
      `Module tests:   ${summary.module_tests}`
    );

    console.log(
      `Final exams:    ${summary.final_exams}`
    );

    console.log(
      `Questions:      ${summary.questions}`
    );

    console.log(
      `Answer options: ${summary.answer_options}`
    );

    console.log("");
    console.log(
      "Source audit expected:"
    );

    console.log(
      `   Courses:  ${audit.courses}`
    );

    console.log(
      `   Modules:  ${audit.modules}`
    );

    console.log(
      `   Lessons:  ${audit.lessons}`
    );

    console.log(
      `   Tests:    ${audit.moduleTests}`
    );

    console.log(
      `   Exams:    ${audit.finalExams}`
    );

    console.log(
      `   Questions: ${audit.questions}`
    );

    console.log("");
    console.log(
      "🎉 Database commit successful."
    );
    console.log("");

  } catch (error) {
    await connection.rollback();

    console.log("");
    console.log(
      "↩️ Transaction rolled back."
    );

    console.log("");
    console.error(
      "============================================"
    );

    console.error(
      "❌ CURRICULUM SEED FAILED"
    );

    console.error(
      "============================================"
    );

    console.error(
      error
    );

    throw error;
  } finally {
    connection.release();
  }

  await db.end();
}

/* =========================================================
   START
========================================================= */

seed()
  .then(() => {
    console.log(
      "Seeder exited successfully."
    );
  })
  .catch((error) => {
    console.error(
      error?.sqlMessage ||
        error?.message ||
        error
    );

    process.exitCode = 1;
  });