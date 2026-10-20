
"use client";

import Link from "next/link";
import {
  ArrowRight,
  Atom,
  BookOpen,
  BriefcaseBusiness,
  Calculator,
  Code2,
  Compass,
  GraduationCap,
  HeartPulse,
  Landmark,
  Languages,
  Music2,
  Palette,
  RefreshCw,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { CourseSummary } from "@/lib/course-types";
import { getCourseImage as resolveCourseImage } from "@/lib/course-images";
import SubjectArtwork from "@/components/subject-artwork";
import styles from "./landing.module.css";

type LoadState = "loading" | "ready" | "error";

const subjectIcons: Record<string, LucideIcon> = {
  Science: Atom,
  Mathematics: Calculator,
  English: BookOpen,
  History: Landmark,
  Technology: Code2,
  Business: BriefcaseBusiness,
  Art: Palette,
  Languages,
  Geography: Compass,
  "Computer Science": Code2,
  Health: HeartPulse,
  Music: Music2,
};

function getCourseImage(title: string, subject: string, thumbnailUrl?: string | null) {
  return resolveCourseImage(title, subject, thumbnailUrl);
}

function SkeletonCard() {
  return (
    <div className={styles.skeletonCard}>
      <div className={`${styles.skeleton} ${styles.skeletonImage}`} />
      <div className={styles.skeletonBody}>
        <div className={`${styles.skeleton} ${styles.skeletonSmall}`} />
        <div className={`${styles.skeleton} ${styles.skeletonTitle}`} />
        <div className={`${styles.skeleton} ${styles.skeletonLine}`} />
      </div>
    </div>
  );
}

export default function LandingPage() {
  const [courses, setCourses] = useState<CourseSummary[]>([]);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [reload, setReload] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoadState("loading");

    fetch("/api/courses", { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("Course list unavailable");
        return (await response.json()) as CourseSummary[];
      })
      .then((data) => {
        setCourses(data);
        setLoadState("ready");
      })
      .catch((error: unknown) => {
        if (error instanceof Error && error.name === "AbortError") return;
        setLoadState("error");
      });

    return () => controller.abort();
  }, [reload]);

  const featuredCourses = courses.slice(0, 6);
  const totalLessons = courses.reduce(
    (total, course) => total + course.lessonCount,
    0,
  );
  const allSubjects = Array.from(new Set(courses.map((course) => course.subject)));
  const subjects = allSubjects.slice(0, 6);

  return (
    <div className={styles.site}>
      <header className={styles.header}>
        <Link href="/" className={styles.brand} aria-label="Fieldnote home">
          <span className={styles.brandMark} aria-hidden="true">
            <i /><i /><i /><i />
          </span>
          <span>Fieldnote</span>
        </Link>

        <nav className={styles.navigation} aria-label="Main navigation">
          <Link href="/courses">Courses</Link>
          <a href="#subjects">Subjects</a>
          <Link href="/feedback">Feedback</Link>
          <Link href="/admin">Teaching hub</Link>
          <Link href="/login" className={styles.loginLink}>Log in</Link>
          <Link href="/signup" className={styles.navCta}>
            Sign up <ArrowRight size={15} />
          </Link>
        </nav>
      </header>

      <main>
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <div className={styles.heroCopy}>
              <h1>
                Secondary school
                <br />
                <em>courses and lessons.</em>
              </h1>

              <p>
                Browse courses by subject and level. Open a course to work through its lessons, quizzes, and exam.
              </p>

              <div className={styles.heroActions}>
                <Link href="/courses" className={styles.primaryButton}>
                  Browse courses <ArrowRight size={17} />
                </Link>
                <Link href="/signup" className={styles.watchButton}>
                  Create student account
                </Link>
              </div>

              <div className={styles.heroStats}>
                <div>
                  <strong>{loadState === "ready" ? courses.length : "—"}</strong>
                  <span>Courses</span>
                </div>
                <div>
                  <strong>{loadState === "ready" ? totalLessons.toLocaleString() : "—"}</strong>
                  <span>Lessons</span>
                </div>
                <div>
                  <strong>{loadState === "ready" ? allSubjects.length : "—"}</strong>
                  <span>Subjects</span>
                </div>
              </div>
            </div>

            <div className={styles.heroVisual}>
              <div className={styles.libraryPreview}>
                <div className={styles.previewHeader}>
                  <div>
                    <span>COURSE LIBRARY</span>
                    <strong>{loadState === "ready" ? `${courses.length} courses` : "Courses"}</strong>
                  </div>
                  <Link href="/courses" aria-label="Open all courses"><ArrowRight size={18} /></Link>
                </div>
                {featuredCourses.length > 0 ? (
                  <div className={styles.previewCourses}>
                    {featuredCourses.slice(0, 3).map((course, index) => (
                      <Link href={`/courses/${course.id}`} className={styles.previewCourse} key={course.id}>
                        <span className={styles.previewIndex}>0{index + 1}</span>
                        <span className={styles.previewCourseTitle}>
                          <strong>{course.title}</strong>
                          <small>{course.subject} · {course.level}</small>
                        </span>
                        <ArrowRight size={15} />
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className={styles.previewEmpty}>
                    {loadState === "loading" ? "Loading courses…" : loadState === "error" ? "Course list unavailable." : "No courses published."}
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className={styles.coursesSection}>
          <div className={styles.sectionHeader}>
            <div>
              <span className={styles.sectionEyebrow}>COURSES</span>
              <h2>Browse the latest courses.</h2>
              <p>Each course includes its available lessons, quizzes, and assessment details.</p>
            </div>
            <Link href="/courses" className={styles.viewAll}>
              All courses <ArrowRight size={16} />
            </Link>
          </div>

          {loadState === "loading" && (
            <div className={styles.courseGrid} aria-busy="true">
              <SkeletonCard /><SkeletonCard /><SkeletonCard />
            </div>
          )}

          {loadState === "error" && (
            <div className={styles.stateCard}>
              <div className={styles.stateIcon}><RefreshCw size={24} /></div>
              <h3>We couldn't load the courses</h3>
              <p>There was a problem connecting to the course library. Please try again.</p>
              <button type="button" onClick={() => setReload((value) => value + 1)} className={styles.retryButton}>
                <RefreshCw size={15} /> Try again
              </button>
            </div>
          )}

          {loadState === "ready" && featuredCourses.length === 0 && (
            <div className={styles.stateCard}>
              <div className={styles.stateIcon}><BookOpen size={24} /></div>
              <h3>No published courses</h3>
              <Link href="/courses" className={styles.retryButton}>
                Open course library <ArrowRight size={15} />
              </Link>
            </div>
          )}

          {loadState === "ready" && featuredCourses.length > 0 && (
            <div className={styles.courseGrid}>
              {featuredCourses.map((course) => {
                const CourseIcon = subjectIcons[course.subject] ?? GraduationCap;
                return (
                  <Link href={`/courses/${course.id}`} className={styles.courseCard} key={course.id}>
                    <div className={styles.courseImage}>
                      <img src={getCourseImage(course.title, course.subject, course.thumbnailUrl)} alt="" loading="lazy" />
                      <span className={styles.courseSubject}>
                        <CourseIcon size={13} /> {course.subject}
                      </span>
                      <span className={styles.courseLevel}>{course.level}</span>
                    </div>
                    <div className={styles.courseBody}>
                      <h3>{course.title}</h3>
                      <div className={styles.courseMeta}>
                        <span>{course.lessonCount} lessons</span><i />
                        <span>{course.quizCount} quizzes</span>
                      </div>
                      <div className={styles.courseFooter}>
                        <span>Open course</span>
                        <span className={styles.courseArrow}><ArrowRight size={16} /></span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {loadState === "ready" && subjects.length > 0 && (
          <section className={styles.subjectSection} id="subjects">
            <div className={styles.sectionHeader}>
              <div>
                <span className={styles.sectionEyebrow}>SUBJECTS</span>
                <h2>Browse by subject.</h2>
                <p>Select a subject to filter the course library.</p>
              </div>
            </div>

            <div className={styles.subjectGrid}>
              {subjects.map((subject) => {
                const Icon = subjectIcons[subject] ?? GraduationCap;
                return (
                  <Link href={`/courses?subject=${encodeURIComponent(subject)}`} className={styles.subjectCard} key={subject}>
                    <div className={styles.subjectImage}>
                      <SubjectArtwork subject={subject} className={styles.subjectArtwork} />
                      <div />
                    </div>
                    <div className={styles.subjectContent}>
                      <span className={styles.subjectIcon}><Icon size={19} /></span>
                      <strong>{subject}</strong>
                      <ArrowRight size={17} />
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

      </main>

      <footer className={styles.footer}>
        <Link href="/" className={styles.footerBrand}>
          <span className={styles.brandMark} aria-hidden="true"><i /><i /><i /><i /></span>
          Fieldnote
        </Link>
        <div>
          <Link href="/courses">Courses</Link>
          <Link href="/login">Log in</Link>
          <Link href="/signup">Sign up</Link>
          <Link href="/admin">Teaching hub</Link>
        </div>
      </footer>
    </div>
  );
}
