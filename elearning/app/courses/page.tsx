import Link from "next/link";
import { courseCatalog } from "../data/courseSeed";

export default function CoursesPage() {
  const featured = courseCatalog.slice(0, 6);

  return (
    <main style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px 80px" }}>
      <header style={{ marginBottom: 30 }}>
        <p style={{ letterSpacing: 2, color: "#6d7b72", fontSize: 12, margin: 0, textTransform: "uppercase" }}>
          COURSE LIBRARY
        </p>
        <h1 style={{ fontSize: 40, margin: "10px 0 8px", fontFamily: "Georgia, serif" }}>Explore 84 courses</h1>
        <p style={{ maxWidth: 700, color: "#58645d", margin: 0, lineHeight: 1.7 }}>
          Every course includes structured lessons, quizzes, and final assessment data designed for a modern learning platform.
        </p>
      </header>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: 18,
          marginBottom: 40,
        }}
      >
        {featured.map((course) => (
          <article
            key={course.id}
            style={{
              border: "1px solid #e5e9e3",
              borderRadius: 12,
              background: "#fff",
              padding: 18,
              boxShadow: "0 8px 24px rgba(20,32,24,0.03)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
              <span style={{ fontSize: 11, color: "#4f7a5c", fontWeight: 700, letterSpacing: 1 }}>{course.subject}</span>
              <span style={{ fontSize: 10, color: "#6e7a72", background: "#f2f6f1", padding: "5px 7px", borderRadius: 999 }}>{course.level}</span>
            </div>

            <h2 style={{ fontSize: 22, margin: "16px 0 8px", fontFamily: "Georgia, serif" }}>{course.title}</h2>
            <p style={{ margin: 0, color: "#6b776d", lineHeight: 1.6, fontSize: 13 }}>{course.description}</p>

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 18, color: "#58645d", fontSize: 12 }}>
              <span>{course.lessons.length} lessons</span>
              <span>{course.duration}</span>
            </div>

            <div style={{ marginTop: 18, borderTop: "1px solid #edf1ed", paddingTop: 12 }}>
              <strong style={{ display: "block", marginBottom: 6, fontSize: 12, color: "#3f5344" }}>Final exam</strong>
              <span style={{ fontSize: 12, color: "#5d6d63" }}>{course.exam.title}</span>
            </div>

            <Link
              href={`/courses/${course.id}`}
              style={{
                display: "inline-flex",
                marginTop: 18,
                padding: "10px 14px",
                background: "#294c3a",
                color: "#fff",
                borderRadius: 8,
                textDecoration: "none",
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              View course
            </Link>
          </article>
        ))}
      </section>

      <section>
        <h2 style={{ fontSize: 28, marginBottom: 18, fontFamily: "Georgia, serif" }}>Sample course breakdown</h2>

        {courseCatalog.slice(0, 3).map((course) => (
          <div
            key={course.id}
            style={{
              border: "1px solid #e5e9e3",
              borderRadius: 12,
              background: "#fbfcfa",
              padding: 20,
              marginBottom: 18,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <div>
                <p style={{ margin: 0, color: "#457155", fontWeight: 700, fontSize: 11, letterSpacing: 1, textTransform: "uppercase" }}>
                  {course.subject}
                </p>
                <h3 style={{ margin: "8px 0 6px", fontSize: 24, fontFamily: "Georgia, serif" }}>{course.title}</h3>
              </div>
              <span style={{ color: "#61716b", fontSize: 12 }}>Passing score: {course.exam.passingScore}%</span>
            </div>

            <div style={{ display: "grid", gap: 12, marginTop: 18 }}>
              {course.lessons.map((lesson) => (
                <div
                  key={lesson.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "minmax(180px, 1fr) minmax(200px, 1fr) minmax(160px, 200px)",
                    gap: 12,
                    background: "#fff",
                    border: "1px solid #edf1ed",
                    borderRadius: 10,
                    padding: 14,
                  }}
                >
                  <div>
                    <strong style={{ display: "block", fontSize: 13, marginBottom: 4 }}>{lesson.title}</strong>
                    <span style={{ color: "#67756f", fontSize: 11 }}>{lesson.duration}</span>
                  </div>

                  <div>
                    <span style={{ color: "#5a6d5f", fontSize: 11, display: "block", marginBottom: 6 }}>Objective</span>
                    <p style={{ margin: 0, color: "#6c776f", fontSize: 12, lineHeight: 1.5 }}>{lesson.objective}</p>
                  </div>

                  <div>
                    <span style={{ color: "#5a6d5f", fontSize: 11, display: "block", marginBottom: 6 }}>Assessment</span>
                    <p style={{ margin: 0, fontSize: 12, color: "#425645" }}>
                      {lesson.quiz.title} • {lesson.quiz.questions.length} questions • {lesson.quiz.passingScore}% pass
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
