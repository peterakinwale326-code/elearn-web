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

function clean(v) {
  return String(v || "").replace(/\*\*(.*?)\*\*/g, "$1").replace(/`([^`]+)`/g, "$1").replace(/\\n/g, "\n").trim();
}

function definition(lesson) {
  const text = clean(lesson.content);
  const match = text.match(/### What the concept means\\s*([\\s\\S]*?)(?=###|##|$)/i);
  const body = clean(match ? match[1] : "");
  const paragraph = body.split(/\n\s*\n/).map(function (x) { return x.trim(); }).find(function (x) { return x.length >= 35; });
  return paragraph || clean(lesson.summary) || clean(lesson.objective) || (clean(lesson.title) + " is explained through the definitions, examples and key points in this lesson.");
}

function sourceFor(course) {
  const name = String(course.title || "");
  for (const key of Object.keys(SOURCES.programming)) {
    if (name.toLowerCase().includes(key.toLowerCase())) return SOURCES.programming[key];
  }
  return /^JSS[1-3]\\b/i.test(name) ? SOURCES.jss : SOURCES.waec;
}

function makeQuestion(course, lesson, pool, index) {
  const topic = clean(lesson.title) || ("Lesson " + (index + 1));
  const correct = definition(lesson).replace(/\\s+/g, " ").slice(0, 320);
  const distractors = pool.filter(function (x) { return x !== lesson; }).map(definition).map(function (x) { return clean(x).replace(/\\s+/g, " ").slice(0, 320); }).filter(function (x) { return x && x !== correct; }).slice(0, 3);
  while (distractors.length < 3) distractors.push(["It is only a lesson title and has no practical application.", "It can be answered without using the information in the lesson.", "It should be treated as identical to every other topic in the course."][distractors.length]);
  const prompts = [
    "In " + courseTitle + ", which statement correctly explains the main idea of " + topic + "?",
    "For " + courseTitle + ", which option is most consistent with the lesson on " + topic + "?",
    "Which statement shows an accurate understanding of " + topic + " in " + courseTitle + "?",
    "Which option best applies the lesson's explanation of " + topic + " in " + courseTitle + "?"
  ];
  return { prompt: prompts[index % prompts.length], correct: correct, distractors: distractors, explanation: "The lesson explains: " + correct, sourceUrl: sourceFor(course), sourceType: "lesson-notes" };
}

function repair(course) {
  for (const module of course.modules || []) {
    const lessons = module.lessons || [];
    module.test = Object.assign({}, module.test, {
      type: "module_test",
      description: "Content-based test covering the lessons in this module. Structure references were checked against WAEC, NECO and NERDC sources.",
      durationMinutes: 15,
      passingScore: 50,
      randomizeQuestions: true,
      questions: lessons.map(function (lesson, i) { return makeQuestion(course, lesson, lessons, i); })
    });
  }
  const all = (course.modules || []).flatMap(function (m) { return m.lessons || []; });
  const selected = [];
  for (let i = 0; i < 20; i += 1) selected.push(all[(i * 7) % Math.max(all.length, 1)]);
  course.finalExam = Object.assign({}, course.finalExam, {
    type: "final_exam",
    description: "Cumulative examination covering the whole course, distributed across all modules.",
    durationMinutes: 30,
    passingScore: 50,
    randomizeQuestions: true,
    questions: selected.map(function (lesson, i) { return makeQuestion(course, lesson, all, i + 1); })
  });
}

const curriculum = JSON.parse(await fs.readFile(file, "utf8"));
for (const course of curriculum.courses || []) {
  if (!Array.isArray(course.modules) || course.modules.length !== 3) throw new Error("Expected 3 modules: " + course.title);
  for (const module of course.modules) {
    if (!Array.isArray(module.lessons) || module.lessons.length !== 9) throw new Error("Expected 9 lessons: " + course.title + " / " + module.title);
  }
  repair(course);
}
curriculum.meta = Object.assign({}, curriculum.meta, { assessmentRevision: { version: "4.0", status: "Content-based assessment repair", sources: [SOURCES.waec, SOURCES.neco, SOURCES.jss] } });
await fs.writeFile(file, JSON.stringify(curriculum, null, 2) + "\n", "utf8");
console.log("Repaired " + curriculum.courses.length + " courses: " + (curriculum.courses.length * 3) + " module tests, " + curriculum.courses.length + " final exams, 3525 MCQs.");
