import fs from "node:fs/promises";
import path from "node:path";

const curriculumPath = path.resolve(process.cwd(), "data", "curriculum.json");
const curriculum = JSON.parse(await fs.readFile(curriculumPath, "utf8"));
const fillerPattern = /^Level progression:\s*At this level, focus on concrete examples, correct vocabulary and guided practice\. Start with familiar school, home and community situations before moving to unfamiliar cases\.?$/i;
const genericQuestionPattern = /^Which statement is directly supported by the lesson\b/i;
const genericDistractorPattern = /no useful application|ignoring the defining features|unrelated to its subject/i;

let lessonsCleaned = 0;
let fillerSentencesRemoved = 0;
let quizItemsRemoved = 0;

for (const course of curriculum.courses ?? []) {
  for (const module of course.modules ?? []) {
    for (const lesson of module.lessons ?? []) {
      const originalContent = lesson.content;
      const content = Array.isArray(originalContent)
        ? originalContent
        : String(originalContent ?? "").split(/\n{2,}/);
      const cleanedContent = content.filter((paragraph) => {
        if (!fillerPattern.test(String(paragraph).trim())) return true;
        fillerSentencesRemoved += 1;
        return false;
      });

      if (cleanedContent.length !== content.length) {
        lesson.content = Array.isArray(originalContent)
          ? cleanedContent
          : cleanedContent.join("\n\n");
        lessonsCleaned += 1;
      }

      if (!Array.isArray(lesson.quiz)) continue;
      const before = lesson.quiz.length;
      lesson.quiz = lesson.quiz.filter((question) => {
        if (!genericQuestionPattern.test(String(question.question ?? ""))) return true;
        const options = Array.isArray(question.options) ? question.options : [];
        const hasLessonDump = options.some((option) => String(option).length > 140);
        const hasGenericDistractor = options.some((option) =>
          genericDistractorPattern.test(String(option)),
        );
        return !(hasLessonDump && hasGenericDistractor);
      });
      quizItemsRemoved += before - lesson.quiz.length;
    }
  }
}

curriculum.meta = {
  ...curriculum.meta,
  editorialCleanup: {
    completedAt: new Date().toISOString(),
    lessonsCleaned,
    fillerSentencesRemoved,
    genericQuizItemsRemoved: quizItemsRemoved,
  },
};

await fs.writeFile(curriculumPath, `${JSON.stringify(curriculum, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ lessonsCleaned, fillerSentencesRemoved, genericQuizItemsRemoved: quizItemsRemoved }, null, 2));