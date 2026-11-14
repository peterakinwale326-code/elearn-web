import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const curriculumPath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "data",
  "curriculum.json",
);
const { courses = [] } = JSON.parse(await readFile(curriculumPath, "utf8"));

const genericPatterns = [
  /^which example provides the strongest evidence that a learner understands .+\?$/i,
  /^in .+, for the lesson on .+:/i,
  /^in .+, which statement best explains why .+ matters in real learning\?$/i,
  /^in .+, what is the best way to respond when a learner is unsure about .+\?$/i,
  /^which example best shows the idea of .+\?$/i,
  /^what is the strongest way to improve an answer about .+\?$/i,
  /^which statement best explains .+ in .+\?$/i,
  /^when applying .+ on a farm, what should be considered first\?$/i,
  /^why should safety be included in work involving .+\?$/i,
  /^which statement gives the most useful interpretation of .+\?$/i,
  /^in a real computer task involving .+, what should be traced\?$/i,
  /^which part of a computer system is most directly involved when applying .+\?$/i,
  /^why do data types matter in programming\?$/i,
];

const normalize = (value) =>
  String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const issues = [];
const allStems = new Map();
const testExamStems = new Map();
let assessmentCount = 0;
let questionCount = 0;

for (const course of courses) {
  const assessments = [
    ...(course.modules ?? []).flatMap((module) =>
      module.test?.questions
        ? [{ title: module.test.title ?? module.title, questions: module.test.questions, isTestOrExam: true }]
        : [],
    ),
    ...(course.modules ?? []).flatMap((module) =>
      (module.lessons ?? []).flatMap((lesson) =>
        lesson.quiz?.length
          ? [{ title: `${lesson.title} quiz`, questions: lesson.quiz, isTestOrExam: false }]
          : [],
      ),
    ),
    ...(course.finalExam?.questions
      ? [{
          title: course.finalExam.title ?? `${course.title} final exam`,
          questions: course.finalExam.questions,
          isTestOrExam: true,
        }]
      : []),
  ];

  for (const assessment of assessments) {
    assessmentCount += 1;
    const seen = new Set();
    for (const [index, item] of assessment.questions.entries()) {
      questionCount += 1;
      const location = `${course.title} / ${assessment.title} / question ${index + 1}`;
      const stem = String(item?.question ?? "").trim();

      if (!stem) {
        issues.push(`${location}: question stem is empty`);
        continue;
      }
      if (genericPatterns.some((pattern) => pattern.test(stem))) {
        issues.push(`${location}: generic filler stem remains`);
      }
      if (!Array.isArray(item.options) || item.options.length !== 4) {
        issues.push(`${location}: expected exactly four options`);
      } else {
        const options = item.options.map((option) => String(option).trim().toLowerCase());
        if (new Set(options).size !== options.length) {
          issues.push(`${location}: answer options are duplicated`);
        }
        if (
          !Number.isInteger(item.answer) ||
          item.answer < 0 ||
          item.answer >= item.options.length
        ) {
          issues.push(`${location}: answer index is invalid`);
        }
      }

      const key = normalize(stem);
      if (seen.has(key)) issues.push(`${location}: duplicate stem within assessment`);
      seen.add(key);

      const occurrences = allStems.get(key) ?? new Set();
      occurrences.add(`${course.title} / ${assessment.title}`);
      allStems.set(key, occurrences);

      if (assessment.isTestOrExam) {
        const testExamOccurrences = testExamStems.get(key) ?? new Set();
        testExamOccurrences.add(`${course.title} / ${assessment.title}`);
        testExamStems.set(key, testExamOccurrences);
      }
    }
  }
}

const crossAssessmentDuplicates = [...testExamStems.values()].filter(
  (assessments) => assessments.size > 1,
).length;

console.log(
  `Audited ${questionCount} questions across ${assessmentCount} assessments in ${courses.length} courses.`,
);
console.log(`Repeated stems across module tests and final exams: ${crossAssessmentDuplicates}.`);

if (issues.length) {
  console.error(`Assessment audit failed with ${issues.length} issue(s):`);
  for (const issue of issues.slice(0, 30)) console.error(`- ${issue}`);
  if (issues.length > 30) console.error(`- ...and ${issues.length - 30} more`);
  process.exitCode = 1;
} else {
  console.log("All assessment structures are valid, filler-free, and unique within each assessment.");
}
