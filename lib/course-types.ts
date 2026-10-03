export type CourseOption = {
  id: number;
  key?: string;
  text: string;
  isCorrect: boolean;
};

export type CourseQuestion = {
  id: number;
  position: number;
  prompt: string;
  questionText?: string;
  questionType?: "multiple_choice" | "true_false" | "short_answer";
  points?: number;
  explanation: string | null;
  options: CourseOption[];
};

export type CourseAssessment = {
  id: number;
  lessonId: number | null;
  moduleId: number | null;
  courseId: number | null;
  type: "lesson_quiz" | "module_test" | "final_exam";
  title: string;
  description?: string | null;
  durationMinutes: number | null;
  passingScore: number;
  maxAttempts?: number | null;
  randomizeQuestions?: boolean;
  isPublished?: boolean;
  questions: CourseQuestion[];
};

export type CourseLesson = {
  id: number;
  moduleId: number;
  moduleNumber?: number;
  moduleCode?: string;
  lessonCode: string;
  position: number;
  title: string;
  durationMinutes: number;
  objective: string | null;
  content: string | null;
  summary?: string | null;
  videoUrl?: string | null;
  documentUrl?: string | null;
  isFree?: boolean;
  isPublished?: boolean;
  quiz?: CourseAssessment | null;
};

export type CourseModule = {
  id: number;
  courseId: number;
  moduleNumber: number;
  moduleCode: string;
  title: string;
  description: string | null;
  position: number;
  durationMinutes: number;
  isPublished?: boolean;
  lessons: CourseLesson[];
  test: CourseAssessment | null;
};

export type CourseSummary = {
  id: number;
  title: string;
  subject: string;
  subjectId?: number | null;
  level: string;
  description: string;
  thumbnailUrl?: string | null;
  instructorName?: string | null;
  durationMinutes: number;
  lessonCount: number;
  quizCount: number;
  examQuestionCount: number;
  examPassingScore: number | null;
};

export type CourseDetails = CourseSummary & {
  modules: CourseModule[];
  lessons: CourseLesson[];
  assessments: CourseAssessment[];
  exam: CourseAssessment | null;
};