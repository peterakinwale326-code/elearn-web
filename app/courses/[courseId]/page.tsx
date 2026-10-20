
"use client";

import Link from "next/link";
import { use, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { getLessonImage } from "@/lib/course-images";
import LearningAssistant from "@/components/learning-assistant";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  Clock3,
  GraduationCap,
  Lock,
  RotateCcw,
  Trophy,
  XCircle,
} from "lucide-react";

import "./course-details.css";

/* =========================================================
   TYPES
========================================================= */

type Option = {
  id?: string | number;
  key?: string;
  text?: string;
  label?: string;
  option?: string;
  isCorrect?: boolean;
};

type Question = {
  id: string | number;
  question?: string;
  text?: string;
  prompt?: string;
  options?: Option[];
  answer?: string | number;
};

type Assessment = {
  id?: string | number;
  title?: string;
  type?: string;
  passingScore?: number | null;
  timeLimit?: number | null;
  duration?: number | null;
  questions?: Question[];
};

type Lesson = {
  id: string | number;
  title?: string;
  name?: string;
  lessonNumber?: string | number;
  code?: string;
  duration?: number;
  durationMinutes?: number;
  content?: string;
  description?: string;
  objective?: string;
  videoUrl?: string | null;
};

type Module = {
  id: string | number;
  title?: string;
  name?: string;
  moduleNumber?: string | number;
  code?: string;
  description?: string;
  lessons?: Lesson[];
  assessment?: Assessment | null;
  test?: Assessment | null;
};

type Course = {
  id?: string | number;
  title?: string;
  name?: string;
  description?: string;
  subject?: string;
  thumbnailUrl?: string | null;
  level?: string;
  grade?: string;
  duration?: number;
  durationMinutes?: number;
  lessonCount?: number;
  modules?: Module[];
  assessments?: Assessment[];
  finalExam?: Assessment | null;
};

type Progress = {
  completedLessons: string[];
  passedModules: string[];
  examScore: number | null;
};

type ViewMode =
  | "lesson"
  | "test-intro"
  | "test"
  | "test-result"
  | "exam-intro"
  | "exam"
  | "exam-result";

type QuizQuestion = {
  question: string;
  options: { key: string; text: string }[];
  answer?: string;
  explanation?: string;
};

const EMPTY_PROGRESS: Progress = {
  completedLessons: [],
  passedModules: [],
  examScore: null,
};

/* =========================================================
   HELPERS
========================================================= */

function idString(value: string | number | undefined | null) {
  return value == null ? "" : String(value);
}

function lessonTitle(lesson: Lesson) {
  return lesson.title || lesson.name || "Untitled lesson";
}

function moduleTitle(module: Module) {
  return module.title || module.name || "Untitled module";
}

function lessonCode(lesson: Lesson) {
  if (lesson.code) return lesson.code;
  if (lesson.lessonNumber != null) return String(lesson.lessonNumber);
  return lessonTitle(lesson).match(/^(\d+(?:\.\d+)?)/)?.[1] || "";
}

function moduleCode(module: Module, index: number) {
  if (module.code) return module.code;
  if (module.moduleNumber != null) return String(module.moduleNumber);
  return String(index + 1);
}

function questionsFor(assessment?: Assessment | null) {
  return Array.isArray(assessment?.questions) ? assessment.questions : [];
}

function passingScore(assessment: Assessment) {
  return assessment.passingScore ?? 50;
}

function durationMinutes(assessment: Assessment) {
  return assessment.timeLimit ?? assessment.duration ?? 30;
}

function getVideoEmbedUrl(value: string) {
  try {
    const url = new URL(value);
    const host = url.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      return `https://www.youtube-nocookie.com/embed/${url.pathname.slice(1)}`;
    }

    if (host === "youtube.com" || host === "m.youtube.com") {
      const videoId = url.searchParams.get("v");
      if (videoId) return `https://www.youtube-nocookie.com/embed/${videoId}`;
      const pathVideoId = url.pathname.match(/^\/(?:embed|shorts|live)\/([^/]+)/)?.[1];
      if (pathVideoId) return `https://www.youtube-nocookie.com/embed/${pathVideoId}`;
    }

    if (host === "youtube-nocookie.com") {
      const videoId = url.pathname.match(/^\/embed\/([^/]+)/)?.[1];
      if (videoId) return `https://www.youtube-nocookie.com/embed/${videoId}`;
    }

    if (host === "vimeo.com" || host === "player.vimeo.com") {
      const videoId = url.pathname.match(/^\/(?:video\/)?(\d+)/)?.[1];
      if (videoId) return `https://player.vimeo.com/video/${videoId}`;
    }
  } catch {
    return null;
  }

  return null;
}

function isFinalExam(assessment?: Assessment | null) {
  if (!assessment) return false;

  return (
    ["final_exam", "final-exam", "exam"].includes(
      assessment.type?.toLowerCase() || "",
    ) || assessment.title?.toLowerCase().includes("final exam") === true
  );
}

function questionText(question: Question) {
  return question.question || question.text || question.prompt || "";
}

function optionText(option: Option) {
  return option.text || option.label || option.option || option.key || String(option.id ?? "");
}

function optionKey(option: Option, index: number) {
  return String(option.key ?? option.id ?? String.fromCharCode(65 + index));
}

function normalizeLessonText(text: string) {
  if (!text) return "";

  let result = text.replace(/\r\n/g, "\n");

  result = result.replace(
    /(?<!^|\n)(?=\d+\.\d+\s+[A-Z])/g,
    "\n",
  );

  result = result.replace(
    /(?<!^|\n)(MODULE\s+\d+(?:\.\d+)?)/gi,
    "\n$1",
  );

  result = result.replace(
    /(?<!^|\n)(FINAL\s+EXAM)/gi,
    "\n$1",
  );

  return result
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n")
    .trim();
}

/* =========================================================
   INLINE MARKDOWN
========================================================= */

function formatInlineText(text: string): ReactNode[] {
  return text
    .split(/(\*\*.*?\*\*|`[^`]+`)/g)
    .map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={index}>{part.slice(2, -2)}</strong>;
      }

      if (part.startsWith("`") && part.endsWith("`")) {
        return <code key={index}>{part.slice(1, -1)}</code>;
      }

      return <span key={index}>{part}</span>;
    });
}

/* =========================================================
   INTERACTIVE LESSON QUIZ

   Supports:
   1. Question text
   2. A. / A) multiple-choice options
   3. Answer: A
   4. Correct answer: A
   5. Explanation: ...
========================================================= */

function parseQuiz(content: string): QuizQuestion[] {
  const lines = content.split("\n").map((line) => line.trim()).filter(Boolean);
  const parsed: QuizQuestion[] = [];

  let current: QuizQuestion | null = null;

  const saveCurrent = () => {
    if (current && current.options.length > 0) {
      parsed.push(current);
    }
  };

  for (const line of lines) {
    if (/^(?:[-*_]\s*){3,}$/.test(line)) continue;
    if (/^\|?\s*:?-{3,}/.test(line)) continue;

    const questionMatch = line.match(
      /^(?:#{1,6}\s*)?(?:Q(?:uestion)?\s*)?(\d+)[.)]\s*(.+)$/i,
    );

    const optionMatch = line.match(
      /^([A-D])[\).]\s*(.+)$/i,
    );

    const answerMatch = line.match(
      /^(?:correct\s+)?answer\s*:\s*([A-D])\b/i,
    );

    const explanationMatch = line.match(
      /^(?:explanation|why)\s*:\s*(.+)$/i,
    );

    if (questionMatch) {
      saveCurrent();
      current = {
        question: questionMatch[2].trim(),
        options: [],
      };
      continue;
    }

    if (optionMatch && current) {
      current.options.push({
        key: optionMatch[1].toUpperCase(),
        text: optionMatch[2].trim(),
      });
      continue;
    }

    if (answerMatch && current) {
      current.answer = answerMatch[1].toUpperCase();
      continue;
    }

    if (explanationMatch && current) {
      current.explanation = explanationMatch[1].trim();
      continue;
    }

    // Also accept answer keys written on a separate line as "Answer: B".
    if (/^(?:correct\s+)?answer\s*:/i.test(line) && !current) {
      continue;
    }

    // Treat continuation lines as part of the question, if options have not started.
    if (current && current.options.length === 0) {
      current.question += ` ${line}`;
    }
  }

  saveCurrent();
  return parsed;
}

function LessonQuiz({ content }: { content: string }) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [checked, setChecked] = useState(false);

  const questions = useMemo(() => parseQuiz(content), [content]);

  useEffect(() => {
    setAnswers({});
    setChecked(false);
  }, [content]);

  if (!questions.length) {
    return (
      <section className="lessonQuiz">
        <div className="lessonQuizHeader">
          <span className="lessonQuizEyebrow">CHECK YOUR UNDERSTANDING</span>
          <h2>Lesson Quiz</h2>
        </div>
        <p>
          This lesson contains a quiz heading, but the questions could not be
          separated into multiple-choice options. Put each question and its
          A–D options on separate lines in the lesson content.
        </p>
      </section>
    );
  }

  const answeredCount = Object.keys(answers).length;
  const canGrade = questions.every((question) => Boolean(question.answer));

  const score = questions.reduce((total, question, index) => {
    return total + (
      question.answer && answers[index] === question.answer ? 1 : 0
    );
  }, 0);

  return (
    <section className="lessonQuiz">
      <header className="lessonQuizHeader">
        <span className="lessonQuizEyebrow">CHECK YOUR UNDERSTANDING</span>
        <h2>Lesson Quiz</h2>
        <p>
          Choose the best answer for each question, then check your responses.
        </p>
        <span className="lessonQuizCount">
          {questions.length} questions
        </span>
      </header>

      {questions.map((question, index) => (
        <fieldset className="lessonQuizQuestion" key={`${index}-${question.question}`}>
          <legend>
            <span className="lessonQuizNumber">{index + 1}</span>
            <span>{question.question}</span>
          </legend>

          <div className="lessonQuizOptions">
            {question.options.map((option) => {
              const selected = answers[index] === option.key;
              const correct = checked && question.answer === option.key;
              const incorrect =
                checked &&
                selected &&
                Boolean(question.answer) &&
                question.answer !== option.key;

              const classes = [
                "lessonQuizOption",
                selected ? "selected" : "",
                correct ? "correct" : "",
                incorrect ? "incorrect" : "",
              ].filter(Boolean).join(" ");

              return (
                <label className={classes} key={option.key}>
                  <input
                    type="radio"
                    name={`lesson-quiz-${index}`}
                    value={option.key}
                    checked={selected}
                    disabled={checked}
                    onChange={() =>
                      setAnswers((previous) => ({
                        ...previous,
                        [index]: option.key,
                      }))
                    }
                  />

                  <span className="lessonQuizLetter">{option.key}</span>
                  <span className="lessonQuizOptionText">{option.text}</span>

                  {checked && correct && (
                    <CheckCircle2 className="lessonQuizResultIcon" size={20} />
                  )}

                  {checked && incorrect && (
                    <XCircle className="lessonQuizResultIcon" size={20} />
                  )}
                </label>
              );
            })}
          </div>

          {checked && question.answer && (
            <div className="lessonQuizFeedback">
              <strong>
                {answers[index] === question.answer ? "Correct" : "Not quite"}
              </strong>
              {question.explanation && <p>{question.explanation}</p>}
            </div>
          )}

          {checked && !question.answer && (
            <p className="lessonQuizUnmarked">
              No answer key was provided for this question.
            </p>
          )}
        </fieldset>
      ))}

      <footer className="lessonQuizActions">
        {!checked ? (
          <>
            <span>{answeredCount} of {questions.length} answered</span>
            <button
              type="button"
              className="primaryButton btn btn-primary"
              disabled={answeredCount !== questions.length}
              onClick={() => setChecked(true)}
            >
              Check answers <Check size={18} />
            </button>
          </>
        ) : (
          <>
            <div>
              {canGrade ? (
                <strong className="lessonQuizScore">
                  Score: {score} / {questions.length}
                  {" "}({Math.round((score / questions.length) * 100)}%)
                </strong>
              ) : (
                <span>
                  Answers reviewed. Add answer keys to the lesson data to
                  calculate a score.
                </span>
              )}
            </div>

            <button
              type="button"
              className="secondaryButton btn btn-outline-secondary"
              onClick={() => {
                setAnswers({});
                setChecked(false);
              }}
            >
              <RotateCcw size={17} /> Try again
            </button>
          </>
        )}
      </footer>
    </section>
  );
}

/* =========================================================
   LESSON BODY RENDERER
========================================================= */

function renderLessonBody(content: string) {
  const normalized = normalizeLessonText(content);

  if (!normalized) {
    return (
      <div className="lessonEmpty">
        <BookOpen size={32} />
        <h3>No lesson content available</h3>
        <p>This lesson has not been populated with learning material yet.</p>
      </div>
    );
  }

  const lines = normalized.split("\n");
  const elements: ReactNode[] = [];

  let paragraph: string[] = [];
  let bullets: string[] = [];
  let numbered: string[] = [];
  let code: string[] = [];
  let inCode = false;

  const flushParagraph = () => {
    if (!paragraph.length) return;
    elements.push(
      <p key={`p-${elements.length}`}>
        {formatInlineText(paragraph.join(" "))}
      </p>,
    );
    paragraph = [];
  };

  const flushLists = () => {
    flushParagraph();

    if (bullets.length) {
      elements.push(
        <ul key={`ul-${elements.length}`}>
          {bullets.map((item, i) => (
            <li key={i}>{formatInlineText(item)}</li>
          ))}
        </ul>,
      );
      bullets = [];
    }

    if (numbered.length) {
      elements.push(
        <ol key={`ol-${elements.length}`}>
          {numbered.map((item, i) => (
            <li key={i}>{formatInlineText(item)}</li>
          ))}
        </ol>,
      );
      numbered = [];
    }
  };

  lines.forEach((raw, index) => {
    const line = raw.trim();

    if (line.startsWith("```")) {
      flushLists();

      if (!inCode) {
        inCode = true;
        code = [];
      } else {
        elements.push(
          <pre className="lessonCode" key={`code-${index}`}>
            <code>{code.join("\n")}</code>
          </pre>,
        );
        code = [];
        inCode = false;
      }
      return;
    }

    if (inCode) {
      code.push(raw);
      return;
    }

   if (!line) {
  flushLists();
  return;
}
    const heading = line.match(/^(#{1,4})\s+(.+)$/);

    if (heading) {
      flushLists();
      const level = heading[1].length;
      const text = heading[2];

      if (level === 1) {
        elements.push(<h2 key={index}>{formatInlineText(text)}</h2>);
      } else if (level === 2) {
        elements.push(<h3 key={index}>{formatInlineText(text)}</h3>);
      } else {
        elements.push(<h4 key={index}>{formatInlineText(text)}</h4>);
      }
      return;
    }

    if (/^[-*]\s+/.test(line)) {
      flushParagraph();
      numbered.length && flushLists();
      bullets.push(line.replace(/^[-*]\s+/, ""));
      return;
    }

    if (/^\d+[.)]\s+/.test(line)) {
      flushParagraph();
      bullets.length && flushLists();
      numbered.push(line.replace(/^\d+[.)]\s+/, ""));
      return;
    }

    if (/^MODULE\s+\d/i.test(line) || /^FINAL EXAM/i.test(line)) {
      flushLists();
      elements.push(
        <div className="lessonModuleHeading" key={index}>
          {line}
        </div>,
      );
      return;
    }

    flushParagraph();
    paragraph.push(line);
  });

  flushLists();

  if (inCode && code.length) {
    elements.push(
      <pre className="lessonCode" key="unfinished-code">
        <code>{code.join("\n")}</code>
      </pre>,
    );
  }

  return <div className="lessonContent">{elements}</div>;
}

function renderLessonContent(content: string) {
  const normalized = normalizeLessonText(content);

  const quizHeading = /^\s{0,3}#{0,3}\s*Lesson Quiz\s*$/im;
  const match = quizHeading.exec(normalized);

  if (!match || match.index === undefined) {
    return renderLessonBody(normalized);
  }

  const lessonText = normalized.slice(0, match.index).trim();
  const quizText = normalized.slice(match.index + match[0].length).trim();

  return (
    <>
      {lessonText && renderLessonBody(lessonText)}
      <LessonQuiz content={quizText} />
    </>
  );
}

/* =========================================================
   ASSESSMENT COMPONENTS
========================================================= */

function AssessmentIntro({
  assessment,
  isFinal,
  onStart,
}: {
  assessment: Assessment;
  isFinal: boolean;
  onStart: () => void;
}) {
  return (
    <section className="assessmentIntro card shadow-sm p-3 p-md-4">
      <div className="assessmentIllustration">
        <GraduationCap size={56} />
      </div>

      <div className="assessmentIntroContent">
        <span className="assessmentBadge badge text-bg-primary">
          {isFinal ? "FINAL EXAM" : "MODULE TEST"}
        </span>

        <h1>{assessment.title || (isFinal ? "Final Exam" : "Module Test")}</h1>

        <p>
          {isFinal
            ? "Complete your final assessment and review your results."
            : "Check your understanding of the lessons in this module."}
        </p>

        <div className="assessmentStats">
          <div className="assessmentStat">
            <BookOpen size={20} />
            <strong>{questionsFor(assessment).length}</strong>
            <span>Questions</span>
          </div>

          <div className="assessmentStat">
            <Clock3 size={20} />
            <strong>{durationMinutes(assessment)}</strong>
            <span>Minutes</span>
          </div>

          <div className="assessmentStat">
            <Trophy size={20} />
            <strong>{passingScore(assessment)}%</strong>
            <span>Pass mark</span>
          </div>
        </div>

        <button className="primaryButton btn btn-primary" onClick={onStart}>
          Start {isFinal ? "Final Exam" : "Module Test"}
          <ArrowRight size={18} />
        </button>
      </div>
    </section>
  );
}

function AssessmentQuestionCard({
  question,
  index,
  selected,
  submitted,
  onSelect,
}: {
  question: Question;
  index: number;
  selected?: string;
  submitted: boolean;
  onSelect: (value: string) => void;
}) {
  return (
    <div className="questionCard card p-3">
      <div className="questionNumber">Question {index + 1}</div>
      <h3 className="questionText">{questionText(question)}</h3>

      <div className="questionOptions">
        {(question.options || []).map((option, i) => {
          const key = optionKey(option, i);
          const correct = option.isCorrect === true;
          const chosen = selected === key;

          return (
            <button
              key={key}
              type="button"
              disabled={submitted}
              className={[
                "questionOption",
                chosen ? "selected" : "",
                submitted && correct ? "correct" : "",
                submitted && chosen && !correct ? "incorrect" : "",
              ].filter(Boolean).join(" ")}
              onClick={() => onSelect(key)}
            >
              <span className="optionLetter">{String.fromCharCode(65 + i)}</span>
              <span className="optionText">{optionText(option)}</span>
              {submitted && correct && <CheckCircle2 size={19} />}
              {submitted && chosen && !correct && <XCircle size={19} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* =========================================================
   MAIN COURSE PAGE
========================================================= */

export default function CourseDetailsPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = use(params);

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeModuleIndex, setActiveModuleIndex] = useState(0);
  const [activeLessonId, setActiveLessonId] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("lesson");
  const [progress, setProgress] = useState<Progress>(EMPTY_PROGRESS);

  const [activeAssessment, setActiveAssessment] = useState<Assessment | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [assessmentScore, setAssessmentScore] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  /* Load course data */

  useEffect(() => {
    const controller = new AbortController();

    async function loadCourse() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `/api/courses/${encodeURIComponent(courseId)}`,
          { cache: "no-store", signal: controller.signal },
        );

        if (!response.ok) {
          throw new Error(`Course request failed (${response.status})`);
        }

        const data = await response.json();
        const loaded: Course = data?.course || data?.data || data;

        if (!loaded) throw new Error("Course data was empty.");

        setCourse(loaded);

        const firstLesson = loaded.modules?.[0]?.lessons?.[0];
        if (firstLesson) setActiveLessonId(idString(firstLesson.id));
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        console.error(err);
        setError("We couldn't load this course. Check that your backend is running.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadCourse();
    return () => controller.abort();
  }, [courseId]);

  /* Restore and save progress */

  useEffect(() => {
    try {
      const saved = localStorage.getItem(`fieldnote-progress-${courseId}`);
      if (!saved) return;

      const parsed = JSON.parse(saved);
      setProgress({
        completedLessons: Array.isArray(parsed.completedLessons)
          ? parsed.completedLessons.map(String)
          : [],
        passedModules: Array.isArray(parsed.passedModules)
          ? parsed.passedModules.map(String)
          : [],
        examScore: typeof parsed.examScore === "number" ? parsed.examScore : null,
      });
    } catch (err) {
      console.warn("Could not restore progress:", err);
    }
  }, [courseId]);

  useEffect(() => {
    if (!course) return;
    try {
      localStorage.setItem(
        `fieldnote-progress-${courseId}`,
        JSON.stringify(progress),
      );
    } catch (err) {
      console.warn("Could not save progress:", err);
    }
  }, [courseId, course, progress]);

  /* Derived course data */

  const modules = useMemo(() => course?.modules || [], [course]);
  const activeModule = modules[activeModuleIndex] || null;
  const lessons = activeModule?.lessons || [];

  const activeLesson =
    lessons.find((lesson) => idString(lesson.id) === activeLessonId) ||
    lessons[0] ||
    null;

  const totalLessons = modules.reduce(
    (total, module) => total + (module.lessons?.length || 0),
    0,
  );

  const completedLessons = progress.completedLessons.length;
  const overallProgress = totalLessons
    ? Math.min(100, Math.round((completedLessons / totalLessons) * 100))
    : 0;

  const allModulesPassed =
    modules.length > 0 &&
    modules.every((module) =>
      progress.passedModules.includes(idString(module.id)),
    );

  const lessonIndex = activeLesson
    ? lessons.findIndex((lesson) => idString(lesson.id) === idString(activeLesson.id))
    : -1;

  const nextLesson = lessonIndex >= 0 ? lessons[lessonIndex + 1] || null : null;

  /* Navigation helpers */

  function goToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function openLesson(moduleIndex: number, lesson: Lesson) {
    setActiveModuleIndex(moduleIndex);
    setActiveLessonId(idString(lesson.id));
    setViewMode("lesson");
    setActiveAssessment(null);
    setSubmitted(false);
    goToTop();
  }

  function getModuleAssessment(module: Module) {
    return module.assessment || module.test || null;
  }

  function openModuleTest(moduleIndex: number) {
    const assessment = getModuleAssessment(modules[moduleIndex]);
    if (!assessment) return;

    setActiveModuleIndex(moduleIndex);
    setActiveAssessment(assessment);
    setSelectedAnswers({});
    setAssessmentScore(null);
    setSubmitted(false);
    setViewMode("test-intro");
    goToTop();
  }

  function findFinalExam() {
    return (
      course?.finalExam ||
      course?.assessments?.find((assessment) => isFinalExam(assessment)) ||
      null
    );
  }

  function openFinalExam() {
    if (!allModulesPassed) return;
    const assessment = findFinalExam();
    if (!assessment) return;

    setActiveAssessment(assessment);
    setSelectedAnswers({});
    setAssessmentScore(null);
    setSubmitted(false);
    setViewMode("exam-intro");
    goToTop();
  }

  function startAssessment() {
    if (!activeAssessment) return;

    setSelectedAnswers({});
    setAssessmentScore(null);
    setSubmitted(false);
    setTimeLeft(durationMinutes(activeAssessment) * 60);
    setViewMode(isFinalExam(activeAssessment) ? "exam" : "test");
    goToTop();
  }

  function markLessonComplete(id: string) {
    setProgress((current) =>
      current.completedLessons.includes(id)
        ? current
        : { ...current, completedLessons: [...current.completedLessons, id] },
    );
  }

  function goNextLesson() {
    if (!activeLesson || !activeModule) return;

    markLessonComplete(idString(activeLesson.id));

    if (nextLesson) {
      setActiveLessonId(idString(nextLesson.id));
      setViewMode("lesson");
      goToTop();
      return;
    }

    const assessment = getModuleAssessment(activeModule);
    if (assessment) {
      setActiveAssessment(assessment);
      setSelectedAnswers({});
      setAssessmentScore(null);
      setSubmitted(false);
      setViewMode("test-intro");
      goToTop();
      return;
    }

    const nextModule = modules[activeModuleIndex + 1];
    const firstLesson = nextModule?.lessons?.[0];

    if (nextModule && firstLesson) {
      setActiveModuleIndex(activeModuleIndex + 1);
      setActiveLessonId(idString(firstLesson.id));
      setViewMode("lesson");
      goToTop();
      return;
    }

    if (allModulesPassed && findFinalExam()) openFinalExam();
  }

  /* Assessment grading */

  function submitAssessment(automatic = false) {
    if (!activeAssessment) return;

    const questions = questionsFor(activeAssessment);
    const correctCount = questions.reduce((total, question) => {
      const selected = selectedAnswers[idString(question.id)];
      const correctOption = question.options?.find((option) => option.isCorrect);

      if (!correctOption) return total;

      const correctKey = optionKey(
        correctOption,
        question.options?.indexOf(correctOption) ?? 0,
      );

      return total + (selected === correctKey ? 1 : 0);
    }, 0);

    const score = questions.length
      ? Math.round((correctCount / questions.length) * 100)
      : 0;

    setAssessmentScore(score);
    setSubmitted(true);

    if (isFinalExam(activeAssessment)) {
      setProgress((current) => ({ ...current, examScore: score }));
      setViewMode("exam-result");
      return;
    }

    const passed = score >= passingScore(activeAssessment);

    if (passed && activeModule) {
      setProgress((current) => {
        const moduleId = idString(activeModule.id);
        return current.passedModules.includes(moduleId)
          ? current
          : { ...current, passedModules: [...current.passedModules, moduleId] };
      });
    }

    setViewMode("test-result");

    if (automatic) {
      console.info("Assessment submitted because the timer expired.");
    }
  }

  function resetAssessment() {
    if (!activeAssessment) return;
    setSelectedAnswers({});
    setAssessmentScore(null);
    setSubmitted(false);
    setTimeLeft(durationMinutes(activeAssessment) * 60);
    setViewMode(isFinalExam(activeAssessment) ? "exam-intro" : "test-intro");
  }

  /* Assessment timer */

  useEffect(() => {
    if (!["test", "exam"].includes(viewMode) || submitted || timeLeft <= 0) return;

    const timer = window.setTimeout(() => {
      setTimeLeft((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [viewMode, submitted, timeLeft]);

  useEffect(() => {
    if (
      timeLeft === 0 &&
      !submitted &&
      (viewMode === "test" || viewMode === "exam") &&
      activeAssessment
    ) {
      submitAssessment(true);
    }
    // Timer completion is intentionally triggered when timeLeft reaches zero.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

  const formattedTime = `${String(Math.floor(timeLeft / 60)).padStart(2, "0")}:${String(timeLeft % 60).padStart(2, "0")}`;

  /* Loading and error states */

  if (loading) {
    return (
      <main className="coursePage container-fluid py-4">
        <div className="courseLoading text-center py-5">
          <div className="loadingSpinner" />
          <h2>Loading course...</h2>
          <p>Preparing your lessons and course materials.</p>
        </div>
      </main>
    );
  }

  if (error || !course) {
    return (
      <main className="coursePage container-fluid py-4">
        <div className="courseError alert alert-danger">
          <XCircle size={44} />
          <h1>Course unavailable</h1>
          <p>{error || "The course could not be found."}</p>
          <div className="errorActions">
            <Link href="/courses" className="secondaryButton btn btn-outline-secondary">
              <ArrowLeft size={18} /> Back to courses
            </Link>
            <button className="primaryButton btn btn-primary" onClick={() => window.location.reload()}>
              <RotateCcw size={18} /> Try again
            </button>
          </div>
        </div>
      </main>
    );
  }

  /* Main page */

  return (
    <main className="coursePage container-fluid py-4">
      <header className="courseHeader card shadow-sm mb-4">
        <div className="courseHeaderTop d-flex justify-content-between align-items-center flex-wrap gap-3">
          <Link href="/courses" className="backLink">
            <ArrowLeft size={18} /> Back to courses
          </Link>
          <Link href="/feedback" className="backLink">Feedback</Link>
          <span className="courseSubject badge text-bg-primary">
            {course.subject || course.level || course.grade || "Course"}
          </span>
        </div>

        <div className="courseHeaderMain d-flex justify-content-between align-items-start flex-wrap gap-4">
          <div>
            <h1>{course.title || course.name || "Untitled course"}</h1>
            {course.description && <p>{course.description}</p>}
          </div>

          <div className="courseMeta d-flex align-items-center flex-wrap gap-3">
            <span><BookOpen size={18} /> {totalLessons} lessons</span>
            <span><GraduationCap size={18} /> {modules.length} modules</span>
          </div>
        </div>

        <div className="courseProgressCard card shadow-sm mt-4">
          <div className="courseProgressInfo d-flex justify-content-between align-items-center gap-3 mb-2">
            <div>
              <strong>Course progress</strong>
              <span>{completedLessons} of {totalLessons} lessons completed</span>
            </div>
            <strong>{overallProgress}%</strong>
          </div>
          <div className="progressBar progress">
            <div
              className="progressBarFill progress-bar bg-success"
              style={{ width: `${overallProgress}%` }}
              role="progressbar"
              aria-valuenow={overallProgress}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>
      </header>

      <div className="courseLayout">
        <aside className="courseSidebar">
          <div className="sidebarHeader bg-light border-bottom p-3">
            <span>COURSE OUTLINE</span>
            <h2>{modules.length} Modules</h2>
          </div>

          <div className="moduleList list-group list-group-flush">
            {modules.map((module, moduleIndex) => {
              const moduleLessons = module.lessons || [];
              const passed = progress.passedModules.includes(idString(module.id));
              const complete =
                moduleLessons.length > 0 &&
                moduleLessons.every((lesson) =>
                  progress.completedLessons.includes(idString(lesson.id)),
                );

              return (
                <div
                  className={`moduleItem ${activeModuleIndex === moduleIndex ? "active" : ""}`}
                  key={idString(module.id)}
                >
                  <button
                    type="button"
                    className="moduleHeading"
                    onClick={() => {
                      setActiveModuleIndex(moduleIndex);
                      if (moduleLessons[0]) {
                        setActiveLessonId(idString(moduleLessons[0].id));
                      }
                      setViewMode("lesson");
                      setActiveAssessment(null);
                    }}
                  >
                    <span className="moduleNumber badge text-bg-light border text-dark">
                      {moduleCode(module, moduleIndex)}
                    </span>
                    <span className="moduleHeadingText">
                      <small>MODULE {moduleCode(module, moduleIndex)}</small>
                      <strong>
                        {moduleTitle(module).replace(/^MODULE\s+\d+(?:\.\d+)?\s*/i, "")}
                      </strong>
                    </span>
                    {(passed || complete) && <CheckCircle2 className="moduleCheck" size={20} />}
                  </button>

                  {activeModuleIndex === moduleIndex && (
                    <div className="lessonList list-group list-group-flush">
                      {moduleLessons.map((lesson) => {
                        const id = idString(lesson.id);
                        const isComplete = progress.completedLessons.includes(id);
                        const selected = activeLessonId === id && viewMode === "lesson";

                        return (
                          <button
                            type="button"
                            key={id}
                            className={`lessonNavItem list-group-item list-group-item-action ${selected ? "active" : ""} ${isComplete ? "completed" : ""}`}
                            onClick={() => openLesson(moduleIndex, lesson)}
                          >
                            <span className="lessonNavIcon">
                              {isComplete ? <Check size={16} /> : <BookOpen size={16} />}
                            </span>
                            <span className="lessonNavText">
                              <small>{lessonCode(lesson)}</small>
                              <strong>
                                {lessonTitle(lesson).replace(/^\d+(?:\.\d+)?\s*/, "")}
                              </strong>
                            </span>
                            {(lesson.duration || lesson.durationMinutes) && (
                              <span className="lessonDuration">
                                {lesson.duration || lesson.durationMinutes}m
                              </span>
                            )}
                          </button>
                        );
                      })}

                      {getModuleAssessment(module) && (
                        <button
                          type="button"
                          className={`assessmentNavItem ${passed ? "completed" : ""}`}
                          onClick={() => openModuleTest(moduleIndex)}
                        >
                          {passed ? <CheckCircle2 size={18} /> : <Trophy size={18} />}
                          <span>
                            <strong>Module test</strong>
                            <small>{passed ? "Passed" : "Complete test"}</small>
                          </span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="finalExamNav">
            <div className="finalExamIcon">
              {allModulesPassed ? <Trophy size={22} /> : <Lock size={22} />}
            </div>
            <div>
              <strong>FINAL EXAM</strong>
              <span>{allModulesPassed ? "Ready to begin" : "Complete all module tests"}</span>
            </div>
            <button
              type="button"
              disabled={!allModulesPassed || !findFinalExam()}
              onClick={openFinalExam}
              aria-label="Open final exam"
            >
              <ArrowRight size={18} />
            </button>
          </div>
        </aside>

        <section className="courseWorkspace">
          {viewMode === "lesson" && activeLesson && (
            <article className="lessonView p-3 p-md-4">
              <div className="lessonTop">
                <div>
                  <span className="lessonBreadcrumb">
                    MODULE {moduleCode(activeModule!, activeModuleIndex)} · {lessonCode(activeLesson)}
                  </span>
                  <h1>{lessonTitle(activeLesson).replace(/^\d+(?:\.\d+)?\s*/, "")}</h1>
                </div>
                <div className="lessonDurationBadge">
                  <Clock3 size={16} />
                  {activeLesson.duration || activeLesson.durationMinutes || 35} mins
                </div>
              </div>

              <div className="learningObjective alert alert-primary">
                <span>LEARNING OBJECTIVE</span>
                <p>
                  {activeLesson.objective ||
                    "Explain the lesson topic and apply it in a practical example."}
                </p>
              </div>

              <div className="lessonMedia">
                <figure className="lessonImage">
                  <img
                    src={getLessonImage(
                      course.title || course.name || "",
                      course.level || course.grade || "",
                      activeModule?.title || activeModule?.name || "",
                      activeLesson.title || activeLesson.name || "",
                    )}
                    alt={`${lessonTitle(activeLesson)} topic illustration`}
                  />
                  <figcaption>{lessonTitle(activeLesson)}</figcaption>
                </figure>
                <div className="lessonVideo">
                  <h2>Lesson video</h2>
                  {activeLesson.videoUrl ? (
                    getVideoEmbedUrl(activeLesson.videoUrl) ? (
                      <iframe
                        src={getVideoEmbedUrl(activeLesson.videoUrl)!}
                        title={`${activeLesson.title || activeLesson.name || "Lesson"} video`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                    ) : (
                      <>
                        <video controls preload="metadata" src={activeLesson.videoUrl}>
                          Your browser does not support embedded video.
                        </video>
                        {activeLesson.videoUrl.startsWith("/") && (
                          <a href={activeLesson.videoUrl} download>
                            Save video for offline study
                          </a>
                        )}
                      </>
                    )
                  ) : (
                    <p className="lessonVideoUnavailable">
                      No video is attached to this lesson yet. When a direct or embeddable video is added, it will play here.
                    </p>
                  )}
                </div>
              </div>

              {renderLessonContent(activeLesson.content || activeLesson.description || "")}

              <div className="lessonFooter d-flex justify-content-between align-items-center flex-wrap gap-3 mt-4 pt-3 border-top">
                <div>
                  {progress.completedLessons.includes(idString(activeLesson.id)) ? (
                    <span className="completedStatus">
                      <CheckCircle2 size={18} /> Lesson completed
                    </span>
                  ) : (
                    <span className="lessonStatus">Complete this lesson to continue.</span>
                  )}
                </div>
                <button className="primaryButton btn btn-primary" onClick={goNextLesson}>
                  {nextLesson ? "Next lesson" : activeModule?.assessment || activeModule?.test ? "Take module test" : "Continue"}
                  <ArrowRight size={18} />
                </button>
              </div>
            </article>
          )}

          {(viewMode === "test-intro" || viewMode === "exam-intro") && activeAssessment && (
            <AssessmentIntro
              assessment={activeAssessment}
              isFinal={viewMode === "exam-intro"}
              onStart={startAssessment}
            />
          )}

          {(viewMode === "test" || viewMode === "exam") && activeAssessment && (
            <section className="assessmentRunner card shadow-sm p-3 p-md-4">
              <div className="assessmentHeader d-flex justify-content-between align-items-center flex-wrap gap-3 border-bottom pb-3 mb-3">
                <div>
                  <span>{viewMode === "exam" ? "FINAL EXAM" : "MODULE TEST"}</span>
                  <h1>{activeAssessment.title || (viewMode === "exam" ? "Final Exam" : "Module Test")}</h1>
                </div>
                <div className={`assessmentTimer ${timeLeft <= 60 ? "warning" : ""}`}>
                  <Clock3 size={20} />
                  <strong>{formattedTime}</strong>
                </div>
              </div>

              <div className="assessmentProgress">
                <span>Answer all questions before submitting.</span>
                <span>{questionsFor(activeAssessment).length} questions</span>
              </div>

              <div className="questions d-grid gap-3">
                {questionsFor(activeAssessment).map((question, index) => (
                  <AssessmentQuestionCard
                    key={idString(question.id)}
                    question={question}
                    index={index}
                    selected={selectedAnswers[idString(question.id)]}
                    submitted={submitted}
                    onSelect={(value) =>
                      setSelectedAnswers((current) => ({
                        ...current,
                        [idString(question.id)]: value,
                      }))
                    }
                  />
                ))}
              </div>

              <div className="assessmentSubmitBar">
                <span>
                  {Object.keys(selectedAnswers).length} of {questionsFor(activeAssessment).length} answered
                </span>
                <button
                  className="primaryButton btn btn-primary"
                  onClick={() => submitAssessment()}
                  disabled={submitted}
                >
                  Submit assessment <Check size={18} />
                </button>
              </div>
            </section>
          )}

          {viewMode === "test-result" && activeAssessment && (
            <section className="assessmentResult card shadow-sm p-3 p-md-4">
              <div className="resultIcon">
                {assessmentScore !== null && assessmentScore >= passingScore(activeAssessment)
                  ? <Trophy size={54} />
                  : <XCircle size={54} />}
              </div>
              <span className="resultLabel">MODULE TEST RESULT</span>
              <h1>
                {assessmentScore !== null && assessmentScore >= passingScore(activeAssessment)
                  ? "Module test passed!"
                  : "Module test not passed"}
              </h1>
              <div className="resultScore">{assessmentScore ?? 0}%</div>
              <p>Pass mark: {passingScore(activeAssessment)}%</p>
              <p>
                {assessmentScore !== null && assessmentScore >= passingScore(activeAssessment)
                  ? "You can continue to the next module."
                  : "Review the lessons and try the module test again."}
              </p>
              <div className="resultActions">
                <button className="secondaryButton btn btn-outline-secondary" onClick={resetAssessment}>
                  <RotateCcw size={18} /> Try again
                </button>
                {assessmentScore !== null && assessmentScore >= passingScore(activeAssessment) && (
                  <button
                    className="primaryButton btn btn-primary"
                    onClick={() => {
                      const nextModule = modules[activeModuleIndex + 1];
                      const firstLesson = nextModule?.lessons?.[0];

                      if (nextModule && firstLesson) {
                        setActiveModuleIndex(activeModuleIndex + 1);
                        setActiveLessonId(idString(firstLesson.id));
                        setViewMode("lesson");
                        setActiveAssessment(null);
                      } else if (allModulesPassed && findFinalExam()) {
                        openFinalExam();
                      } else {
                        setViewMode("lesson");
                        setActiveAssessment(null);
                      }

                      goToTop();
                    }}
                  >
                    Continue <ArrowRight size={18} />
                  </button>
                )}
              </div>
            </section>
          )}

          {viewMode === "exam-result" && (
            <section className="assessmentResult finalResult card shadow-sm p-3 p-md-4">
              <div className="resultIcon"><Trophy size={54} /></div>
              <span className="resultLabel">FINAL EXAM RESULT</span>
              <h1>Final exam completed</h1>
              <div className="resultScore">{progress.examScore ?? assessmentScore ?? 0}%</div>
              <p>Your final exam score has been saved to your course progress.</p>
              <Link href="/courses" className="primaryButton btn btn-primary">
                <ArrowLeft size={18} /> Back to courses
              </Link>
            </section>
          )}

          {viewMode === "lesson" && !activeLesson && (
            <div className="lessonEmpty text-center p-5">
              <BookOpen size={44} />
              <h2>No lesson selected</h2>
              <p>Select a lesson from the course outline.</p>
            </div>
          )}
        </section>
      </div>
      <LearningAssistant
        courseId={courseId}
        courseTitle={course.title || course.name || "Course"}
        lessonTitle={activeLesson ? lessonTitle(activeLesson) : undefined}
        lessonContent={activeLesson?.content || activeLesson?.description || ""}
      />
    </main>
  );
}