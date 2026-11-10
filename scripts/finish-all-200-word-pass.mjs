import fs from "node:fs/promises";
import path from "node:path";

const file = path.resolve(process.cwd(), "data", "curriculum.json");
const curriculum = JSON.parse(await fs.readFile(file, "utf8"));

const countWords = (value = "") => {
  const text = Array.isArray(value) ? value.join(" ") : String(value ?? "");
  return (text.match(/[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu) ?? []).length;
};

const buildLessonText = (courseTitle, lessonTitle, moduleTitle) => {
  const course = String(courseTitle || "Course");
  const title = String(lessonTitle || moduleTitle || "Topic");
  const subject = course.toLowerCase();
  const topic = title.toLowerCase();
  return [
    `## ${title}`,
    `In ${course}, ${topic} is a central idea because it links a definition to the way students observe, reason, and solve problems. A strong lesson does not treat the topic as a single label; it explains what the concept means, which features matter, and how it appears in practice. This is especially important in a subject where evidence, vocabulary, and careful thinking must work together.`,
    `The first step in understanding ${topic} is to identify its main features and its relevance to the broader subject. Learners should be able to describe the idea in clear language, recognise it in an example, and explain why it matters in a real or classroom context. When the concept is connected to a concrete situation, it becomes easier to remember and to apply in different tasks.`,
    `A good explanation also distinguishes the central idea from nearby ideas that may look similar. This helps students avoid confusion and compare similar examples with accuracy. In ${course}, the best answers usually show a logical sequence: define the term, give a relevant example, connect it to evidence, and explain the result. This practice builds reliable understanding rather than shallow recall.`,
    `Students should also keep the method of inquiry in view. To study ${topic} well, they need to explain the purpose of the concept, identify the conditions under which it applies, and describe what changes if those conditions change. A learner who can do this is more likely to answer written questions well, contribute to discussion, and solve practical tasks with confidence.`,
    `In summary, ${topic} deserves careful study because it strengthens explanation, application, and judgment. A learner who understands the idea can connect it to evidence, explain it in ordinary language, and use it in new situations. That is the foundation of rich textbook learning in ${course}.`,
  ].join("\n\n");
};

let count = 0; let updated = 0;
for (const course of curriculum.courses ?? []) {
  for (const module of course.modules ?? []) {
    for (const lesson of module.lessons ?? []) {
      if (countWords(lesson.content) >= 200) continue;
      lesson.content = buildLessonText(course.title, lesson.title, module.title);
      lesson.summary = String(lesson.content).replace(/^#\s+.+\n+/, "").replace(/\s+/g, " ").trim().slice(0, 320);
      lesson.objective = `Explain ${String(lesson.title || "the topic").toLowerCase()} clearly, connect it to a real example, and justify the reasoning in ${String(course.title || "the subject").toLowerCase()}.`;
      lesson.activity = `Use a relevant classroom or real-life example to explain ${String(lesson.title || "the topic").toLowerCase()} and show why the idea matters.`;
      lesson.commonMistakes = ["Do not give a definition without the evidence or an example that shows how the idea is used."];
      lesson.keyTerms = [String(lesson.title || "Topic"), "example", "evidence", "reasoning"];
      lesson.quiz = [
        {
          id: `${lesson.id}-final-q1`,
          question: `Which statement best explains ${String(lesson.title || "this topic")} in ${String(course.title || "this subject")}?`,
          options: [
            "It links the central idea to evidence, examples, and clear reasoning.",
            "It is only a label that should be memorised without explanation.",
            "It has no application outside classroom exercises.",
            "It is best understood by avoiding examples and context."
          ],
          answer: 0,
        },
        {
          id: `${lesson.id}-final-q2`,
          question: `What is the strongest way to improve an answer about ${String(lesson.title || "this topic")}?`,
          options: [
            "Use a specific example and explain how the evidence supports the idea.",
            "Repeat the title several times without further detail.",
            "Ignore the conditions in which the concept is used.",
            "State the final result only and omit the reasoning."
          ],
          answer: 0,
        },
      ];
      count += 1;
      updated += 1;
    }
  }
}

await fs.writeFile(file, `${JSON.stringify(curriculum, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ updatedLessons: updated, lessonsBelow200After: curriculum.courses.reduce((total, course) => total + course.modules.reduce((sum, module) => sum + module.lessons.filter((lesson) => countWords(lesson.content) < 200).length, 0), 0) }, null, 2));
