import { nodeApiUrl } from "@/lib/node-api";
import { getCourseSubject } from "@/lib/course-images";
import { readFile } from "node:fs/promises";
import path from "node:path";

type SourceLesson = {
  title?: string;
  content?: string | string[];
  objective?: string;
  learningObjective?: string;
  summary?: string;
  recap?: string;
  quiz?: SourceQuestion[];
};

type SourceQuestion = {
  id?: string;
  question: string;
  options: string[];
  answer: number;
  explanation?: string;
};

type SourceAssessment = {
  id?: string;
  title?: string;
  instructions?: string;
  questions: SourceQuestion[];
};

type SourceModule = {
  title?: string;
  lessons?: SourceLesson[];
  test?: SourceAssessment;
};

type SourceCourse = {
  title?: string;
  level?: string;
  modules?: SourceModule[];
  finalExam?: SourceAssessment;
};

type CoursePayload = Record<string, unknown>;

let sourceCoursesPromise: Promise<SourceCourse[]> | undefined;

function normalizeTitle(value: unknown) {
  return String(value ?? "")
    .normalize("NFKC")
    .replace(/^\d+(?:\.\d+)?\s*/, "")
    .toLocaleLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "")
    .trim();
}

function sourceContent(content: SourceLesson["content"]) {
  return Array.isArray(content)
    ? content.map((paragraph) => String(paragraph).trim()).filter(Boolean).join("\n\n")
    : String(content ?? "").trim();
}

function renderLessonQuiz(questions: SourceQuestion[]) {
  if (!questions.length) return "";
  return [
    "## Lesson Quiz",
    "",
    ...questions.flatMap((question, index) => [
      `### ${index + 1}. ${question.question}`,
      ...question.options.map((option, optionIndex) =>
        `${String.fromCharCode(65 + optionIndex)}. ${option}`,
      ),
      `Answer: ${String.fromCharCode(65 + question.answer)}`,
      ...(question.explanation ? [`Explanation: ${question.explanation}`] : []),
      "",
    ]),
  ].join("\n");
}

function mergeSourceAssessment(
  current: CoursePayload | undefined,
  source: SourceAssessment,
  type: "module_test" | "final_exam",
) {
  if (!Array.isArray(source.questions)) {
    throw new Error(`The source ${type} does not contain a question list.`);
  }

  const currentQuestions = Array.isArray(current?.questions)
    ? current.questions as CoursePayload[]
    : [];
  const questions = source.questions.map((question, index) => {
    if (
      typeof question.question !== "string" ||
      !Array.isArray(question.options) ||
      question.options.length !== 4 ||
      !Number.isInteger(question.answer) ||
      question.answer < 0 ||
      question.answer >= question.options.length
    ) {
      throw new Error(`The source ${type} contains an invalid question at position ${index + 1}.`);
    }

    const currentQuestion = currentQuestions[index] ?? {};
    return {
      ...currentQuestion,
      id: currentQuestion.id ?? question.id ?? `${type}-${index + 1}`,
      question: question.question,
      questionText: question.question,
      prompt: question.question,
      answer: String.fromCharCode(65 + question.answer),
      explanation: question.explanation ?? currentQuestion.explanation ?? null,
      options: question.options.map((text, optionIndex) => ({
        key: String.fromCharCode(65 + optionIndex),
        text,
        isCorrect: optionIndex === question.answer,
      })),
    };
  });

  return {
    ...(current ?? {}),
    ...source,
    id: current?.id ?? source.id,
    type: current?.type ?? type,
    questions,
  };
}

async function loadSourceCourses() {
  sourceCoursesPromise ??= readFile(
    path.join(process.cwd(), "data", "curriculum.json"),
    "utf8",
  ).then((text) => {
    const parsed = JSON.parse(text) as { courses?: SourceCourse[] };
    return parsed.courses ?? [];
  });
  return sourceCoursesPromise;
}

async function applySourceLessons(payload: CoursePayload) {
  const course = (payload.course ?? payload.data ?? payload) as CoursePayload;
  const title = String(course.title ?? course.name ?? "");
  const existingSubject = typeof course.subject === "string" ? course.subject : undefined;
  course.subject = getCourseSubject(title, existingSubject);
  const level = normalizeTitle(course.level ?? course.grade);
  const sourceCourses = await loadSourceCourses();
  const sourceCourse = sourceCourses.find((candidate) => {
    if (normalizeTitle(candidate.title) !== normalizeTitle(title)) return false;
    const sourceLevel = normalizeTitle(candidate.level);
    return sourceLevel === level || (sourceLevel === "programming" && !level);
  });

  if (!sourceCourse) return payload;

  const modules = Array.isArray(course.modules) ? course.modules as CoursePayload[] : [];
  for (const moduleData of modules) {
    const moduleTitle = normalizeTitle(moduleData.title ?? moduleData.name);
    const sourceModule = sourceCourse.modules?.find(
      (candidate) => normalizeTitle(candidate.title) === moduleTitle,
    );
    if (!sourceModule) continue;

    if (sourceModule.test) {
      const currentAssessment = (moduleData.assessment ?? moduleData.test) as CoursePayload | undefined;
      const assessment = mergeSourceAssessment(
        currentAssessment,
        sourceModule.test,
        "module_test",
      );
      moduleData.test = assessment;
      if (moduleData.assessment) moduleData.assessment = assessment;
    }

    const lessons = Array.isArray(moduleData.lessons)
      ? moduleData.lessons as CoursePayload[]
      : [];
    for (const lesson of lessons) {
      const lessonTitle = normalizeTitle(lesson.title ?? lesson.name);
      const sourceLesson = sourceModule.lessons?.find(
        (candidate) => normalizeTitle(candidate.title) === lessonTitle,
      );
      if (!sourceLesson) continue;

      const content = sourceContent(sourceLesson.content)
        .replace(/\n{0,2}#{1,3}\s*Lesson Quiz[\s\S]*$/i, "")
        .trim();
      const lessonQuiz = sourceLesson.quiz ? renderLessonQuiz(sourceLesson.quiz) : "";
      lesson.content = [content, lessonQuiz].filter(Boolean).join("\n\n");
      lesson.objective = sourceLesson.objective || sourceLesson.learningObjective ||
        `Explain ${sourceLesson.title}, identify its key ideas, and apply them to an accurate example.`;
      lesson.summary = sourceLesson.summary || sourceLesson.recap || content.split(/\n+/)[0] || "";
    }
  }

  if (sourceCourse.finalExam) {
    const currentExam = (
      course.finalExam ??
      course.exam ??
      (Array.isArray(course.assessments)
        ? course.assessments.find((assessment: CoursePayload) => assessment.type === "final_exam")
        : undefined)
    ) as CoursePayload | undefined;
    const finalExam = mergeSourceAssessment(
      currentExam,
      sourceCourse.finalExam,
      "final_exam",
    );
    course.finalExam = finalExam;
    if (course.exam) course.exam = finalExam;
  }

  return payload;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ courseId: string }> },
) {
  const { courseId } = await params;

  if (!courseId) {
    return Response.json(
      { error: "Course ID is required" },
      { status: 400 },
    );
  }

  const url = nodeApiUrl(
    `/api/courses/${encodeURIComponent(courseId)}`,
  );

  console.log("COURSE API REQUEST:", url);

  try {
    const upstream = await fetch(url, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    const body = await upstream.text();

    console.log(
      "COURSE API RESPONSE:",
      upstream.status,
      body.slice(0, 1000),
    );

    const payload = upstream.ok
      ? await applySourceLessons(JSON.parse(body) as CoursePayload)
      : undefined;

    return new Response(payload ? JSON.stringify(payload) : body, {
      status: upstream.status,
      headers: {
        "Content-Type":
          upstream.headers.get("content-type") ??
          "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("COURSE API FETCH ERROR:", error);

    return Response.json(
      {
        error: "Course API unavailable",
        details:
          error instanceof Error
            ? error.message
            : String(error),
      },
      { status: 503 },
    );
  }
}