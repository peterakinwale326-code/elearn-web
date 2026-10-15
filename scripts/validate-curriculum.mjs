import fs from "node:fs/promises";
import path from "node:path";

const file = path.resolve(process.cwd(), "data", "curriculum.json");
const curriculum = JSON.parse(await fs.readFile(file, "utf8"));
const fillerPattern = /Level progression:\s*At this level, focus on concrete examples, correct vocabulary and guided practice/i;
const genericQuestionPattern = /^Which statement is directly supported by the lesson\b/i;
const genericDistractorPattern = /no useful application|ignoring the defining features|unrelated to its subject/i;
const failures = [];
let lessonCount = 0;
let minimumWordCount = Number.POSITIVE_INFINITY;

if (curriculum.courses?.length !== 75) {
	failures.push(`Expected 75 courses, found ${curriculum.courses?.length ?? 0}`);
}

for (const course of curriculum.courses ?? []) {
	if (!course.title || !Array.isArray(course.modules) || !course.modules.length) {
		failures.push(`${course.title || "Untitled course"}: missing title or modules`);
		continue;
	}

	for (const module of course.modules) {
		for (const lesson of module.lessons ?? []) {
			lessonCount += 1;
			const paragraphs = Array.isArray(lesson.content)
				? lesson.content.map((paragraph) => String(paragraph).trim()).filter(Boolean)
				: String(lesson.content ?? "").split(/\n{2,}/).map((paragraph) => paragraph.trim()).filter(Boolean);
			const body = paragraphs.join("\n");
			const words = (body.match(/[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu) ?? []).length;
			minimumWordCount = Math.min(minimumWordCount, words);

			if (!lesson.title || paragraphs.length < 2 || body.length < 240) {
				failures.push(`${course.title} / ${lesson.title || "Untitled lesson"}: missing substantive lesson content`);
			}

			if (words < 300) {
				failures.push(`${course.title} / ${lesson.title}: ${words} words; minimum is 300`);
			}

			if (fillerPattern.test(body)) {
				failures.push(`${course.title} / ${lesson.title}: repeated level-progression filler remains`);
			}

			for (const question of lesson.quiz ?? []) {
				if (!Array.isArray(question.options) || question.options.length < 2) {
					failures.push(`${course.title} / ${lesson.title}: quiz question has fewer than two options`);
					continue;
				}

				if (!Number.isInteger(question.answer) || question.answer < 0 || question.answer >= question.options.length) {
					failures.push(`${course.title} / ${lesson.title}: quiz answer index is invalid`);
				}

				const hasGenericDistractor = question.options.some((option) =>
					genericDistractorPattern.test(String(option)),
				);
				if (genericQuestionPattern.test(String(question.question ?? "")) && hasGenericDistractor) {
					failures.push(`${course.title} / ${lesson.title}: templated generic quiz item remains`);
				}
			}
		}
	}
}

console.log(`Courses: ${curriculum.courses?.length ?? 0} Lessons: ${lessonCount} Minimum words: ${minimumWordCount} Failures: ${failures.length}`);
if (failures.length) {
	for (const failure of failures.slice(0, 100)) console.log(`FAIL: ${failure}`);
	process.exit(1);
}

console.log("Curriculum structure, lesson content, quiz answers, and filler checks passed.");