
import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import mysql from 'mysql2/promise';

const root = process.cwd();
const dataPath = path.resolve(root, 'data', 'curriculum.json');
const sourcesPath = path.resolve(root, 'data', 'lesson-sources.json');

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

const subjectImages = {
  Science: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=900&q=80",
  Mathematics: "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=900&q=80",
  English: "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&w=900&q=80",
  History: "https://images.unsplash.com/photo-1461360228754-6e81c478b882?auto=format&fit=crop&w=900&q=80",
  Technology: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80",
  Business: "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=900&q=80",
  Art: "https://images.unsplash.com/photo-1561214115-f2f134cc4912?auto=format&fit=crop&w=900&q=80",
  Languages: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=900&q=80",
  Geography: "https://images.unsplash.com/photo-1524666041070-9cffc8c7a4d0?auto=format&fit=crop&w=900&q=80",
  "Computer Science": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80",
  Health: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=900&q=80",
  Music: "https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?auto=format&fit=crop&w=900&q=80",
};
const fallbackSubjectImage = "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1000&q=80";

function getSubjectImage(subject) {
  return subjectImages[subject] ?? fallbackSubjectImage;
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
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)`,
    [
      subjectId,
      course.title,
      courseSlug,
      course.code,
      course.level,
      course.description,
      getSubjectImage(course.subject),
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
  lesson,
  courseTitle,
  lessonSources
) {
  const parts = String(lesson.code).split('.');
  const position = Number(parts[1] ?? 1);

  const sourceUrl =
    lessonSources[courseTitle] ??
    lessonSources._default ??
    null;

  const sourceNote = sourceUrl
    ? '\n\n## Further Reading\n\nThis lesson is part of the platform curriculum and should be studied together with the referenced documentation. Use the source to check terminology, examples and additional details rather than copying it as lesson text.\n\n**Reference:** ' + sourceUrl + '\\n'
    : '';

  const lessonContent = String(lesson.content ?? '') + sourceNote;

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
      lessonContent,
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
      question.explanation ??\n        'Review the lesson topic carefully and compare each option with the definition, process or example taught.',
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

  let lessonSources = {};
  try {
    const sourceRaw = await fs.readFile(sourcesPath, 'utf8');
    const sourceData = JSON.parse(sourceRaw);
    lessonSources = sourceData.sources ?? {};
  } catch (error) {
    console.warn('⚠️ Lesson source map unavailable; continuing without source notes.');
  }

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
            lesson,
            course.title,
            lessonSources
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

