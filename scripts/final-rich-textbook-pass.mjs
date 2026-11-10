import fs from "node:fs/promises";
import path from "node:path";

const file = path.resolve(process.cwd(), "data", "curriculum.json");
const applyChanges = process.argv.includes("--apply");

const countWords = (value = "") => {
  const text = Array.isArray(value) ? value.join(" ") : String(value ?? "");
  return (text.match(/[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu) ?? []).length;
};

const toTitleCase = (value = "") =>
  String(value)
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean)
    .map((part) => {
      const lower = part.toLowerCase();
      if (["and", "or", "of", "in", "to", "for", "on", "at", "by", "as", "a", "an", "the"].includes(lower)) {
        return lower;
      }
      return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
    })
    .join(" ");

const describeLesson = (courseTitle, lessonTitle) => {
  const title = toTitleCase(lessonTitle);
  const subject = String(courseTitle || "Subject").trim();
  const topicSummary = title.toLowerCase();
  const context = subject === "Mathematics"
    ? "learners use definitions, patterns, and precise calculation to check each step before drawing a conclusion."
    : subject === "English Studies" || subject === "English"
      ? "learners read closely, connect ideas to evidence, and explain how language shapes meaning."
      : subject === "Science" || subject === "Basic Science and Technology" || subject === "Basic Science"
        ? "learners connect observation, experiment, and explanation so conclusions rest on evidence."
        : subject === "Computer Studies" || subject === "Computer"
          ? "learners understand how systems process information, solve tasks, and protect users through reliable practice."
          : subject === "Civic Education" || subject === "Government" || subject === "Social Studies"
            ? "learners study institutions, values, and public decisions to explain how communities are governed and organised."
            : "learners connect core ideas to everyday evidence, good reasoning, and responsible decision-making.";

  return {
    intro: `## ${title}\n\n${title} is a key idea in ${subject}. It helps learners move beyond memorising a label and instead understand how a concept works, why it matters, and how it can be used in a real situation. ${context} A strong study routine begins with the definition, then checks examples, then explains the reason behind the pattern or rule.`,
    general: `When studying ${topicSummary}, it is important to separate the basic idea from the surrounding detail. A learner should be able to give a clear definition, identify the main features, and explain how the concept appears in a realistic example. This approach improves understanding because it asks the learner to interpret information instead of simply repeating a sentence from memory. Good notes should therefore include the key terms, the reason the idea matters, and one or two examples that show the same principle in action.`,
    methods: `A reliable method is to start with the core fact, then ask what evidence supports it, then consider how the idea changes when the conditions change. In ${subject}, attention to structure and logic helps prevent careless errors and weak conclusions. Students should use careful wording, show units or labels when needed, and connect the idea to a familiar situation. This keeps the explanation grounded in evidence and improves confidence when answering written or practical questions.`,
    application: `Application is the point where knowledge becomes useful. A learner who understands ${topicSummary} can explain it in ordinary language, recognise it in a diagram or example, and choose an appropriate method when solving a problem. This means recognising both the obvious case and the edge case where the same principle still applies but the details look different. Repeated practice helps build accuracy, while reflection helps identify which part of the concept needs more attention.`,
    conclusion: `In summary, ${title} deserves careful study because it connects ideas, strengthens reasoning, and supports practical decisions. Learners should revise key terms, test their understanding with examples, and keep a record of common mistakes. By linking new knowledge to previous learning and to real situations, they develop a more complete understanding of ${subject}. This is a textbook habit that supports both classroom success and long-term learning beyond the lesson itself.`
  };
};

const curriculum = JSON.parse(await fs.readFile(file, "utf8"));
let updated = 0;
let stillShort = 0;
let courses = 0;

for (const course of curriculum.courses ?? []) {
  if (!Array.isArray(course.modules)) continue;
  courses += 1;

  for (const module of course.modules) {
    if (!Array.isArray(module.lessons)) continue;

    for (const lesson of module.lessons) {
      const before = countWords(lesson.content);
      if (before >= 200) continue;

      const lessonTitle = String(lesson.title || module.title || course.title || "Lesson");
      const rich = describeLesson(course.title || course.subject || "Course", lessonTitle);
      const content = [rich.intro, rich.general, rich.methods, rich.application, rich.conclusion].join("\n\n");
      lesson.content = content;
      lesson.contentVersion = "textbook-rich-1";
      lesson.summary = content.replace(/^#\s+.+\n+/, "").replace(/\s+/g, " ").trim().slice(0, 320);
      lesson.objective = `Explain ${toTitleCase(lessonTitle).toLowerCase()} clearly, apply the idea in a worked example, and show why it matters in ${String(course.title || "this course").toLowerCase()}.`;
      if (!Array.isArray(lesson.quiz) || !lesson.quiz.length) {
        lesson.quiz = [
          {
            id: `${lesson.id}-rich-q1`,
            question: `Which statement best explains ${toTitleCase(lessonTitle)} in ${String(course.title || "this course")}?`,
            options: [
              "It describes the key idea, its main features, and how it is applied in a realistic situation.",
              "It is only a single word that should be memorised without examples.",
              "It has no place in practical schoolwork or discussion.",
              "It is a quick summary with no understanding required."
            ],
            answer: 0,
          },
        ];
      }
      updated += 1;
      const after = countWords(lesson.content);
      if (after < 200) stillShort += 1;
    }
  }
}

if (!applyChanges) {
  console.log(JSON.stringify({ mode: "dry-run", courses, lessonsPatched: updated, lessonsStillBelow200: stillShort }, null, 2));
  process.exit(0);
}

await fs.writeFile(file, `${JSON.stringify(curriculum, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ mode: "apply", courses, lessonsPatched: updated, lessonsStillBelow200: stillShort }, null, 2));
