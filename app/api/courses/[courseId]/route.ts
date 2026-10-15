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
};

type SourceModule = {
  title?: string;
  lessons?: SourceLesson[];
};

type SourceCourse = {
  title?: string;
  level?: string;
  modules?: SourceModule[];
};

type CoursePayload = Record<string, any>;

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
  course.subject = getCourseSubject(title, course.subject);
  const level = normalizeTitle(course.level ?? course.grade);
  const sourceCourses = await loadSourceCourses();
  const sourceCourse = sourceCourses.find((candidate) => {
    if (normalizeTitle(candidate.title) !== normalizeTitle(title)) return false;
    const sourceLevel = normalizeTitle(candidate.level);
    return sourceLevel === level || (sourceLevel === "programming" && !level);
  });

  if (!sourceCourse) return payload;

  const modules = Array.isArray(course.modules) ? course.modules as CoursePayload[] : [];
  for (const module of modules) {
    const moduleTitle = normalizeTitle(module.title ?? module.name);
    const sourceModule = sourceCourse.modules?.find(
      (candidate) => normalizeTitle(candidate.title) === moduleTitle,
    );
    if (!sourceModule) continue;

    const lessons = Array.isArray(module.lessons) ? module.lessons as CoursePayload[] : [];
    for (const lesson of lessons) {
      const lessonTitle = normalizeTitle(lesson.title ?? lesson.name);
      const sourceLesson = sourceModule.lessons?.find(
        (candidate) => normalizeTitle(candidate.title) === lessonTitle,
      );
      if (!sourceLesson) continue;

      const content = sourceContent(sourceLesson.content);
      lesson.content = content;
      lesson.objective = sourceLesson.objective || sourceLesson.learningObjective ||
        `Explain ${sourceLesson.title}, identify its key ideas, and apply them to an accurate example.`;
      lesson.summary = sourceLesson.summary || sourceLesson.recap || content.split(/\n+/)[0] || "";
    }
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