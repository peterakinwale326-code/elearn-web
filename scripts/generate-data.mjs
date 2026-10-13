import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_DIR = path.join(__dirname, '..', 'data');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'curriculum.json');

// Set target to generate hundreds of thousands of lines of JSON
const TARGET_LESSON_COUNT = 10000;

const SUBJECT_TAXONOMY = {
  'JavaScript Programming': {
    code: 'CS-JS',
    level: 'Senior Secondary',
    topics: [
      'Input and Output in the Browser',
      'Variables with let and const',
      'Primitive Data Types',
      'Operators and Expressions',
      'Conditional Statements',
      'Loops and Iteration',
      'Functions and Scope',
      'Arrays and Array Methods',
      'Objects and Methods',
      'DOM Manipulation',
      'Event Handling',
      'Promises and Async/Await'
    ]
  },
  'Python Fundamentals': {
    code: 'CS-PY',
    level: 'Senior Secondary',
    topics: [
      'Variables and Data Types',
      'Control Flow and Conditionals',
      'Lists, Sets, and Dictionaries',
      'Functions and Modules',
      'File Handling and I/O'
    ]
  },
  'Web Development & HTML/CSS': {
    code: 'CS-WEB',
    level: 'Junior Secondary',
    topics: [
      'HTML Structural Tags',
      'CSS Selectors and Styling',
      'Flexbox and Grid Layouts',
      'Responsive Web Design'
    ]
  }
};

function generateLessonContent(topic, subIndex) {
  return `# ${topic} - Part ${subIndex}\n\n## 1. Overview & Learning Objectives\nIn this comprehensive unit, we explore **${topic}** (Section ${subIndex}) with runnable examples, debugging practices, and interactive self-checks.\n\n## 2. Theoretical Background\nUnderstanding ${topic.toLowerCase()} requires analyzing how variables and expressions interact at runtime. Master these core principles before writing production code.\n\n## 3. Practical Code Example\n\`\`\`javascript\n// Section ${subIndex} Execution Example\nconst dataset = [10, 20, 30];\nfunction processData(items) {\n  return items.map(item => item * ${subIndex});\n}\nconsole.log(processData(dataset));\n\`\`\`\n\n## 4. Line-by-Line Walkthrough\n* **Line 1-2:** Initializes the dataset array with numerical values.\n* **Line 3-5:** Defines a transformation function using implicit return.\n* **Line 6:** Executes processData and logs output to browser console.\n\n## 5. Self-Check & Common Pitfalls\nAvoid mutating state directly without creating local copies. Ensure all return statements handle edge cases gracefully.`;
}

function generateLargeDataset(totalTarget) {
  const dataset = {
    meta: {
      formatVersion: '3.0',
      generator: 'Node.js Large Dataset Engine',
      totalRecords: totalTarget
    },
    courses: []
  };

  let totalGenerated = 0;
  let batchIndex = 1;

  while (totalGenerated < totalTarget) {
    for (const [subjName, details] of Object.entries(SUBJECT_TAXONOMY)) {
      if (totalGenerated >= totalTarget) break;

      const courseCode = `${details.code}-${String(batchIndex).padStart(3, '0')}`;
      const modules = [];

      details.topics.forEach((topic, modIdx) => {
        if (totalGenerated >= totalTarget) return;

        const lessons = [];
        // Generate 5 lessons per topic to build scale
        for (let lesIdx = 1; lesIdx <= 5; lesIdx++) {
          if (totalGenerated >= totalTarget) break;
          totalGenerated++;

          lessons.push({
            code: `LES-${details.code}-${modIdx + 1}.${lesIdx}`,
            title: `${topic} - Part ${lesIdx}`,
            durationMinutes: 40,
            content: generateLessonContent(topic, lesIdx),
            assessmentSeed: {
              prompt: `What is the primary function of ${topic} part ${lesIdx}?`,
              correct: 'Option A: Modifies or reads program state safely.',
              distractors: [
                'Option B: Throws an unhandled exception.',
                'Option C: Stops script execution immediately.'
              ]
            }
          });
        }

        modules.push({
          code: `MOD-${details.code}-${batchIndex}-${String(modIdx + 1).padStart(2, '0')}`,
          title: `Module ${modIdx + 1}: ${topic}`,
          lessons
        });
      });

      dataset.courses.push({
        subject: subjName,
        title: `${details.level} ${subjName} (Series ${batchIndex})`,
        code: courseCode,
        level: details.level,
        modules
      });

      batchIndex++;
    }
  }

  return dataset;
}

console.log(`Generating dataset targeting ${TARGET_LESSON_COUNT} total lessons...`);
const data = generateLargeDataset(TARGET_LESSON_COUNT);

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(data, null, 2), 'utf-8');

const stats = fs.statSync(OUTPUT_FILE);
const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);

console.log(`Successfully generated dataset at: ${OUTPUT_FILE}`);
console.log(`Final File Size: ${fileSizeInMB} MB (~800k+ to 1M+ lines)`);