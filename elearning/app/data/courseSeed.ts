export type QuestionSeed = {
  id: string;
  prompt: string;
  options: string[];
  answer: string;
  explanation: string;
};

export type LessonSeed = {
  id: string;
  title: string;
  duration: string;
  objective: string;
  content: string;
  quiz: {
    title: string;
    questions: QuestionSeed[];
    passingScore: number;
  };
};

export type CourseSeed = {
  id: string;
  title: string;
  subject: string;
  level: string;
  duration: string;
  description: string;
  lessons: LessonSeed[];
  exam: {
    title: string;
    duration: string;
    questions: QuestionSeed[];
    passingScore: number;
  };
};

const subjects = [
  "Science",
  "Mathematics",
  "English",
  "History",
  "Technology",
  "Business",
  "Art",
  "Languages",
  "Geography",
  "Computer Science",
  "Health",
  "Music",
];

const courseBases = [
  "Foundations",
  "Essentials",
  "Applied",
  "Advanced",
  "Exploration",
  "Research",
  "Strategy",
  "Practice",
  "Insights",
  "Discovery",
  "Mastery",
  "Leadership",
];

const lessonThemes = [
  "Key concepts",
  "Real-world examples",
  "Hands-on practice",
  "Problem solving",
  "Review and application",
  "Project work",
  "Assessment preparation",
  "Critical analysis",
];

function createQuestionSet(courseIndex: number, lessonIndex: number, subject: string): QuestionSeed[] {
  const baseQuestions = [
    {
      prompt: `Which idea best helps explain the main concept in ${subject}?`,
      options: ["Observation", "Application", "Critical review", "Background context"],
      answer: "Observation",
      explanation: "Using observation helps learners connect the idea to real evidence and examples.",
    },
    {
      prompt: `What is the most effective way to apply learning in this topic?`,
      options: ["Memorize all key words", "Practice with examples", "Skip the overview", "Only read once"],
      answer: "Practice with examples",
      explanation: "Application through examples strengthens understanding and retention.",
    },
    {
      prompt: `Why is review important in ${subject}?`,
      options: ["It adds new confusion", "It confirms understanding", "It removes all effort", "It prevents practice"],
      answer: "It confirms understanding",
      explanation: "Reviewing helps learners check if key ideas are clear before moving on.",
    },
  ];

  return baseQuestions.map((question, questionIndex) => ({
    id: `q-${courseIndex + 1}-${lessonIndex + 1}-${questionIndex + 1}`,
    prompt: `${question.prompt}`,
    options: question.options,
    answer: question.answer,
    explanation: question.explanation,
  }));
}

function createExamSet(courseIndex: number, subject: string): QuestionSeed[] {
  return Array.from({ length: 5 }, (_, questionIndex) => ({
    id: `exam-${courseIndex + 1}-${questionIndex + 1}`,
    prompt: `Capstone question ${questionIndex + 1}: Which strategy best demonstrates mastery in ${subject.toLowerCase()}?`,
    options: [
      "Repeat without reflection",
      "Apply concepts in context",
      "Skip assessment checks",
      "Avoid practice tasks",
    ],
    answer: "Apply concepts in context",
    explanation: "Mastery comes from applying knowledge in realistic and structured situations.",
  }));
}

function buildLessons(courseIndex: number, subject: string, level: string): LessonSeed[] {
  return Array.from({ length: 7 }, (_, lessonIndex) => {
    const theme = lessonThemes[(lessonIndex + courseIndex) % lessonThemes.length];
    const title = `${subject} ${theme} ${lessonIndex + 1}`;
    const lessonQuestions = createQuestionSet(courseIndex, lessonIndex, subject);

    return {
      id: `lesson-${courseIndex + 1}-${lessonIndex + 1}`,
      title,
      duration: `${lessonIndex % 2 === 0 ? 22 : 28} mins`,
      objective: `Build confidence in ${theme.toLowerCase()} with guided explanations, examples, and applied practice for ${level.toLowerCase()} learners.`,
      content: `In this lesson, learners focus on ${theme.toLowerCase()} within ${subject.toLowerCase()}. The session introduces key principles, explores examples, and supports guided practice with short reflection tasks to strengthen understanding and retention.`,
      quiz: {
        title: `Quiz ${lessonIndex + 1}`,
        questions: lessonQuestions,
        passingScore: 80,
      },
    };
  });
}

export const courseCatalog: CourseSeed[] = Array.from({ length: 84 }, (_, index) => {
  const subject = subjects[index % subjects.length];
  const level = ["Beginner", "Intermediate", "Advanced"][index % 3];
  const base = courseBases[index % courseBases.length];
  const lessons = buildLessons(index, subject, level);

  return {
    id: `course-${index + 1}`,
    title: `${subject} ${base} ${index + 1}`,
    subject,
    level,
    duration: `${lessons.length * 25} mins`,
    description: `A structured learning pathway covering the foundations, application, and assessment requirements of ${subject.toLowerCase()} for ${level.toLowerCase()} students.`,
    lessons,
    exam: {
      title: `${subject} Capstone Exam ${index + 1}`,
      duration: "45 mins",
      questions: createExamSet(index, subject),
      passingScore: 75,
    },
  };
});
