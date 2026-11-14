import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { authoredAssessmentQuestion } from "./assessment-question-bank.mjs";

const curriculumPath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "data",
  "curriculum.json",
);
const applyChanges = process.argv.includes("--apply");
const curriculum = JSON.parse(await readFile(curriculumPath, "utf8"));

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
    /^in .+, which statement best explains why (.+) matters in real learning\?$/i,
    /^in .+, which example best shows the idea of (.+)\?$/i,
    /^in .+, what is the best way to respond when a learner is unsure about (.+)\?$/i,
    /^which statement best explains (.+?) in .+\?$/i,
    /^what is the strongest way to improve an answer about (.+)\?$/i,
    /which statement best describes (.+)\?$/i,
    /which example provides the strongest evidence that a learner understands (.+)\?$/i,
    /for the lesson on (.+?):/i,
    /when applying (.+) on a farm, what should be considered first\?/i,
    /why should safety be included in work involving (.+)\?/i,
    /which statement gives the most useful interpretation of (.+)\?/i,
    /in a real computer task involving (.+), what should be traced\?/i,
    /which part of a computer system is most directly involved when applying (.+)\?/i,
    /which statement best explains why (.+) matters in real learning\?/i,
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
      { question: "A register records whether each learner attended today's lesson", answer: types.boolean },
      { question: "A library record displays the title of a borrowed book", answer: types.text },
      { question: "An app keeps the names of selected subjects together in order", answer: types.collection },
      { question: "A counter records how many assignments have been submitted", answer: types.integer },
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

function makeQuestion(question, answer, distractors) {
  const options = [
    String(answer),
    ...distractors.map(String).filter((option) => option !== String(answer)),
  ].filter((option, index, all) => all.indexOf(option) === index).slice(0, 4);
  if (options.length !== 4) return null;
  return { question, options, answer: 0 };
}

function mathematicsQuestion(topic, variant, level) {
  const offset = variant + Math.max(0, ["JSS1", "JSS2", "JSS3", "SS1", "SS2", "SS3"].indexOf(level));
  const n = (value) => value + offset;
  if (/whole number|place value/i.test(topic)) {
    const digits = [
      { number: 5382, digit: 3, value: 300 },
      { number: 7246, digit: 2, value: 200 },
      { number: 6815, digit: 8, value: 800 },
      { number: 4937, digit: 9, value: 900 },
    ];
    const item = digits[offset % digits.length];
    return makeQuestion(
      `In ${item.number}, what is the value of the digit ${item.digit}?`,
      item.value,
      [item.digit, item.value * 10, item.value / 10],
    );
  }
  if (/factor|multiple|prime/i.test(topic)) {
    const values = [36, 42, 48, 54];
    const value = values[offset % values.length];
    const factorPairs = { 36: "2 × 2 × 3 × 3", 42: "2 × 3 × 7", 48: "2 × 2 × 2 × 2 × 3", 54: "2 × 3 × 3 × 3" };
    const alternatives = ["2 × 3 × 5", "2 × 2 × 2 × 3", "3 × 3 × 5", "2 × 2 × 7"];
    return makeQuestion(
      `Which is the prime factorisation of ${value}?`,
      factorPairs[value],
      alternatives,
    );
  }
  if (/fraction/i.test(topic)) {
    const examples = [
      ["1/4 + 1/2", "3/4", ["2/6", "1/8", "2/4"]],
      ["2/3 - 1/6", "1/2", ["1/3", "1/6", "3/6"]],
      ["3/5 + 1/10", "7/10", ["4/15", "2/5", "8/10"]],
      ["3/4 × 2/3", "1/2", ["5/7", "6/7", "2/3"]],
    ];
    const [expression, answer, distractors] = examples[offset % examples.length];
    return makeQuestion(`Calculate ${expression}.`, answer, distractors);
  }
  if (/decimal|percent/i.test(topic)) {
    const examples = [
      [15, 20000],
      [12, 2500],
      [18, 1500],
      [25, 840],
    ];
    const [percent, amount] = examples[offset % examples.length];
    const answer = (percent * amount) / 100;
    return makeQuestion(
      `A shop reduces an item priced at ₦${amount} by ${percent}%. What is the discount?`,
      `₦${answer}`,
      [`₦${amount - answer}`, `₦${answer + percent}`, `₦${amount / percent}`],
    );
  }
  if (/ratio|proportion/i.test(topic)) {
    const examples = [
      [3, 5, 24],
      [2, 7, 36],
      [4, 3, 28],
      [5, 2, 35],
    ];
    const [a, b, total] = examples[offset % examples.length];
    const second = (total * b) / (a + b);
    return makeQuestion(
      `A mixture uses ingredient A and B in the ratio ${a}:${b}. If ${a + b} equal parts are used, how many parts are B?`,
      b,
      [a, a + b, second],
    );
  }
  if (/directed number|integer/i.test(topic)) {
    const examples = [
      ["-7 + 12", "5", ["-19", "-5", "19"]],
      ["14 - 22", "-8", ["8", "-36", "36"]],
      ["-6 × 4", "-24", ["24", "-10", "10"]],
      ["-30 ÷ -5", "6", ["-6", "25", "-25"]],
    ];
    const [expression, answer, distractors] = examples[offset % examples.length];
    return makeQuestion(`Evaluate ${expression}.`, answer, distractors);
  }
  if (/indices|standard form/i.test(topic)) {
    const examples = [
      ["2^5", "32", ["10", "25", "64"]],
      ["3^3", "27", ["9", "18", "81"]],
      ["10^4", "10,000", ["1,000", "40,000", "100,000"]],
      ["5^2 × 5^1", "125", ["25", "150", "625"]],
    ];
    const [expression, answer, distractors] = examples[offset % examples.length];
    return makeQuestion(`Evaluate ${expression}.`, answer, distractors);
  }
  if (/algebraic expression|simplifying expression/i.test(topic)) {
    const examples = [
      ["3x + 2x - 4", "5x - 4", ["5x + 4", "6x - 4", "x - 4"]],
      ["7a - 3a + 2", "4a + 2", ["10a + 2", "4a - 2", "a + 2"]],
      ["2m + 5 - m + 3", "m + 8", ["3m + 8", "m + 2", "2m + 8"]],
      ["4p - 2 + p + 6", "5p + 4", ["5p - 8", "4p + 4", "p + 4"]],
    ];
    const [expression, answer, distractors] = examples[offset % examples.length];
    return makeQuestion(`Simplify ${expression}.`, answer, distractors);
  }
  if (/equation/i.test(topic)) {
    const x = n(4);
    const coefficient = (offset % 3) + 2;
    const constant = n(3);
    const result = coefficient * x + constant;
    return makeQuestion(
      `Solve ${coefficient}x + ${constant} = ${result}.`,
      x,
      [x + 1, x - 1, result - constant],
    );
  }
  if (/sequence|pattern/i.test(topic)) {
    const start = n(3);
    const step = (offset % 4) + 2;
    const answer = start + step * 4;
    return makeQuestion(
      `What is the next term in ${start}, ${start + step}, ${start + 2 * step}, ${start + 3 * step}, ...?`,
      answer,
      [answer + step, answer - 1, answer + 1],
    );
  }
  if (/angle|line/i.test(topic)) {
    const angle = 42 + (offset % 5) * 7;
    return makeQuestion(
      `Two straight lines intersect. If one angle is ${angle}°, what is the vertically opposite angle?`,
      `${angle}°`,
      [`${180 - angle}°`, `${angle / 2}°`, `${90 + angle}°`],
    );
  }
  if (/triangle|quadrilateral/i.test(topic)) {
    const angle = 35 + (offset % 4) * 5;
    const answer = 180 - angle - 65;
    return makeQuestion(
      `Two angles of a triangle are ${angle}° and 65°. Find the third angle.`,
      `${answer}°`,
      [`${180 - angle}°`, `${angle + 65}°`, `${answer + 10}°`],
    );
  }
  if (/polygon|symmetry/i.test(topic)) {
    const examples = [
      ["regular hexagon", "6"],
      ["square", "4"],
      ["equilateral triangle", "3"],
      ["regular octagon", "8"],
    ];
    const [shape, answer] = examples[offset % examples.length];
    return makeQuestion(
      `How many lines of reflection symmetry does a regular ${shape} have?`,
      answer,
      ["2", "1", "0"],
    );
  }
  if (/perimeter|area/i.test(topic)) {
    const length = n(8);
    const width = n(5);
    return makeQuestion(
      `A rectangular garden is ${length} m long and ${width} m wide. What is its area?`,
      `${length * width} m²`,
      [`${2 * (length + width)} m`, `${length + width} m²`, `${length * width * 2} m²`],
    );
  }
  if (/volume|capacity/i.test(topic)) {
    const length = n(4);
    const width = n(3);
    const height = n(5);
    return makeQuestion(
      `Find the volume of a cuboid measuring ${length} cm by ${width} cm by ${height} cm.`,
      `${length * width * height} cm³`,
      [`${length * width + height} cm³`, `${2 * (length * width + height)} cm³`, `${length + width + height} cm³`],
    );
  }
  if (/speed|distance|time/i.test(topic)) {
    const speed = 40 + (offset % 5) * 10;
    const time = (offset % 3) + 2;
    return makeQuestion(
      `A bus travels at ${speed} km/h for ${time} hours. How far does it travel?`,
      `${speed * time} km`,
      [`${speed + time} km`, `${speed / time} km`, `${speed * (time + 1)} km`],
    );
  }
  if (/mean|median|mode/i.test(topic)) {
    const values = [4 + (offset % 3), 6 + (offset % 4), 8 + (offset % 2)];
    const answer = values.reduce((sum, value) => sum + value, 0) / values.length;
    return makeQuestion(
      `Find the mean of ${values.join(", ")}.`,
      answer,
      [answer + 1, answer - 1, values[values.length - 1]],
    );
  }
  if (/probability/i.test(topic)) {
    const sides = 6 + (offset % 3) * 2;
    return makeQuestion(
      `A fair ${sides}-sided spinner is numbered 1 to ${sides}. What is the probability of landing on 1?`,
      `1/${sides}`,
      [`1/${sides - 1}`, `2/${sides}`, `${sides}/1`],
    );
  }
  if (/coordinate/i.test(topic)) {
    const x = n(3);
    const y = n(5);
    return makeQuestion(
      `In which quadrant is the point (${x}, ${y})?`,
      "Quadrant I",
      ["Quadrant II", "Quadrant III", "Quadrant IV"],
    );
  }
  if (/transformation/i.test(topic)) {
    const x = n(2);
    const y = n(4);
    const dx = (offset % 3) + 1;
    return makeQuestion(
      `Point (${x}, ${y}) is translated ${dx} units to the right. What are its new coordinates?`,
      `(${x + dx}, ${y})`,
      [`(${x}, ${y + dx})`, `(${x - dx}, ${y})`, `(${x}, ${y - dx})`],
    );
  }
  if (/pythagoras/i.test(topic)) {
    const scale = (offset % 4) + 1;
    return makeQuestion(
      `A right triangle has shorter sides ${3 * scale} cm and ${4 * scale} cm. Find the hypotenuse.`,
      `${5 * scale} cm`,
      [`${6 * scale} cm`, `${7 * scale} cm`, `${4 * scale} cm`],
    );
  }
  if (/similarity|scale/i.test(topic)) {
    const factor = (offset % 3) + 2;
    return makeQuestion(
      `A map uses a scale of 1:${factor * 1000}. What real distance does 3 cm represent?`,
      `${factor * 30} m`,
      [`${factor * 3} m`, `${factor * 300} m`, `${3 + factor} m`],
    );
  }
  if (/financial|interest|budget/i.test(topic)) {
    const principal = 1000 * ((offset % 4) + 2);
    const rate = (offset % 3) + 5;
    const years = (offset % 2) + 2;
    const interest = (principal * rate * years) / 100;
    return makeQuestion(
      `Find the simple interest on ₦${principal} at ${rate}% per year for ${years} years.`,
      `₦${interest}`,
      [`₦${principal * rate / 100}`, `₦${interest + principal}`, `₦${principal * years}`],
    );
  }
  if (/graphs and tables|data interpretation/i.test(topic)) {
    const data = [
      { table: "2, 4, 6, 8", question: "What is the mean of the values 2, 4, 6 and 8?", answer: "5", distractors: ["4", "6", "20"] },
      { table: "3, 5, 5, 9", question: "What is the mode of the values 3, 5, 5 and 9?", answer: "5", distractors: ["3", "6", "9"] },
      { table: "4, 7, 10, 13", question: "The table lists values 4, 7, 10 and 13. What is the difference between the largest and smallest?", answer: "9", distractors: ["7", "10", "13"] },
      { table: "5, 8, 8, 12", question: "What is the median of the ordered values 5, 8, 8 and 12?", answer: "8", distractors: ["5", "7", "12"] },
    ];
    const item = data[offset % data.length];
    return makeQuestion(item.question, item.answer, item.distractors);
  }
  if (/mixed problem solving/i.test(topic)) {
    const length = n(6);
    const width = n(4);
    return makeQuestion(
      `A rectangle is ${length} cm long and ${width} cm wide. What is its perimeter?`,
      `${2 * (length + width)} cm`,
      [`${length * width} cm`, `${length + width} cm`, `${2 * length * width} cm`],
    );
  }
  return null;
}

function englishQuestion(topic, variant) {
  const cases = [
    [/vowel|diphthong/i, [
      ["Which word has /ɔ:/?", "law", ["lay", "lee", "lie"]],
      ["Which word has /ʊ/?", "book", ["boot", "boat", "bait"]],
      ["Which word has the vowel sound /ɔ:/ in the lesson's pronunciation model?", "thought", ["thin", "three", "thank"]],
      ["Which word has the vowel sound /ʊ/ as in “book”?", "foot", ["food", "fool", "boot"]],
      ["Which word has the vowel sound /eɪ/ as in “day”?", "train", ["tree", "try", "toy"]],
      ["Which word has the vowel sound /aɪ/ as in “time”?", "shine", ["seen", "soon", "shown"]],
      ["Which word begins with a vowel sound?", "hour", ["house", "uniform", "European"]],
      ["Which word contains the long /i:/ sound?", "sheep", ["ship", "shape", "shop"]],
    ]],
    [/consonant|speech sound|spelling/i, [
      ["Which pair differs only in the initial consonant sound?", "bat / pat", ["bat / bag", "ship / sheep", "thin / then"]],
      ["Which word begins with the voiced consonant /b/?", "bag", ["pan", "fan", "tan"]],
    ]],
    [/stress|intonation/i, [
      ["In the noun REcord, which syllable receives the main stress?", "The first syllable", ["The second syllable", "Both syllables equally", "Neither syllable"]],
      ["Which mark best shows a rising intonation at the end of a yes-or-no question?", "A rising pitch", ["A falling pitch", "No change in pitch", "A pause before every word"]],
    ]],
    [/word class|noun|pronoun/i, [
      ["In “The pupils carefully arranged the books,” which word is an adverb?", "carefully", ["pupils", "arranged", "books"]],
      ["In “Amina gave him the notebook,” which word is a pronoun?", "him", ["Amina", "gave", "notebook"]],
      ["In “They carried the baskets carefully,” which word is a pronoun?", "They", ["carried", "baskets", "carefully"]],
      ["In “Our coach praised the team,” which word is a possessive pronoun?", "Our", ["coach", "praised", "team"]],
      ["In “The bright lantern lit the path,” which word is an adjective?", "bright", ["lantern", "lit", "path"]],
      ["In “The children laughed loudly,” which word is a verb?", "laughed", ["children", "the", "loudly"]],
    ]],
    [/verb|tense/i, [
      ["Choose the correct past-tense form: “Yesterday, Musa ___ the match.”", "watched", ["watch", "watches", "watching"]],
      ["Which sentence uses the present perfect tense?", "They have finished the work.", ["They finish the work.", "They finished the work yesterday.", "They will finish the work."]],
      ["Choose the correct verb: “Last Friday, Amina ___ her assignment before dinner.”", "completed", ["complete", "completes", "completing"]],
      ["Choose the correct verb: “The pupils ___ the library every Wednesday.”", "visit", ["visits", "visited tomorrow", "visiting"]],
      ["Choose the correct past-tense form: “The rain ___ before the match began.”", "had stopped", ["has stop", "will stopping", "stop"]],
      ["Which sentence uses the future continuous tense?", "At noon, we will be travelling to Kano.", ["At noon, we travelled to Kano.", "We travel to Kano every week.", "We have travelled to Kano."]],
    ]],
    [/subject.?verb agreement/i, [
      ["Choose the correct verb: “Each of the players ___ a number.”", "has", ["have", "are having", "were"]],
      ["Which sentence has correct subject-verb agreement?", "The list of names is on the desk.", ["The list of names are on the desk.", "The lists of name is on the desk.", "The name list were on the desk."]],
    ]],
    [/adjective|adverb/i, [
      ["In “The careful driver stopped,” which word describes the noun?", "careful", ["driver", "stopped", "the"]],
      ["Choose the correct word: “The team played ___.”", "well", ["good", "bestly", "betterly"]],
    ]],
    [/preposition|conjunction/i, [
      ["Choose the preposition: “The keys are beneath the book.”", "beneath", ["keys", "are", "book"]],
      ["Which conjunction correctly completes the sentence: “We waited ___ the rain stopped”?", "until", ["under", "beside", "between"]],
    ]],
    [/sentence structure|clause/i, [
      ["Which group of words is a complete independent clause?", "The children opened the gate.", ["Because the gate was locked", "While the children waited", "Although the road was clear"]],
      ["Which sentence is compound?", "Tola read the note, and Kemi answered it.", ["Tola read the note.", "After Tola read the note.", "Reading the note carefully."]],
    ]],
    [/punctuation|capital letter/i, [
      ["Which sentence uses the apostrophe correctly for one learner's book?", "The learner's book is here.", ["The learners book is here.", "The learners' book is here.", "The learner,s book is here."]],
      ["Which punctuation mark should end a direct question?", "A question mark", ["A comma", "A colon", "A semicolon"]],
    ]],
    [/direct.*reported|reported speech/i, [
      ["Change to reported speech: Ada said, “I am ready.”", "Ada said that she was ready.", ["Ada said that I am ready.", "Ada says that she were ready.", "Ada said, that she ready."]],
      ["In reported speech, “He said, ‘I will come’” becomes:", "He said that he would come.", ["He said that I will come.", "He says he would came.", "He said that he comes."]],
    ]],
    [/main idea|inference|reading/i, [
      ["A passage says the road was wet and several drivers slowed down. What can the reader infer?", "The rain made driving conditions less safe.", ["The road had been closed for repairs.", "The drivers were late for school.", "The rain had stopped all transport."]],
      ["Which sentence is most likely to express a passage's main idea?", "A statement that captures the central point supported by several details.", ["The longest sentence in the passage.", "A minor example mentioned once.", "A personal opinion unrelated to the text."]],
      ["A passage describes a community planting trees, caring for them and recording bird numbers. Which idea best summarises it?", "Residents are restoring a habitat and monitoring its wildlife.", ["The community is building a new road.", "Birds have stopped living in the area.", "The residents are measuring rainfall only."]],
      ["A passage explains how pupils compared water samples, recorded their results and repeated the measurements. What is its main focus?", "The pupils used a careful process to investigate water quality.", ["The pupils planned a sports competition.", "The school replaced its water tanks.", "The class studied the history of transport."]],
      ["A story says that Kemi practised daily and finally completed a difficult drum rhythm. What can the reader infer?", "Regular practice helped Kemi improve.", ["Kemi had never heard the rhythm.", "The drum was not used.", "The practice stopped before she began."]],
      ["A passage lists shade, clean water and daily checks as reasons a garden survived a dry week. Which conclusion is best supported?", "The garden's care helped the plants withstand dry conditions.", ["The garden received too much rain.", "The plants needed no attention.", "The garden was moved indoors."]],
    ]],
    [/vocabulary|context/i, [
      ["In “Despite the delay, the passengers remained patient,” what does patient mean?", "Able to wait calmly", ["Unable to hear", "Eager to leave immediately", "Feeling physically ill"]],
      ["In “The glass vase was fragile, so it was wrapped carefully,” fragile means:", "Easily broken", ["Very expensive", "Extremely heavy", "Difficult to see"]],
    ]],
    [/summary/i, [
      ["What makes a summary effective?", "It states the central points briefly in the learner's own words.", ["It copies every sentence from the passage.", "It adds new examples not in the passage.", "It repeats only the opening sentence."]],
      ["When writing a summary, which detail should usually be omitted?", "A minor example that does not support the main point.", ["The central claim", "A key cause", "An essential result"]],
    ]],
    [/formal letter|business letter/i, [
      ["Which closing is most suitable for a formal letter that begins “Dear Sir/Madam”?", "Yours faithfully", ["See you soon", "Your friend", "Cheers"]],
      ["Where should the writer place the subject heading in a formal letter?", "Clearly above the body of the letter", ["Inside the recipient's address", "After the signature", "At the bottom margin"]],
    ]],
    [/informal letter/i, [
      ["Which opening is most suitable for a letter to a close friend?", "Dear Chika,", ["To the Managing Director", "Dear Sir/Madam,", "Attention: Accounts Department"]],
      ["What is an appropriate feature of an informal letter?", "A friendly personal tone", ["A legal reference number", "A formal subject heading only", "A list of official enclosures"]],
    ]],
    [/report writing|report/i, [
      ["Which feature belongs in a factual incident report?", "A clear account of what happened, when, and where", ["Unverified rumours about the cause", "A fictional ending", "Personal insults about those involved"]],
      ["Why are headings useful in a report?", "They organise information into clear sections.", ["They replace evidence.", "They make the report informal.", "They hide the sequence of events."]],
    ]],
    [/argument|debate/i, [
      ["Which addition most strengthens an argument about school library hours?", "Relevant evidence showing when learners need access", ["An insult directed at opponents", "A repeated claim without support", "An unrelated personal story"]],
      ["During a debate, a speaker should respond to an opposing claim by:", "Addressing its reasons with relevant evidence.", ["Changing the subject immediately.", "Attacking the speaker personally.", "Repeating the motion without explanation."]],
    ]],
    [/narrative|story/i, [
      ["Which element helps readers understand how a story's events unfold?", "A clear sequence of events", ["A list of unrelated facts", "A repeated title only", "An unexplained set of instructions"]],
      ["What is the climax of a narrative?", "The point of greatest tension or turning point", ["The list of characters", "The opening setting only", "The final punctuation mark"]],
    ]],
    [/descriptive|imagery|poetry/i, [
      ["Which phrase uses a simile?", "The moon shone like a silver coin.", ["The moon rose above the hill.", "The moon was bright.", "The moon appeared at night."]],
      ["Which detail best helps a reader imagine a busy market?", "The sharp scent of pepper mixed with the calls of traders.", ["The market was open.", "The market is a place.", "People went there yesterday."]],
      ["Which phrase creates a clear sound image of a storm?", "Rain rattled against the zinc roof.", ["The storm happened last night.", "The roof was above the room.", "Rain is a kind of weather."]],
      ["Which phrase uses personification?", "The old gate groaned as the wind pushed it.", ["The gate was made of wood.", "The wind blew across the yard.", "A visitor opened the gate."]],
      ["Which detail appeals most directly to the sense of touch?", "The rough, cool stone pressed against her palm.", ["A bell rang across the field.", "The sunset turned the clouds orange.", "The soup smelled of ginger."]],
      ["Which phrase creates a visual image of a crowded bus station?", "Blue buses filled the dusty yard beneath a line of waving hands.", ["The buses arrived yesterday.", "The station was in town.", "Travellers waited for transport."]],
    ]],
    [/drama|dialogue/i, [
      ["In a play script, what do character names before lines identify?", "The speaker of each line", ["The setting's weather", "The audience's age", "The scene's page number"]],
      ["What is a stage direction used for?", "To guide actors' movement, expression, or delivery", ["To replace every spoken line", "To list the audience members", "To explain the author's biography"]],
    ]],
    [/editing|clarity/i, [
      ["Which edit improves clarity in “Due to the fact that it rained, the match was cancelled”?", "Because it rained, the match was cancelled.", ["Due the rain match cancellation.", "The match, it was cancelled raining.", "Due to fact, match was cancelled it rained."]],
      ["When editing a paragraph, which change best improves cohesion?", "Add a suitable linking word between related ideas.", ["Remove all punctuation.", "Repeat the same sentence several times.", "Replace precise words with vague ones."]],
    ]],
    [/functional communication/i, [
      ["Which response is most appropriate when asking a teacher to explain an unclear instruction?", "Could you please explain the last step again?", ["You did not explain anything.", "Give me the answer now.", "I will ignore the instruction."]],
      ["A learner is calling a school office. Which opening is most suitable?", "Good morning. My name is Ada, and I am calling about the science club.", ["Who are you? Tell me everything.", "Hey, do this now.", "I do not know why I called."]],
    ]],
    [/integrated language practice/i, [
      ["Choose the sentence with correct tense and subject-verb agreement.", "The pupils have completed their project.", ["The pupils has completed their project.", "The pupils completing their project yesterday.", "The pupils have complete their project."]],
      ["Which sentence combines a clear time expression with the correct verb form?", "By the time the bell rang, the class had finished the test.", ["By the time the bell ring, the class finish the test.", "The class had finish when the bell rings.", "The class finishing the test by the bell."]],
    ]],
  ];
  for (const [pattern, questions] of cases) {
    if (pattern.test(topic)) {
      const [question, answer, distractors] = questions[variant % questions.length];
      return makeQuestion(question, answer, distractors);
    }
  }
  return null;
}

function technologyQuestion(topic, variant) {
  const cases = [
    [/safety|hazard|fire|electrical/i, [
      ["Before changing a faulty workshop socket, what should a learner do first?", "Isolate the electrical supply and report the fault.", ["Touch the exposed wire to test it.", "Pour water on the socket.", "Continue working beside it."]],
      ["Which item provides eye protection when chipping metal?", "Safety goggles", ["Cotton gloves", "A dustpan", "A measuring tape"]],
      ["A learner notices a loose guard on a powered machine. What is the safest response?", "Stop using it, isolate the machine and report the defect.", ["Hold the guard by hand while the machine runs.", "Ask another learner to operate it faster.", "Remove the guard and continue." ]],
      ["Why should a workshop floor be kept free of oil and offcuts?", "To reduce slips, trips and falls.", ["To make tools harder to find.", "To increase the chance of fire.", "To prevent machines from being switched off."]],
      ["What should be done before using a fire extinguisher in a workshop?", "Raise the alarm and ensure it is safe to act without delaying evacuation.", ["Hide the fire from the supervisor.", "Pour petrol on the flames.", "Block the exit to keep people away."]],
      ["Which action reduces the risk of injury when using a hand tool?", "Use the correct tool and inspect it for damage before starting.", ["Use a cracked handle if the task is short.", "Point the cutting edge toward a nearby person.", "Leave the tool on the floor after use."]],
    ]],
    [/drawing instrument/i, [
      ["Which instrument is used to draw a circle of a specified radius?", "A compass", ["A set square", "A T-square", "A French curve"]],
      ["Which instrument is commonly used to draw parallel horizontal lines on a drawing board?", "A T-square", ["A pair of dividers", "A compass", "A protractor"]],
    ]],
    [/line|lettering/i, [
      ["Which line type is conventionally used to show a hidden edge in an engineering drawing?", "A short-dashed line", ["A thick continuous outline", "A freehand border", "A chain dimension line"]],
      ["Why should lettering on a technical drawing be consistent?", "It keeps notes clear and easy to read.", ["It changes the scale of the object.", "It replaces dimensions.", "It hides the drawing's centre lines."]],
    ]],
    [/geometric construction/i, [
      ["What does a perpendicular bisector do to a line segment?", "It crosses the segment at 90° and divides it into two equal parts.", ["It divides the segment into three parts.", "It runs parallel to the segment.", "It joins the segment to a circle's centre."]],
      ["Which instrument is essential for constructing an arc with a fixed radius?", "A compass", ["A ruler without a scale", "A set square only", "A lettering stencil"]],
    ]],
    [/scale drawing/i, [
      ["On a scale drawing of 1:100, what real length is represented by 4 cm?", "4 m", ["40 cm", "400 m", "104 m"]],
      ["A 6 m wall is drawn at a scale of 1:50. How long should the drawing be?", "12 cm", ["3 cm", "30 cm", "300 cm"]],
    ]],
    [/wood|timber/i, [
      ["Why is timber seasoned before it is used for furniture?", "To reduce its moisture content and limit later warping.", ["To make it absorb more water.", "To turn it into metal.", "To increase its weight."]],
      ["Which property makes hardwood suitable for durable furniture?", "It is generally dense and resistant to wear.", ["It dissolves easily in water.", "It is always lighter than foam.", "It cannot be shaped with tools."]],
      ["A timber board is likely to shrink after installation. Which preparation was probably inadequate?", "Seasoning to reduce its moisture content.", ["Painting a safety line on the floor.", "Sharpening a metal chisel.", "Measuring the board's length."]],
    ]],
    [/woodworking tool|woodwork tool|saw|metalworking tool|metalwork tool/i, [
      ["Which tool is designed to cut timber along a marked line?", "A hand saw", ["A try square", "A spanner", "A file"]],
      ["Which tool is used to smooth a rough metal edge by abrasion?", "A file", ["A soldering iron", "A plumb bob", "A mallet"]],
    ]],
    [/joint|joining metal/i, [
      ["Which wood joint commonly uses a projecting tenon fitted into a matching mortise?", "A mortise-and-tenon joint", ["A butt joint", "A lap joint", "A mitre joint"]],
      ["Which process joins metal parts by melting a filler metal without melting the main pieces?", "Soldering", ["Seasoning", "Forging", "Turning"]],
    ]],
    [/metal.*propert|alloy/i, [
      ["Why is copper commonly used for electrical wiring?", "It conducts electricity well and can be drawn into wire.", ["It is a poor conductor and very brittle.", "It dissolves in air immediately.", "It is transparent."]],
      ["What is an alloy?", "A mixture containing a metal and one or more other elements.", ["A pure non-metal gas.", "A tool for measuring angles.", "A type of timber joint."]],
    ]],
    [/building material|cement|concrete|mortar/i, [
      ["Which combination is used to make ordinary concrete?", "Cement, water, sand and coarse aggregate", ["Cement and dry leaves only", "Timber, paint and glass", "Clay and kerosene"]],
      ["What is the main purpose of mortar in blockwork?", "To bind blocks together and fill joints.", ["To reinforce electrical cables.", "To measure a roof's pitch.", "To season timber."]],
      ["A block wall has weak, crumbly joints. Which material should be checked first?", "The mortar mix and its preparation.", ["The compass used for drawing circles.", "The timber seasoning rack.", "The electrical switch rating."]],
    ]],
    [/building tool/i, [
      ["Which tool is used to check whether a wall is vertical?", "A plumb bob", ["A hacksaw", "A soldering iron", "A compass"]],
      ["Which hand tool is commonly used to spread mortar between blocks?", "A bricklayer's trowel", ["A pair of dividers", "A cold chisel for wood", "A wire stripper"]],
    ]],
    [/foundation|wall/i, [
      ["What is the main structural purpose of a building foundation?", "To transfer the building's loads safely to the ground.", ["To carry rainwater to a tank.", "To provide a decorative roof finish.", "To divide electrical circuits."]],
      ["Why should a wall be checked for plumb during construction?", "To ensure it is vertical.", ["To measure its colour.", "To calculate the cement's age.", "To test water pressure."]],
    ]],
    [/roof|roofing/i, [
      ["Which feature helps a pitched roof drain rainwater?", "Its slope directs water toward the eaves.", ["A flat ceiling traps water.", "A foundation beam raises the floor.", "A wall tie blocks the gutters."]],
      ["Why is roofing material selected for the local climate?", "It must provide suitable weather protection and durability.", ["It determines the room's furniture.", "It replaces the building foundation.", "It eliminates the need for ventilation."]],
    ]],
    [/circuit|electricity|conductor|insulator/i, [
      ["What must be present for a simple battery-lamp circuit to work?", "A closed conducting path through the lamp", ["A broken wire between the battery and lamp", "Only an open switch", "An insulating gap across every connection"]],
      ["Which material is a good electrical insulator for a cable covering?", "Rubber", ["Copper", "Aluminium", "Iron"]],
    ]],
    [/machine|mechanical advantage/i, [
      ["Mechanical advantage is calculated as:", "Load divided by effort", ["Effort divided by distance", "Distance divided by time", "Mass multiplied by temperature"]],
      ["A machine lifts a 300 N load with a 100 N effort. What is its mechanical advantage?", "3", ["200", "30", "0.3"]],
    ]],
    [/lever|linkage/i, [
      ["What is the fixed turning point of a lever called?", "The fulcrum", ["The load", "The effort", "The axle's thread"]],
      ["In a first-class lever, where is the fulcrum located?", "Between the effort and the load", ["Beyond both effort and load", "Inside the load only", "At the end of the effort arm only"]],
    ]],
    [/gear|pulley/i, [
      ["What happens when two external gears mesh?", "They rotate in opposite directions.", ["They rotate in the same direction.", "Neither gear can rotate.", "Both gears become pulleys."]],
      ["What is one benefit of a fixed pulley?", "It changes the direction of the applied effort.", ["It always halves the load.", "It produces energy from nothing.", "It removes friction completely."]],
    ]],
    [/plumbing|water supply|drainage/i, [
      ["Why should a waste pipe have a suitable downward gradient?", "So wastewater can flow toward the drain.", ["To make water flow back into a clean tank.", "To support roof trusses.", "To increase electrical resistance."]],
      ["Which fitting is used to change the direction of a pipe run?", "An elbow", ["A fuse", "A hinge", "A drawing compass"]],
      ["A pipe branches to supply a second outlet. Which fitting is designed to join three pipe sections?", "A tee", ["An elbow", "A plug", "A reducing washer"]],
    ]],
    [/maintenance|repair/i, [
      ["What should be done before maintaining a machine with moving parts?", "Switch it off and isolate its power source.", ["Increase its speed.", "Remove its safety guard while it runs.", "Apply water to the motor."]],
      ["Why is preventive maintenance carried out?", "To find and correct wear before equipment fails.", ["To make repairs impossible.", "To increase the chance of sudden breakdown.", "To avoid inspecting equipment."]],
    ]],
    [/project|design|human needs|technological development/i, [
      ["What is the best first step in designing a useful technology project?", "Identify the user's need and the problem to be solved.", ["Buy materials before defining the task.", "Decorate the finished product first.", "Choose a tool without considering its purpose."]],
      ["How should a learner evaluate a finished technology project?", "Test it against the stated purpose, safety and design requirements.", ["Judge it only by its colour.", "Ignore whether it works.", "Compare it with an unrelated project."]],
      ["A prototype wobbles when loaded. What should the designer do next?", "Test the structure, identify the weak point and revise the design.", ["Hide the prototype before testing it.", "Add decoration without checking stability.", "Ignore the load requirement."]],
    ]],
  ];
  for (const [pattern, questions] of cases) {
    if (pattern.test(topic)) {
      const [question, answer, distractors] = questions[variant % questions.length];
      return makeQuestion(question, answer, distractors);
    }
  }
  return null;
}

function businessQuestion(topic, variant) {
  const cases = [
    [/needs|wants|goods and services|scope of business/i, [
      ["Which activity is a service rather than the production of a physical good?", "A mechanic repairing a bicycle", ["A bakery making bread", "A factory assembling chairs", "A farmer harvesting maize"]],
      ["Which statement best distinguishes a need from a want?", "A need is essential, while a want is desired but not essential.", ["A want is always free.", "A need is only a luxury.", "A need and a want mean exactly the same thing."]],
    ]],
    [/occupation|economic activity|factor.*production/i, [
      ["A carpenter uses tools and skill to make a table. Which factor of production is the carpenter's skill?", "Labour", ["Land", "Capital", "Entrepreneurship"]],
      ["Which factor of production includes machinery used by a factory?", "Capital", ["Land", "Labour", "Consumer demand"]],
    ]],
    [/production|productivity/i, [
      ["What does production mean in business?", "Creating goods or services that satisfy human wants.", ["Only transporting finished goods abroad.", "Keeping money in a bank account.", "Recording a customer's complaint."]],
      ["A workshop makes more chairs per worker-hour after improving its process. What has increased?", "Productivity", ["Inflation", "Insurance", "Consumer credit"]],
    ]],
    [/trade|home trade|foreign trade|wholesale|retail|aids to trade/i, [
      ["A Nigerian company buys machinery from another country. This transaction is:", "An import", ["An export", "Home trade", "Barter within one market"]],
      ["Which activity is an aid to trade because it moves goods to buyers?", "Transport", ["Production", "Consumption", "Book-keeping"]],
      ["A retailer buys cartons of soap from a wholesaler in the same country. This is:", "Home trade", ["Foreign trade", "An export", "Barter"]],
      ["What does a wholesaler usually do?", "Buy goods in bulk from producers and resell them to retailers.", ["Sell only one item directly to each factory.", "Manufacture currency.", "Provide insurance to every household."]],
      ["A firm sells locally made cocoa to a buyer in another country. From the firm's viewpoint, this is:", "An export", ["An import", "Home trade", "A retail purchase"]],
      ["A trader arranges insurance against damage while goods are being shipped. Which aid to trade is being used?", "Insurance", ["Production", "Consumption", "Barter"]],
      ["A market uses mobile banking to let buyers pay sellers quickly. Which aid to trade supports the payment?", "Banking", ["Warehousing", "Manufacturing", "Farming"]],
      ["A shop sells school bags directly to families who will use them. This is an example of:", "Retail trade", ["Wholesale trade", "Foreign exchange", "Production only"]],
      ["Why does advertising help trade?", "It informs potential buyers about goods and where they can be obtained.", ["It removes the need to make products.", "It guarantees every product is free.", "It prevents sellers from reaching customers."]],
    ]],
    [/ownership|business organisation/i, [
      ["Which feature is typical of a sole proprietorship?", "One owner controls the business and bears its risks.", ["It must have thousands of shareholders.", "It is owned by the government only.", "It cannot make a profit."]],
      ["Why might two owners form a partnership?", "To combine skills, capital and responsibility under an agreement.", ["To remove all business risks.", "To avoid keeping records.", "To prevent either owner from contributing."]],
    ]],
    [/entrepreneur|business opportunity|small business project/i, [
      ["What should an entrepreneur check before investing in a proposed product?", "Whether customers need it and the business can supply it sustainably.", ["Only the colour of the packaging.", "Whether competitors can be ignored.", "Whether costs can be left unrecorded."]],
      ["Which action shows an entrepreneur responding to a business opportunity?", "Testing a product idea with likely customers before expanding.", ["Ignoring customer feedback.", "Buying stock without checking demand.", "Setting prices without calculating costs."]],
      ["Which amount should be included when estimating a small business's start-up capital?", "The cost of initial equipment and operating inputs.", ["Only the owner's favourite colour.", "The future value of every competitor.", "A sales figure with no time period."]],
      ["Before expanding a food stall, which evidence is most useful to the owner?", "Sales records showing which items customers buy and when.", ["A guess about sales with no records.", "The number of unrelated shops in another town.", "The owner's preferred uniform colour."]],
      ["A business idea attracts many buyers but costs more to produce than customers will pay. What should the entrepreneur examine?", "Ways to change costs, price or the product before committing further.", ["How to stop recording expenses.", "Whether to ignore customers permanently.", "How to remove all product information."]],
    ]],
    [/money|banking|savings|current account|payment method|cheque/i, [
      ["Which function of money allows prices of different goods to be compared?", "A measure of value", ["A means of production", "A form of insurance", "A storage facility"]],
      ["Which account is generally designed for frequent business deposits and payments?", "A current account", ["A fixed-term deposit only", "A loan agreement", "A share certificate"]],
      ["Why might a saver choose a savings account rather than keep cash at home?", "The account can keep funds secure and may earn interest.", ["It guarantees unlimited profit.", "It prevents the saver from making deposits.", "It removes all financial risk."]],
      ["What should a customer do before signing a cheque?", "Check the payee, amount and date are correct.", ["Leave the amount blank for anyone to complete.", "Sign a cheque with no payee.", "Share the cheque's details publicly."]],
      ["Which record should a customer check to confirm deposits and withdrawals made through a bank account?", "A bank statement", ["A delivery note", "A stock card", "A price list"]],
      ["What is the main purpose of a bank paying-in slip?", "To record cash or cheques deposited into an account.", ["To authorise a customer to withdraw goods from a warehouse.", "To list a firm's employees.", "To calculate the selling price of stock."]],
      ["A bank pays interest on a savings balance. What does the interest represent to the saver?", "A return earned on money deposited.", ["A transport fee paid to a wholesaler.", "A discount on goods bought for resale.", "A business liability written off automatically."]],
    ]],
    [/advertis|marketing|consumer protection/i, [
      ["What should an honest advertisement do?", "Give accurate information about the product.", ["Hide important costs.", "Make claims the seller cannot support.", "Misrepresent the product's features."]],
      ["A customer receives a faulty product. Which action best supports consumer protection?", "Keep the receipt and contact the seller with evidence of the fault.", ["Discard all proof of purchase.", "Accept a misleading explanation without question.", "Damage the product further before reporting it."]],
    ]],
    [/office|office equipment|office machine/i, [
      ["Which office machine produces a paper copy of a digital document?", "A printer", ["A scanner", "A router", "A calculator only"]],
      ["What is a central purpose of office work?", "To organise information and support an organisation's operations.", ["To manufacture every product sold by the organisation.", "To replace all customer service.", "To avoid communication between departments."]],
    ]],
    [/filing|records|business information/i, [
      ["Why are records filed using a consistent system?", "So information can be found and retrieved efficiently.", ["So documents cannot be located.", "To remove the need for accurate entries.", "To make every record a duplicate."]],
      ["Which source document provides evidence that a customer paid?", "A receipt", ["A price list", "A timetable", "A job application"]],
    ]],
    [/business document/i, [
      ["Which document tells a customer the amount owed for goods supplied on credit?", "An invoice", ["A receipt", "A payslip", "A delivery timetable"]],
      ["Which document acknowledges that a seller has received payment?", "A receipt", ["A purchase order", "A quotation", "A statement of account"]],
    ]],
    [/business letter|communication|telephone|mail|reception/i, [
      ["What should a clear business message include?", "The purpose, relevant details and any action required.", ["Unrelated personal comments only.", "An unclear request with no contact details.", "Unverified rumours."]],
      ["When receiving a business visitor, what should a receptionist do first?", "Greet the visitor and establish whom they have come to see.", ["Share confidential files immediately.", "Ignore the visitor.", "Send the visitor into a restricted area without checking."]],
    ]],
    [/book.?keeping|cash book|petty cash|profit and loss|discount|interest|budget|stock record/i, [
      ["A business receives cash from a customer. Where should the receipt be recorded?", "On the receipts side of the cash book", ["As a purchase in the stock book only", "As an unpaid liability", "Nowhere until the year ends"]],
      ["A shop earns ₦80,000 in revenue and incurs ₦55,000 in expenses. What is its profit?", "₦25,000", ["₦135,000", "₦55,000", "₦80,000"]],
      ["A shop buys 20 notebooks and sells 7. How many notebooks remain in stock?", "13", ["27", "7", "20"]],
      ["A customer receives a 10% discount on an item priced at ₦5,000. How much is the discount?", "₦500", ["₦50", "₦4,500", "₦5,010"]],
      ["A business budgets ₦30,000 for supplies and spends ₦24,500. How much remains in the budget?", "₦5,500", ["₦54,500", "₦24,500", "₦6,500"]],
      ["A trader sells goods for ₦72,000 that cost ₦49,000. What is the gross profit?", "₦23,000", ["₦121,000", "₦49,000", "₦72,000"]],
      ["A shop's opening stock is ₦18,000 and its closing stock is ₦12,000. What happened to stock during the period, ignoring purchases and sales details?", "The closing stock is ₦6,000 lower than the opening stock.", ["The closing stock is ₦30,000 higher.", "The two stock values are equal.", "The opening stock is ₦6,000 lower."]],
    ]],
    [/insurance|risk/i, [
      ["Why does a business take out insurance?", "To transfer specified financial risks in return for a premium.", ["To guarantee that no accident can happen.", "To replace all sales records.", "To avoid paying any premium."]],
      ["What is an insurance premium?", "The amount paid for insurance cover.", ["The value of a damaged item only.", "A business's annual profit.", "The amount of tax refunded."]],
    ]],
    [/transport|warehousing/i, [
      ["Why does a wholesaler use a warehouse?", "To store goods safely until they are needed for distribution.", ["To manufacture every item in the store.", "To replace all transport services.", "To prevent stock from being counted."]],
      ["Which transport choice is most suitable for moving a large quantity of heavy goods over land?", "A freight lorry", ["A bicycle basket", "A passenger lift", "A small hand envelope"]],
      ["Which transport is often economical for moving bulky goods over a long distance by land?", "Rail", ["A handcart", "A passenger elevator", "A wheelbarrow"]],
      ["Why might a food distributor use a refrigerated vehicle?", "To keep perishable goods within a safe temperature range during delivery.", ["To make the goods heavier.", "To avoid recording stock.", "To replace the need for packaging in every case."]],
      ["What is one reason a business keeps an inventory record in its warehouse?", "To monitor quantities received, stored and issued.", ["To remove the need for customer orders.", "To set the weather forecast.", "To prevent goods from being inspected."]],
    ]],
    [/customer relation/i, [
      ["A customer reports that an order arrived incomplete. What is the best response?", "Check the order record and arrange a prompt correction.", ["Blame the customer without checking.", "Ignore the complaint.", "Delete the order record."]],
      ["Why should a business keep a record of customer complaints?", "To track recurring issues and improve service.", ["To discourage every customer from returning.", "To replace sales accounts.", "To publish customers' private details."]],
    ]],
  ];
  for (const [pattern, questions] of cases) {
    if (pattern.test(topic)) {
      const [question, answer, distractors] = questions[variant % questions.length];
      return makeQuestion(question, answer, distractors);
    }
  }
  return null;
}

function programmingConceptQuestion(language, topic, variant) {
  const normalizedTopic = normalize(topic);
  if (language === "PHP" && /form/i.test(normalizedTopic)) {
    const questions = [
      [
        "A PHP form submits data with method=\"POST\". Which superglobal normally contains the submitted fields?",
        "$_POST",
        ["$_GET", "$_SERVER", "$_FILES"],
      ],
      [
        "Before storing a value submitted through a PHP form, what should the application do?",
        "Validate the value and safely handle it for its intended use.",
        ["Trust it because browsers always send safe values.", "Use it directly in an SQL string.", "Disable server-side checks."],
      ],
    ];
    const [stem, answer, distractors] = questions[variant % questions.length];
    return makeQuestion(stem, answer, distractors);
  }
  if (/html/i.test(language)) {
    if (/form/i.test(normalizedTopic)) {
      return makeQuestion(
        "Which HTML element groups controls for submitting user input?",
        "<form>",
        ["<section>", "<table>", "<footer>"],
      );
    }
    if (/list/i.test(normalizedTopic)) {
      return makeQuestion(
        "Which HTML element creates an ordered, numbered list?",
        "<ol>",
        ["<ul>", "<li>", "<dl>"],
      );
    }
    if (/link|anchor/i.test(normalizedTopic)) {
      return makeQuestion(
        "Which HTML attribute specifies the destination of a link?",
        "href",
        ["src", "alt", "class"],
      );
    }
    if (/class|object|interface/i.test(normalizedTopic)) {
      const questions = [
        ["In HTML, what is an object in object-oriented programming?", "A reusable name that CSS and scripts can use to select elements.", ["A unique page address for the browser.", "A command that submits a form.", "A method for storing a password."]],
        ["In HTML, what does the class attribute provide?", "A reusable name that CSS and scripts can use to select elements.", ["A unique page address for the browser.", "A command that submits a form.", "A method for storing a password."]],
        ["Which HTML attribute can assign the same reusable label to several elements?", "class", ["href", "src", "method"]],
        ["How can CSS target elements marked with class=\"notice\"?", "Use the .notice class selector.", ["Use #notice as a class selector.", "Use the href attribute.", "Use a form method."]],
      ];
      const [stem, answer, distractors] = questions[variant % questions.length];
      return makeQuestion(stem, answer, distractors);
    }
  }
  if (/css/i.test(language)) {
    if (/cascade|inheritance/i.test(normalizedTopic)) {
      const questions = [
        ["When two CSS rules have equal specificity, which rule normally wins?", "The rule declared later", ["The rule with the shorter selector", "The first rule in the file", "Neither rule can apply"]],
        ["If an element has both a class rule and an inline style for the same property, which normally has greater priority?", "The inline style, unless a higher-priority declaration applies.", ["The class rule in every case.", "The rule with the most comments.", "The rule in the shortest file."]],
        ["Why can a child element inherit a text colour from its parent?", "The color property is inherited when the child has no overriding value.", ["Every CSS property is always inherited.", "The browser copies the parent's HTML into the child.", "Inheritance changes the element's tag name."]],
        ["What is the cascade used to determine?", "Which applicable declaration supplies a property's computed value.", ["The order in which images are downloaded only.", "The number of HTML elements on a page.", "Whether a browser can open a URL."]],
      ];
      const [stem, answer, distractors] = questions[variant % questions.length];
      return makeQuestion(stem, answer, distractors);
    }
    if (/selector|class/i.test(normalizedTopic)) {
      const questions = [
        ["Which CSS selector targets every element with class=\"card\"?", ".card", ["#card", "card()", "*card"]],
        ["Which CSS selector targets the element with id=\"notice\"?", "#notice", [".notice", "notice()", "*notice"]],
        ["Which selector targets all paragraph elements?", "p", [".p", "#p", "paragraph()"]],
        ["Which selector targets a link while the pointer is over it?", "a:hover", ["a:visited-only", ".hover a", "#hovered"]],
      ];
      const [stem, answer, distractors] = questions[variant % questions.length];
      return makeQuestion(stem, answer, distractors);
    }
  }

  if (/program structure/i.test(normalizedTopic)) {
    const entryPoint = {
      Java: "public static void main(String[] args)",
      "C++": "int main()",
      "C#": "static void Main()",
      Dart: "void main()",
      Python: "if __name__ == \"__main__\":",
      Ruby: "the first top-level statement",
      JavaScript: "the script's top-level statements",
      TypeScript: "the script's top-level statements",
      PHP: "<?php",
    }[language];
    if (entryPoint) {
      const questions = [
        [`Which construct is the usual starting point for a ${language} program?`, entryPoint, ["A comment block", "A variable declaration only", "The closing brace of a class"]],
        [`Which ${language} entry point does the runtime or interpreter begin executing?`, entryPoint, ["A comment block", "A variable declaration only", "The closing brace of a class"]],
        [`In a ${language} application, what role does the main entry point serve?`, "It begins the program's top-level execution.", ["It stores every user password.", "It replaces all functions.", "It defines the operating system." ]],
        [`Why must a ${language} application have a recognised entry point?`, "The runtime needs a defined place to begin execution.", ["It allows comments to run as code.", "It prevents the program from loading.", "It changes the source language." ]],
      ];
      const [stem, answer, distractors] = questions[variant % questions.length];
      return makeQuestion(stem, answer, distractors);
    }
  }
  if (/operator/i.test(normalizedTopic)) {
    const a = 17 + (variant % 5);
    const b = 5 + (variant % 3);
    return makeQuestion(
      `In ${language}, what value does the remainder expression ${a} % ${b} produce?`,
      a % b,
      [(a + b) % b, Math.floor(a / b), b % a],
    );
  }
  if (/conditional|branch/i.test(normalizedTopic)) {
    const score = 60 + (variant % 4) * 5;
    return makeQuestion(
      `A program checks whether score >= 50. If score is ${score}, which branch should run?`,
      "The condition is true, so the if-branch runs.",
      ["The condition is false, so the else-branch runs.", "The program must stop before checking.", "Both branches always run."],
    );
  }
  if (/loop|iteration/i.test(normalizedTopic)) {
    const limit = 3 + (variant % 4);
    return makeQuestion(
      `A loop starts at 0 and repeats while its counter is less than ${limit}, increasing by 1 each time. How many times does it run?`,
      limit,
      [limit - 1, limit + 1, limit * 2],
    );
  }
  if (/function|method/i.test(normalizedTopic)) {
    const questions = [
      [`In ${language}, why would a programmer place a repeated calculation in a function or method?`, "To reuse the named block and avoid duplicating its instructions.", ["To make the calculation run only once in every possible call.", "To turn the function into a data file.", "To prevent the function from accepting input."]],
      [`A ${language} program calculates a sales tax in several places. What is a benefit of putting that calculation in one function?`, "A single change to the function can update all its callers consistently.", ["Each caller must copy the code again.", "The function prevents the program from using numbers.", "The calculation becomes a comment."]],
      [`Why might a ${language} function accept an input parameter?`, "To let the caller supply a value the function needs to process.", ["To force the function to return a file.", "To prevent the function from being called.", "To replace every local variable."]],
      [`What does a return statement commonly do in a ${language} function?`, "Send a result back to the code that called the function.", ["Rename the source file.", "Repeat the function forever.", "Declare a new programming language."]],
    ];
    const [stem, answer, distractors] = questions[variant % questions.length];
    return makeQuestion(stem, answer, distractors);
  }
  if (/array|list|tuple|collection/i.test(normalizedTopic)) {
    const questions = [
      [`In ${language}, what is the main purpose of an array or list?`, "To store an ordered group of values that can be accessed by position.", ["To define a comment for the compiler.", "To stop a program from storing data.", "To represent only one fixed arithmetic operator."]],
      [`A ${language} program stores the daily temperatures in order. Which structure is suitable?`, "A list or array of numeric values.", ["A single Boolean flag.", "A function name with no stored values.", "A comment containing no data."]],
      [`How can a program use the third item in an ordered ${language} list?`, "Access it by its position using the language's indexing rules.", ["Call it as if it were a file.", "Change the list into a class name.", "Read it only from a comment."]],
      [`Why might a ${language} developer loop through a collection?`, "To process each stored item using the same operation.", ["To prevent any item from being read.", "To turn the collection into a network cable.", "To remove the need for data."]],
    ];
    const [stem, answer, distractors] = questions[variant % questions.length];
    return makeQuestion(stem, answer, distractors);
  }
  if (/string/i.test(normalizedTopic)) {
    return makeQuestion(
      `In ${language}, which value is a string?`,
      "\"Fieldnote\"",
      ["42", "true", "3.5"],
    );
  }
  if (/scope/i.test(normalizedTopic)) {
    return makeQuestion(
      `A variable is declared inside a function in ${language}. What does local scope generally mean?`,
      "The variable is available only within its declaring function or block.",
      ["The variable is automatically available in every file.", "The variable becomes a database table.", "The variable cannot be read in its own function."],
    );
  }
  if (/class|object|interface/i.test(normalizedTopic)) {
    const questions = [
      [`In ${language}, what is an object in object-oriented programming?`, "An instance that combines state with related behaviour.", ["A loop that repeats forever.", "A text file containing only comments.", "A primitive arithmetic operator."]],
      [`In ${language}, what does a class usually define?`, "A template describing the data and behaviour of its instances.", ["A single execution of a loop.", "A network connection with no code.", "A comment that runs at startup."]],
      [`Why might a ${language} object have a method?`, "To provide behaviour associated with that object's data.", ["To store only a file path.", "To replace the program's entry point.", "To make all values immutable automatically."]],
      [`What is one reason to create two objects from the same ${language} class?`, "They can share a structure while holding different state.", ["They must always contain identical values.", "They erase the class definition.", "They stop methods from being called."]],
    ];
    const [stem, answer, distractors] = questions[variant % questions.length];
    return makeQuestion(stem, answer, distractors);
  }
  if (/event|dom/i.test(normalizedTopic)) {
    const questions = [
      ["In a browser, what does the DOM represent?", "A structured object model of the page that scripts can inspect and update.", ["A network cable standard.", "A database password store.", "A programming language's compiler output."]],
      ["A browser script changes the text inside a heading. Which browser model does it update?", "The DOM", ["The DNS", "A database index", "The processor's instruction set"]],
      ["What does a click-event handler allow a browser program to do?", "Run specified code in response to a user's click.", ["Change the computer's physical keyboard.", "Make the page ignore every user action.", "Rename the web server automatically."]],
      ["Why should a script wait until a page element exists before selecting it?", "The element cannot be found in the DOM before it is created.", ["The DOM stores only images.", "A selector deletes the entire page.", "Scripts cannot read text nodes."]],
      ["Which operation is commonly used to find an element by its id in a browser?", "Select the element using its id from the DOM.", ["Search the operating system's files.", "Read the browser's network password.", "Compile the HTML into a database."]],
      ["When an event handler updates a button label, what changes for the user?", "The rendered page reflects the updated DOM content.", ["The browser's address changes automatically.", "The keyboard layout is reinstalled.", "The server's source files are rewritten."]],
    ];
    const [stem, answer, distractors] = questions[variant % questions.length];
    return makeQuestion(stem, answer, distractors);
  }
  if (/asynchronous|promise|fetch|api/i.test(normalizedTopic)) {
    const questions = [
      [`Why does ${language} use asynchronous operations for network requests?`, "The program can continue responding while it waits for the network result.", ["The request is guaranteed to finish before it starts.", "Asynchronous code removes the need to handle errors.", "It converts every response into a local variable automatically."]],
      [`A ${language} app loads a course list from an API. Why should the interface remain responsive during the request?`, "The response may take time, and the learner should still be able to use the app.", ["The network always returns data instantly.", "A request cannot fail.", "The browser needs to stop rendering until completion."]],
      [`What should a ${language} program do if an asynchronous request is rejected?`, "Handle the failure and show an appropriate recovery message.", ["Treat the missing response as valid data.", "Hide the error and report success.", "Retry without limit or delay."]],
      [`When should a ${language} app display data returned by a request?`, "After the request completes successfully and the response is checked.", ["Before sending the request.", "Only if the device is switched off.", "Without checking whether the response is an error."]],
      [`What does awaiting a network result help a ${language} function do?`, "Continue with the result after the asynchronous operation settles.", ["Convert the network into local storage.", "Guarantee that the server never fails.", "Skip all error handling."]],
      [`Why might a ${language} application cancel or ignore an outdated request?`, "A newer request may have made the older result irrelevant.", ["It increases the old response's accuracy.", "It turns the request into a database.", "It prevents the user from entering input."]],
    ];
    const [stem, answer, distractors] = questions[variant % questions.length];
    return makeQuestion(stem, answer, distractors);
  }
  if (/error|debug/i.test(normalizedTopic)) {
    const questions = [
      [`When a ${language} program throws an error, what is the best first debugging step?`, "Read the error message and inspect the reported line and surrounding values.", ["Delete the first line of the program.", "Ignore the error and assume the output is correct.", "Change unrelated code at random."]],
      [`A ${language} test fails only for an empty input. What should the programmer inspect first?`, "The code path that handles empty values and the test's expected result.", ["An unrelated screen colour.", "The computer's speaker volume.", "Every dependency without checking the failure." ]],
      [`How can a breakpoint help debug a ${language} function?`, "It pauses execution so the current values and control flow can be inspected.", ["It permanently deletes the function.", "It encrypts the program's output.", "It automatically fixes all syntax errors."]],
      [`A ${language} program produces the wrong total without throwing an error. What is a useful next step?`, "Trace the input values and intermediate calculations.", ["Assume the total is correct because no error appeared.", "Delete the output without checking the code.", "Change random variable names."]],
    ];
    const [stem, answer, distractors] = questions[variant % questions.length];
    return makeQuestion(stem, answer, distractors);
  }
  return null;
}

function subjectQuestion(course, topic, variant) {
  if (course.title === "Mathematics") return mathematicsQuestion(topic, variant, course.level);
  if (course.title === "English Studies") return englishQuestion(topic, variant);
  if (course.title === "Basic Technology") return technologyQuestion(topic, variant);
  if (course.title === "Business Studies") return businessQuestion(topic, variant);
  if (course.level === "Programming") {
    return programmingConceptQuestion(course.title, topic, variant);
  }
  return null;
}

function generatedProgrammingTopic(question) {
  if (/statement creates a reusable(?:, updateable)? (?:variable|binding)|^A checkout stores|^A quiz app must/i.test(question)) return "variable";
  if (/type best represents (?:this value|it) in/i.test(question) || /^A quiz mark|^A learner's name/i.test(question)) return "data types";
  return "";
}

function duplicateTopicForQuestion(course, question) {
  const stem = String(question ?? "");
  if (course.title === "English Studies" && /Which word has \/(?:ɔ:|ʊ)\/\?/i.test(stem)) return "vowels and diphthongs";
  if (course.title === "Business Studies") {
    if (/aid to trade/i.test(stem)) return "trade and aids to trade";
    if (/account is generally designed/i.test(stem)) return "banking and current account";
    if (/transport choice is most suitable/i.test(stem)) return "transport and warehousing";
    if (/shop earns .* revenue .* expenses .* profit/i.test(stem)) return "profit and loss";
  }
  if (course.title === "Physical Education") {
    if (/start is normally used for a sprint/i.test(stem)) return "sprint technique";
    if (/team use width when attacking in football/i.test(stem)) return "football tactic";
  }
  if (course.title === "HTML" && /HTML, what (?:is an object|does the class attribute)/i.test(stem)) return "class and object";
  if (/usual starting point for a (?:Java|C\+\+|C#) program|entry point does the runtime/i.test(stem)) return "program structure";
  if (/stream in file or network programming/i.test(stem)) return "file stream";
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

function sourceAssessmentQuestion(questions, usedQuestions) {
  const question = questions?.find(
    (item) =>
      item &&
      typeof item.question === "string" &&
      Array.isArray(item.options) &&
      item.options.length === 4 &&
      Number.isInteger(item.answer) &&
      item.answer >= 0 &&
      item.answer < item.options.length &&
      !isGeneric(item.question) &&
      !usedQuestions.has(normalize(item.question)),
  );
  if (!question) return null;
  return {
    question: question.question,
    options: question.options,
    answer: question.answer,
  };
}

function generatedQuestionForTopic(course, topic, variant, isFinal) {
  return (
    programmingQuestion(course.title, topic, variant) ??
    subjectQuestion(course, topic, variant) ??
    authoredAssessmentQuestion(course, topic, variant) ??
    biologyQuestion(course, topic, isFinal)
  );
}

function lessonQuizAlternativeQuestion(course, lessonTitle) {
  const lesson = normalize(lessonTitle);
  const language = course.title;
  const alternatives = {
    "HTML:links": {
      question: "Which attribute value opens an HTML link in a new browser tab?",
      options: ['target="_blank"', 'href="_blank"', 'rel="tab"', 'src="_blank"'],
      answer: 0,
    },
    "HTML:lists": {
      question: "Which HTML element represents one item inside an ordered or unordered list?",
      options: ["<li>", "<ol>", "<ul>", "<dl>"],
      answer: 0,
    },
    "HTML:forms": {
      question: "Which HTML attribute prevents a form from being submitted with an empty required field?",
      options: ["required", "multiple", "download", "autofocus"],
      answer: 0,
    },
    "HTML:forms and validation": {
      question: "Which HTML attribute checks a text field against a pattern such as a course-code format?",
      options: ["pattern", "target", "colspan", "poster"],
      answer: 0,
    },
    "HTML:accessible forms": {
      question: "Which attribute links a form control to separate hint or error text for assistive technology?",
      options: ["aria-describedby", "aria-hidden", "download", "accept"],
      answer: 0,
    },
    "JavaScript:scope": {
      question: "After a block containing `let score = 8` ends, where can `score` still be accessed?",
      options: [
        "Only inside the block where it was declared",
        "From every function in the application",
        "Only from a database query",
        "Only after it is redeclared as a class",
      ],
      answer: 0,
    },
  };
  const known = alternatives[`${language}:${lesson}`];
  if (known) return known;

  if (
    ["Python", "Java", "PHP", "C++", "COBOL", "C#", "Ruby", "Dart"].includes(language) &&
    /string/.test(lesson)
  ) {
    return {
      question: `Which ${language} literal stores the text "ready" as a string?`,
      options: ['"ready"', "ready", "false", "24"],
      answer: 0,
    };
  }
  return null;
}

let updated = 0;
let adjusted = 0;
const unresolved = [];
for (const course of curriculum.courses ?? []) {
  const courseLessons = (course.modules ?? []).flatMap((module) => module.lessons ?? []);
  const assessments = [
    ...(course.modules ?? []).flatMap((module) =>
      module.test?.questions
        ? [{
            title: module.test.title ?? module.title,
            questions: module.test.questions,
            lessons: module.lessons ?? [],
            moduleTitle: module.title,
          }]
        : [],
    ),
    ...(course.modules ?? []).flatMap((module) =>
      (module.lessons ?? []).flatMap((lesson) =>
        lesson.quiz?.length
          ? [{
              title: `${lesson.title} quiz`,
              questions: lesson.quiz,
              lessons: [lesson],
              moduleTitle: module.title,
              questionSources: module.test?.questions ?? [],
            }]
          : [],
      ),
    ),
    ...(course.finalExam?.questions
      ? [{
          title: course.finalExam.title ?? `${course.title} final exam`,
          questions: course.finalExam.questions,
          lessons: courseLessons,
          moduleTitle: null,
        }]
      : []),
  ];

  for (const assessment of assessments) {
    const programmingVariants = new Map();
    const topicVariants = new Map();
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
      const normalizedTopic = normalize(topic);
      const topicVariant = topicVariants.get(normalizedTopic) ?? 0;
      topicVariants.set(normalizedTopic, topicVariant + 1);
      const isFinal = /final|exam/i.test(assessment.title);
      const programmingTopic = programmingTypes[course.title] ? topic : "";
      const variant = programmingTopic
        ? programmingVariants.get(programmingTopic) ?? 0
        : 0;
      if (programmingTopic) programmingVariants.set(programmingTopic, variant + 1);
      const createReplacement = (attempt) =>
        generatedQuestionForTopic(
          course,
          topic,
          programmingTopic ? variant + attempt : topicVariant + attempt,
          isFinal,
        );
      let replacement = createReplacement(0);
      if (replacement && usedQuestions.has(normalize(replacement.question))) {
        for (let attempt = 1; attempt < 32; attempt += 1) {
          const alternative = createReplacement(attempt);
          if (alternative && !usedQuestions.has(normalize(alternative.question))) {
            replacement = alternative;
            break;
          }
        }
      }
      replacement ??=
        sourceQuestion(assessment.lessons, topic, usedQuestions) ??
        sourceAssessmentQuestion(assessment.questionSources, usedQuestions) ??
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

    const seenQuestions = new Set();
    for (const item of assessment.questions) {
      if (!item || typeof item.question !== "string") continue;
      if (
        course.title === "HTML" &&
        /^In HTML, what is an object in object-oriented programming\?$/i.test(item.question)
      ) {
        const correction = programmingConceptQuestion(course.title, "class and object", 1);
        if (correction) {
          item.question = correction.question;
          item.options = correction.options;
          item.answer = correction.answer;
          adjusted += 1;
        }
      }
      const currentQuestion = normalize(item.question);
      if (!seenQuestions.has(currentQuestion)) {
        seenQuestions.add(currentQuestion);
        continue;
      }

      const lessonQuizAlternative = assessment.questions === assessment.lessons?.[0]?.quiz
        ? lessonQuizAlternativeQuestion(course, assessment.lessons[0].title)
        : null;
      if (
        lessonQuizAlternative &&
        !seenQuestions.has(normalize(lessonQuizAlternative.question))
      ) {
        item.question = lessonQuizAlternative.question;
        item.options = lessonQuizAlternative.options;
        item.answer = lessonQuizAlternative.answer;
        seenQuestions.add(normalize(item.question));
        adjusted += 1;
        continue;
      }

      const generatedTopic = generatedProgrammingTopic(item.question);
      if (programmingTypes[course.title] && generatedTopic) {
        for (let variant = 1; variant < assessment.questions.length; variant += 1) {
          const replacement = programmingQuestion(
            course.title,
            generatedTopic,
            variant,
          );
          if (replacement && !seenQuestions.has(normalize(replacement.question))) {
            item.question = replacement.question;
            item.options = replacement.options;
            item.answer = replacement.answer;
            seenQuestions.add(normalize(item.question));
            adjusted += 1;
            break;
          }
        }
        continue;
      }

      const topics = assessment.lessons
        .map((lesson) => lesson.title)
        .filter((title) => typeof title === "string");
      const duplicateTopic = duplicateTopicForQuestion(course, item.question);
      if (duplicateTopic) topics.push(duplicateTopic);
      let replacement = null;
      for (const topic of topics) {
        const isFinal = /final|exam/i.test(assessment.title);
        for (let variant = 0; variant < 32; variant += 1) {
          const candidate = generatedQuestionForTopic(
            course,
            topic,
            variant,
            isFinal,
          );
          if (!candidate || normalize(candidate.question) !== currentQuestion) continue;
          for (let alternativeVariant = 0; alternativeVariant < 32; alternativeVariant += 1) {
            const alternative = generatedQuestionForTopic(
              course,
              topic,
              alternativeVariant,
              isFinal,
            );
            if (
              alternative &&
              normalize(alternative.question) !== currentQuestion &&
              !seenQuestions.has(normalize(alternative.question))
            ) {
              replacement = alternative;
              break;
            }
          }
          if (replacement) break;
        }
        if (replacement) break;
      }
      if (replacement) {
        item.question = replacement.question;
        item.options = replacement.options;
        item.answer = replacement.answer;
        seenQuestions.add(normalize(item.question));
        adjusted += 1;
      }
    }
  }

}

if (unresolved.length > 0) {
  console.error(
    `Resolved ${updated} generic question(s); ${unresolved.length} need authored questions or additional source material.`,
  );
  for (const question of unresolved.slice(0, 20)) console.error(`- ${question}`);
  process.exitCode = 1;
} else if (applyChanges && updated + adjusted > 0) {
  await writeFile(curriculumPath, `${JSON.stringify(curriculum, null, 2)}\n`, "utf8");
  console.log(`Updated ${updated} generic question(s) and refined ${adjusted} option set(s).`);
} else {
  console.log(`Ready to update ${updated} generic question(s) and refine ${adjusted} option set(s). Re-run with --apply to write.`);
}
