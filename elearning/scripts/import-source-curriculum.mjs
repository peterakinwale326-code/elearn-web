import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const DATA = path.join(ROOT, "data", "curriculum.json");
const SOURCES = path.join(ROOT, "data", "curriculum-source-registry.json");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function cleanHtml(value) {
  return String(value ?? "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&ndash;/gi, "–")
    .replace(/&mdash;/gi, "—")
    .replace(/&#39;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function slug(value) {
  return String(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function parseTables(html) {
  const rows = [];
  const tableMatches = html.matchAll(/<tr[\s\S]*?<\/tr>/gi);
  for (const match of tableMatches) {
    const cells = [...match[0].matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)]
      .map((m) => cleanHtml(m[1]));
    if (cells.length >= 2) rows.push(cells);
  }
  return rows;
}

function topicRows(html) {
  return parseTables(html).filter((row) => {
    const first = String(row[0] ?? "").toLowerCase();
    if (!first || first === "week" || first === "weeks") return false;
    return /^\d+/.test(first) || /^\d+\s*[–-]/.test(first);
  });
}

function lessonFromRow(course, row, index, term) {
  const week = String(row[0]).match(/\d+/)?.[0] ?? String(index + 1);
  const topic = row[1] || row[0] || "Curriculum topic";
  const breakdown = row.slice(2).filter(Boolean).join(" — ");
  const sourceText = breakdown
    ? `## Source curriculum breakdown\\n\\n${breakdown}`
    : "## Source curriculum breakdown\\n\\nSee the linked published scheme for the detailed weekly breakdown.";
  return {
    code: `${term}.${index + 1}`,
    title: topic,
    durationMinutes: 40,
    objective: `Study the published curriculum topic “${topic}” and explain its main ideas using the source breakdown.`,
    content: `# ${topic}\\n\\n## Curriculum Topic\\n\\n**Class:** ${course.level}\\n\\n**Week:** ${week}\\n\\n**Subject:** ${course.subject}\\n\\n${sourceText}\\n\\n## Study Guidance\\n\\nUse the published scheme as the authoritative sequence for this topic. Work through the listed concepts, examples and classroom activities in order.\\n\\n## Revision\\n\\n1. State the main topic.\\n2. List the concepts named in the source breakdown.\\n3. Explain one concept in your own words.\\n4. Give one example or classroom activity related to the topic.\\n\\n## Source\\n\\n${course.source}`,
    summary: breakdown || topic,
    assessmentSeed: [],
    resources: [course.source],
    courseTitle: course.title
  };
}

async function main() {
  const curriculum = JSON.parse(await fs.readFile(DATA, "utf8"));
  const registry = JSON.parse(await fs.readFile(SOURCES, "utf8"));
  const byCourse = new Map((registry.courses ?? []).map((x) => [x.course, x]));

  let imported = 0;
  let failed = 0;

  for (const course of curriculum.courses ?? []) {
    const source = byCourse.get(course.title);
    if (!source || source.sourceType !== "published_scheme_of_work") continue;

    try {
      const response = await fetch(source.source, {
        headers: { "User-Agent": "PStacks-Elearning-Curriculum-Importer/1.0" }
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const html = await response.text();
      const rows = topicRows(html);

      if (rows.length < 6) throw new Error(`Only ${rows.length} curriculum rows were detected`);

      const terms = [rows.slice(0, Math.ceil(rows.length / 3)), rows.slice(Math.ceil(rows.length / 3), Math.ceil(rows.length * 2 / 3)), rows.slice(Math.ceil(rows.length * 2 / 3))];

      course.modules = terms.map((termRows, moduleIndex) => ({
        code: String(moduleIndex + 1),
        title: `Term ${moduleIndex + 1}`,
        description: `Published scheme-of-work topics for ${course.title}, sourced from ${source.source}.`,
        lessons: termRows.map((row, lessonIndex) => lessonFromRow(course, row, lessonIndex, moduleIndex + 1)),
        test: course.modules?.[moduleIndex]?.test ?? {
          type: "module_test",
          title: `Term ${moduleIndex + 1} Test`,
          description: "Assessment based on the published curriculum topics in this term.",
          durationMinutes: 20,
          passingScore: 50,
          maxAttempts: 3,
          randomizeQuestions: true,
          questions: []
        }
      }));

      course.source = {
        url: source.source,
        type: source.sourceType,
        license: source.license
      };
      imported++;
      await sleep(150);
      console.log(`✅ ${course.title}: ${rows.length} source topics imported`);
    } catch (error) {
      failed++;
      console.warn(`⚠️ ${course.title}: ${error.message}`);
    }
  }

  curriculum.meta = {
    ...(curriculum.meta ?? {}),
    sourceImport: {
      status: "scheme-topics-importer",
      importedCourses: imported,
      failedCourses: failed,
      generatedAt: new Date().toISOString(),
      note: "School-course lesson titles and curriculum breakdowns are imported from the linked published schemes. Copyrighted lesson notes are not copied."
    }
  };

  await fs.writeFile(DATA, JSON.stringify(curriculum, null, 2) + "\n", "utf8");
  console.log(`Finished. Imported: ${imported}; failed: ${failed}.`);
  if (failed) process.exitCode = 1;
}

main().catch((error) => {
  console.error("Curriculum source import failed:", error);
  process.exit(1);
});
