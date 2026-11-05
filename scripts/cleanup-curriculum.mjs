import fs from "node:fs/promises";
import path from "node:path";

const curriculumPath = path.resolve(process.cwd(), "data", "curriculum.json");
const curriculum = JSON.parse(await fs.readFile(curriculumPath, "utf8"));
const fillerPattern = /^Level progression:\s*At this level, focus on concrete examples, correct vocabulary and guided practice\. Start with familiar school, home and community situations before moving to unfamiliar cases\.?$/i;
const genericFillerParagraphPatterns = [
  /^Worked example: consider a familiar Nigerian school or community situation in which the idea applies\. Identify the relevant facts first, then select the concept that explains them\. Do not begin by memorising a formula or definition without knowing what each part means\.$/i,
  /^Key points: define the main terms accurately; distinguish closely related ideas; use correct units, labels or conventions where required; and check whether the conclusion agrees with the evidence\.$/i,
  /^Practice: write a short explanation of the concept, give one example from everyday life and answer one question that requires you to apply it rather than merely define it\.$/i,
  /^At this stage the emphasis is on clear definitions, familiar examples and correct basic procedure\.$/i,
  /^\*\*Lesson summary:\*\* The important result is not simply knowing what .+ is called\. You should now be able to describe the central idea, recognise it in an example, apply the appropriate procedure or evidence, and explain why your conclusion is reasonable\.$/i,
  /^Worked example: construct a realistic .+ situation in which .+ matters\. Identify the relevant facts and apply the concept step by step\.$/i,
  /^Practice: create your own example of .+, annotate the important features and write a short explanation showing how the concept applies\.$/i,
  /^.+ should be understood through people, institutions, rules and consequences\. Identify the actors involved, the authority or social relationship at work, and the principles that guide their actions\.$/i,
  /^Case study: take a school, community or Nigerian public-life situation involving .+\. Describe the facts, identify the relevant institution or social group and explain two possible responses\.$/i,
  /^Activity: investigate a local example related to .+; record two pieces of evidence, one contrasting viewpoint and a reasoned conclusion\.$/i,
  /^Course distinction: In this .+ course, connect the concept to the specific questions of .+\.$/i,
  /^.+ is an important part of .+\. .+ is a core topic in .+; learners should understand its meaning, social effects, examples and practical use\. The key is to understand the relationship between the definition and the situation in which it is used\. A learner should be able to explain the idea in ordinary language, identify it in an example and use the appropriate rule or procedure when solving a problem\.$/i,
  /^.+ is a specific concept within .+\. Begin by defining its central terms, identifying its main features and distinguishing it from the nearest related concept\.$/i,
];
const genericQuestionPattern = /^Which statement is directly supported by the lesson\b/i;
const templatedQuestionPatterns = [
  /^Which statement best describes .+\?$/i,
  /^In .+?, when working on “.+”, which statement best describes .+\?$/i,
  /^In .+?, when working on “.+”, which statement most directly matches the main idea explained in “.+”\?$/i,
  /^In .+?, when working on “.+”, which example provides the strongest evidence that a learner understands .+\?$/i,
];
const genericDistractorPattern = /no useful application|ignoring the defining features|unrelated to its subject|unrelated to .+|can never be observed or applied|has no practical use|claim with no affected people or institutions|personal preference presented as a rule|conclusion reached without considering evidence|should be understood through people, institutions, rules and consequences|institutions and social relationships are irrelevant to the concept|personal preference automatically becomes a public rule|evidence is unnecessary when discussing public issues|mainly a matter of memorising the title|without considering any examples, conditions or evidence|means the opposite of the explanation given in this lesson/i;

let lessonsCleaned = 0;
let fillerSentencesRemoved = 0;
let genericFillerParagraphsRemoved = 0;
let quizItemsRemoved = 0;

for (const course of curriculum.courses ?? []) {
  for (const module of course.modules ?? []) {
    for (const lesson of module.lessons ?? []) {
      const originalContent = lesson.content;
      const content = Array.isArray(originalContent)
        ? originalContent
        : String(originalContent ?? "").split(/\n{2,}/);
      const cleanedContent = content.filter((paragraph) => {
        const text = String(paragraph).trim();
        if (fillerPattern.test(text)) {
          fillerSentencesRemoved += 1;
          return false;
        }
        if (genericFillerParagraphPatterns.some((pattern) => pattern.test(text))) {
          genericFillerParagraphsRemoved += 1;
          return false;
        }
        return true;
      });

      if (cleanedContent.length !== content.length) {
        lesson.content = Array.isArray(originalContent)
          ? cleanedContent
          : cleanedContent.join("\n\n");
        lessonsCleaned += 1;
      }

      const summarySource = Array.isArray(lesson.content)
        ? lesson.content.map((paragraph) => String(paragraph).trim()).filter(Boolean).join(" ")
        : String(lesson.content ?? "");
      lesson.summary = summarySource
        .replace(/^#{1,6}\s*/gm, "")
        .replace(/[*`]/g, "")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 320);

      if (Array.isArray(lesson.quiz)) {
        const before = lesson.quiz.length;
        lesson.quiz = lesson.quiz.filter((question) => {
          const questionText = String(question.question ?? "");
          const options = Array.isArray(question.options) ? question.options : [];
          const hasGenericDistractor = options.some((option) =>
            genericDistractorPattern.test(String(option)),
          );
          const isTemplateQuestion =
            genericQuestionPattern.test(questionText) ||
            templatedQuestionPatterns.some((pattern) => pattern.test(questionText));
          const hasTemplateEvidenceOption = options.some((option) =>
            /real or realistic case identifying actors, institutions, principles, evidence and consequences/i.test(String(option)),
          );
          return !(isTemplateQuestion && (
            hasGenericDistractor ||
            hasTemplateEvidenceOption ||
            /^In .+?, when working on “.+”, which statement best describes .+\?$/i.test(questionText) ||
            /^In .+?, when working on “.+”, which statement most directly matches the main idea explained in “.+”\?$/i.test(questionText)
          ));
        });
        quizItemsRemoved += before - lesson.quiz.length;
      }
    }
  }
}

curriculum.meta = {
  ...curriculum.meta,
  editorialCleanup: {
    completedAt: new Date().toISOString(),
    lessonsCleaned,
    fillerSentencesRemoved,
    genericFillerParagraphsRemoved,
    genericQuizItemsRemoved: quizItemsRemoved,
  },
};

const temporaryPath = `${curriculumPath}.tmp`;
await fs.writeFile(temporaryPath, `${JSON.stringify(curriculum, null, 2)}\n`, "utf8");
await fs.rename(temporaryPath, curriculumPath);
console.log(JSON.stringify({
  lessonsCleaned,
  fillerSentencesRemoved,
  genericFillerParagraphsRemoved,
  genericQuizItemsRemoved: quizItemsRemoved,
}, null, 2));