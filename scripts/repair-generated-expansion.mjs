import fs from "node:fs/promises";
import path from "node:path";

const file = path.resolve(process.cwd(), "data", "curriculum.json");
const curriculum = JSON.parse(await fs.readFile(file, "utf8"));

const accountingLesson = `# Users of accounting information

Accounting information helps people make decisions about an organisation. Its usefulness depends on who will use it, what decision they face and whether the figures are relevant, reliable and timely. Different users need different information; one total cannot answer every question.

Internal users work within the organisation. An owner may compare profit across periods, while a manager may use sales and stock reports to plan orders. Employees may consider the organisation's stability and its ability to pay wages. External users rely on accounts and other reports supplied by the organisation. A bank considers cash flow and existing debt before approving a loan. A supplier may assess whether invoices are likely to be paid. An investor compares returns with risk, while tax authorities check that legal obligations are met.

Suppose two shops report the same annual profit. A lender may prefer the shop with steadier cash receipts and lower debt, while an owner may focus on sales growth. Profit alone cannot settle both decisions. Users also need the reporting period, accounting policies and supporting records. Financial statements summarise evidence; they do not guarantee future success. When interpreting a figure, identify the user and decision first, then select the information relevant to it.`;

const accountingQuiz = [
  {
    id: "ss2-accounting-m1-l2-editorial-q1",
    question: "A bank is considering a loan to a business. Which information is most directly relevant to the bank's decision?",
    options: [
      "Cash flow and existing debt that affect repayment ability",
      "The owner's preferred shop colour",
      "A list of products the business may sell someday",
      "The number of staff who like the business name",
    ],
    answer: 0,
  },
  {
    id: "ss2-accounting-m1-l2-editorial-q2",
    question: "Why might an owner and a supplier focus on different parts of the same accounts?",
    options: [
      "They face different decisions and therefore need different information",
      "Accounting reports have no consistent meaning",
      "Suppliers are not allowed to use financial information",
      "Owners only need the cash balance",
    ],
    answer: 0,
  },
  {
    id: "ss2-accounting-m1-l2-editorial-q3",
    question: "Two shops report equal profit, but one has steadier cash receipts and less debt. What is the sound conclusion for a lender?",
    options: [
      "Compare cash flow and debt as well as profit before judging repayment risk",
      "The shops have identical financial risk because profit is equal",
      "Ignore the reporting period and supporting records",
      "Choose the shop with more products, regardless of its accounts",
    ],
    answer: 0,
  },
];

function paddingMarker(course, lesson) {
  const level = String(course.level ?? "").replace(/\s+/g, " ").trim();
  const subject = String(course.title ?? "").replace(/\s+/g, " ").trim();
  const concept = String(lesson.title ?? "").replace(/\s+/g, " ").trim().toLowerCase();
  return `In ${level} ${subject}, ${concept} matters because it links the topic to evidence, decision-making and real learning.`;
}

let contentBlocksRemoved = 0;
let summariesCleaned = 0;
let targetLessonsUpdated = 0;
let lessonsVisited = 0;

for (const course of curriculum.courses ?? []) {
  for (const module of course.modules ?? []) {
    for (const lesson of module.lessons ?? []) {
      lessonsVisited += 1;
      const marker = paddingMarker(course, lesson);
      const content = String(lesson.content ?? "");
      const contentIndex = content.indexOf(marker);
      if (contentIndex >= 0) {
        lesson.content = content.slice(0, contentIndex).trimEnd();
        contentBlocksRemoved += 1;
      }

      const summary = String(lesson.summary ?? "");
      const summaryIndex = summary.indexOf(marker);
      if (summaryIndex >= 0) {
        lesson.summary = summary.slice(0, summaryIndex).trimEnd();
        summariesCleaned += 1;
      }

      if (
        course.id === "ss2-accounting" &&
        lesson.id === "ss2-accounting-m1-l2" &&
        lesson.title === "Users of accounting information"
      ) {
        lesson.content = accountingLesson;
        lesson.summary = "Accounting information serves internal and external users who make different decisions. Owners and managers assess performance and operations; lenders, suppliers, investors and tax authorities examine information relevant to their needs. Profit, cash flow, debt, reporting periods and accounting policies must be interpreted together.";
        lesson.objective = "Distinguish internal and external users of accounting information and explain how their decisions determine the information they need.";
        lesson.activity = "For a fictional shop seeking a bank loan, list the information a lender would examine and explain why profit alone is insufficient.";
        lesson.commonMistakes = ["Do not assume every user needs the same report or that a profit figure alone answers a question about cash, debt or risk."];
        lesson.keyTerms = ["internal user", "external user", "financial statement", "cash flow", "accountability"];
        lesson.contentVersion = "textbook-accounting-users-1";
        lesson.quiz = accountingQuiz;
        targetLessonsUpdated += 1;
      }
    }
  }
}

if (lessonsVisited !== 2025 || targetLessonsUpdated !== 1) {
  throw new Error(JSON.stringify({ lessonsVisited, expectedLessons: 2025, targetLessonsUpdated }));
}

await fs.writeFile(file, `${JSON.stringify(curriculum, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ contentBlocksRemoved, summariesCleaned, targetLessonsUpdated }, null, 2));