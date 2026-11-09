import fs from "node:fs/promises";
import path from "node:path";

const dataFile = path.resolve(process.cwd(), "data", "curriculum.json");
const curriculum = JSON.parse(await fs.readFile(dataFile, "utf8"));

function cleanTopicName(title) {
  return String(title ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

function questionSet(subject, level, lessonTitle, lessonId) {
  const topic = cleanTopicName(lessonTitle);
  const topicLower = topic.toLowerCase();
  const subjectLower = String(subject).toLowerCase();
  const context = `${level} ${subject}`;

  const q1 = {
    id: `${lessonId}-q1`,
    question: `In ${context}, which statement best explains why ${topic} matters in real learning?`,
    options: [
      `It helps learners connect ${topicLower} to clear examples, evidence and sound decisions in ${subjectLower}.`,
      `It is only a label to memorise and does not need evidence.`,
      `It is useful only when the teacher gives the answer first.`,
      `It should be ignored once the title is known.`
    ],
    answer: 0,
  };

  const q2 = {
    id: `${lessonId}-q2`,
    question: `In ${context}, which example best shows the idea of ${topic}?`,
    options: [
      `A learner applies ${topicLower} to a real case, explains the key idea and supports the conclusion with evidence.`,
      `A learner guesses the answer without checking the facts or the example.`,
      `A learner changes the topic title to something easier to remember.`,
      `A learner ignores the lesson and writes only the chapter heading.`
    ],
    answer: 0,
  };

  const q3 = {
    id: `${lessonId}-q3`,
    question: `In ${context}, what is the best way to respond when a learner is unsure about ${topic}?`,
    options: [
      `Identify the main idea, use a relevant example and check the evidence before concluding.`,
      `Skip the idea and give a random answer.`,
      `Repeat the topic title without explaining it.`,
      `Only use the first sentence from the lesson and ignore the rest.`
    ],
    answer: 0,
  };

  return [q1, q2, q3];
}

let updated = 0;
for (const course of curriculum.courses ?? []) {
  for (const module of course.modules ?? []) {
    for (const lesson of module.lessons ?? []) {
      if (!lesson || !lesson.title) continue;
      const quiz = questionSet(course.title, course.level, lesson.title, lesson.id);
      lesson.quiz = quiz;
      updated += 1;
    }
  }
}

await fs.writeFile(dataFile, `${JSON.stringify(curriculum, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ updatedCourses: curriculum.courses.length, updatedLessons: updated }, null, 2));
