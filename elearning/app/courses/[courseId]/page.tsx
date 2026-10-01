"use client";

import Link from "next/link";
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
import { use, useEffect, useMemo, useState } from "react";
import type {
  CourseAssessment,
  CourseDetails,
  CourseLesson,
  CourseModule,
  CourseQuestion,
} from "@/lib/course-types";
import styles from "./course-details.module.css";

type ViewMode =
  | "lesson"
  | "test-intro"
  | "test"
  | "test-result"
  | "exam-intro"
  | "exam"
  | "exam-result";

type SavedProgress = {
  completedLessons: number[];
  passedModules: number[];
  examScore: number | null;
};

const emptyProgress: SavedProgress = {
  completedLessons: [],
  passedModules: [],
  examScore: null,
};

function formatInlineText(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);

  return parts.map((part, index) => {
    if (
      part.startsWith("**") &&
      part.endsWith("**")
    ) {
      return (
        <strong key={index}>
          {part.slice(2, -2)}
        </strong>
      );
    }

    return <span key={index}>{part}</span>;
  });
}

function renderLessonContent(content: string | null) {
  if (!content) {
    return (
      <p className={styles.emptyContent}>
        No lesson content has been added yet.
      </p>
    );
  }

  const lines = content.replace(/\r/g, "").split("\n");
  const blocks: React.ReactNode[] = [];

  let paragraph: string[] = [];
  let listItems: string[] = [];

  const flushParagraph = () => {
    if (!paragraph.length) return;

    const value = paragraph.join(" ").trim();

    if (value) {
      blocks.push(
        <p key={`p-${blocks.length}`}>
          {formatInlineText(value)}
        </p>,
      );
    }

    paragraph = [];
  };

  const flushList = () => {
    if (!listItems.length) return;

    blocks.push(
      <ul key={`ul-${blocks.length}`}>
        {listItems.map((item, index) => (
          <li key={`${item}-${index}`}>
            {formatInlineText(item)}
          </li>
        ))}
      </ul>,
    );

    listItems = [];
  };

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i].trim();

    if (!line) {
      flushParagraph();
      flushList();
      continue;
    }

    if (line.startsWith("# ")) {
      flushParagraph();
      flushList();

      blocks.push(
        <h2 key={`h2-${blocks.length}`}>
          {formatInlineText(line.slice(2))}
        </h2>,
      );

      continue;
    }

    if (line.startsWith("## ")) {
      flushParagraph();
      flushList();

      blocks.push(
        <h3 key={`h3-${blocks.length}`}>
          {formatInlineText(line.slice(3))}
        </h3>,
      );

      continue;
    }

    if (line.startsWith("### ")) {
      flushParagraph();
      flushList();

      blocks.push(
        <h4 key={`h4-${blocks.length}`}>
          {formatInlineText(line.slice(4))}
        </h4>,
      );

      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      flushParagraph();

      listItems.push(
        line.replace(/^[-*]\s+/, ""),
      );

      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      flushParagraph();

      listItems.push(
        line.replace(/^\d+\.\s+/, ""),
      );

      continue;
    }

    if (line.startsWith("|")) {
      flushParagraph();
      flushList();

      const cells = line
        .split("|")
        .map((cell) => cell.trim())
        .filter(Boolean);

      const nextLine = lines[i + 1]?.trim() ?? "";

      if (/^\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)+\|?$/.test(nextLine)) {
        i += 1;

        blocks.push(
          <div
            key={`table-${blocks.length}`}
            className={styles.tableWrap}
          >
            <table>
              <thead>
                <tr>
                  {cells.map((cell, index) => (
                    <th key={`${cell}-${index}`}>
                      {formatInlineText(cell)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const rows: React.ReactNode[] = [];

                  let cursor = i + 1;

                  while (
                    cursor < lines.length &&
                    lines[cursor].trim().startsWith("|")
                  ) {
                    const rowCells = lines[cursor]
                      .trim()
                      .split("|")
                      .map((cell) => cell.trim())
                      .filter(Boolean);

                    rows.push(
                      <tr key={`row-${cursor}`}>
                        {rowCells.map((cell, index) => (
                          <td key={`${cell}-${index}`}>
                            {formatInlineText(cell)}
                          </td>
                        ))}
                      </tr>,
                    );

                    cursor += 1;
                  }

                  i = cursor - 1;

                  return rows;
                })()}
              </tbody>
            </table>
          </div>,
        );
      }

      continue;
    }

    paragraph.push(line);
  }

  flushParagraph();
  flushList();

  return <div className={styles.lessonContent}>{blocks}</div>;
}

function QuestionCard({
  question,
  questionNumber,
  selected,
  onSelect,
  showAnswer,
}: {
  question: CourseQuestion;
  questionNumber: number;
  selected: string | null;
  onSelect: (optionId: string) => void;
  showAnswer?: boolean;
}) {
  return (
    <article className={styles.questionCard}>
      <div className={styles.questionNumber}>
        Question {questionNumber}
      </div>

      <h3>
        {question.prompt}
      </h3>

      <div className={styles.options}>
        {question.options.map((option) => {
          const optionId = String(option.id);
          const isSelected = selected === optionId;
          const isCorrect = option.isCorrect;

          let className = styles.option;

          if (isSelected) {
            className += ` ${styles.optionSelected}`;
          }

          if (
            showAnswer &&
            isCorrect
          ) {
            className += ` ${styles.optionCorrect}`;
          }

          if (
            showAnswer &&
            isSelected &&
            !isCorrect
          ) {
            className += ` ${styles.optionWrong}`;
          }

          return (
            <label
              key={option.id}
              className={className}
            >
              <input
                type="radio"
                name={`question-${question.id}`}
                value={optionId}
                checked={isSelected}
                onChange={() =>
                  onSelect(optionId)
                }
              />

              <span className={styles.optionLetter}>
                {option.key ??
                  String.fromCharCode(
                    65 + option.position - 1,
                  )}
              </span>

              <span className={styles.optionText}>
                {option.text}
              </span>

              {showAnswer &&
              isCorrect ? (
                <Check size={17} />
              ) : null}

              {showAnswer &&
              isSelected &&
              !isCorrect ? (
                <XCircle size={17} />
              ) : null}
            </label>
          );
        })}
      </div>

      {showAnswer &&
      (question.explanation ||
        question.options.some(
          (option) => option.isCorrect,
        )) ? (
        <div className={styles.answerExplanation}>
          <strong>Explanation</strong>
          <p>
            {question.explanation ||
              "Review the lesson material for this question."}
          </p>
        </div>
      ) : null}
    </article>
  );
}

function AssessmentIntro({
  assessment,
  title,
  description,
  onStart,
}: {
  assessment: CourseAssessment;
  title: string;
  description: string;
  onStart: () => void;
}) {
  return (
    <section className={styles.assessmentIntro}>
      <img
        src="/assessment-illustration.svg"
        alt=""
        className={styles.assessmentImage}
      />

      <div className={styles.assessmentIntroBody}>
        <span className={styles.assessmentEyebrow}>
          Assessment
        </span>

        <h2>{title}</h2>

        <p className={styles.assessmentDescription}>
          {description}
        </p>

        <div className={styles.assessmentStats}>
          <div>
            <BookOpen size={18} />
            <strong>
              {assessment.questions.length}
            </strong>
            <span>Questions</span>
          </div>

          <div>
            <Clock3 size={18} />
            <strong>
              {assessment.durationMinutes ?? "—"}
            </strong>
            <span>Minutes</span>
          </div>

          <div>
            <Trophy size={18} />
            <strong>
              {assessment.passingScore}%
            </strong>
            <span>Pass mark</span>
          </div>
        </div>

        <div className={styles.readyMessage}>
          <div className={styles.readyIcon}>
            <GraduationCap size={22} />
          </div>

          <div>
            <strong>
              Do you want to start your test now?
            </strong>

            <p>
              Make sure you have completed the
              lessons in this section before
              beginning the assessment.
            </p>
          </div>
        </div>

        <button
          type="button"
          className={styles.primaryButton}
          onClick={onStart}
        >
          Start {assessment.type === "final_exam" ? "Final Exam" : "Test"}
          <ArrowRight size={18} />
        </button>
      </div>
    </section>
  );
}

export default function CourseDetailsPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = use(params);

  const [course, setCourse] =
    useState<CourseDetails | null>(null);

  const [loadError, setLoadError] =
    useState(false);

  const [activeModuleIndex, setActiveModuleIndex] =
    useState(0);

  const [activeLessonId, setActiveLessonId] =
    useState<number | null>(null);

  const [viewMode, setViewMode] =
    useState<ViewMode>("lesson");

  const [selectedAnswers, setSelectedAnswers] =
    useState<Record<number, string>>({});

  const [assessmentScore, setAssessmentScore] =
    useState<number | null>(null);

  const [savedProgress, setSavedProgress] =
    useState<SavedProgress>(emptyProgress);

  const [timeLeft, setTimeLeft] =
    useState(0);

  const [activeAssessment, setActiveAssessment] =
    useState<CourseAssessment | null>(null);

  useEffect(() => {
    const controller =
      new AbortController();

    fetch(
      `/api/courses/${courseId}`,
      {
        cache: "no-store",
        signal: controller.signal,
      },
    )
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(
            "Course could not be loaded",
          );
        }

        return (await response.json()) as CourseDetails;
      })
      .then((data) => {
        setCourse(data);

        if (data.modules.length > 0) {
          setActiveModuleIndex(0);

          if (
            data.modules[0].lessons.length > 0
          ) {
            setActiveLessonId(
              data.modules[0].lessons[0].id,
            );
          }
        }
      })
      .catch((error: unknown) => {
        if (
          error instanceof Error &&
          error.name === "AbortError"
        ) {
          return;
        }

        setLoadError(true);
      });

    return () =>
      controller.abort();
  }, [courseId]);

  useEffect(() => {
    try {
      const raw =
        localStorage.getItem(
          `fieldnote-progress-${courseId}`,
        );

      if (!raw) return;

      const parsed =
        JSON.parse(raw) as SavedProgress;

      setSavedProgress({
        completedLessons:
          Array.isArray(
            parsed.completedLessons,
          )
            ? parsed.completedLessons
            : [],
        passedModules:
          Array.isArray(
            parsed.passedModules,
          )
            ? parsed.passedModules
            : [],
        examScore:
          typeof parsed.examScore ===
          "number"
            ? parsed.examScore
            : null,
      });
    } catch {
      // Ignore invalid local progress.
    }
  }, [courseId]);

  useEffect(() => {
    try {
      localStorage.setItem(
        `fieldnote-progress-${courseId}`,
        JSON.stringify(savedProgress),
      );
    } catch {
      // Ignore localStorage failures.
    }
  }, [courseId, savedProgress]);

  useEffect(() => {
    if (
      viewMode !== "test" &&
      viewMode !== "exam"
    ) {
      return;
    }

    if (timeLeft <= 0) {
      if (activeAssessment) {
        handleSubmitAssessment(true);
      }

      return;
    }

    const timer =
      window.setInterval(() => {
        setTimeLeft(
          (current) =>
            Math.max(current - 1, 0),
        );
      }, 1000);

    return () =>
      window.clearInterval(timer);
  }, [
    viewMode,
    timeLeft,
    activeAssessment,
  ]);

  const activeModule =
    course?.modules[
      activeModuleIndex
    ] ?? null;

  const activeLesson =
    activeModule?.lessons.find(
      (lesson) =>
        lesson.id === activeLessonId,
    ) ??
    activeModule?.lessons[0] ??
    null;

  const moduleCompletedCount =
    course?.modules.map(
      (module) =>
        module.lessons.filter(
          (lesson) =>
            savedProgress.completedLessons.includes(
              lesson.id,
            ),
        ).length,
    ) ?? [];

  const totalCompletedLessons =
    savedProgress.completedLessons.length;

  const totalLessons =
    course?.lessonCount ?? 0;

  const overallProgress =
    totalLessons > 0
      ? Math.round(
          (totalCompletedLessons /
            totalLessons) *
            100,
        )
      : 0;

  const allModulesPassed =
    Boolean(
      course &&
        course.modules.length > 0 &&
        course.modules.every(
          (module) =>
            savedProgress.passedModules.includes(
              module.id,
            ),
        ),
    );

  const activeModuleComplete =
    Boolean(
      activeModule &&
        activeModule.lessons.length > 0 &&
        activeModule.lessons.every(
          (lesson) =>
            savedProgress.completedLessons.includes(
              lesson.id,
            ),
        ),
    );

  const currentLessonPosition =
    activeModule && activeLesson
      ? activeModule.lessons.findIndex(
          (lesson) =>
            lesson.id ===
            activeLesson.id,
        )
      : -1;

  const nextLesson =
    activeModule &&
    currentLessonPosition >= 0 &&
    currentLessonPosition <
      activeModule.lessons.length - 1
      ? activeModule.lessons[
          currentLessonPosition + 1
        ]
      : null;

  const nextModule =
    course &&
    activeModuleIndex <
      course.modules.length - 1
      ? course.modules[
          activeModuleIndex + 1
        ]
      : null;

  const formattedTime =
    `${String(
      Math.floor(timeLeft / 60),
    ).padStart(2, "0")}:${String(
      timeLeft % 60,
    ).padStart(2, "0")}`;

  const assessmentProgressText =
    activeAssessment
      ? `${Object.keys(selectedAnswers).length} / ${activeAssessment.questions.length} answered`
      : "";

  function saveLessonCompletion(
    lessonId: number,
  ) {
    setSavedProgress(
      (previous) => ({
        ...previous,
        completedLessons:
          previous.completedLessons.includes(
            lessonId,
          )
            ? previous.completedLessons
            : [
                ...previous.completedLessons,
                lessonId,
              ],
      }),
    );
  }

  function startAssessment(
    assessment: CourseAssessment,
    nextMode: "test" | "exam",
  ) {
    setActiveAssessment(
      assessment,
    );

    setSelectedAnswers({});
    setAssessmentScore(null);

    setTimeLeft(
      (assessment.durationMinutes ?? 30) *
        60,
    );

    setViewMode(nextMode);
  }

  function handleSubmitAssessment(
    automatic = false,
  ) {
    if (!activeAssessment) return;

    const total =
      activeAssessment.questions.length;

    if (!total) {
      setAssessmentScore(0);
      return;
    }

    const correct =
      activeAssessment.questions.filter(
        (question) => {
          const selected =
            selectedAnswers[
              question.id
            ];

          return question.options.some(
            (option) =>
              String(option.id) ===
                selected &&
              option.isCorrect,
          );
        },
      ).length;

    const score = Math.round(
      (correct / total) * 100,
    );

    setAssessmentScore(score);

    if (
      activeAssessment.type ===
        "module_test" &&
      activeModule
    ) {
      if (
        score >=
        activeAssessment.passingScore
      ) {
        setSavedProgress(
          (previous) => ({
            ...previous,
            passedModules:
              previous.passedModules.includes(
                activeModule.id,
              )
                ? previous.passedModules
                : [
                    ...previous.passedModules,
                    activeModule.id,
                  ],
          }),
        );
      }

      setViewMode("test-result");
    } else {
      setSavedProgress(
        (previous) => ({
          ...previous,
          examScore: score,
        }),
      );

      setViewMode("exam-result");
    }

    if (automatic) {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }

  function openLesson(
    moduleIndex: number,
    lessonId: number,
  ) {
    const selectedModule =
      course?.modules[moduleIndex];

    if (!selectedModule) return;

    setActiveModuleIndex(
      moduleIndex,
    );

    setActiveLessonId(
      lessonId,
    );

    setViewMode("lesson");

    setActiveAssessment(
      null,
    );

    setAssessmentScore(null);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function goNextLesson() {
    if (!activeLesson) return;

    saveLessonCompletion(
      activeLesson.id,
    );

    if (nextLesson) {
      setActiveLessonId(
        nextLesson.id,
      );

      return;
    }

    if (activeModule) {
      const moduleLessonsComplete =
        activeModule.lessons.every(
          (lesson) =>
            savedProgress.completedLessons.includes(
              lesson.id,
            ) ||
            lesson.id ===
              activeLesson.id,
        );

      if (
        moduleLessonsComplete &&
        activeModule.test
      ) {
        setActiveAssessment(
          activeModule.test,
        );

        setViewMode("test-intro");

        return;
      }
    }

    if (nextModule) {
      setActiveModuleIndex(
        activeModuleIndex + 1,
      );

      setActiveLessonId(
        nextModule.lessons[0]?.id ??
          null,
      );

      return;
    }

    if (
      allModulesPassed &&
      course?.exam
    ) {
      setActiveAssessment(
        course.exam,
      );

      setViewMode("exam-intro");
    }
  }

  function resetCurrentAssessment() {
    if (!activeAssessment) return;

    setSelectedAnswers({});
    setAssessmentScore(null);

    setTimeLeft(
      (activeAssessment.durationMinutes ??
        30) * 60,
    );

    setViewMode(
      activeAssessment.type ===
        "final_exam"
        ? "exam"
        : "test",
    );
  }

  function goToNextModule() {
    if (!course) return;

    const nextIndex =
      activeModuleIndex + 1;

    if (
      nextIndex >=
      course.modules.length
    ) {
      if (course.exam) {
        setActiveAssessment(
          course.exam,
        );

        setViewMode("exam-intro");
      }

      return;
    }

    const module =
      course.modules[nextIndex];

    setActiveModuleIndex(
      nextIndex,
    );

    setActiveLessonId(
      module.lessons[0]?.id ??
        null,
    );

    setViewMode("lesson");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  if (loadError) {
    return (
      <main className={styles.page}>
        <section className={styles.errorState}>
          <XCircle size={36} />
          <h1>Course unavailable</h1>
          <p>
            The course database could not
            be reached.
          </p>

          <Link
            href="/courses"
            className={styles.primaryButton}
          >
            Back to library
          </Link>
        </section>
      </main>
    );
  }

  if (!course) {
    return (
      <main className={styles.page}>
        <div className={styles.loadingState}>
          <span className={styles.loadingSpinner} />
          <p>Loading course...</p>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <header className={styles.courseHeader}>
        <div className={styles.headerInner}>
          <Link
            href="/courses"
            className={styles.backLink}
          >
            <ArrowLeft size={16} />
            Back to library
          </Link>

          <div className={styles.headerGrid}>
            <div>
              <span className={styles.kicker}>
                {course.subject}
              </span>

              <h1>{course.title}</h1>

              <p className={styles.courseDescription}>
                {course.description}
              </p>

              <div className={styles.metaRow}>
                <span>
                  {course.level}
                </span>

                <span>
                  {course.lessonCount} lessons
                </span>

                <span>
                  {course.modules.length} modules
                </span>

                <span>
                  {course.modules.length} tests
                </span>

                {course.exam ? (
                  <span>
                    Final exam
                  </span>
                ) : null}
              </div>
            </div>

            <aside
              className={
                styles.progressCard
              }
            >
              <span>
                COURSE PROGRESS
              </span>

              <strong>
                {overallProgress}%
              </strong>

              <div
                className={
                  styles.progressTrack
                }
              >
                <div
                  className={
                    styles.progressFill
                  }
                  style={{
                    width: `${overallProgress}%`,
                  }}
                />
              </div>

              <small>
                {totalCompletedLessons} of{" "}
                {totalLessons} lessons
                completed
              </small>
            </aside>
          </div>
        </div>
      </header>

      <div className={styles.pageGrid}>
        <aside className={styles.sidebar}>
          <div className={styles.sidebarTitle}>
            <BookOpen size={17} />
            Course outline
          </div>

          <div className={styles.moduleList}>
            {course.modules.map(
              (module, moduleIndex) => {
                const completed =
                  moduleCompletedCount[
                    moduleIndex
                  ] ?? 0;

                const complete =
                  completed ===
                    module.lessons
                      .length &&
                  module.lessons.length >
                    0;

                const passed =
                  savedProgress.passedModules.includes(
                    module.id,
                  );

                return (
                  <section
                    key={module.id}
                    className={`${styles.moduleNav} ${
                      activeModuleIndex ===
                      moduleIndex
                        ? styles.moduleNavActive
                        : ""
                    }`}
                  >
                    <button
                      type="button"
                      className={
                        styles.moduleHeading
                      }
                      onClick={() => {
                        setActiveModuleIndex(
                          moduleIndex,
                        );

                        setActiveLessonId(
                          module.lessons[0]
                            ?.id ?? null,
                        );

                        setViewMode(
                          "lesson",
                        );
                      }}
                    >
                      <div>
                        <span>
                          MODULE{" "}
                          {
                            module.moduleCode
                          }
                        </span>

                        <strong>
                          {module.title}
                        </strong>
                      </div>

                      {passed ? (
                        <CheckCircle2
                          size={18}
                        />
                      ) : complete ? (
                        <Check
                          size={18}
                        />
                      ) : null}
                    </button>

                    <div
                      className={
                        styles.lessonNav
                      }
                    >
                      {module.lessons.map(
                        (
                          lesson,
                        ) => {
                          const done =
                            savedProgress.completedLessons.includes(
                              lesson.id,
                            );

                          return (
                            <button
                              key={
                                lesson.id
                              }
                              type="button"
                              className={`${styles.lessonNavButton} ${
                                activeLessonId ===
                                  lesson.id &&
                                viewMode ===
                                  "lesson"
                                  ? styles.lessonNavActive
                                  : ""
                              }`}
                              onClick={() =>
                                openLesson(
                                  moduleIndex,
                                  lesson.id,
                                )
                              }
                            >
                              <span
                                className={
                                  styles.lessonNumber
                                }
                              >
                                {lesson.lessonCode}
                              </span>

                              <span>
                                {
                                  lesson.title
                                }
                              </span>

                              {done ? (
                                <Check
                                  size={
                                    14
                                  }
                                  className={
                                    styles.completedIcon
                                  }
                                />
                              ) : null}
                            </button>
                          );
                        },
                      )}
                    </div>

                    <button
                      type="button"
                      className={
                        styles.sidebarTestButton
                      }
                      disabled={
                        !complete
                      }
                      onClick={() => {
                        if (
                          module.test
                        ) {
                          setActiveModuleIndex(
                            moduleIndex,
                          );

                          setActiveAssessment(
                            module.test,
                          );

                          setViewMode(
                            "test-intro",
                          );
                        }
                      }}
                    >
                      {complete ? (
                        passed ? (
                          <CheckCircle2
                            size={15}
                          />
                        ) : (
                          <GraduationCap
                            size={15}
                          />
                        )
                      ) : (
                        <Lock
                          size={15}
                        />
                      )}

                      <span>
                        {passed
                          ? "Module test passed"
                          : "Module test"}
                      </span>
                    </button>
                  </section>
                );
              },
            )}
          </div>

          {course.exam ? (
            <div
              className={
                styles.examNavCard
              }
            >
              <div>
                <span>
                  FINAL EXAM
                </span>

                <strong>
                  {allModulesPassed
                    ? "Ready to start"
                    : "Complete all module tests"}
                </strong>
              </div>

              <button
                type="button"
                disabled={
                  !allModulesPassed
                }
                onClick={() => {
                  setActiveAssessment(
                    course.exam,
                  );

                  setViewMode(
                    "exam-intro",
                  );
                }}
              >
                {allModulesPassed ? (
                  <ArrowRight
                    size={17}
                  />
                ) : (
                  <Lock
                    size={17}
                  />
                )}
              </button>
            </div>
          ) : null}
        </aside>

        <section className={styles.workspace}>
          {viewMode === "lesson" &&
          activeLesson ? (
            <>
              <article
                className={
                  styles.lessonCard
                }
              >
                <div
                  className={
                    styles.lessonTop
                  }
                >
                  <div>
                    <span
                      className={
                        styles.lessonKicker
                      }
                    >
                      MODULE{" "}
                      {
                        activeModule?.moduleCode
                      }{" "}
                      ·{" "}
                      {
                        activeLesson.lessonCode
                      }
                    </span>

                    <h2>
                      {
                        activeLesson.title
                      }
                    </h2>
                  </div>

                  <span
                    className={
                      styles.duration
                    }
                  >
                    <Clock3 size={15} />
                    {
                      activeLesson.durationMinutes
                    }{" "}
                    mins
                  </span>
                </div>

                {activeLesson.objective ? (
                  <div
                    className={
                      styles.objectiveBox
                    }
                  >
                    <span>
                      LEARNING OBJECTIVE
                    </span>

                    <p>
                      {
                        activeLesson.objective
                      }
                    </p>
                  </div>
                ) : null}

                <div
                  className={
                    styles.contentReader
                  }
                >
                  {renderLessonContent(
                    activeLesson.content,
                  )}
                </div>

                {activeLesson.summary ? (
                  <div
                    className={
                      styles.summaryBox
                    }
                  >
                    <span>
                      LESSON SUMMARY
                    </span>

                    <p>
                      {
                        activeLesson.summary
                      }
                    </p>
                  </div>
                ) : null}

                <footer
                  className={
                    styles.lessonFooter
                  }
                >
                  <span>
                    Lesson{" "}
                    {currentLessonPosition +
                      1}{" "}
                    of{" "}
                    {
                      activeModule
                        ?.lessons.length
                    }
                  </span>

                  <button
                    type="button"
                    className={
                      styles.primaryButton
                    }
                    onClick={
                      goNextLesson
                    }
                  >
                    {nextLesson
                      ? "Complete lesson & continue"
                      : activeModuleComplete
                        ? "Continue to module test"
                        : "Complete lesson"}
                    <ArrowRight
                      size={17}
                    />
                  </button>
                </footer>
              </article>
            </>
          ) : null}

          {viewMode === "test-intro" &&
          activeAssessment ? (
            <AssessmentIntro
              assessment={
                activeAssessment
              }
              title={
                activeAssessment.title
              }
              description={
                activeAssessment.description ||
                "This test checks your understanding of the lessons you have completed in this module."
              }
              onStart={() =>
                startAssessment(
                  activeAssessment,
                  "test",
                )
              }
            />
          ) : null}

          {viewMode === "exam-intro" &&
          activeAssessment ? (
            <AssessmentIntro
              assessment={
                activeAssessment
              }
              title={
                activeAssessment.title
              }
              description={
                activeAssessment.description ||
                "This final examination covers the complete course."
              }
              onStart={() =>
                startAssessment(
                  activeAssessment,
                  "exam",
                )
              }
            />
          ) : null}

          {(viewMode === "test" ||
            viewMode === "exam") &&
          activeAssessment ? (
            <section
              className={
                styles.assessmentRunner
              }
            >
              <div
                className={
                  styles.runnerHeader
                }
              >
                <div>
                  <span>
                    {activeAssessment.type ===
                    "final_exam"
                      ? "FINAL EXAMINATION"
                      : "MODULE TEST"}
                  </span>

                  <h2>
                    {
                      activeAssessment.title
                    }
                  </h2>
                </div>

                <div
                  className={
                    styles.timer
                  }
                >
                  <Clock3 size={18} />
                  {formattedTime}
                </div>
              </div>

              <div
                className={
                  styles.runnerMeta
                }
              >
                <span>
                  {assessmentProgressText}
                </span>

                <span>
                  Pass mark:{" "}
                  {
                    activeAssessment.passingScore
                  }
                  %
                </span>
              </div>

              <div
                className={
                  styles.questionNavigation
                }
              >
                {activeAssessment.questions.map(
                  (
                    question,
                    index,
                  ) => (
                    <button
                      type="button"
                      key={
                        question.id
                      }
                      className={
                        selectedAnswers[
                          question.id
                        ]
                          ? styles.questionDotAnswered
                          : styles.questionDot
                      }
                      onClick={() => {
                        document
                          .getElementById(
                            `question-${question.id}`,
                          )
                          ?.scrollIntoView({
                            behavior:
                              "smooth",
                            block:
                              "center",
                          });
                      }}
                    >
                      {index + 1}
                    </button>
                  ),
                )}
              </div>

              <div
                className={
                  styles.questionList
                }
              >
                {activeAssessment.questions.map(
                  (
                    question,
                    index,
                  ) => (
                    <div
                      id={`question-${question.id}`}
                      key={
                        question.id
                      }
                    >
                      <QuestionCard
                        question={
                          question
                        }
                        questionNumber={
                          index + 1
                        }
                        selected={
                          selectedAnswers[
                            question.id
                          ] ??
                          null
                        }
                        onSelect={(
                          optionId,
                        ) =>
                          setSelectedAnswers(
                            (previous) => ({
                              ...previous,
                              [question.id]:
                                optionId,
                            }),
                          )
                        }
                      />
                    </div>
                  ),
                )}
              </div>

              <div
                className={
                  styles.submitBar
                }
              >
                <div>
                  <strong>
                    Ready to submit?
                  </strong>

                  <span>
                    You can review
                    your answers
                    before submitting.
                  </span>
                </div>

                <button
                  type="button"
                  className={
                    styles.primaryButton
                  }
                  onClick={() =>
                    handleSubmitAssessment(
                      false,
                    )
                  }
                >
                  Submit{" "}
                  {activeAssessment.type ===
                  "final_exam"
                    ? "exam"
                    : "test"}
                  <Check
                    size={17}
                  />
                </button>
              </div>
            </section>
          ) : null}

          {(viewMode ===
            "test-result" ||
            viewMode ===
              "exam-result") &&
          activeAssessment ? (
            <section
              className={
                styles.resultCard
              }
            >
              <div
                className={
                  styles.resultIcon
                }
              >
                {assessmentScore !==
                null &&
                assessmentScore >=
                  activeAssessment.passingScore ? (
                  <Trophy
                    size={34}
                  />
                ) : (
                  <XCircle
                    size={34}
                  />
                )}
              </div>

              <span
                className={
                  styles.resultEyebrow
                }
              >
                {activeAssessment.type ===
                "final_exam"
                  ? "FINAL EXAM RESULT"
                  : "MODULE TEST RESULT"}
              </span>

              <h2>
                {assessmentScore !==
                  null &&
                assessmentScore >=
                  activeAssessment.passingScore
                  ? "Assessment passed"
                  : "Keep going"}
              </h2>

              <div
                className={
                  styles.scoreCircle
                }
              >
                <strong>
                  {assessmentScore ?? 0}%
                </strong>

                <span>
                  score
                </span>
              </div>

              <p>
                Pass mark:{" "}
                {
                  activeAssessment.passingScore
                }%
              </p>

              {assessmentScore !==
                null &&
              assessmentScore >=
                activeAssessment.passingScore ? (
                <p
                  className={
                    styles.resultMessage
                  }
                >
                  Great work. You have
                  successfully completed
                  this assessment.
                </p>
              ) : (
                <p
                  className={
                    styles.resultMessage
                  }
                >
                  You need at least{" "}
                  {
                    activeAssessment.passingScore
                  }% to pass. Review the
                  lessons and try again.
                </p>
              )}

              <div
                className={
                  styles.resultActions
                }
              >
                <button
                  type="button"
                  className={
                    styles.secondaryButton
                  }
                  onClick={
                    resetCurrentAssessment
                  }
                >
                  <RotateCcw
                    size={17}
                  />
                  Try again
                </button>

                {activeAssessment.type ===
                  "module_test" &&
                assessmentScore !==
                  null &&
                assessmentScore >=
                  activeAssessment.passingScore ? (
                  <button
                    type="button"
                    className={
                      styles.primaryButton
                    }
                    onClick={
                      goToNextModule
                    }
                  >
                    Continue to next module
                    <ArrowRight
                      size={17}
                    />
                  </button>
                ) : null}

                {activeAssessment.type ===
                  "final_exam" &&
                assessmentScore !==
                  null &&
                assessmentScore >=
                  activeAssessment.passingScore ? (
                  <Link
                    href="/courses"
                    className={
                      styles.primaryButton
                    }
                  >
                    Back to library
                    <ArrowRight
                      size={17}
                    />
                  </Link>
                ) : null}
              </div>
            </section>
          ) : null}
        </section>
      </div>
    </main>
  );
}