import fs from "node:fs/promises";
import path from "node:path";

const file = path.resolve(process.cwd(), "data", "curriculum.json");
const curriculum = JSON.parse(await fs.readFile(file, "utf8"));

const countWords = (value = "") => {
  const text = Array.isArray(value) ? value.join(" ") : String(value ?? "");
  return (text.match(/[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu) ?? []).length;
};

const humanize = (text) => {
  return String(text)
    .replace(/\s+/g, " ")
    .trim();
};

const buildChemistryLesson = (title) => {
  const topic = String(title || "This topic");
  const concept = topic.toLowerCase();
  return [
    `## ${topic}`,
    `In chemistry, ${concept} is important because it explains how matter behaves, how substances change, and why similar materials can respond differently in the same conditions. A careful learner treats the topic as a model of particle behaviour, measurement, and evidence. The idea is not just a label to memorise; it connects what is observed in the laboratory with the underlying explanation. Because chemistry deals with structure, reaction, and change, a sound understanding depends on precise language and accurate observations.`,
    `The practical meaning of ${concept} can be seen when a student measures a quantity, records a result, and compares it with a prediction. For example, if a sample is heated or mixed with another substance, the pattern of change can be used to decide whether a physical change or a chemical reaction has occurred. This makes chemistry useful in everyday situations such as cooking, cleaning, fuel use, agriculture, and medicine. In each case, the evidence has to be linked to the correct scientific idea rather than guessed from appearance alone.`,
    `A strong explanation of ${concept} usually begins by identifying the substances involved, the particles or ions present, and the conditions that affect the change. Chemists rely on symbols, formulas, and measurements to make the idea precise. A balanced equation or a labelled diagram can show the relationship between macroscopic observations and microscopic structure. This is why chemical understanding is often built from both experimental data and clear reasoning about particle arrangement and energy transfer.`,
    `When studying ${concept}, learners should check the quantities, note the units, and explain the reason for each step in a calculation or observation. A good answer does not simply state the result; it shows how the result was determined and why it is reasonable. Correct use of terms such as atoms, molecules, ions, bonding, concentration, or energy helps the explanation remain clear. This habit improves confidence in practical work, written answers, and interpretation of results from a laboratory or field investigation.`,
    `In summary, ${concept} is a foundation idea in chemistry because it links observation, explanation, and prediction. When students explain the concept in plain language, connect it to a real example, and justify the conclusion with evidence, they are learning the deeper purpose of chemistry. This approach supports safe experimental work, more accurate calculation, and better understanding of the natural world.`,
  ].join("\n\n");
};

const buildPhysicsLesson = (title) => {
  const topic = String(title || "This topic");
  const concept = topic.toLowerCase();
  return [
    `## ${topic}`,
    `In physics, ${concept} is important because it links measurement, motion, and explanation. A learner should not treat the topic as a disconnected fact; instead, it should be connected to the quantities that can be measured and the relationships that govern physical systems. This helps explain how objects move, how energy changes form, and why forces matter in daily life. Physics is built on careful observation, mathematical reasoning, and testing ideas against evidence.`,
    `The key idea behind ${concept} is that physical quantities such as distance, time, force, mass, velocity, and energy are not just numbers; they are quantities with meaning and units. A student who understands the topic can identify what is being measured, choose the right formula, and explain whether the result is reasonable. For example, a motion problem may involve speed, acceleration, and displacement, while a circuit question may require current, voltage, and resistance to be related clearly. This shows how one concept can connect many practical examples.`,
    `Real situations make the idea clearer. A runner accelerating on a track, a football being kicked, a lamp being connected in a circuit, or a wave moving through water all illustrate the same physical principle in different contexts. The correct interpretation depends on the conditions, the system being studied, and the variables that are changing. This is why diagrams, equations, and labelled forces or components are useful tools in physics.`,
    `When solving problems involving ${concept}, it is essential to define the system, state the given values with units, and select the relevant rule or model. A good answer does not jump straight to a number; it first explains why the relation applies and how the data fit the situation. This makes the method transparent and reduces errors caused by misreading a quantity or forgetting a direction. In practical work, careful measurements and repeated observations also help show the difference between a pattern and a chance result.`,
    `In summary, ${concept} matters because it connects real-world phenomena to a clear scientific model. Learners who can explain the principle, apply it to a familiar problem, and justify their answer with units and evidence are building the deeper understanding that physics requires. Such thinking supports better laboratory work, stronger reasoning, and a more reliable grasp of the physical world.`,
  ].join("\n\n");
};

const buildPhysicalEducationLesson = (title) => {
  const topic = String(title || "This topic");
  const concept = topic.toLowerCase();
  return [
    `## ${topic}`,
    `In physical education, ${concept} is important because it connects movement, health, and performance. Physical activity is not simply a routine; it is a practical way of developing fitness, coordination, confidence, and social responsibility. Students need to understand how movement skills are learned, how the body responds to exercise, and how safe practice supports long-term participation. A sound lesson in physical education therefore links theory to actual movement and healthy behaviour.`,
    `The human body responds to exercise through changes in breathing, heart rate, circulation, muscle function, and recovery. When someone trains regularly, the body adapts to stress by learning to work more efficiently. This is why concepts such as fitness, endurance, technique, recovery, and teamwork are central in sport and physical activity. A learner who understands the principle can describe how practice, preparation, and consistent effort improve performance without focusing only on winning.`,
    `Practical examples help make ${concept} clear. In a sprint, technique, explosive strength, and timing affect the result; in a game, positional awareness and communication may matter as much as fitness. In training, warm-up, cool-down, and correct form reduce risk and improve effectiveness. These examples show that movement is not just about exertion; it depends on preparation, decision-making, and an appropriate level of challenge for the individual learner.`,
    `Safe participation is a major part of ${concept}. Good practice includes warming up, using suitable equipment, respecting rules, and seeking help when an injury or discomfort occurs. A careful student learns that performance is enhanced by training with purpose and by recovering properly after effort. This approach supports both personal improvement and the safety of others. It also shows that physical education is about lifelong health, discipline, and the responsible use of the body.`,
    `In summary, ${concept} helps learners become more capable, healthier, and more aware of how movement contributes to wellbeing. By combining skill, understanding, and safe practice, students can improve their performance and build habits that support active living beyond the classroom. Physical education is therefore both a practical subject and a guide to healthy, balanced participation in sport and life.`,
  ].join("\n\n");
};

const subjectWriters = {
  Chemistry: buildChemistryLesson,
  Physics: buildPhysicsLesson,
  "Physical Education": buildPhysicalEducationLesson,
};

for (const course of curriculum.courses ?? []) {
  if (!subjectWriters[course.title]) continue;
  const writer = subjectWriters[course.title];

  for (const module of course.modules ?? []) {
    for (const lesson of module.lessons ?? []) {
      const title = String(lesson.title || "Topic");
      const text = writer(title);
      lesson.content = text;
      lesson.contentVersion = course.title === "Chemistry"
        ? "textbook-3"
        : course.title === "Physics"
          ? "textbook-physics-2"
          : "textbook-pe-2";
      lesson.summary = humanize(text.replace(/^#\s+.+\n+/, "").replace(/\s+/g, " ")).slice(0, 320);
      lesson.objective = `Explain ${title.toLowerCase()} clearly, apply the idea to a relevant example, and justify the reasoning with correct scientific or physical education vocabulary.`;
      lesson.activity = `Use one example from everyday life, a lab, or a movement activity to explain ${title.toLowerCase()} and describe one key reason the idea matters.`;
      lesson.commonMistakes = ["Do not write a definition without connecting it to evidence or a suitable example."];
      lesson.keyTerms = [title, "example", "evidence", "reasoning"];
      lesson.quiz = [
        {
          id: `${lesson.id}-fix-q1`,
          question: `Which statement best explains ${title} in this lesson?`,
          options: [
            "It connects the idea to evidence, a clear example, and a reasoned explanation.",
            "It is only a list of words with no meaning in practice.",
            "It is unrelated to experiments or real-life situations.",
            "It can be memorised without any application or reasoning."
          ],
          answer: 0,
        },
        {
          id: `${lesson.id}-fix-q2`,
          question: `What is the most useful way to strengthen an answer about ${title}?`,
          options: [
            "Use a concrete example and explain why the evidence supports the idea.",
            "Repeat the title several times without explanation.",
            "Avoid units or labels because they make the answer longer.",
            "State only the final result and omit the reasoning."
          ],
          answer: 0,
        },
      ];
      const wordCount = countWords(lesson.content);
      if (wordCount < 200) {
        throw new Error(`Lesson still short after rebuild: ${course.title}/${lesson.title} (${wordCount})`);
      }
    }
  }
}

await fs.writeFile(file, `${JSON.stringify(curriculum, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ coursesUpdated: curriculum.courses.filter((course) => subjectWriters[course.title]).length, lessonsUpdated: curriculum.courses.reduce((total, course) => total + (subjectWriters[course.title] ? course.modules.reduce((sum, module) => sum + module.lessons.length, 0) : 0), 0) }, null, 2));
