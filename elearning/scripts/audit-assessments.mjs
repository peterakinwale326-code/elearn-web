import fs from "node:fs/promises";
import path from "node:path";

const file = path.resolve(process.cwd(), "data", "curriculum.json");
const data = JSON.parse(await fs.readFile(file, "utf8"));

let moduleTests = 0;
let finalExams = 0;
let moduleQuestions = 0;
let finalQuestions = 0;
const promptCounts = new Map();
const bad = [];

function inspectQuestion(courseTitle, assessmentLabel, question, index) {
  const prompt = String(question?.prompt ?? "").trim();
  const correct = String(question?.correct ?? "").trim();
  const distractors = Array.isArray(question?.distractors)
    ? question.distractors.map((item) => String(item).trim()).filter(Boolean)
    : [];

  if (!prompt || !correct || distractors.length !== 3) {
    bad.push(`${courseTitle} / ${assessmentLabel} / Q${index}: invalid question or option set`);
  }

  if (/only a lesson title|memorised without understanding|without considering the situation/i.test(
    `${prompt} ${correct} ${distractors.join(" ")}`
  )) {
    bad.push(`${courseTitle} / ${assessmentLabel} / Q${index}: placeholder wording detected`);
  }

  const allOptions = [correct, ...distractors].map((item) => item.toLowerCase());
  if (new Set(allOptions).size !== allOptions.length) {
    bad.push(`${courseTitle} / ${assessmentLabel} / Q${index}: duplicate options`);
  }

  if (prompt) {
    const key = prompt.toLowerCase();
    promptCounts.set(key, (promptCounts.get(key) ?? 0) + 1);
  }
}

for (const course of data.courses ?? []) {
  for (const module of course.modules ?? []) {
    moduleTests += 1;
    const questions = module.test?.questions ?? [];

    if (questions.length !== 9) {
      bad.push(
        `${course.title} / ${module.title}: expected 9 module-test questions, found ${questions.length}`
      );
    }

    moduleQuestions += questions.length;
    questions.forEach((question, index) =>
      inspectQuestion(course.title, `${module.title} module test`, question, index + 1)
    );
  }

  finalExams += 1;
  const questions = course.finalExam?.questions ?? [];

  if (questions.length !== 20) {
    bad.push(
      `${course.title}: expected 20 final-exam questions, found ${questions.length}`
    );
  }

  finalQuestions += questions.length;
  questions.forEach((question, index) =>
    inspectQuestion(course.title, "final exam", question, index + 1)
  );
}

const duplicatePrompts = [...promptCounts.entries()]
  .filter(([, count]) => count > 1);

const result = {
  courses: data.courses?.length ?? 0,
  moduleTests,
  finalExams,
  moduleQuestions,
  finalQuestions,
  totalQuestions: moduleQuestions + finalQuestions,
  duplicatePrompts: duplicatePrompts.length,
  invalidItems: bad.length,
  sampleProblems: bad.slice(0, 20)
};

console.log(JSON.stringify(result, null, 2));

if (bad.length || duplicatePrompts.length) {
  process.exitCode = 1;
}
