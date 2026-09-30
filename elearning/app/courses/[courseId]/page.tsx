"use client";

import Link from "next/link";
import { LoaderCircle, RefreshCw } from "lucide-react";
import { use, useEffect, useState } from "react";
import type { CourseDetails } from "@/lib/course-types";

export default function CourseDetailsPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = use(params);
  const [course, setCourse] = useState<CourseDetails | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const [activeLessonIndex, setActiveLessonIndex] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState<Record<string, boolean>>({});
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [examScore, setExamScore] = useState<number | null>(null);

  useEffect(() => {
    let active = true;

    fetch(`/api/courses/${courseId}`, { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Course could not be loaded");
        return (await response.json()) as CourseDetails;
      })
      .then((data) => {
        if (active) setCourse(data);
      })
      .catch(() => {
        if (active) setLoadError(true);
      });

    return () => {
      active = false;
    };
  }, [courseId, retryKey]);

  function handleAnswerChange(questionId: string, value: string) {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  }

  function handleSubmitLesson(lessonId: number) {
    const lesson = course?.lessons.find((item) => item.id === lessonId);
    if (!lesson?.quiz) return;

    const correctAnswers = lesson.quiz.questions.filter((question) => {
      const selected = selectedAnswers[question.id];
      return question.options.some((option) => String(option.id) === selected && option.isCorrect);
    }).length;

    const score = Math.round((correctAnswers / lesson.quiz.questions.length) * 100);

    setScores((prev) => ({ ...prev, [lessonId]: score }));
    setSubmitted((prev) => ({ ...prev, [lessonId]: true }));
  }

  function handleSubmitExam() {
    if (!course?.exam) return;

    const correctAnswers = course.exam.questions.filter((question) => {
      const selected = selectedAnswers[question.id];
      return question.options.some((option) => String(option.id) === selected && option.isCorrect);
    }).length;

    setExamScore(Math.round((correctAnswers / course.exam.questions.length) * 100));
  }

  if (loadError) {
    return (
      <main role="alert" style={{ maxWidth: 760, margin: "12vh auto", padding: 32, textAlign: "center" }}>
        <h1 style={{ fontFamily: "Georgia, serif", fontWeight: 500 }}>Course unavailable</h1>
        <p style={{ color: "#607168", lineHeight: 1.6 }}>The course database could not be reached. Check the connection and try again.</p>
        <button type="button" onClick={() => { setLoadError(false); setRetryKey((key) => key + 1); }} style={{ display: "inline-flex", alignItems: "center", gap: 8, minHeight: 40, padding: "0 14px", border: 0, background: "#216448", color: "white", cursor: "pointer" }}>
          <RefreshCw size={16} strokeWidth={1.8} /> Try again
        </button>
        <div style={{ marginTop: 14 }}><Link href="/courses">Back to all courses</Link></div>
      </main>
    );
  }
  if (!course) {
    return (
      <main role="status" aria-live="polite" style={{ display: "grid", minHeight: "50vh", placeContent: "center", justifyItems: "center", gap: 10, color: "#52695b" }}>
        <LoaderCircle size={22} strokeWidth={1.8} />
        <span>Loading course…</span>
      </main>
    );
  }

  const activeLesson = course.lessons[activeLessonIndex];
  if (!activeLesson) {
    return <main style={{ maxWidth: 1200, margin: "0 auto", padding: 32 }}>This course has no lessons yet.</main>;
  }

  const totalCourseProgress = Math.round(
    (Object.values(scores).reduce((sum, value) => sum + value, 0) / Math.max(course.lessons.length * 100, 1)) * 100
  );

  return (
    <main style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 20px 80px" }}>
      <div style={{ marginBottom: 20 }}>
        <Link href="/courses" style={{ color: "#386747", textDecoration: "none", fontWeight: 700, fontSize: 13 }}>
          ← Back to library
        </Link>
      </div>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 2fr) minmax(280px, 0.9fr)",
          gap: 24,
          alignItems: "flex-start",
        }}
      >
        <div>
          <p style={{ margin: 0, letterSpacing: 2, fontSize: 11, color: "#5b7365", textTransform: "uppercase" }}>
            {course.subject}
          </p>
          <h1 style={{ margin: "10px 0 8px", fontSize: 40, fontFamily: "Georgia, serif" }}>{course.title}</h1>
          <p style={{ margin: 0, color: "#607168", lineHeight: 1.8, maxWidth: 760 }}>{course.description}</p>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 12,
              marginTop: 18,
              color: "#4f6358",
              fontSize: 12,
            }}
          >
            <span>Level: {course.level}</span>
            <span>Lessons: {course.lessons.length}</span>
            <span>Duration: {course.durationMinutes} mins</span>
            {course.exam ? <span>Exam: {course.exam.passingScore}% pass</span> : null}
          </div>
        </div>

        <aside
          style={{
            border: "1px solid #e5e9e3",
            borderRadius: 12,
            background: "#fff",
            padding: 18,
          }}
        >
          <p style={{ margin: 0, fontSize: 11, letterSpacing: 1.5, color: "#607168", textTransform: "uppercase" }}>Progress</p>
          <div style={{ marginTop: 16, fontSize: 30, fontFamily: "Georgia, serif" }}>{totalCourseProgress}%</div>
          <div style={{ marginTop: 10, height: 8, background: "#edf0eb", borderRadius: 999, overflow: "hidden" }}>
            <div style={{ width: `${totalCourseProgress}%`, height: "100%", background: "#477155" }} />
          </div>
          <p style={{ marginTop: 14, color: "#607168", fontSize: 12 }}>Strong momentum. Finish the next lesson to unlock more assessment points.</p>
        </aside>
      </section>

      <section style={{ marginTop: 28, display: "grid", gridTemplateColumns: "260px minmax(0, 1fr)", gap: 20 }}>
        <nav
          style={{
            border: "1px solid #e5e9e3",
            borderRadius: 12,
            background: "#fbfcfa",
            padding: 12,
          }}
        >
          <p style={{ margin: "0 0 12px", color: "#5f7367", fontSize: 11, letterSpacing: 1.4, textTransform: "uppercase" }}>Lessons</p>

          {course.lessons.map((lesson, index) => (
            <button
              key={lesson.id}
              type="button"
              onClick={() => setActiveLessonIndex(index)}
              style={{
                display: "block",
                width: "100%",
                border: activeLessonIndex === index ? "1px solid #355d45" : "1px solid #e5e9e3",
                background: activeLessonIndex === index ? "#eaf1eb" : "#fff",
                color: "#2b4637",
                borderRadius: 10,
                marginBottom: 8,
                padding: "10px 12px",
                textAlign: "left",
                cursor: "pointer",
              }}
            >
              {index + 1}. {lesson.title}
            </button>
          ))}

          <div style={{ marginTop: 14, borderTop: "1px solid #edf1ed", paddingTop: 14 }}>
            <p style={{ margin: 0, fontSize: 11, letterSpacing: 1.4, color: "#607168", textTransform: "uppercase" }}>Final exam</p>
            <div style={{ marginTop: 10, fontWeight: 700, color: "#2a4637", fontSize: 13 }}>{course.exam?.title ?? "Not configured"}</div>
          </div>
        </nav>

        <div
          style={{
            border: "1px solid #e5e9e3",
            borderRadius: 14,
            background: "#fff",
            padding: 22,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <div>
              <p style={{ margin: 0, fontSize: 11, color: "#5d7367", letterSpacing: 1.5, textTransform: "uppercase" }}>Lesson {activeLessonIndex + 1}</p>
              <h2 style={{ margin: "8px 0", fontFamily: "Georgia, serif", fontSize: 30 }}>{activeLesson.title}</h2>
            </div>
            <span style={{ fontSize: 12, color: "#50625a", background: "#f2f5f2", padding: "7px 10px", borderRadius: 999 }}>{activeLesson.durationMinutes} mins</span>
          </div>

          <p style={{ color: "#586a60", lineHeight: 1.8, marginTop: 18 }}>{activeLesson.content}</p>

          <div style={{ marginTop: 22, paddingTop: 20, borderTop: "1px solid #edf1ed" }}>
            <p style={{ margin: 0, color: "#4a5e50", fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", fontWeight: 700 }}>Learning objective</p>
            <p style={{ margin: "10px 0 0", color: "#586b5e", lineHeight: 1.7 }}>{activeLesson.objective}</p>
          </div>

          {activeLesson.quiz ? (
          <div style={{ marginTop: 28, border: "1px solid #e6ebe4", borderRadius: 12, padding: 18, background: "#fbfcfa" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <h3 style={{ margin: 0, fontSize: 24, fontFamily: "Georgia, serif" }}>{activeLesson.quiz.title}</h3>
              {submitted[activeLesson.id] ? (
                <span style={{ fontSize: 12, color: scores[activeLesson.id] >= activeLesson.quiz.passingScore ? "#2d6a3d" : "#9a573b", background: scores[activeLesson.id] >= activeLesson.quiz.passingScore ? "#edf7ee" : "#fbf0e9", padding: "6px 10px", borderRadius: 999, fontWeight: 700 }}>
                  {scores[activeLesson.id] >= activeLesson.quiz.passingScore ? "Passed" : "Try again"} · {scores[activeLesson.id]}%
                </span>
              ) : null}
            </div>

            <div style={{ marginTop: 18, display: "grid", gap: 18 }}>
              {activeLesson.quiz.questions.map((question, questionIndex) => (
                <div key={question.id} style={{ border: "1px solid #edf1ed", borderRadius: 10, padding: 14, background: "#fff" }}>
                  <p style={{ margin: "0 0 10px", fontWeight: 700, color: "#324c3d" }}>
                    {questionIndex + 1}. {question.prompt}
                  </p>

                  <div style={{ display: "grid", gap: 8 }}>
                    {question.options.map((option) => (
                      <label key={option.id} style={{ display: "flex", alignItems: "center", gap: 10, color: "#4d5d54", fontSize: 13 }}>
                        <input
                          type="radio"
                          name={`question-${question.id}`}
                          value={option.id}
                          checked={selectedAnswers[question.id] === String(option.id)}
                          onChange={() => handleAnswerChange(String(question.id), String(option.id))}
                          style={{ accentColor: "#294c3a" }}
                        />
                        <span>{option.text}</span>
                      </label>
                    ))}
                  </div>
                  {submitted[activeLesson.id] ? (
                    <p style={{ margin: "12px 0 0", color: "#617267", fontSize: 12, lineHeight: 1.6 }}>
                      {question.explanation} Correct answer: <strong>{question.options.find((option) => option.isCorrect)?.text}</strong>
                    </p>
                  ) : null}
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => handleSubmitLesson(activeLesson.id)}
              style={{
                marginTop: 18,
                background: "#294c3a",
                color: "#fff",
                border: "none",
                borderRadius: 10,
                padding: "12px 16px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Submit quiz
            </button>
            <span style={{ marginLeft: 12, color: "#607168", fontSize: 12 }}>Pass mark: {activeLesson.quiz.passingScore}%</span>
          </div>
          ) : <p style={{ marginTop: 24, color: "#607168" }}>No quiz is configured for this lesson yet.</p>}

          {course.exam ? (
          <div style={{ marginTop: 28, borderTop: "1px solid #edf1ed", paddingTop: 22 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <h3 style={{ margin: 0, fontSize: 24, fontFamily: "Georgia, serif" }}>{course.exam.title}</h3>
              {examScore !== null ? (
                <strong style={{ color: examScore >= course.exam.passingScore ? "#2d6a3d" : "#9a573b", fontSize: 13 }}>
                  {examScore >= course.exam.passingScore ? "Passed" : "Not passed yet"} · {examScore}%
                </strong>
              ) : null}
            </div>
            <p style={{ color: "#5d7367", marginTop: 10 }}>{course.exam.durationMinutes ?? "Untimed"} mins · {course.exam.questions.length} questions · {course.exam.passingScore}% to pass</p>
            <div style={{ display: "grid", gap: 14, marginTop: 18 }}>
              {course.exam.questions.map((question, questionIndex) => (
                <div key={question.id} style={{ border: "1px solid #edf1ed", borderRadius: 10, padding: 14 }}>
                  <p style={{ margin: "0 0 10px", fontWeight: 700, color: "#324c3d" }}>{questionIndex + 1}. {question.prompt}</p>
                  <div style={{ display: "grid", gap: 8 }}>
                    {question.options.map((option) => (
                      <label key={option.id} style={{ display: "flex", alignItems: "center", gap: 10, color: "#4d5d54", fontSize: 13 }}>
                        <input
                          type="radio"
                          name={`question-${question.id}`}
                          value={option.id}
                          checked={selectedAnswers[question.id] === String(option.id)}
                          onChange={() => handleAnswerChange(String(question.id), String(option.id))}
                          style={{ accentColor: "#294c3a" }}
                        />
                        <span>{option.text}</span>
                      </label>
                    ))}
                  </div>
                  {examScore !== null ? (
                    <p style={{ margin: "12px 0 0", color: "#617267", fontSize: 12, lineHeight: 1.6 }}>
                      {question.explanation} Correct answer: <strong>{question.options.find((option) => option.isCorrect)?.text}</strong>
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={handleSubmitExam}
              style={{
                marginTop: 18,
                background: "#294c3a",
                color: "#fff",
                border: "none",
                borderRadius: 10,
                padding: "12px 16px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Submit final exam
            </button>
          </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
