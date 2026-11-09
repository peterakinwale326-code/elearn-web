import fs from "node:fs/promises";
import path from "node:path";

const curriculumPath = path.resolve(process.cwd(), "data", "curriculum.json");
const applyChanges = process.argv.includes("--apply");
const fixedClosers = [
  "Start by drawing or defining the quantities involved, then work through the example with units.",
  "Explain why the stated relationship applies, and identify one condition that could change the result.",
  "In an examination response, show the reasoning as well as the final result and check the units or evidence.",
  "Use the example to explain the idea in your own words, then identify one real situation where it matters.",
];

const englishLessons = {
  JSS2: {
    content: `# Subject-verb agreement

Agreement means that a verb form matches its grammatical subject. In the simple present tense, most singular subjects take a verb ending in -s: The monitor checks the register. Plural subjects use the base form: The monitors check the register. The noun closest to the verb is not always the subject, so identify the subject before choosing the verb.

In “The box of exercise books is on the desk,” the subject is box; “of exercise books” only describes it. Indefinite pronouns such as each, everyone and somebody are treated as singular in standard school English: Everyone has a turn. In the past tense, most verbs do not change for number: She walked; they walked. The verb be is different: She was ready; they were ready.

When two separate subjects are joined by and, use a plural verb: Amina and Musa are reading. Read the whole sentence and check who or what performs the action before editing the verb.`,
    quiz: [
      { question: "Choose the verb that agrees: 'The list of names ___ on the table.'", options: ["are", "is", "were", "have"], answer: 1 },
      { question: "Which sentence has correct agreement?", options: ["Everyone have a copy.", "The pupils walks home.", "Each learner has a notebook.", "The box of pens are open."], answer: 2 },
    ],
  },
  JSS3: {
    content: `# Subject-verb agreement

Subject-verb agreement connects a verb to the grammatical subject, not simply to the nearest noun. A singular subject usually takes a singular present-tense verb: The captain of the players speaks. The plural noun players belongs to a prepositional phrase; captain controls the verb. Remove the phrase to check: The captain speaks.

Compound subjects joined by and usually take a plural verb: The teacher and the class are ready. When either...or or neither...nor joins subjects of different number, the verb commonly agrees with the nearer subject: Either the prefects or the teacher is speaking; either the teacher or the prefects are speaking. A writer can often revise the sentence to avoid an awkward result.

Words such as each, everybody and neither are singular in standard school usage. In questions, the subject may follow the verb: Where are the books? With does, the main verb stays in its base form: Does the learner understand? The auxiliary already marks the subject.`,
    quiz: [
      { question: "Choose the verb: 'Neither the players nor the coach ___ satisfied.'", options: ["are", "were", "is", "have"], answer: 2 },
      { question: "Which question uses agreement correctly?", options: ["Does the pupils understand?", "Do the pupil understands?", "Does the pupil understand?", "Do the pupil understands?"], answer: 2 },
    ],
  },
  SS1: {
    content: `# Subject-verb agreement

In formal English, a finite verb agrees with the head of its subject. In “The quality of the answers is improving,” quality is the head; answers is inside a prepositional phrase and does not determine the verb. Identify the whole subject, then locate its central noun or pronoun.

Subjects joined by and usually take a plural verb, but a single combined idea may be singular: Rice and beans is today's lunch. With either...or and neither...nor, proximity agreement is common, though restructuring may improve a sentence with mismatched subjects. Indefinite pronouns such as each, everyone and nobody take singular verbs. Collective nouns can be singular when the group acts as a unit; the intended meaning and the school's chosen style guide should be consistent.

In “There are several reasons,” reasons is the real subject even though it follows the verb. Amounts, titles and names of subjects are often singular when treated as one unit: Ten kilometres is a long distance; Economics is a school subject.`,
    quiz: [
      { question: "Choose the verb: 'The cause of the delays ___ still unknown.'", options: ["are", "were", "is", "have"], answer: 2 },
      { question: "Which sentence treats an amount as one unit?", options: ["Ten kilometres is a long walk.", "Ten kilometres are a long walk.", "Each kilometre have a marker.", "The kilometre of roads are long."], answer: 0 },
    ],
  },
  SS2: {
    content: `# Subject-verb agreement

Agreement follows the grammatical head of a subject, even when the subject contains long modifiers or a relative clause. In “The list of applicants who meet the requirements is available,” list controls the main verb is; applicants controls the verb meet inside the relative clause. Each clause has its own subject-verb relationship.

Indefinite pronouns such as each, either and neither are normally singular: Neither of the proposals is complete. With either...or and neither...nor, proximity agreement is widely used, but a sentence with contrasting numbers is often clearer when rewritten. In “There are several reasons,” the postponed subject reasons is plural. Collective nouns may take singular agreement when the group is treated as one unit, or plural agreement when members are emphasised; follow a consistent variety and style.

When editing, mark clause boundaries, identify each subject and then check its finite verb. This prevents a plural noun inside a phrase from pulling the main verb away from its subject.`,
    quiz: [
      { question: "In 'The report that the students prepared ___ on the table,' which verb completes the main clause?", options: ["are", "is", "were", "have"], answer: 1 },
      { question: "Which sentence has correct agreement in both clauses?", options: ["The list of pupils who arrive early are posted.", "The list of pupils who arrives early is posted.", "The list of pupils who arrive early is posted.", "The lists of pupils who arrives early is posted."], answer: 2 },
    ],
  },
  SS3: {
    content: `# Subject-verb agreement

In examination editing, trace agreement through the sentence rather than matching a verb to the nearest noun. In “The evidence collected by the investigators points to a different conclusion,” evidence is the subject; investigators is part of a modifying phrase. In a complex sentence, identify the subject and verb of each clause separately.

Compound subjects joined by and generally take a plural verb, while a single title, quantity or combined dish may be singular according to meaning. Each, everyone and neither are treated as singular in standard formal usage. With either...or and neither...nor, agreement with the nearer subject is common, but recasting a sentence can remove an awkward mismatch. Collective nouns require attention to whether the group is presented as one body or as individual members.

Questions and introductory there can invert the usual order: “Where are the documents?” and “There is one concern.” In editing, underline the subject, circle the finite verb and test whether the sentence's meaning supports that form.`,
    quiz: [
      { question: "Choose the correct form: 'The evidence from both witnesses ___ the claim.'", options: ["support", "supports", "have supported", "are supporting"], answer: 1 },
      { question: "Which sentence is correctly edited?", options: ["There is several reasons to wait.", "There are several reasons to wait.", "There has several reasons to wait.", "There was several reasons to wait."], answer: 1 },
    ],
  },
};

const curriculum = JSON.parse(await fs.readFile(curriculumPath, "utf8"));
const changed = { Chemistry: 0, Physics: 0, "Physical Education": 0, English: 0 };
const missingEditorial = [];

for (const course of curriculum.courses ?? []) {
  const headingSet = course.title === "Chemistry" || course.title === "Physics" || course.title === "Physical Education";
  for (const module of course.modules ?? []) {
    for (const lesson of module.lessons ?? []) {
      const currentVersion = String(lesson.contentVersion ?? "");
      const isUneditedVersion = /textbook-(?:2|physics-1|pe-1)$/.test(currentVersion);
      const isFinalVersion = currentVersion === "textbook-3" || currentVersion === "textbook-physics-2" || currentVersion === "textbook-pe-2";
      if (headingSet && (isUneditedVersion || isFinalVersion)) {
        changed[course.title] += 1;
        if (isFinalVersion) continue;

        let content = String(lesson.content ?? "").trim();
        const title = String(lesson.title ?? "Lesson");
        const domainHeadings = course.title === "Chemistry"
          ? [`## Chemical principles in ${title}`, `## Worked chemistry example`, `## Apply ${title}`]
          : course.title === "Physics"
            ? [`## Physical model for ${title}`, `## Worked physics example`, `## Explore ${title}`]
            : [`## Movement concepts in ${title}`, `## Skill in context`, `## Practise ${title}`];
        content = content
          .replace("## Explanation", domainHeadings[0])
          .replace("## Example and application", domainHeadings[1])
          .replace("## Check your understanding", domainHeadings[2]);

        for (const closer of fixedClosers) {
          if (content.endsWith(`\n\n${closer}`)) {
            content = content.slice(0, -closer.length - 2).trimEnd();
            break;
          }
        }

        lesson.content = content;
        lesson.contentVersion = course.title === "Chemistry"
          ? "textbook-3"
          : course.title === "Physics"
            ? "textbook-physics-2"
            : "textbook-pe-2";
        lesson.summary = content.replace(/^#\s+.+\n+/, "").replace(/\s+/g, " ").trim().slice(0, 320);
      }

      if (course.title === "English Studies" && String(lesson.title ?? "").toLowerCase() === "subject-verb agreement" && course.level !== "JSS1") {
        const editorial = englishLessons[course.level];
        if (!editorial) {
          missingEditorial.push(`${course.id}/${lesson.id}: ${course.level}`);
          continue;
        }

        lesson.content = editorial.content;
        lesson.objective = "Identify the grammatical subject in simple and complex sentences, select the agreeing verb form, and justify the choice using sentence structure.";
        lesson.summary = editorial.content.replace(/^#\s+.+\n+/, "").replace(/\s+/g, " ").trim().slice(0, 320);
        lesson.activity = `Edit a short passage by marking each clause's subject and checking its finite verb; explain one correction using the sentence structure.`;
        lesson.commonMistakes = ["Do not match a verb to the nearest noun without identifying the grammatical subject of its clause."];
        lesson.keyTerms = ["subject", "finite verb", "agreement", "clause", "compound subject"];
        lesson.contentVersion = "textbook-en-concord-1";
        lesson.quiz = editorial.quiz.map((question, index) => ({
          id: `${lesson.id}-editorial-q${index + 1}`,
          ...question,
        }));
        changed.English += 1;
      }
    }
  }
}

if (Object.values(changed).some((count) => count === 0) || missingEditorial.length) {
  throw new Error(JSON.stringify({ changed, missingEditorial }));
}

if (applyChanges) await fs.writeFile(curriculumPath, `${JSON.stringify(curriculum, null, 2)}\n`, "utf8");

console.log(JSON.stringify({ mode: applyChanges ? "apply" : "dry-run", changed, missingEditorial }, null, 2));