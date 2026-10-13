import { GoogleGenAI, Type, Schema } from "@google/genai";
import * as fs from "fs";
import * as path from "path";
import dotenv from "dotenv";

// 1. Load environment variables from project root
dotenv.config();
dotenv.config({ path: path.join(__dirname, "..", ".env.local") });

// 2. Import seed data and catalog from scripts/curriculum-seeds.ts
import {
  COMPLETE_CURRICULUM_SEEDS,
  NERDC_85_SUBJECTS_CATALOG,
  CourseSeedSpec,
} from "./curriculum-seeds";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("❌ ERROR: GEMINI_API_KEY is not defined in your environment or .env/.env.local file.");
  process.exit(1);
}

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey });

// Target output destination: elearning/data/curriculum.json
const OUTPUT_FILE = path.join(__dirname, "..", "data", "curriculum.json");

// Define strict JSON Schema for structured Gemini response
const courseOutputSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    courseId: { type: Type.NUMBER },
    code: { type: Type.STRING },
    title: { type: Type.STRING },
    category: { type: Type.STRING },
    level: { type: Type.STRING },
    department: { type: Type.STRING },
    nerdcSubjectRef: { type: Type.STRING },
    textbookOverview: { type: Type.STRING },
    modules: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          moduleNumber: { type: Type.NUMBER },
          moduleTitle: { type: Type.STRING },
          lessons: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                lessonNumber: { type: Type.NUMBER },
                title: { type: Type.STRING },
                content: { type: Type.STRING },
                quiz: {
                  type: Type.OBJECT,
                  properties: {
                    questions: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          questionText: { type: Type.STRING },
                          options: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                          },
                          correctAnswerIndex: { type: Type.NUMBER },
                          explanation: { type: Type.STRING },
                        },
                        required: [
                          "questionText",
                          "options",
                          "correctAnswerIndex",
                          "explanation",
                        ],
                      },
                    },
                  },
                  required: ["questions"],
                },
              },
              required: ["lessonNumber", "title", "content", "quiz"],
            },
          },
        },
        required: ["moduleNumber", "moduleTitle", "lessons"],
      },
    },
  },
  required: ["courseId", "code", "title", "modules"],
};

async function generateCourseContent(
  seed: CourseSeedSpec,
  maxRetries = 5
): Promise<any> {
  const prompt = `
Generate full e-learning curriculum content for the following course:

Title: ${seed.title} (${seed.code})
Level: ${seed.level} | Category: ${seed.category} | Department: ${seed.department}
Overview: ${seed.textbookOverview}
Core Topics: ${seed.coreTopicsCovered.join(", ")}

Requirements:
1. Divide into exactly ${seed.modulesCount} modules.
2. Produce ${seed.lessonsCount} lessons total across the modules.
3. For each lesson, provide thorough instructional content and a quiz with 3 multiple-choice questions (4 options each, 0-based index for correct answer, and explanation).
`;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: courseOutputSchema,
          temperature: 0.2,
        },
      });

      return JSON.parse(response.text!);
    } catch (err: any) {
      const isTransient =
        err?.status === 503 || err?.status === 429 || err?.code === 503;

      if (isTransient && attempt < maxRetries) {
        // Backoff delay: 5s, 10s, 20s, 40s...
        const delayMs = Math.pow(2, attempt) * 2500;
        console.warn(
          `⚠️ Model high demand (${err?.status || "503"}). Waiting ${delayMs / 1000}s before retrying ${seed.code} (Attempt ${attempt}/${maxRetries})...`
        );
        await new Promise((res) => setTimeout(res, delayMs));
      } else {
        throw err;
      }
    }
  }
}

async function run() {
  console.log("🚀 Starting build-curriculum runner...");

  // Ensure destination directory exists
  const dataDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  let fileData: {
    nerdcSubjectCatalog: typeof NERDC_85_SUBJECTS_CATALOG;
    courses: any[];
  } = {
    nerdcSubjectCatalog: NERDC_85_SUBJECTS_CATALOG,
    courses: [],
  };

  // Resume progress if data/curriculum.json already exists
  if (fs.existsSync(OUTPUT_FILE)) {
    try {
      const existing = JSON.parse(fs.readFileSync(OUTPUT_FILE, "utf-8"));
      if (existing.courses) fileData.courses = existing.courses;
      console.log(
        `📦 Found existing curriculum.json with ${fileData.courses.length} courses. Resuming...`
      );
    } catch {
      fileData.courses = [];
    }
  }

  const completedCodes = new Set(fileData.courses.map((c) => c.code));

  console.log(
    `📚 Total Seeds Loaded: ${COMPLETE_CURRICULUM_SEEDS.length}`
  );

  for (let i = 0; i < COMPLETE_CURRICULUM_SEEDS.length; i++) {
    const seed = COMPLETE_CURRICULUM_SEEDS[i];

    if (completedCodes.has(seed.code)) {
      console.log(
        `[${i + 1}/${COMPLETE_CURRICULUM_SEEDS.length}] ⏭️ Skipping ${seed.code} (Already exists)`
      );
      continue;
    }

    console.log(
      `[${i + 1}/${COMPLETE_CURRICULUM_SEEDS.length}] ⏳ Generating ${seed.code}: ${seed.title}...`
    );

    try {
      const generatedCourse = await generateCourseContent(seed);
      fileData.courses.push(generatedCourse);

      // Write updated content to data/curriculum.json immediately after each generation
      fs.writeFileSync(OUTPUT_FILE, JSON.stringify(fileData, null, 2), "utf-8");
      console.log(`✅ Saved ${seed.code} to ${OUTPUT_FILE}`);
      
      // Delay 3s between successful requests to prevent rate spikes
      await new Promise((res) => setTimeout(res, 3000));
    } catch (err) {
      console.error(`❌ Failed generating ${seed.code}:`, err);
      await new Promise((res) => setTimeout(res, 4000));
    }
  }

  console.log(`\n🎉 Pipeline Complete! Output file ready at:\n${OUTPUT_FILE}`);
}

// Execute with global catch handler
run().catch((err) => {
  console.error("💥 Execution stopped with uncaught error:", err);
  process.exit(1);
});