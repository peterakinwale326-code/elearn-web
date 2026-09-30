import Link from "next/link";
import { connection } from "next/server";
import type { CourseSummary } from "../../lib/course-types";
import { nodeApiUrl } from "../../lib/node-api";

export default async function CoursesPage() {
  await connection();
  let courses: CourseSummary[] = [];
  let databaseError = false;
  try {
    const response = await fetch(nodeApiUrl("/api/courses"), { cache: "no-store" });
    if (!response.ok) throw new Error("Node course API unavailable");
    courses = await response.json() as CourseSummary[];
  } catch {
    databaseError = true;
  }

  return (
    <main style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px 80px" }}>
      <header style={{ marginBottom: 30 }}>
        <p style={{ letterSpacing: 2, color: "#6d7b72", fontSize: 12, margin: 0, textTransform: "uppercase" }}>
          COURSE LIBRARY
        </p>
        <h1 style={{ fontSize: 40, margin: "10px 0 8px", fontFamily: "Georgia, serif" }}>Explore {courses.length} courses</h1>
        <p style={{ maxWidth: 700, color: "#58645d", margin: 0, lineHeight: 1.7 }}>
          Browse the courses, lessons, quizzes, and final exams in your learning database.
        </p>
      </header>

      {databaseError ? null : (
        <div style={{ marginBottom: 18, color: "#58645d", fontSize: 13 }}>
          {courses.length} courses <span aria-hidden="true">·</span> {courses.reduce((total, course) => total + course.lessonCount, 0)} lessons <span aria-hidden="true">·</span> {courses.reduce((total, course) => total + course.quizCount, 0)} quizzes <span aria-hidden="true">·</span> {courses.filter((course) => course.examPassingScore !== null).length} final exams
        </div>
      )}

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: 18,
        }}
      >
        {courses.map((course) => (
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
              <span>{course.lessonCount} lessons</span>
              <span>{course.durationMinutes} mins</span>
            </div>

            <div style={{ marginTop: 18, borderTop: "1px solid #edf1ed", paddingTop: 12 }}>
              <strong style={{ display: "block", marginBottom: 6, fontSize: 12, color: "#3f5344" }}>{course.quizCount} lesson quizzes · {course.examPassingScore === null ? "No final exam" : "Final exam"}</strong>
              {course.examPassingScore !== null ? (
                <span style={{ fontSize: 12, color: "#5d6d63" }}>{course.examQuestionCount} exam questions · {course.examPassingScore}% to pass</span>
              ) : null}
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
      {databaseError ? (
        <p role="alert" style={{ marginTop: 28, color: "#8a4b35" }}>
          The Node course API is unavailable. Start it with `npm run api:dev`, then retry.
        </p>
      ) : courses.length === 0 ? (
        <p style={{ marginTop: 28, color: "#58645d" }}>No courses are in the database yet.</p>
      ) : null}
    </main>
  );
}
