"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { courseCatalog } from "../..//data/courseSeed";

export default function CourseDetailsPage({ params }: { params: { courseId: string } }) {
  const course = useMemo(
    () => courseCatalog.find((item) => item.id === params.courseId) ?? courseCatalog[0],
    [params.courseId]
  );

  const [activeLessonIndex, setActiveLessonIndex] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState<Record<string, boolean>>({});
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});

  const activeLesson = course.lessons[activeLessonIndex];

  function handleAnswerChange(questionId: string, value: string) {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  }

  function handleSubmitLesson(lessonId: string) {
    const lesson = course.lessons.find((item) => item.id === lessonId);
    if (!lesson) return;

    const correctAnswers = lesson.quiz.questions.filter((question) => {
      const selected = selectedAnswers[question.id];
      return selected === question.answer;
    }).length;

    const score = Math.round((correctAnswers / lesson.quiz.questions.length) * 100);

    setScores((prev) => ({ ...prev, [lessonId]: score }));
    setSubmitted((prev) => ({ ...prev, [lessonId]: true }));
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
            <span>Duration: {course.duration}</span>
            <span>Exam: {course.exam.passingScore}% pass</span>
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
                textAlign: "left",
                padding: "10px 12px",
                marginBottom: 8,
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              {index + 1}. {lesson.title}
            </button>
          ))}

          <div style={{ marginTop: 14, borderTop: "1px solid #edf1ed", paddingTop: 14 }}>
            <p style={{ margin: 0, fontSize: 11, letterSpacing: 1.4, color: "#607168", textTransform: "uppercase" }}>Final exam</p>
            <div style={{ marginTop: 10, fontWeight: 700, color: "#2a4637", fontSize: 13 }}>{course.exam.title}</div>
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
            <span style={{ fontSize: 12, color: "#50625a", background: "#f2f5f2", padding: "7px 10px", borderRadius: 999 }}>{activeLesson.duration}</span>
          </div>

          <p style={{ color: "#586a60", lineHeight: 1.8, marginTop: 18 }}>{activeLesson.content}</p>

          <div style={{ marginTop: 22, paddingTop: 20, borderTop: "1px solid #edf1ed" }}>
            <p style={{ margin: 0, color: "#4a5e50", fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", fontWeight: 700 }}>Learning objective</p>
            <p style={{ margin: "10px 0 0", color: "#586b5e", lineHeight: 1.7 }}>{activeLesson.objective}</p>
          </div>

          <div style={{ marginTop: 28, border: "1px solid #e6ebe4", borderRadius: 12, padding: 18, background: "#fbfcfa" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <h3 style={{ margin: 0, fontSize: 24, fontFamily: "Georgia, serif" }}>{activeLesson.quiz.title}</h3>
              {submitted[activeLesson.id] ? (
                <span style={{ fontSize: 12, color: "#2d6a3d", background: "#edf7ee", padding: "6px 10px", borderRadius: 999, fontWeight: 700 }}>
                  Score: {scores[activeLesson.id]}%
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
                      <label key={option} style={{ display: "flex", alignItems: "center", gap: 10, color: "#4d5d54", fontSize: 13 }}>
                        <input
                          type="radio"
                          name={question.id}
                          value={option}
                          checked={selectedAnswers[question.id] === option}
                          onChange={() => handleAnswerChange(question.id, option)}
                          style={{ accentColor: "#294c3a" }}
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
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
          </div>

          <div style={{ marginTop: 28, borderTop: "1px solid #edf1ed", paddingTop: 22 }}>
            <h3 style={{ margin: 0, fontSize: 24, fontFamily: "Georgia, serif" }}>Final exam</h3>
            <p style={{ color: "#5d7367", marginTop: 10 }}>{course.exam.title} • {course.exam.duration} • {course.exam.questions.length} questions</p>
          </div>
        </div>
      </section>
    </main>
  );
}
