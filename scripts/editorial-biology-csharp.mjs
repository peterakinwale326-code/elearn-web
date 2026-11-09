import fs from "node:fs/promises";
import path from "node:path";

const file = path.resolve(process.cwd(), "data", "curriculum.json");
const applyChanges = process.argv.includes("--apply");

const biology = {
  Photosynthesis: `# Photosynthesis

Photosynthesis is the process by which green plants use light energy to make glucose from carbon dioxide and water. Chlorophyll in chloroplasts absorbs light. The word equation is carbon dioxide + water -> glucose + oxygen; the balanced symbol equation is 6CO2 + 6H2O -> C6H12O6 + 6O2. Light and chlorophyll enable the reaction but are not consumed as reactants.

Glucose can be used in respiration, converted to starch for storage or used to make cellulose and other compounds. Carbon dioxide enters through stomata, while water is absorbed by roots and carried to leaves. In a starch test, a leaf is boiled in water, decolourised in hot ethanol using a water bath, rinsed and tested with iodine. A blue-black result indicates starch.

To test the need for light, destarch a plant, cover part of a leaf and expose it to light. After testing, compare the covered and uncovered areas while keeping other conditions similar.`,
  Genetics: `# Genetics

Genetics studies inheritance and variation. A gene is a section of DNA associated with a characteristic; alternative forms of a gene are alleles. In a simple dominant-recessive model, an organism with genotype Tt shows the dominant characteristic, while tt shows the recessive one. Dominance does not mean that an allele is more common or better.

If two heterozygous plants (Tt x Tt) are crossed, each parent can pass T or t. A Punnett square gives TT, Tt, Tt and tt, so the genotype ratio is 1:2:1 and the predicted phenotype ratio is 3:1 under the model. These are probabilities for many offspring, not a guarantee about a small family or one individual.

Separate genotype from phenotype, state the assumptions and identify which allele each parent can pass before predicting outcomes. Real traits may involve many genes and environmental influences.`,
};

const csharp = `# C# and .NET

C# is a statically typed programming language; .NET supplies its runtime, libraries and development tools. A C# project is compiled into an intermediate representation that the .NET runtime executes. The base class library provides common facilities such as collections, file access and networking, while the compiler checks many type errors before execution.

A console application can start with a Main method or use top-level statements in modern C#. For example, \`int score = 72;\` and \`Console.WriteLine(score >= 50 ? "Pass" : "Try again");\` store an integer and select output using a conditional expression. The type checker prevents assigning arbitrary text to score, but it does not prove that the program's logic matches the requirement.

Use the .NET CLI to create, build and run a project. Test boundary values such as 49 and 50, and distinguish compile-time errors from exceptions that occur while the program runs.`;

const ids = new Set(["ss1-biology", "ss2-biology", "ss3-biology"]);
const curriculum = JSON.parse(await fs.readFile(file, "utf8"));
let biologyLessons = 0;
let csharpLessons = 0;
const missing = [];

for (const course of curriculum.courses ?? []) {
  for (const module of course.modules ?? []) {
    for (const lesson of module.lessons ?? []) {
      if (ids.has(course.id) && Object.hasOwn(biology, lesson.title)) {
        lesson.content = biology[lesson.title];
        lesson.summary = lesson.content.replace(/^#\s+.+\n+/, "").replace(/\s+/g, " ").trim().slice(0, 320);
        lesson.contentVersion = "textbook-biology-2";
        biologyLessons += 1;
      }

      if (course.id === "programming-csharp" && lesson.title === "C# and .NET") {
        lesson.content = csharp;
        lesson.summary = csharp.replace(/^#\s+.+\n+/, "").replace(/\s+/g, " ").trim().slice(0, 320);
        lesson.contentVersion = "textbook-csharp-1";
        csharpLessons += 1;
      }

      if (ids.has(course.id) && ["Photosynthesis", "Genetics"].includes(lesson.title) && !Object.hasOwn(biology, lesson.title)) missing.push(`${course.id}/${lesson.title}`);
    }
  }
}

if (biologyLessons !== 6 || csharpLessons !== 1 || missing.length) {
  throw new Error(JSON.stringify({ biologyLessons, expectedBiology: 6, csharpLessons, expectedCsharp: 1, missing }));
}

if (applyChanges) await fs.writeFile(file, `${JSON.stringify(curriculum, null, 2)}\n`, "utf8");

console.log(JSON.stringify({ mode: applyChanges ? "apply" : "dry-run", biologyLessons, csharpLessons }, null, 2));