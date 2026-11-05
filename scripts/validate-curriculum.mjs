import fs from "node:fs/promises";
import path from "node:path";

const file = path.resolve(process.cwd(), "data", "curriculum.json");
const curriculum = JSON.parse(await fs.readFile(file, "utf8"));
const fillerPattern = /Level progression:\s*At this level, focus on concrete examples, correct vocabulary and guided practice/i;
const genericQuestionPattern = /^Which statement is directly supported by the lesson\b/i;
const genericDistractorPattern = /no useful application|ignoring the defining features|unrelated to its subject|can never be observed or applied|has no practical use|claim with no affected people or institutions|personal preference presented as a rule|conclusion reached without considering evidence|should be understood through people, institutions, rules and consequences|institutions and social relationships are irrelevant to the concept|personal preference automatically becomes a public rule|evidence is unnecessary when discussing public issues|mainly a matter of memorising the title|without considering any examples, conditions or evidence|means the opposite of the explanation given in this lesson/i;
const answerLeakPattern = /The supported answer is|Review question \d+:/i;
const genericObjectivePattern = /accurate subject knowledge, work through a relevant example/i;
const generatedFillerHeadings = /^## (?:Core explanation and worked application|Check your understanding|Independent practice)$/im;
const genericTeachingPattern = /A reader should be able to trace how the evidence supports|Worked reading method: state a claim in one sentence/i;
const generatedLessonSectionPattern = /^## (?:Subject explanation and examples|Try it yourself)\b/im;
const generatedCourseMetadataPattern = /^_Course:.*_$/m;
const genericChemistryBlurbPattern = /Chemistry treats .+ as a relationship between particles, substances and measurable changes/i;
const genericPhysicsBlurbPattern = /should be studied through measurable quantities and physical relationships|state a realistic situation involving .+ list the known quantities/i;
const genericPhysicalEducationBlurbPattern = /Performance activity: practise or observe .+ use a simple checklist for preparation|generic physical education lesson/i;
const genericFillerParagraphPatterns = [
	/^Worked example: consider a familiar Nigerian school or community situation in which the idea applies\. Identify the relevant facts first, then select the concept that explains them\. Do not begin by memorising a formula or definition without knowing what each part means\.$/i,
	/^Key points: define the main terms accurately; distinguish closely related ideas; use correct units, labels or conventions where required; and check whether the conclusion agrees with the evidence\.$/i,
	/^Practice: write a short explanation of the concept, give one example from everyday life and answer one question that requires you to apply it rather than merely define it\.$/i,
	/^At this stage the emphasis is on clear definitions, familiar examples and correct basic procedure\.$/i,
	/^\*\*Lesson summary:\*\* The important result is not simply knowing what .+ is called\. You should now be able to describe the central idea, recognise it in an example, apply the appropriate procedure or evidence, and explain why your conclusion is reasonable\.$/i,
	/^Worked example: construct a realistic .+ situation in which .+ matters\. Identify the relevant facts and apply the concept step by step\.$/i,
	/^Practice: create your own example of .+, annotate the important features and write a short explanation showing how the concept applies\.$/i,
	/^.+ should be understood through people, institutions, rules and consequences\. Identify the actors involved, the authority or social relationship at work, and the principles that guide their actions\.$/i,
	/^Case study: take a school, community or Nigerian public-life situation involving .+\. Describe the facts, identify the relevant institution or social group and explain two possible responses\.$/i,
	/^Activity: investigate a local example related to .+; record two pieces of evidence, one contrasting viewpoint and a reasoned conclusion\.$/i,
	/^Course distinction: In this .+ course, connect the concept to the specific questions of .+\.$/i,
	/^.+ is an important part of .+\. .+ is a core topic in .+; learners should understand its meaning, social effects, examples and practical use\. The key is to understand the relationship between the definition and the situation in which it is used\. A learner should be able to explain the idea in ordinary language, identify it in an example and use the appropriate rule or procedure when solving a problem\.$/i,
	/^.+ is a specific concept within .+\. Begin by defining its central terms, identifying its main features and distinguishing it from the nearest related concept\.$/i,
];
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

			if (course.title === "Chemistry" && words < 100) {
				failures.push(`${course.title} / ${lesson.title}: ${words} words; topic chapter minimum is 100`);
			}

			if (["Physics", "Physical Education"].includes(course.title) && words < 80) {
				failures.push(`${course.title} / ${lesson.title}: ${words} words; topic chapter minimum is 80`);
			}

			if (fillerPattern.test(body)) {
				failures.push(`${course.title} / ${lesson.title}: repeated level-progression filler remains`);
			}

			if (generatedLessonSectionPattern.test(body) || generatedCourseMetadataPattern.test(body)) {
				failures.push(`${course.title} / ${lesson.title}: generated lesson padding or metadata remains`);
			}

			if (course.title === "Chemistry" && (
				lesson.contentVersion !== "textbook-2" ||
				genericChemistryBlurbPattern.test(body)
			)) {
				failures.push(`${course.title} / ${lesson.title}: generic Chemistry content remains`);
			}

			if (course.title === "Physics" && (
				lesson.contentVersion !== "textbook-physics-1" ||
				genericPhysicsBlurbPattern.test(body)
			)) {
				failures.push(`${course.title} / ${lesson.title}: generic Physics content remains`);
			}

			if (course.title === "Physical Education" && (
				lesson.contentVersion !== "textbook-pe-1" ||
				genericPhysicalEducationBlurbPattern.test(body)
			)) {
				failures.push(`${course.title} / ${lesson.title}: generic Physical Education content remains`);
			}

			if (answerLeakPattern.test(body)) {
				failures.push(`${course.title} / ${lesson.title}: assessment answer is exposed in lesson text`);
			}

			if (generatedFillerHeadings.test(body)) {
				failures.push(`${course.title} / ${lesson.title}: generic generated lesson section remains`);
			}

			if (genericTeachingPattern.test(body)) {
				failures.push(`${course.title} / ${lesson.title}: generic cross-subject teaching text remains`);
			}

			if (paragraphs.some((paragraph) =>
				genericFillerParagraphPatterns.some((pattern) => pattern.test(paragraph)),
			)) {
				failures.push(`${course.title} / ${lesson.title}: generic textbook filler paragraph remains`);
			}

			if (genericObjectivePattern.test(String(lesson.objective ?? ""))) {
				failures.push(`${course.title} / ${lesson.title}: generic learning objective remains`);
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
					genericDistractorPattern.test(String(option)) ||
					/can never be observed or applied|has no practical use|claim with no affected people or institutions|personal preference presented as a rule|conclusion reached without considering evidence/i.test(String(option)),
				);
				const questionText = String(question.question ?? "");
				if (
					(genericQuestionPattern.test(questionText) ||
						/^Which statement best describes .+\?$/i.test(questionText) ||
						/^In .+?, when working on “.+”, which statement best describes .+\?$/i.test(questionText) ||
						/^In .+?, when working on “.+”, which statement most directly matches the main idea explained in “.+”\?$/i.test(questionText) ||
						/^In .+?, when working on “.+”, which example provides the strongest evidence that a learner understands .+\?$/i.test(questionText)) &&
					hasGenericDistractor
				) {
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