
import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import mysql from 'mysql2/promise';

const root = process.cwd();
const dataPath = path.resolve(root, 'data', 'curriculum.json');

const db = mysql.createPool({
  host: process.env.DB_HOST ?? '127.0.0.1',
  port: Number(process.env.DB_PORT ?? 3306),
  user: process.env.DB_USER ?? '',
  password: process.env.DB_PASSWORD ?? '',
  database: process.env.DB_NAME ?? 'school',
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
  charset: 'utf8mb4',
});

function slug(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function makeUniqueSlug(value, usedSlugs) {
  const base = slug(value);

  if (!usedSlugs.has(base)) {
    usedSlugs.add(base);
    return base;
  }

  let counter = 2;
  let candidate = base + '-' + counter;

  while (usedSlugs.has(candidate)) {
    counter += 1;
    candidate = base + '-' + counter;
  }

  usedSlugs.add(candidate);

  console.log(
    '⚠️ Duplicate slug "' +
      base +
      '" detected. Using "' +
      candidate +
      '" instead.'
  );

  return candidate;
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function totalMinutes(course) {
  return course.modules.reduce(
    (sum, module) =>
      sum +
      module.lessons.reduce(
        (lessonSum, lesson) =>
          lessonSum +
          Number(lesson.durationMinutes ?? 0),
        0
      ),
    0
  );
}

async function cleanCurriculum(connection) {
  const tables = [
    'answer_options',
    'attempt_answers',
    'attempts',
    'course_completions',
    'lesson_resources',
    'lesson_progress',
    'enrollments',
    'questions',
    'assessments',
    'lessons',
    'modules',
    'courses',
    'subjects',
  ];

  for (const table of tables) {
    await connection.query(
      'DELETE FROM `' + table + '`'
    );
  }
}

async function insertSubject(
  connection,
  subject,
  subjectSlug
) {
  const [result] = await connection.execute(
    `INSERT INTO subjects
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
      VALUES (?, ?, ?, ?, ?, ?, 1, ?)`,
    [
      subject.name,
      subjectSlug,
      subject.code,
      subject.description ??
        subject.name +
          ' secondary-school subject.',
      subject.category ?? 'Academic',
      subject.educationLevel ??
        'junior_secondary',
      Number(
        String(subject.code).replace(/\D/g, '') || 0
      ),
    ]
  );

  return Number(result.insertId);
}

async function insertCourse(
  connection,
  course,
  subjectId,
  coursePosition,
  courseSlug
) {
  const [result] = await connection.execute(
    `INSERT INTO courses
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
      VALUES (?, ?, ?, ?, ?, ?, NULL, ?, ?, ?, 1, ?)`,
    [
      subjectId,
      course.title,
      courseSlug,
      course.code,
      course.level,
      course.description,
      course.level === 'Elective'
        ? 'PStacks Learning Team'
        : 'PStacks Academic Curriculum Team',
      totalMinutes(course),
      Number(course.finalExam?.passingScore ?? 50),
      coursePosition,
    ]
  );

  return Number(result.insertId);
}

async function insertModule(
  connection,
  courseId,
  module,
  modulePosition
) {
  const [result] = await connection.execute(
    `INSERT INTO modules
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
      VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
    [
      courseId,
      Number(module.code),
      module.code,
      module.title,
      module.description ?? '',
      modulePosition,
      module.lessons.reduce(
        (sum, lesson) =>
          sum +
          Number(
            lesson.durationMinutes ?? 0
          ),
        0
      ),
    ]
  );

  return Number(result.insertId);
}

async function insertLesson(
  connection,
  moduleId,
  lesson
) {
  const parts = String(lesson.code).split('.');
  const position = Number(parts[1] ?? 1);

  const [result] = await connection.execute(
    `INSERT INTO lessons
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
      VALUES (?, ?, ?, ?, ?, ?, NULL, NULL, ?, ?, 1, 1)`,
    [
      moduleId,
      lesson.code,
      lesson.title,
      lesson.objective ?? '',
      lesson.content ?? '',
      lesson.summary ?? '',
      Number(
        lesson.durationMinutes ?? 35
      ),
      position,
    ]
  );

  return Number(result.insertId);
}

async function insertAssessment(
  connection,
  courseId,
  moduleId,
  assessment
) {
  const [result] = await connection.execute(
    `INSERT INTO assessments
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
      VALUES (?, ?, NULL, ?, ?, ?, ?, ?, ?, ?, 1)`,
    [
      courseId,
      moduleId,
      assessment.type,
      assessment.title,
      assessment.description ??
        'Assessment for the concepts taught in this module.',
      Number(
        assessment.durationMinutes ?? 15
      ),
      Number(
        assessment.passingScore ?? 50
      ),
      Number(
        assessment.maxAttempts ?? 3
      ),
      assessment.randomizeQuestions
        ? 1
        : 0,
    ]
  );

  return Number(result.insertId);
}

async function insertQuestion(
  connection,
  assessmentId,
  question,
  position
) {
  const [result] = await connection.execute(
    `INSERT INTO questions
      (
        assessment_id,
        question_text,
        explanation,
        question_type,
        points,
        position
      )
      VALUES (?, ?, ?, 'multiple_choice', 1, ?)`,
    [
      assessmentId,
      question.prompt,
      'Review the lesson topic carefully and compare each option with the definition, process or example taught.',
      position,
    ]
  );

  const questionId = Number(result.insertId);

  const options = [
    question.correct,
    ...(question.distractors ?? []),
  ];

  assert(
    options.length >= 2,
    'Question "' +
      question.prompt +
      '" has fewer than two options.'
  );

  for (let i = 0; i < options.length; i += 1) {
    await connection.execute(
      `INSERT INTO answer_options
        (
          question_id,
          option_key,
          option_text,
          is_correct,
          position
        )
        VALUES (?, ?, ?, ?, ?)`,
      [
        questionId,
        String.fromCharCode(65 + i),
        String(options[i]),
        i === 0 ? 1 : 0,
        i + 1,
      ]
    );
  }
}

async function seed() {
  const raw = await fs.readFile(
    dataPath,
    'utf8'
  );

  const curriculum = JSON.parse(raw);

  assert(
    Array.isArray(curriculum.subjects),
    'curriculum.subjects must be an array'
  );

  assert(
    Array.isArray(curriculum.courses),
    'curriculum.courses must be an array'
  );

  const [dbRows] = await db.query(
    'SELECT DATABASE() AS db'
  );

  console.log(
    '📚 Loading curriculum for database: ' +
      (dbRows[0]?.db ?? 'unknown')
  );

  console.log(
    '📊 ' +
      (curriculum.meta?.counts?.subjects ??
        curriculum.subjects.length) +
      ' subjects, ' +
      curriculum.courses.length +
      ' courses'
  );

  const connection =
    await db.getConnection();

  try {
    await connection.beginTransaction();

    console.log(
      '🧹 Removing previous curriculum data (users/auth remain intact)...'
    );

    await cleanCurriculum(connection);

    /*
     * SUBJECTS
     */
    const subjectIds = new Map();
    const usedSubjectSlugs = new Set();

    for (const subject of curriculum.subjects) {
      const subjectSlug =
        makeUniqueSlug(
          subject.slug ?? subject.name,
          usedSubjectSlugs
        );

      const id = await insertSubject(
        connection,
        subject,
        subjectSlug
      );

      subjectIds.set(subject.name, id);
    }

    /*
     * COURSES
     */
    const usedCourseSlugs = new Set();

    for (
      let i = 0;
      i < curriculum.courses.length;
      i += 1
    ) {
      const course =
        curriculum.courses[i];

      let subjectId =
        subjectIds.get(course.subject);

      if (!subjectId) {
        const [rows] =
          await connection.execute(
            'SELECT id FROM subjects WHERE name = ? LIMIT 1',
            [course.subject]
          );

        subjectId = rows[0]
          ? Number(rows[0].id)
          : null;
      }

      assert(
        subjectId,
        'No subject row exists for course subject: ' +
          course.subject
      );

      const courseSlug =
        makeUniqueSlug(
          course.slug ?? course.title,
          usedCourseSlugs
        );

      const courseId =
        await insertCourse(
          connection,
          course,
          subjectId,
          i + 1,
          courseSlug
        );

      assert(
        Array.isArray(course.modules),
        'Modules missing for course: ' +
          course.title
      );

      for (
        let mi = 0;
        mi < course.modules.length;
        mi += 1
      ) {
        const module =
          course.modules[mi];

        const moduleId =
          await insertModule(
            connection,
            courseId,
            module,
            mi + 1
          );

        assert(
          Array.isArray(module.lessons),
          'Lessons missing for ' +
            course.title +
            ' module ' +
            module.code
        );

        for (const lesson of module.lessons) {
          await insertLesson(
            connection,
            moduleId,
            lesson
          );
        }

        const assessment = module.test;

        assert(
          assessment?.type ===
            'module_test',
          'Module test missing for ' +
            course.title +
            ' ' +
            module.code
        );

        const assessmentId =
          await insertAssessment(
            connection,
            courseId,
            moduleId,
            assessment
          );

        assert(
          Array.isArray(
            assessment.questions
          ),
          'Questions missing for ' +
            course.title +
            ' ' +
            module.code
        );

        for (
          let qi = 0;
          qi <
          assessment.questions.length;
          qi += 1
        ) {
          await insertQuestion(
            connection,
            assessmentId,
            assessment.questions[qi],
            qi + 1
          );
        }
      }

      /*
       * FINAL EXAM
       */
      const finalExam =
        course.finalExam;

      assert(
        finalExam?.type ===
          'final_exam',
        'Final exam missing for ' +
          course.title
      );

      const finalAssessmentId =
        await insertAssessment(
          connection,
          courseId,
          null,
          finalExam
        );

      assert(
        Array.isArray(
          finalExam.questions
        ),
        'Final exam questions missing for ' +
          course.title
      );

      for (
        let qi = 0;
        qi < finalExam.questions.length;
        qi += 1
      ) {
        await insertQuestion(
          connection,
          finalAssessmentId,
          finalExam.questions[qi],
          qi + 1
        );
      }

      console.log(
        '   ✅ ' +
          (i + 1) +
          '/' +
          curriculum.courses.length +
          ' ' +
          course.title
      );
    }

    await connection.commit();

    const [[summary]] =
      await connection.query(`
        SELECT
          (SELECT COUNT(*) FROM subjects) AS subjects,
          (SELECT COUNT(*) FROM courses
            WHERE is_published = 1) AS courses,
          (SELECT COUNT(*) FROM modules
            WHERE is_published = 1) AS modules,
          (SELECT COUNT(*) FROM lessons
            WHERE is_published = 1) AS lessons,
          (SELECT COUNT(*) FROM assessments
            WHERE is_published = 1
            AND type = 'module_test') AS module_tests,
          (SELECT COUNT(*) FROM assessments
            WHERE is_published = 1
            AND type = 'final_exam') AS final_exams,
          (SELECT COUNT(*) FROM questions) AS questions,
          (SELECT COUNT(*) FROM answer_options) AS answer_options
      `);

    console.log('');
    console.log(
      '============================================'
    );
    console.log(
      '✅ Nigerian curriculum seed completed!'
    );
    console.log(
      '============================================'
    );

    console.table(summary);
  } catch (error) {
    await connection.rollback();

    console.error(
      '❌ Curriculum seed failed:',
      error.message
    );

    console.error(
      '⚠️ Database transaction rolled back.'
    );

    throw error;
  } finally {
    connection.release();
    await db.end();
  }
}

seed().catch(() => {
  process.exit(1);
});

