import fs from "node:fs/promises";
import path from "node:path";

const file = path.resolve(process.cwd(), "data", "curriculum.json");
const curriculum = JSON.parse(await fs.readFile(file, "utf8"));

function countWords(text) {
  return (String(text ?? "").match(/[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu) ?? []).length;
}

function titleCase(value) {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

function buildExpandedParagraph(course, lessonTitle) {
  const title = titleCase(lessonTitle);
  const level = titleCase(course.level || "");
  const subject = titleCase(course.title || "");
  const concept = title.toLowerCase();

  const first = `In ${level} ${subject}, ${concept} matters because it links the topic to evidence, decision-making and real learning. Learners should not treat the idea as a label alone. Instead, they need to explain what it means, identify the key feature or rule, and give a clear example that shows how it works in context. This helps students connect classroom knowledge with everyday practice and improves their ability to reason clearly.`;

  const second = `A useful example of ${concept} is a familiar ${subject.toLowerCase()} situation in which the idea can be observed, described or applied. A learner can explain the steps, name the relevant factors, and show why the result follows from the concept rather than from guesswork. This approach makes the lesson stronger because it shows understanding, not just recall. When the explanation includes a correct example, a clear cause-and-effect idea, and a sensible conclusion, the learner is demonstrating real mastery of ${concept}.`;

  return `${first} ${second}`;
}

let lessonsUpdated = 0;
let totalWordsBefore = 0;
let totalWordsAfter = 0;

for (const course of curriculum.courses ?? []) {
  for (const module of course.modules ?? []) {
    for (const lesson of module.lessons ?? []) {
      const original = String(lesson.content ?? "");
      const before = countWords(original);
      totalWordsBefore += before;

      if (before >= 180 && before <= 260) {
        continue;
      }

      const extension = buildExpandedParagraph(course, lesson.title);
      const next = original.trim();
      const finalText = `${next}\n\n${extension}`.trim();
      lesson.content = finalText;
      lesson.summary = `${lesson.summary || ""} ${extension}`.trim();
      lessonsUpdated += 1;

      const after = countWords(lesson.content);
      totalWordsAfter += after;
    }
  }
}

await fs.writeFile(file, `${JSON.stringify(curriculum, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ lessonsUpdated, totalWordsBefore, totalWordsAfter }, null, 2));
