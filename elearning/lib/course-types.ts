export type CourseOption = {
  id: number;
  text: string;
  isCorrect: boolean;
};

export type CourseQuestion = {
  id: number;
  position: number;
  prompt: string;
  explanation: string;
  options: CourseOption[];
};

export type CourseAssessment = {
  id: number;
  lessonId: number | null;
  courseId: number | null;
  type: "lesson_quiz" | "final_exam";
  title: string;
  durationMinutes: number | null;
  passingScore: number;
  questions: CourseQuestion[];
};

export type CourseLesson = {
  id: number;
  position: number;
  title: string;
  durationMinutes: number;
  objective: string;
  content: string;
  quiz: CourseAssessment | null;
};

export type CourseSummary = {
  id: number;
  title: string;
  subject: string;
  level: string;
  description: string;
  durationMinutes: number;
  lessonCount: number;
  quizCount: number;
  examQuestionCount: number;
  examPassingScore: number | null;
};

export type CourseDetails = CourseSummary & {
  lessons: CourseLesson[];
  exam: CourseAssessment | null;
};
