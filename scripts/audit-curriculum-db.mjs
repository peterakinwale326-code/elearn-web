import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: process.env.DB_HOST ?? "127.0.0.1",
  port: Number(process.env.DB_PORT ?? 3306),
  user: process.env.DB_USER ?? "",
  password: process.env.DB_PASSWORD ?? "",
  database: process.env.DB_NAME ?? "school",
  waitForConnections: true,
  connectionLimit: 2,
  queueLimit: 0,
  charset: "utf8mb4",
  connectTimeout: 5000,
});

const fillerPatterns = [
  /Detailed analytical breakdown|Step-by-step application in standardized exam problems|standard evaluation query|Correct analytical response option|Incorrect distractor option|Sample evaluation question/i,
  /Worked example: consider a familiar Nigerian school or community situation|Key points: define the main terms accurately|Practice: write a short explanation of the concept|At this stage the emphasis is on clear definitions/i,
  /The important result is not simply knowing what .+ is called|construct a realistic .+ situation in which .+ matters|create your own example of .+, annotate the important features/i,
  /should be understood through people, institutions, rules and consequences|Case study: take a school, community or Nigerian public-life situation involving|Activity: investigate a local example related to .+; record two pieces of evidence/i,
  /Course distinction: In this .+ course|is a core topic in .+; learners should understand its meaning, social effects, examples and practical use/i,
  /which statement best describes .+|which example provides the strongest evidence that a learner understands/i,
];

function text(value) {
  if (typeof value === "string") return value;
  if (Buffer.isBuffer(value)) return value.toString("utf8");
  return String(value ?? "");
}

function wordCount(value) {
  return (value.match(/[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu) ?? []).length;
}

try {
  const [rows] = await pool.query(`
    SELECT
      l.id,
      l.title,
      l.content,
      c.title AS course_title,
      c.level AS course_level,
      m.title AS module_title
    FROM lessons AS l
    LEFT JOIN modules AS m ON m.id = l.module_id
    LEFT JOIN courses AS c ON c.id = m.course_id
    ORDER BY c.title, c.level, m.title, l.title
  `);

  const fillerExamples = [];
  const thinExamples = [];
  let lessonsWithFiller = 0;
  let lessonsUnder80Words = 0;
  let lessonsUnder120Words = 0;
  let lessonsWithEmptyContent = 0;

  for (const row of rows) {
    const content = text(row.content);
    const words = wordCount(content);
    const hasFiller = fillerPatterns.some((pattern) => pattern.test(content));
    const label = `${row.course_title ?? "Unknown course"} (${row.course_level ?? "unknown level"}) / ${row.module_title ?? "Unknown module"} / ${row.title ?? "Untitled lesson"}`;

    if (!content.trim()) {
      lessonsWithEmptyContent += 1;
    }

    if (words < 80) {
      lessonsUnder80Words += 1;
      if (thinExamples.length < 20) thinExamples.push({ lesson: label, words });
    }

    if (words < 120) {
      lessonsUnder120Words += 1;
    }

    if (hasFiller) {
      lessonsWithFiller += 1;
      if (fillerExamples.length < 20) {
        const matchingLine = content
          .split(/\r?\n/)
          .find((line) => fillerPatterns.some((pattern) => pattern.test(line)));
        fillerExamples.push({
          lesson: label,
          excerpt: (matchingLine ?? content).trim().slice(0, 220),
        });
      }
    }
  }

  console.log(JSON.stringify({
    database: process.env.DB_NAME ?? "school",
    lessonCount: rows.length,
    lessonsWithFiller,
    lessonsWithEmptyContent,
    lessonsUnder80Words,
    lessonsUnder120Words,
    fillerExamples,
    thinExamples,
  }, null, 2));
} finally {
  await pool.end();
}
