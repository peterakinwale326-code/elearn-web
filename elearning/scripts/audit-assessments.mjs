import fs from "node:fs/promises";
import path from "node:path";

const file = path.resolve(process.cwd(), "data", "curriculum.json");
const data = JSON.parse(await fs.readFile(file, "utf8"));

let moduleTests = 0;
let finalExams = 0;
let moduleQuestions = 0;
let finalQuestions = 0;
const prompts = new Map();
const bad = [];

for (const course of data.courses || []) {
  for (const module of course.modules || []) {
    moduleTests += 1;
    const questions = module.test?.questions || [];
    if (questions.length !== 9) bad.push(course.title + " / " + module.title + ": expected 9 questions, found " + questions.length);
    moduleQuestions += questions.length;

    for (const question of questions) {
      const prompt = String(question.prompt || "").trim().toLowerCase();
      prompts.set(prompt, (prompts.get(prompt) || 0) + 1);
      if (/which topic belongs|only a lesson title|memorised without understanding|without considering the situation/i.test(prompt)) {
        bad.push(course.title + " / " + module.title + ": generic placeholder prompt");
      }
      if (!question.correct || !Array.isArray(question.distractors) || question.distractors.length !== 3) {
        bad.push(course.title + " / " + module.title + ": invalid option set");
      }
    }
  }

  finalExams += 1;
  const questions = course.finalExam?.questions || [];
  if (questions.length !== 20) bad.push(course.title + ": expected 20 final-exam questions, found " + questions.length);
  finalQuestions += questions.length;
}

const duplicates = [...prompts.entries()].filter(([, count]) => count > 1);
console.log(JSON.stringify({
  courses: (data.courses || []).length,
  moduleTests,
  finalExams,
  moduleQuestions,
  finalQuestions,
  totalQuestions: moduleQuestions + finalQuestions,
  duplicatePrompts: duplicates.length,
  invalidItems: bad.length,
  sampleProblems: bad.slice(0, 20)
}, null, 2));

if (bad.length || duplicates.length) process.exitCode = 1;
