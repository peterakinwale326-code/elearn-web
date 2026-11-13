import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const curriculumPath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "data",
  "curriculum.json",
);
const applyChanges = process.argv.includes("--apply");
const curriculum = JSON.parse(await readFile(curriculumPath, "utf8"));

const genericPatterns = [
  /^which statement best describes .+\?$/i,
  /^which example provides the strongest evidence that a learner understands .+\?$/i,
  /^in .+, for the lesson on .+: what is the main purpose of .+\?$/i,
  /^in .+, for the lesson on .+: why do data types matter in programming\?$/i,
  /^why do data types matter in programming\?$/i,
];

const programmingTypes = {
  JavaScript: { integer: "number", text: "string", boolean: "boolean", collection: "Array<string>" },
  Python: { integer: "int", text: "str", boolean: "bool", collection: "list[str]" },
  Java: { integer: "int", text: "String", boolean: "boolean", collection: "List<String>" },
  PHP: { integer: "int", text: "string", boolean: "bool", collection: "array" },
  "C++": { integer: "int", text: "std::string", boolean: "bool", collection: "std::vector<std::string>" },
  "C#": { integer: "int", text: "string", boolean: "bool", collection: "List<string>" },
  Ruby: { integer: "Integer", text: "String", boolean: "TrueClass / FalseClass", collection: "Array" },
  Dart: { integer: "int", text: "String", boolean: "bool", collection: "List<String>" },
  TypeScript: { integer: "number", text: "string", boolean: "boolean", collection: "Array<string>" },
};

function isGeneric(question) {
  return genericPatterns.some((pattern) => pattern.test(String(question ?? "").trim()));
}

function normalize(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\bsocialisation\b/g, "socialization")
    .trim();
}

function getTopic(question) {
  const text = String(question ?? "");
  if (/why do data types matter in programming\?/i.test(text)) return "Data types";
  const patterns = [
    /which statement best describes (.+)\?$/i,
    /which example provides the strongest evidence that a learner understands (.+)\?$/i,
    /for the lesson on (.+?):/i,
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[1].trim();
  }
  return "";
}

function lessonForTopic(lessons, topic) {
  const normalizedTopic = normalize(topic);
  const exact = lessons.find((lesson) => normalize(lesson.title) === normalizedTopic);
  if (exact) return exact;

  const topicWords = new Set(normalizedTopic.split(" ").filter((word) => word.length > 2));
  let bestLesson = null;
  let bestScore = 0;
  for (const lesson of lessons) {
    const lessonWords = normalize(lesson.title).split(" ").filter((word) => word.length > 2);
    const overlap = lessonWords.filter((word) => topicWords.has(word)).length;
    const score = overlap / Math.max(lessonWords.length, topicWords.size, 1);
    if (score > bestScore) {
      bestLesson = lesson;
      bestScore = score;
    }
  }
  return bestScore >= 0.5 ? bestLesson : null;
}

function variableDeclaration(language, name, value) {
  switch (language) {
    case "JavaScript":
      return `let ${name} = ${value};`;
    case "TypeScript":
      return `let ${name}: number = ${value};`;
    case "Dart":
    case "Java":
    case "C#":
    case "C++":
      return `int ${name} = ${value};`;
    case "PHP":
      return `$${name} = ${value};`;
    case "Python":
    case "Ruby":
      return `${name} = ${value}`;
    default:
      return null;
  }
}

function programmingQuestion(language, topic, variant = 0) {
  const types = programmingTypes[language];
  if (!types) return null;

  const normalizedTopic = normalize(topic);
  if (/variable|binding|constant|value|object/.test(normalizedTopic)) {
    const scenarios = [
      { name: "unitPrice", value: 120, context: "A checkout stores a unit price once so several item totals can use it" },
      { name: "score", value: 0, context: "A quiz app increases a learner's score after each correct answer" },
      { name: "seconds", value: 60, context: "A timer updates the number of seconds that have elapsed" },
      { name: "attempts", value: 3, context: "A sign-in form increments its attempt count after a failed try" },
      { name: "absentCount", value: 1, context: "An attendance tool updates the number of absences recorded" },
      { name: "sampleCount", value: 5, context: "A lab record tracks how many samples have been checked" },
      { name: "streak", value: 2, context: "A flashcard app changes a learner's correct-answer streak" },
      { name: "remaining", value: 80, context: "A budget tool recalculates how much money remains" },
    ];
    const scenario = scenarios[variant % scenarios.length];
    const mutable = variableDeclaration(language, scenario.name, scenario.value);
    if (!mutable) return null;
    let immutable;
    switch (language) {
      case "JavaScript":
        immutable = `const ${scenario.name} = ${scenario.value};`;
        break;
      case "TypeScript":
        immutable = `const ${scenario.name}: number = ${scenario.value};`;
        break;
      case "Dart":
        immutable = `final ${scenario.name} = ${scenario.value};`;
        break;
      case "PHP":
        immutable = `define('${scenario.name.toUpperCase()}', ${scenario.value});`;
        break;
      case "Python":
      case "Ruby":
        immutable = null;
        break;
      case "Java":
        immutable = `final int ${scenario.name} = ${scenario.value};`;
        break;
      case "C++":
      case "C#":
        immutable = `const int ${scenario.name} = ${scenario.value};`;
        break;
      default:
        immutable = null;
    }
    const alternatives = immutable
      ? [immutable, `${scenario.name} = "${scenario.value}";`, `${scenario.name} = [${scenario.value}];`]
      : [
          `${scenario.name} == ${scenario.value}`,
          `${scenario.name} = "${scenario.value}"`,
          language === "Ruby"
            ? `def ${scenario.name}; ${scenario.value}; end`
            : `def ${scenario.name}(): return ${scenario.value}`,
        ];
    return {
      question: `${scenario.context}. Which ${language} statement creates a reusable, updateable binding?`,
      options: [mutable, ...alternatives],
      answer: 0,
    };
  }

  if (/data type|primitive|type|annotation|utility/.test(normalizedTopic) || /why do data types matter/i.test(topic)) {
    const scenarios = [
      { question: "A quiz mark is a whole number", answer: types.integer },
      { question: "A learner's name must be stored as text", answer: types.text },
      { question: "A submission is either accepted or rejected", answer: types.boolean },
      { question: "A class roster stores several learner names together", answer: types.collection },
      { question: "The number of books in a library inventory is counted without fractions", answer: types.integer },
      { question: "A course code such as BIO-204 is stored for display", answer: types.text },
      { question: "A settings switch is either on or off", answer: types.boolean },
      { question: "Several selected course names are kept in order", answer: types.collection },
    ];
    const scenario = scenarios[variant % scenarios.length];
    const options = [types.integer, types.text, types.boolean, types.collection];
    return {
      question: `${scenario.question}. Which type best represents this value in ${language}?`,
      options: [scenario.answer, ...options.filter((option) => option !== scenario.answer)],
      answer: 0,
    };
  }
  return null;
}

function generatedProgrammingTopic(question) {
  if (/statement creates a reusable(?:, updateable)? (?:variable|binding)|^A checkout stores|^A quiz app must/i.test(question)) return "variable";
  if (/type best represents (?:this value|it) in/i.test(question) || /^A quiz mark|^A learner's name/i.test(question)) return "data types";
  return "";
}

function biologyQuestion(course, topic, isFinal) {
  if (!/biology/i.test(course.title)) return null;
  const normalizedTopic = normalize(topic);
  const isRespiration = /respiration/.test(normalizedTopic);
  const isDigestion = /digestion/.test(normalizedTopic);
  if (isRespiration) {
    return isFinal
      ? {
          question: "During a race, a runner's muscles need more energy and oxygen. Which cellular process releases energy from glucose?",
          options: ["Aerobic respiration", "Digestion", "Excretion", "Photosynthesis"],
          answer: 0,
        }
      : {
          question: "Which process releases usable energy from glucose inside living cells?",
          options: ["Cellular respiration", "Digestion", "Excretion", "Transpiration"],
          answer: 0,
        };
  }
  if (isDigestion) {
    return isFinal
      ? {
          question: "After digestive enzymes act on protein, which small molecules can be absorbed through the small intestine?",
          options: ["Amino acids", "Starch granules", "Fat droplets", "Mineral salts only"],
          answer: 0,
        }
      : {
          question: "A learner chews a piece of bread. Which enzyme in saliva begins the digestion of starch?",
          options: ["Amylase", "Pepsin", "Lipase", "Trypsin"],
          answer: 0,
        };
  }
  return null;
}

function socializationQuestion(topic, usedQuestions) {
  if (normalize(topic) !== "socialization") return null;
  const questions = [
    {
      question: "A learner picks up greeting customs at home and turn-taking rules from classmates. What process explains how these behaviours are learned?",
      options: ["Socialization", "Migration", "Urbanization", "Population growth"],
      answer: 0,
    },
    {
      question: "A pupil starts using the language and routines of a sports club after joining it. Which influence is shaping this learning?",
      options: ["A peer group as an agent of socialization", "A change in climate", "A movement of people between regions", "A change in population density"],
      answer: 0,
    },
  ];
  return questions.find((item) => !usedQuestions.has(normalize(item.question))) ?? null;
}

function sourceQuestion(lessons, topic, usedQuestions) {
  const lesson = lessonForTopic(lessons, topic);
  if (!lesson || !Array.isArray(lesson.quiz)) return null;
  const quizQuestion = lesson.quiz.find(
    (item) =>
      item &&
      typeof item.question === "string" &&
      Array.isArray(item.options) &&
      Number.isInteger(item.answer) &&
      !isGeneric(item.question) &&
      !usedQuestions.has(normalize(item.question)),
  );
  if (!quizQuestion) return null;
  return {
    question: quizQuestion.question,
    options: quizQuestion.options,
    answer: quizQuestion.answer,
  };
}

let updated = 0;
let adjusted = 0;
const unresolved = [];
for (const course of curriculum.courses ?? []) {
  const courseLessons = (course.modules ?? []).flatMap((module) => module.lessons ?? []);
  const assessments = [
    ...(course.modules ?? []).flatMap((module) =>
      module.test?.questions
        ? [{ title: module.test.title ?? module.title, questions: module.test.questions, lessons: module.lessons ?? [] }]
        : [],
    ),
    ...(course.finalExam?.questions
      ? [{ title: course.finalExam.title ?? `${course.title} final exam`, questions: course.finalExam.questions, lessons: courseLessons }]
      : []),
  ];

  for (const assessment of assessments) {
    const programmingVariants = new Map();
    const usedQuestions = new Set(
      assessment.questions
        .map((item) => item?.question)
        .filter((question) => typeof question === "string" && !isGeneric(question))
        .map(normalize),
    );
    for (const item of assessment.questions) {
      if (!item) continue;
      if (!isGeneric(item.question)) {
        const generatedTopic = generatedProgrammingTopic(item.question);
        if (programmingTypes[course.title] && generatedTopic) {
          const variant = programmingVariants.get(generatedTopic) ?? 0;
          programmingVariants.set(generatedTopic, variant + 1);
          const replacement = programmingQuestion(
            course.title,
            generatedTopic,
            variant,
          );
          if (
            replacement &&
            (item.question !== replacement.question ||
              JSON.stringify(item.options) !== JSON.stringify(replacement.options) ||
              item.answer !== replacement.answer)
          ) {
            item.question = replacement.question;
            item.options = replacement.options;
            item.answer = replacement.answer;
            adjusted += 1;
          }
        }
        continue;
      }
      const topic = getTopic(item.question);
      const programmingTopic = programmingTypes[course.title] ? topic : "";
      const variant = programmingTopic
        ? programmingVariants.get(programmingTopic) ?? 0
        : 0;
      if (programmingTopic) programmingVariants.set(programmingTopic, variant + 1);
      const replacement =
        programmingQuestion(course.title, topic, variant) ??
        biologyQuestion(course, topic, isFinal) ??
        sourceQuestion(assessment.lessons, topic, usedQuestions) ??
        sourceQuestion(courseLessons, topic, usedQuestions) ??
        socializationQuestion(topic, usedQuestions);

      if (!replacement) {
        unresolved.push(`${course.title} / ${assessment.title}: ${item.question}`);
        continue;
      }

      item.question = replacement.question;
      item.options = replacement.options;
      item.answer = replacement.answer;
      usedQuestions.add(normalize(item.question));
      updated += 1;
    }
  }
}

if (unresolved.length > 0) {
  console.error(`Could not replace ${unresolved.length} generic assessment question(s):`);
  for (const question of unresolved.slice(0, 30)) console.error(`- ${question}`);
  process.exitCode = 1;
} else if (applyChanges && updated + adjusted > 0) {
  await writeFile(curriculumPath, `${JSON.stringify(curriculum, null, 2)}\n`, "utf8");
  console.log(`Updated ${updated} generic assessment question(s) and refined ${adjusted} generated option set(s).`);
} else {
  console.log(`Ready to update ${updated} generic assessment question(s) and refine ${adjusted} generated option set(s). Re-run with --apply to write.`);
}
