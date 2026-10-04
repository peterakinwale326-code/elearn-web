"use client";

import Link from "next/link";
import { use, useEffect, useMemo, useState } from "react";
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

import "./course-details.module.css";

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

/* =========================================================
   HELPERS
========================================================= */

const emptyProgress: Progress = {
  completedLessons: [],
  passedModules: [],
  examScore: null,
};

function idString(value: string | number | undefined | null) {
  return value == null ? "" : String(value);
}

function lessonTitle(lesson: Lesson) {
  return lesson.title || lesson.name || "Untitled lesson";
}

function moduleTitle(module: Module) {
  return module.title || module.name || "Untitled module";
}

function getLessonCode(lesson: Lesson) {
  if (lesson.code) return lesson.code;

  if (lesson.lessonNumber != null) {
    return String(lesson.lessonNumber);
  }

  const title = lessonTitle(lesson);
  const match = title.match(/^(\d+(?:\.\d+)?)/);

  return match?.[1] || "";
}

function getModuleCode(module: Module, index: number) {
  if (module.code) return module.code;

  if (module.moduleNumber != null) {
    return String(module.moduleNumber);
  }

  return `${index + 1}.0`;
}

function assessmentQuestions(assessment: Assessment | null | undefined) {
  return Array.isArray(assessment?.questions)
    ? assessment.questions
    : [];
}

function assessmentPassingScore(assessment: Assessment) {
  return assessment.passingScore ?? 50;
}

function assessmentDuration(assessment: Assessment) {
  return (
    assessment.timeLimit ??
    assessment.duration ??
    30
  );
}

function assessmentIsFinal(assessment: Assessment | null | undefined) {
  if (!assessment) return false;

  return (
    assessment.type === "final_exam" ||
    assessment.type === "final-exam" ||
    assessment.type === "exam" ||
    assessment.title?.toLowerCase().includes("final exam") === true
  );
}

function getQuestionText(question: Question) {
  return question.question || question.text || question.prompt || "";
}

function getOptionText(option: Option) {
  return (
    option.text ||
    option.label ||
    option.option ||
    option.key ||
    String(option.id ?? "")
  );
}

function getOptionKey(option: Option, index: number) {
  return String(
    option.id ??
      option.key ??
      String.fromCharCode(65 + index),
  );
}

/* =========================================================
   CONTENT NORMALIZER
========================================================= */

/**
 * The curriculum data can sometimes arrive with missing
 * line breaks, for example:
 *
 * 1.1Incomplete records1.2Adjustments1.3Depreciation
 *
 * This function repairs the common lesson-number pattern.
 */
function normalizeLessonText(text: string) {
  if (!text) return "";

  let result = text.replace(/\r\n/g, "\n");

  /*
   * Put a line break before lesson numbers:
   * 1.1
   * 1.2
   * 2.1
   * etc.
   */
  result = result.replace(
    /(?<!^|\n)(?=\d+\.\d+)/g,
    "\n",
  );

  /*
   * Put a line break before MODULE.
   */
  result = result.replace(
    /(?<!^|\n)(MODULE\s+\d+(?:\.\d+)?)/gi,
    "\n$1",
  );

  /*
   * Put a line break before FINAL EXAM.
   */
  result = result.replace(
    /(?<!^|\n)(FINAL\s+EXAM)/gi,
    "\n$1",
  );

  /*
   * Clean excessive blank lines.
   */
  const cleanedLines: string[] = [];
  let insideCodeBlock = false;

  for (const line of result.split("\n")) {
    const trimmed = line.trim();

    if (trimmed.startsWith("\`\`\`")) {
      insideCodeBlock = !insideCodeBlock;
      cleanedLines.push(trimmed);
      continue;
    }

    if (insideCodeBlock) {
      cleanedLines.push(line.replace(/\\s+$/, ""));
      continue;
    }

    if (trimmed) cleanedLines.push(trimmed);
  }

  return cleanedLines.join("\n").trim();
}

/**
 * Converts Markdown-like lesson content into React elements.
 */
function renderLessonContent(content: string) {
  const normalized = normalizeLessonText(content);

  if (!normalized) {
    return (
      <div className="lessonEmpty">
        <BookOpen size={28} />
        <p>No lesson content is available yet.</p>
      </div>
    );
  }

  const lines = normalized.split("\n");

  const elements: React.ReactNode[] = [];
  let listItems: string[] = [];
  let orderedItems: string[] = [];
  let proseLines: string[] = [];
  let codeLines: string[] = [];
  let codeLanguage = "";

  const flushProse = () => {
    if (!proseLines.length) return;
    elements.push(
      <p key={`p-${elements.length}`}>
        {formatInlineText(proseLines.join(" "))}
      </p>,
    );
    proseLines = [];
  };

  const flushCode = (key: string) => {
    if (!codeLines.length) return;
    elements.push(
      <pre className="lessonCode" key={key}>
        <code data-language={codeLanguage || undefined}>
          {codeLines.join("\n")}
        </code>
      </pre>,
    );
    codeLines = [];
    codeLanguage = "";
  };

  const flushLists = () => {
    flushProse();
    if (listItems.length) {
      elements.push(
        <ul key={`ul-${elements.length}`}>
          {listItems.map((item, index) => (
            <li key={index}>{formatInlineText(item)}</li>
          ))}
        </ul>,
      );

      listItems = [];
    }

    if (orderedItems.length) {
      elements.push(
        <ol key={`ol-${elements.length}`}>
          {orderedItems.map((item, index) => (
            <li key={index}>{formatInlineText(item)}</li>
          ))}
        </ol>,
      );

      orderedItems = [];
    }
  };

  lines.forEach((rawLine, index) => {
    const line = rawLine.trim();

    if (line.startsWith("\`\`\`")) {
      flushLists();
      if (codeLines.length) {
        flushCode(`code-${index}`);
      } else {
        codeLanguage = line.slice(3).trim();
      }
      return;
    }

    if (codeLines.length || codeLanguage) {
      if (line === "\`\`\`") {
        flushCode(`code-${index}`);
      } else {
        codeLines.push(rawLine.replace(/^\\s{0,2}/, ""));
      }
      return;
    }

    if (!line) return;

    /* Headings */
    if (line.startsWith("### ")) {
      flushLists();

      elements.push(
        <h4 key={`h4-${index}`}>
          {formatInlineText(line.slice(4))}
        </h4>,
      );

      return;
    }

    if (line.startsWith("## ")) {
      flushLists();

      elements.push(
        <h3 key={`h3-${index}`}>
          {formatInlineText(line.slice(3))}
        </h3>,
      );

      return;
    }

    if (line.startsWith("# ")) {
      flushLists();

      elements.push(
        <h2 key={`h2-${index}`}>
          {formatInlineText(line.slice(2))}
        </h2>,
      );

      return;
    }

    /* Learning objective heading */
    if (
      /^learning objectives?$/i.test(line) ||
      /^learning objective$/i.test(line)
    ) {
      flushLists();

      elements.push(
        <h3 key={`objective-${index}`}>
          {line}
        </h3>,
      );

      return;
    }

    /* Bullets */
    if (/^[-*]\s+/.test(line)) {
      orderedItems.length && flushLists();

      listItems.push(line.replace(/^[-*]\s+/, ""));
      return;
    }

    /* Numbered list */
    if (/^\d+[.)]\s+/.test(line)) {
      listItems.length && flushLists();

      orderedItems.push(
        line.replace(/^\d+[.)]\s+/, ""),
      );

      return;
    }

    flushLists();

    /*
     * Standalone MODULE headings
     */
    if (/^MODULE\s+\d+(?:\.\d+)?/i.test(line)) {
      elements.push(
        <div
          className="lessonModuleHeading"
          key={`module-${index}`}
        >
          {formatInlineText(line)}
        </div>,
      );

      return;
    }

    /*
     * Standalone FINAL EXAM heading
     */
    if (/^FINAL EXAM/i.test(line)) {
      elements.push(
        <div
          className="lessonModuleHeading"
          key={`exam-${index}`}
        >
          {formatInlineText(line)}
        </div>,
      );

      return;
    }

    /*
     * Markdown table rows.
     */
    if (line.includes("|")) {
      const cells = line
        .split("|")
        .map((cell) => cell.trim())
        .filter(Boolean);

      if (cells.length > 1) {
        elements.push(
          <div
            className="lessonTableRow"
            key={`table-${index}`}
          >
            {cells.map((cell, cellIndex) => (
              <div
                className="lessonTableCell"
                key={cellIndex}
              >
                {formatInlineText(cell)}
              </div>
            ))}
          </div>,
        );

        return;
      }
    }

    proseLines.push(line);
  });

  flushCode("code-final");
  flushLists();

  return (
    <div className="lessonContent">
      {elements}
    </div>
  );
}

function formatInlineText(text: string) {
  const parts = text.split(/(\*\*.*?\*\*|\`[^\`]+\`)/g);

  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }

    if (part.startsWith("\`") && part.endsWith("\`")) {
      return <code key={index}>{part.slice(1, -1)}</code>;
    }

    return part;
  });
}

/* =========================================================
   QUESTION CARD
========================================================= */

function QuestionCard({
  question,
  questionNumber,
  selected,
  submitted,
  onSelect,
}: {
  question: Question;
  questionNumber: number;
  selected?: string;
  submitted: boolean;
  onSelect: (value: string) => void;
}) {
  const options = question.options || [];

  return (
    <div className="questionCard">
      <div className="questionNumber">
        Question {questionNumber}
      </div>

      <h3 className="questionText">
        {getQuestionText(question)}
      </h3>

      <div className="questionOptions">
        {options.map((option, index) => {
          const key = getOptionKey(option, index);
          const isSelected = selected === key;
          const isCorrect = option.isCorrect === true;

          let className = "questionOption";

          if (isSelected) {
            className += " selected";
          }

          if (submitted && isCorrect) {
            className += " correct";
          }

          if (
            submitted &&
            isSelected &&
            !isCorrect
          ) {
            className += " incorrect";
          }

          return (
            <button
              key={key}
              type="button"
              className={className}
              onClick={() => !submitted && onSelect(key)}
              disabled={submitted}
            >
              <span className="optionLetter">
                {String.fromCharCode(65 + index)}
              </span>

              <span className="optionText">
                {getOptionText(option)}
              </span>

              {submitted && isCorrect && (
                <CheckCircle2
                  size={20}
                  className="optionIcon"
                />
              )}

              {submitted &&
                isSelected &&
                !isCorrect && (
                  <XCircle
                    size={20}
                    className="optionIcon"
                  />
                )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* =========================================================
   ASSESSMENT INTRO
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
  const questions = assessmentQuestions(assessment);
  const duration = assessmentDuration(assessment);
  const passingScore = assessmentPassingScore(assessment);

  return (
    <section className="assessmentIntro">
      <div className="assessmentIllustration">
        <GraduationCap size={64} />
      </div>

      <div className="assessmentIntroContent">
        <span className="assessmentBadge">
          {isFinal ? "FINAL EXAM" : "MODULE TEST"}
        </span>

        <h1>
          {assessment.title ||
            (isFinal ? "Final Exam" : "Module Test")}
        </h1>

        <p>
          {isFinal
            ? "Complete the final assessment after passing all module tests."
            : "Test your understanding of the lessons in this module."}
        </p>

        <div className="assessmentStats">
          <div className="assessmentStat">
            <BookOpen size={20} />
            <strong>{questions.length}</strong>
            <span>Questions</span>
          </div>

          <div className="assessmentStat">
            <Clock3 size={20} />
            <strong>{duration}</strong>
            <span>Minutes</span>
          </div>

          <div className="assessmentStat">
            <Trophy size={20} />
            <strong>{passingScore}%</strong>
            <span>Pass mark</span>
          </div>
        </div>

        <button
          type="button"
          className="primaryButton"
          onClick={onStart}
        >
          Start {isFinal ? "Final Exam" : "Module Test"}
          <ArrowRight size={18} />
        </button>
      </div>
    </section>
  );
}

/* =========================================================
   MAIN PAGE
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

  const [activeModuleIndex, setActiveModuleIndex] =
    useState(0);

  const [activeLessonId, setActiveLessonId] =
    useState<string>("");

  const [viewMode, setViewMode] =
    useState<ViewMode>("lesson");

  const [progress, setProgress] =
    useState<Progress>(emptyProgress);

  const [selectedAnswers, setSelectedAnswers] =
    useState<Record<string, string>>({});

  const [assessmentScore, setAssessmentScore] =
    useState<number | null>(null);

  const [activeAssessment, setActiveAssessment] =
    useState<Assessment | null>(null);

  const [timeLeft, setTimeLeft] = useState(0);

  const [submitted, setSubmitted] =
    useState(false);

  /* =====================================================
     LOAD COURSE
  ===================================================== */

  useEffect(() => {
    const controller = new AbortController();

    async function loadCourse() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `/api/courses/${encodeURIComponent(courseId)}`,
          {
            cache: "no-store",
            signal: controller.signal,
          },
        );

        if (!response.ok) {
          throw new Error(
            `Course request failed with status ${response.status}`,
          );
        }

        const data = await response.json();

        const loadedCourse: Course =
          data?.course ||
          data?.data ||
          data;

        if (!loadedCourse) {
          throw new Error("Course data was empty.");
        }

        setCourse(loadedCourse);

        const firstModule =
          loadedCourse.modules?.[0];

        const firstLesson =
          firstModule?.lessons?.[0];

        if (firstLesson) {
          setActiveLessonId(
            idString(firstLesson.id),
          );
        }
      } catch (err) {
        if (
          err instanceof DOMException &&
          err.name === "AbortError"
        ) {
          return;
        }

        console.error("Course loading error:", err);

        setError(
          "We couldn't load this course. Make sure the backend server is running.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadCourse();

    return () => controller.abort();
  }, [courseId]);

  /* =====================================================
     LOAD SAVED PROGRESS
  ===================================================== */

  useEffect(() => {
    try {
      const key = `fieldnote-progress-${courseId}`;
      const saved = localStorage.getItem(key);

      if (!saved) return;

      const parsed = JSON.parse(saved);

      setProgress({
        completedLessons: Array.isArray(
          parsed.completedLessons,
        )
          ? parsed.completedLessons.map(String)
          : [],

        passedModules: Array.isArray(
          parsed.passedModules,
        )
          ? parsed.passedModules.map(String)
          : [],

        examScore:
          typeof parsed.examScore === "number"
            ? parsed.examScore
            : null,
      });
    } catch (err) {
      console.warn(
        "Could not restore course progress:",
        err,
      );
    }
  }, [courseId]);

  /* =====================================================
     SAVE PROGRESS
  ===================================================== */

  useEffect(() => {
    if (!course) return;

    try {
      localStorage.setItem(
        `fieldnote-progress-${courseId}`,
        JSON.stringify(progress),
      );
    } catch (err) {
      console.warn(
        "Could not save course progress:",
        err,
      );
    }
  }, [courseId, course, progress]);

  /* =====================================================
     DERIVED DATA
  ===================================================== */

  const modules = useMemo(
    () => course?.modules || [],
    [course],
  );

  const activeModule =
    modules[activeModuleIndex] || null;

  const lessons =
    activeModule?.lessons || [];

  const activeLesson =
    lessons.find(
      (lesson) =>
        idString(lesson.id) === activeLessonId,
    ) ||
    lessons[0] ||
    null;

  const totalLessons = modules.reduce(
    (total, module) =>
      total + (module.lessons?.length || 0),
    0,
  );

  const completedLessons =
    progress.completedLessons.length;

  const overallProgress =
    totalLessons > 0
      ? Math.round(
          (completedLessons / totalLessons) * 100,
        )
      : 0;

  const activeModuleCompleted =
    lessons.length > 0 &&
    lessons.every((lesson) =>
      progress.completedLessons.includes(
        idString(lesson.id),
      ),
    );

  const allModulesPassed =
    modules.length > 0 &&
    modules.every((module) =>
      progress.passedModules.includes(
        idString(module.id),
      ),
    );

  const nextLesson = activeLesson
    ? lessons[
        lessons.findIndex(
          (lesson) =>
            idString(lesson.id) ===
            idString(activeLesson.id),
        ) + 1
      ]
    : null;

  const currentLessonPosition =
    activeLesson
      ? lessons.findIndex(
          (lesson) =>
            idString(lesson.id) ===
            idString(activeLesson.id),
        ) + 1
      : 0;

  /* =====================================================
     LESSON COMPLETION
  ===================================================== */

  function markLessonComplete(
    lessonId: string,
  ) {
    setProgress((current) => {
      if (
        current.completedLessons.includes(
          lessonId,
        )
      ) {
        return current;
      }

      return {
        ...current,
        completedLessons: [
          ...current.completedLessons,
          lessonId,
        ],
      };
    });
  }

  /* =====================================================
     OPEN LESSON
  ===================================================== */

  function openLesson(
    moduleIndex: number,
    lesson: Lesson,
  ) {
    setActiveModuleIndex(moduleIndex);
    setActiveLessonId(idString(lesson.id));
    setViewMode("lesson");
    setActiveAssessment(null);
    setSubmitted(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  /* =====================================================
     OPEN MODULE TEST
  ===================================================== */

  function openModuleTest(moduleIndex: number) {
    const module = modules[moduleIndex];

    if (!module) return;

    const assessment =
      module.assessment ||
      module.test ||
      null;

    if (!assessment) return;

    setActiveModuleIndex(moduleIndex);
    setActiveAssessment(assessment);
    setSelectedAnswers({});
    setAssessmentScore(null);
    setSubmitted(false);
    setViewMode("test-intro");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  /* =====================================================
     START ASSESSMENT
  ===================================================== */

  function startAssessment() {
    if (!activeAssessment) return;

    setSelectedAnswers({});
    setAssessmentScore(null);
    setSubmitted(false);

    setTimeLeft(
      assessmentDuration(activeAssessment) * 60,
    );

    setViewMode(
      assessmentIsFinal(activeAssessment)
        ? "exam"
        : "test",
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  /* =====================================================
     SUBMIT ASSESSMENT
  ===================================================== */

  function submitAssessment(
    automatic = false,
  ) {
    if (!activeAssessment) return;

    const questions =
      assessmentQuestions(activeAssessment);

    if (!questions.length) {
      setAssessmentScore(0);
      setSubmitted(true);

      setViewMode(
        assessmentIsFinal(activeAssessment)
          ? "exam-result"
          : "test-result",
      );

      return;
    }

    let correct = 0;

    questions.forEach((question) => {
      const questionId = idString(question.id);

      const selected =
        selectedAnswers[questionId];

      if (!selected) return;

      const correctOption =
        question.options?.find(
          (option) =>
            option.isCorrect === true,
        );

      if (
        correctOption &&
        getOptionKey(
          correctOption,
          question.options?.indexOf(
            correctOption,
          ) || 0,
        ) === selected
      ) {
        correct += 1;
      }
    });

    const score = Math.round(
      (correct / questions.length) * 100,
    );

    setAssessmentScore(score);
    setSubmitted(true);

    const isFinal =
      assessmentIsFinal(activeAssessment);

    if (isFinal) {
      setProgress((current) => ({
        ...current,
        examScore: score,
      }));

      setViewMode("exam-result");
      return;
    }

    const passed =
      score >=
      assessmentPassingScore(activeAssessment);

    if (passed && activeModule) {
      setProgress((current) => {
        const moduleId = idString(
          activeModule.id,
        );

        if (
          current.passedModules.includes(
            moduleId,
          )
        ) {
          return current;
        }

        return {
          ...current,
          passedModules: [
            ...current.passedModules,
            moduleId,
          ],
        };
      });
    }

    setViewMode("test-result");

    if (automatic) {
      console.log(
        "Assessment submitted automatically because time expired.",
      );
    }
  }

  /* =====================================================
     TIMER
  ===================================================== */

  useEffect(() => {
    if (
      viewMode !== "test" &&
      viewMode !== "exam"
    ) {
      return;
    }

    if (submitted) return;

    if (timeLeft <= 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setTimeLeft((current) =>
        current > 0 ? current - 1 : 0,
      );
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [viewMode, submitted, timeLeft]);

  useEffect(() => {
    if (
      timeLeft === 0 &&
      !submitted &&
      (viewMode === "test" ||
        viewMode === "exam") &&
      activeAssessment
    ) {
      submitAssessment(true);
    }
    // Deliberately only reacts when timer reaches zero.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

  /* =====================================================
     NEXT LESSON
  ===================================================== */

  function goNextLesson() {
    if (!activeLesson || !activeModule) {
      return;
    }

    const currentLessonId =
      idString(activeLesson.id);

    markLessonComplete(currentLessonId);

    const currentIndex = lessons.findIndex(
      (lesson) =>
        idString(lesson.id) ===
        currentLessonId,
    );

    const followingLesson =
      lessons[currentIndex + 1];

    if (followingLesson) {
      setActiveLessonId(
        idString(followingLesson.id),
      );

      setViewMode("lesson");

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      return;
    }

    /*
     * Current module is finished.
     * If it has a test, show the test.
     */
    const moduleAssessment =
      activeModule.assessment ||
      activeModule.test ||
      null;

    if (moduleAssessment) {
      setActiveAssessment(moduleAssessment);
      setSelectedAnswers({});
      setAssessmentScore(null);
      setSubmitted(false);
      setViewMode("test-intro");

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      return;
    }

    /*
     * Move to next module.
     */
    const nextModule =
      modules[activeModuleIndex + 1];

    if (nextModule) {
      const firstLesson =
        nextModule.lessons?.[0];

      if (firstLesson) {
        setActiveModuleIndex(
          activeModuleIndex + 1,
        );

        setActiveLessonId(
          idString(firstLesson.id),
        );

        setViewMode("lesson");

        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      }

      return;
    }

    /*
     * Everything is completed.
     * Look for final exam.
     */
    const finalExam =
      course?.finalExam ||
      course?.assessments?.find(
        assessment =>
          assessmentIsFinal(assessment),
      );

    if (
      finalExam &&
      allModulesPassed
    ) {
      setActiveAssessment(finalExam);
      setViewMode("exam-intro");

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }

  /* =====================================================
     OPEN FINAL EXAM
  ===================================================== */

  function openFinalExam() {
    if (!allModulesPassed) return;

    const finalExam =
      course?.finalExam ||
      course?.assessments?.find(
        assessment =>
          assessmentIsFinal(assessment),
      );

    if (!finalExam) return;

    setActiveAssessment(finalExam);
    setSelectedAnswers({});
    setAssessmentScore(null);
    setSubmitted(false);
    setViewMode("exam-intro");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  /* =====================================================
     RESET ASSESSMENT
  ===================================================== */

  function resetAssessment() {
    setSelectedAnswers({});
    setAssessmentScore(null);
    setSubmitted(false);

    if (activeAssessment) {
      setTimeLeft(
        assessmentDuration(activeAssessment) *
          60,
      );
    }

    setViewMode(
      activeAssessment &&
        assessmentIsFinal(activeAssessment)
        ? "exam-intro"
        : "test-intro",
    );
  }

  /* =====================================================
     FORMAT TIME
  ===================================================== */

  const formattedTime = `${String(
    Math.floor(timeLeft / 60),
  ).padStart(2, "0")}:${String(
    timeLeft % 60,
  ).padStart(2, "0")}`;

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <main className="coursePage">
        <div className="courseLoading">
          <div className="loadingSpinner" />

          <h2>Loading course...</h2>

          <p>
            Preparing your lessons and course
            materials.
          </p>
        </div>
      </main>
    );
  }

  /* =====================================================
     ERROR
  ===================================================== */

  if (error || !course) {
    return (
      <main className="coursePage">
        <div className="courseError">
          <XCircle size={52} />

          <h1>Course unavailable</h1>

          <p>
            {error ||
              "The course could not be found."}
          </p>

          <div className="errorActions">
            <Link
              href="/courses"
              className="secondaryButton"
            >
              <ArrowLeft size={18} />
              Back to courses
            </Link>

            <button
              type="button"
              className="primaryButton"
              onClick={() =>
                window.location.reload()
              }
            >
              <RotateCcw size={18} />
              Try again
            </button>
          </div>
        </div>
      </main>
    );
  }

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <main className="coursePage">
      {/* =================================================
          HEADER
      ================================================= */}

      <header className="courseHeader">
        <div className="courseHeaderTop">
          <Link
            href="/courses"
            className="backLink"
          >
            <ArrowLeft size={18} />
            Back to courses
          </Link>

          <span className="courseSubject">
            {course.subject ||
              course.level ||
              course.grade ||
              "Course"}
          </span>
        </div>

        <div className="courseHeaderMain">
          <div>
            <h1>
              {course.title ||
                course.name ||
                "Untitled course"}
            </h1>

            {course.description && (
              <p>{course.description}</p>
            )}
          </div>

          <div className="courseMeta">
            <span>
              <BookOpen size={17} />
              {totalLessons} lessons
            </span>

            <span>
              <GraduationCap size={17} />
              {modules.length} modules
            </span>
          </div>
        </div>

        <div className="courseProgressCard">
          <div className="courseProgressInfo">
            <div>
              <strong>
                Course progress
              </strong>

              <span>
                {completedLessons} of{" "}
                {totalLessons} lessons completed
              </span>
            </div>

            <strong>
              {overallProgress}%
            </strong>
          </div>

          <div className="progressBar">
            <div
              className="progressBarFill"
              style={{
                width: `${overallProgress}%`,
              }}
            />
          </div>
        </div>
      </header>

      {/* =================================================
          MAIN LAYOUT
      ================================================= */}

      <div className="courseLayout">
        {/* =================================================
            SIDEBAR
        ================================================= */}

        <aside className="courseSidebar">
          <div className="sidebarHeader">
            <div>
              <span>COURSE OUTLINE</span>
              <h2>
                {modules.length} Modules
              </h2>
            </div>
          </div>

          <div className="moduleList">
            {modules.map(
              (module, moduleIndex) => {
                const moduleLessons =
                  module.lessons || [];

                const modulePassed =
                  progress.passedModules.includes(
                    idString(module.id),
                  );

                const moduleCompleted =
                  moduleLessons.length > 0 &&
                  moduleLessons.every(
                    (lesson) =>
                      progress.completedLessons.includes(
                        idString(lesson.id),
                      ),
                  );

                const moduleAssessment =
                  module.assessment ||
                  module.test ||
                  null;

                return (
                  <div
                    className={`moduleItem ${
                      activeModuleIndex ===
                      moduleIndex
                        ? "active"
                        : ""
                    }`}
                    key={idString(module.id)}
                  >
                    <button
                      type="button"
                      className="moduleHeading"
                      onClick={() => {
                        setActiveModuleIndex(moduleIndex);
                        const firstLesson = moduleLessons[0];
                        if (firstLesson) setActiveLessonId(idString(firstLesson.id));
                        setViewMode("lesson");
                      }}
                    >
                      <div className="moduleNumber">
                        {getModuleCode(
                          module,
                          moduleIndex,
                        )}
                      </div>

                      <div className="moduleHeadingText">
                        <span>
                          MODULE{" "}
                          {getModuleCode(
                            module,
                            moduleIndex,
                          )}
                        </span>

                        <h3>
                          {moduleTitle(module).replace(
                            /^MODULE\s+\d+(?:\.\d+)?\s*/i,
                            "",
                          )}
                        </h3>
                      </div>

                      {modulePassed ||
                      moduleCompleted ? (
                        <CheckCircle2
                          size={20}
                          className="moduleCheck"
                        />
                      ) : null}
                    </button>

                    {activeModuleIndex === moduleIndex && (
                      <div className="lessonList">
                        {moduleLessons.map(
                          (lesson) => {
                          const lessonId =
                            idString(
                              lesson.id,
                            );

                          const completed =
                            progress.completedLessons.includes(
                              lessonId,
                            );

                          const selected =
                            activeLessonId ===
                              lessonId &&
                            activeModuleIndex ===
                              moduleIndex &&
                            viewMode ===
                              "lesson";

                          return (
                            <button
                              type="button"
                              key={lessonId}
                              className={`lessonNavItem ${
                                selected
                                  ? "active"
                                  : ""
                              } ${
                                completed
                                  ? "completed"
                                  : ""
                              }`}
                              onClick={() =>
                                openLesson(
                                  moduleIndex,
                                  lesson,
                                )
                              }
                            >
                              <span className="lessonNavIcon">
                                {completed ? (
                                  <Check
                                    size={15}
                                  />
                                ) : (
                                  <BookOpen
                                    size={15}
                                  />
                                )}
                              </span>

                              <span className="lessonNavText">
                                <small>
                                  {getLessonCode(
                                    lesson,
                                  )}
                                </small>

                                <strong>
                                  {lessonTitle(
                                    lesson,
                                  ).replace(
                                    /^\d+(?:\.\d+)?\s*/,
                                    "",
                                  )}
                                </strong>
                              </span>

                              {lesson.duration ||
                              lesson.durationMinutes ? (
                                <span className="lessonDuration">
                                  {lesson.duration ||
                                    lesson.durationMinutes}
                                  m
                                </span>
                              ) : null}
                            </button>
                          );
                          },
                        )}
                      </div>
                    )}

                      {moduleAssessment && (
                        <button
                          type="button"
                          className={`assessmentNavItem ${
                            modulePassed
                              ? "completed"
                              : ""
                          }`}
                          onClick={() =>
                            openModuleTest(
                              moduleIndex,
                            )
                          }
                        >
                          {modulePassed ? (
                            <CheckCircle2
                              size={18}
                            />
                          ) : (
                            <Trophy size={18} />
                          )}

                          <span>
                            <strong>
                              Module test
                            </strong>

                            <small>
                              {modulePassed
                                ? "Passed"
                                : "Complete test"}
                            </small>
                          </span>
                        </button>
                      )}
                    </div>
                );
              },
            )}
          </div>

          {/* FINAL EXAM */}
          <div className="finalExamNav">
            <div className="finalExamIcon">
              {allModulesPassed ? (
                <Trophy size={22} />
              ) : (
                <Lock size={22} />
              )}
            </div>

            <div>
              <strong>FINAL EXAM</strong>

              <span>
                {allModulesPassed
                  ? "Ready to begin"
                  : "Complete all module tests"}
              </span>
            </div>

            <button
              type="button"
              disabled={!allModulesPassed}
              onClick={openFinalExam}
              aria-label="Open final exam"
            >
              <ArrowRight size={18} />
            </button>
          </div>
        </aside>

        {/* =================================================
            WORKSPACE
        ================================================= */}

        <section className="courseWorkspace">
          {/* =================================================
              LESSON
          ================================================= */}

          {viewMode === "lesson" &&
            activeLesson && (
              <article className="lessonView">
                <div className="lessonTop">
                  <div>
                    <span className="lessonBreadcrumb">
                      MODULE{" "}
                      {getModuleCode(
                        activeModule!,
                        activeModuleIndex,
                      )}{" "}
                      ·{" "}
                      {getLessonCode(
                        activeLesson,
                      )}
                    </span>

                    <h1>
                      {lessonTitle(
                        activeLesson,
                      ).replace(
                        /^\d+(?:\.\d+)?\s*/,
                        "",
                      )}
                    </h1>
                  </div>

                  <div className="lessonDurationBadge">
                    <Clock3 size={16} />

                    {activeLesson.duration ||
                      activeLesson.durationMinutes ||
                      35}{" "}
                    mins
                  </div>
                </div>

                <div className="learningObjective">
                  <span>
                    LEARNING OBJECTIVE
                  </span>

                  <p>
                    {activeLesson.objective ||
                      "Explain the lesson topic and apply it in a practical example."}
                  </p>
                </div>

                {renderLessonContent(
                  activeLesson.content ||
                    activeLesson.description ||
                    "",
                )}

                <div className="lessonFooter">
                  <div>
                    {progress.completedLessons.includes(
                      idString(
                        activeLesson.id,
                      ),
                    ) ? (
                      <span className="completedStatus">
                        <CheckCircle2
                          size={18}
                        />
                        Lesson completed
                      </span>
                    ) : (
                      <span className="lessonStatus">
                        Complete this lesson to
                        continue.
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    className="primaryButton"
                    onClick={goNextLesson}
                  >
                    {nextLesson
                      ? "Next lesson"
                      : activeModule?.assessment
                        ? "Take module test"
                        : "Continue"}
                    <ArrowRight size={18} />
                  </button>
                </div>
              </article>
            )}

          {/* =================================================
              TEST INTRO
          ================================================= */}

          {viewMode === "test-intro" &&
            activeAssessment && (
              <AssessmentIntro
                assessment={
                  activeAssessment
                }
                isFinal={false}
                onStart={
                  startAssessment
                }
              />
            )}

          {/* =================================================
              EXAM INTRO
          ================================================= */}

          {viewMode === "exam-intro" &&
            activeAssessment && (
              <AssessmentIntro
                assessment={
                  activeAssessment
                }
                isFinal={true}
                onStart={
                  startAssessment
                }
              />
            )}

          {/* =================================================
              TEST / EXAM
          ================================================= */}

          {(viewMode === "test" ||
            viewMode === "exam") &&
            activeAssessment && (
              <section className="assessmentRunner">
                <div className="assessmentHeader">
                  <div>
                    <span>
                      {viewMode === "exam"
                        ? "FINAL EXAM"
                        : "MODULE TEST"}
                    </span>

                    <h1>
                      {activeAssessment.title ||
                        (viewMode === "exam"
                          ? "Final Exam"
                          : "Module Test")}
                    </h1>
                  </div>

                  <div
                    className={`assessmentTimer ${
                      timeLeft <= 60
                        ? "warning"
                        : ""
                    }`}
                  >
                    <Clock3 size={20} />

                    <strong>
                      {formattedTime}
                    </strong>
                  </div>
                </div>

                <div className="assessmentProgress">
                  <span>
                    Answer all questions before
                    submitting.
                  </span>

                  <span>
                    {
                      assessmentQuestions(
                        activeAssessment,
                      ).length
                    }{" "}
                    questions
                  </span>
                </div>

                <div className="questions">
                  {assessmentQuestions(
                    activeAssessment,
                  ).map(
                    (question, index) => (
                      <QuestionCard
                        key={idString(
                          question.id,
                        )}
                        question={question}
                        questionNumber={
                          index + 1
                        }
                        selected={
                          selectedAnswers[
                            idString(
                              question.id,
                            )
                          ]
                        }
                        submitted={submitted}
                        onSelect={(value) =>
                          setSelectedAnswers(
                            (current) => ({
                              ...current,
                              [idString(
                                question.id,
                              )]: value,
                            }),
                          )
                        }
                      />
                    ),
                  )}
                </div>

                <div className="assessmentSubmitBar">
                  <span>
                    {
                      Object.keys(
                        selectedAnswers,
                      ).length
                    }{" "}
                    of{" "}
                    {
                      assessmentQuestions(
                        activeAssessment,
                      ).length
                    }{" "}
                    answered
                  </span>

                  <button
                    type="button"
                    className="primaryButton"
                    onClick={() =>
                      submitAssessment()
                    }
                    disabled={submitted}
                  >
                    Submit assessment
                    <Check size={18} />
                  </button>
                </div>
              </section>
            )}

          {/* =================================================
              TEST RESULT
          ================================================= */}

          {viewMode === "test-result" &&
            activeAssessment && (
              <section className="assessmentResult">
                <div className="resultIcon">
                  {assessmentScore !== null &&
                  assessmentScore >=
                    assessmentPassingScore(
                      activeAssessment,
                    ) ? (
                    <Trophy size={54} />
                  ) : (
                    <XCircle size={54} />
                  )}
                </div>

                <span className="resultLabel">
                  MODULE TEST RESULT
                </span>

                <h1>
                  {assessmentScore !== null &&
                  assessmentScore >=
                    assessmentPassingScore(
                      activeAssessment,
                    )
                    ? "Module test passed!"
                    : "Module test not passed"}
                </h1>

                <div className="resultScore">
                  {assessmentScore ?? 0}%
                </div>

                <p>
                  Pass mark:{" "}
                  {assessmentPassingScore(
                    activeAssessment,
                  )}
                  %
                </p>

                {assessmentScore !== null &&
                assessmentScore >=
                  assessmentPassingScore(
                    activeAssessment,
                  ) ? (
                  <p>
                    You can continue to the
                    next module.
                  </p>
                ) : (
                  <p>
                    Review the lessons and try
                    the module test again.
                  </p>
                )}

                <div className="resultActions">
                  <button
                    type="button"
                    className="secondaryButton"
                    onClick={
                      resetAssessment
                    }
                  >
                    <RotateCcw size={18} />
                    Try again
                  </button>

                  {assessmentScore !== null &&
                    assessmentScore >=
                      assessmentPassingScore(
                        activeAssessment,
                      ) && (
                      <button
                        type="button"
                        className="primaryButton"
                        onClick={() => {
                          const nextModule =
                            modules[
                              activeModuleIndex +
                                1
                            ];

                          if (nextModule) {
                            const firstLesson =
                              nextModule
                                .lessons?.[0];

                            if (firstLesson) {
                              setActiveModuleIndex(
                                activeModuleIndex +
                                  1,
                              );

                              setActiveLessonId(
                                idString(
                                  firstLesson.id,
                                ),
                              );

                              setViewMode(
                                "lesson",
                              );
                            }
                          } else {
                            openFinalExam();
                          }

                          window.scrollTo({
                            top: 0,
                            behavior:
                              "smooth",
                          });
                        }}
                      >
                        Continue
                        <ArrowRight
                          size={18}
                        />
                      </button>
                    )}
                </div>
              </section>
            )}

          {/* =================================================
              EXAM RESULT
          ================================================= */}

          {viewMode === "exam-result" && (
            <section className="assessmentResult finalResult">
              <div className="resultIcon">
                <Trophy size={54} />
              </div>

              <span className="resultLabel">
                FINAL EXAM RESULT
              </span>

              <h1>
                Final exam completed
              </h1>

              <div className="resultScore">
                {progress.examScore ??
                  assessmentScore ??
                  0}
                %
              </div>

              <p>
                Your final exam score has been
                saved to your course progress.
              </p>

              <Link
                href="/courses"
                className="primaryButton"
              >
                <ArrowLeft size={18} />
                Back to courses
              </Link>
            </section>
          )}

          {/* =================================================
              NO ACTIVE LESSON
          ================================================= */}

          {viewMode === "lesson" &&
            !activeLesson && (
              <div className="lessonEmpty">
                <BookOpen size={44} />

                <h2>
                  No lesson selected
                </h2>

                <p>
                  Select a lesson from the
                  course outline.
                </p>
              </div>
            )}
        </section>
      </div>
    </main>
  );
}