import fs from "node:fs/promises";
import path from "node:path";

const file = path.resolve(process.cwd(), "data", "curriculum.json");

const SOURCES = {
  jss: "https://www.nerdc.gov.ng/content_manager/jss1-3.html",
  waec: "https://www.waecnigeria.org/sites/default/files/2026-03/FINAL%20TIMETABLE%20WASSCE%20%28SC%29%202026%20-%20NIGERIA.pdf",
  neco: "https://neco.gov.ng/2026%20SSCE%20INTERNAL%20TIMETABLE-2.pdf",
  programming: {
    HTML: "https://developer.mozilla.org/en-US/docs/Web/HTML",
    CSS: "https://developer.mozilla.org/en-US/docs/Web/CSS",
    JavaScript: "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
    Python: "https://docs.python.org/3/",
    Java: "https://docs.oracle.com/en/java/",
    PHP: "https://www.php.net/docs.php",
    "C++": "https://en.cppreference.com/w/",
    COBOL: "https://gnucobol.sourceforge.io/guides.html",
    "C#": "https://learn.microsoft.com/dotnet/csharp/",
    Ruby: "https://www.ruby-lang.org/en/documentation/",
    Dart: "https://dart.dev/language",
    TypeScript: "https://www.typescriptlang.org/docs/"
  }
};

const FALLBACK_DISTRACTORS = [
  "It is only the name of the lesson and does not describe a real concept.",
  "It can be answered correctly without using any information from the lesson.",
  "It has exactly the same meaning as every other topic in the course."
];

function clean(value) {
  return String(value ?? "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\`([^\`]+)\`/g, "$1")
    .replace(/\\n/g, "\n")
    .replace(/\s+/g, " ")
    .trim();
}

function extractDefinition(lesson) {
  const text = clean(lesson.content);
  const match = text.match(
    /### What the concept means\s*([\s\S]*?)(?=###|##|$)/i
  );

  const section = clean(match?.[1] ?? "");
  const paragraph = section
    .split(/\n\s*\n/)
    .map((part) => clean(part))
    .find((part) => part.length >= 35);

  return (
    paragraph ||
    clean(lesson.summary) ||
    clean(lesson.objective) ||
    `${clean(lesson.title)} is explained through the definitions, examples and key points in this lesson.`
  );
}

function sourceFor(course) {
  const title = String(course.title ?? "");

  for (const [language, url] of Object.entries(SOURCES.programming)) {
    if (title.toLowerCase().includes(language.toLowerCase())) {
      return url;
    }
  }

  return /^JSS[1-3]\b/i.test(title) ? SOURCES.jss : SOURCES.waec;
}

function uniqueOptions(correct, candidates) {
  const seen = new Set([correct.toLowerCase()]);
  const result = [];

  for (const candidate of candidates) {
    const value = clean(candidate).slice(0, 320);
    const key = value.toLowerCase();

    if (!value || seen.has(key)) continue;
    seen.add(key);
    result.push(value);

    if (result.length === 3) break;
  }

  for (const fallback of FALLBACK_DISTRACTORS) {
    if (result.length === 3) break;
    if (!seen.has(fallback.toLowerCase())) {
      seen.add(fallback.toLowerCase());
      result.push(fallback);
    }
  }

  return result;
}

function makeQuestion(course, lesson, pool, index) {
  const courseTitle = clean(course.title) || "this course";
  const topic = clean(lesson.title) || `Lesson ${index + 1}`;
  const correct = clean(extractDefinition(lesson)).slice(0, 320);

  const distractors = uniqueOptions(
    correct,
    pool
      .filter((item) => item !== lesson)
      .map(extractDefinition)
  );

  const prompts = [
    `In ${courseTitle}, which statement correctly explains "${topic}"?`,
    `Which option best matches the lesson meaning of "${topic}" in ${courseTitle}?`,
    `A learner studying "${topic}" in ${courseTitle} should choose which explanation?`,
    `Which statement shows an accurate understanding of "${topic}"?`
  ];

  return {
    prompt: prompts[index % prompts.length],
    correct,
    distractors,
    explanation: `The lesson on "${topic}" explains: ${correct}`,
    sourceUrl: sourceFor(course),
    sourceType: "lesson-notes-and-curriculum-structure"
  };
}

function repairCourse(course) {
  const modules = course.modules ?? [];

  for (const module of modules) {
    const lessons = module.lessons ?? [];

    module.test = {
      ...(module.test ?? {}),
      type: "module_test",
      title: module.test?.title ?? `${module.title} Module Test`,
      description:
        "Content-based assessment covering the lessons in this module. The assessment structure is informed by Nigerian secondary-school examination references.",
      durationMinutes: 15,
      passingScore: 50,
      maxAttempts: 3,
      randomizeQuestions: true,
      questions: lessons.map((lesson, index) =>
        makeQuestion(course, lesson, lessons, index)
      )
    };
  }

  const allLessons = modules.flatMap((module) => module.lessons ?? []);
  if (!allLessons.length) {
    throw new Error(`No lessons found for ${course.title}`);
  }

  const selected = [];
  const step = 7;
  let index = 0;

  while (selected.length < Math.min(20, allLessons.length)) {
    selected.push(allLessons[index % allLessons.length]);
    index += step;
    if (index >= allLessons.length * 2) index = selected.length;
  }

  course.finalExam = {
    ...(course.finalExam ?? {}),
    type: "final_exam",
    title: course.finalExam?.title ?? `${course.title} Final Exam`,
    description:
      "Cumulative assessment covering the whole course. WAEC/NECO structures are used as references; this platform does not reproduce copyrighted past-question banks.",
    durationMinutes: 30,
    passingScore: 50,
    maxAttempts: 2,
    randomizeQuestions: true,
    questions: selected.map((lesson, index) =>
      makeQuestion(course, lesson, allLessons, index + 1)
    )
  };
}

const curriculum = JSON.parse(await fs.readFile(file, "utf8"));

for (const course of curriculum.courses ?? []) {
  if (!Array.isArray(course.modules) || course.modules.length !== 3) {
    throw new Error(`Expected 3 modules: ${course.title}`);
  }

  for (const module of course.modules) {
    if (!Array.isArray(module.lessons) || module.lessons.length !== 9) {
      throw new Error(`Expected 9 lessons: ${course.title} / ${module.title}`);
    }
  }

  repairCourse(course);
}

curriculum.meta = {
  ...(curriculum.meta ?? {}),
  assessmentRevision: {
    version: "5.0",
    status: "Content-based assessment repair",
    sources: [SOURCES.waec, SOURCES.neco, SOURCES.jss],
    note:
      "Question wording is original platform practice content based on the topics taught in each lesson. Official sources are used for curriculum and assessment structure, not copied as a question bank."
  }
};

await fs.writeFile(file, JSON.stringify(curriculum, null, 2) + "\n", "utf8");

const courseCount = curriculum.courses?.length ?? 0;
console.log(
  `Repaired ${courseCount} courses: ${courseCount * 3} module tests and ${courseCount} final exams.`
);
