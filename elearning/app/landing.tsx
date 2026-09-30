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
  LoaderCircle,
  Music2,
  Palette,
  RefreshCw,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { CourseSummary } from "@/lib/course-types";
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

const subjectTones: Record<string, string> = {
  Science: "green",
  Mathematics: "blue",
  English: "coral",
  History: "gold",
  Technology: "slate",
  Business: "orange",
  Art: "rose",
  Languages: "teal",
  Geography: "leaf",
  "Computer Science": "navy",
  Health: "aqua",
  Music: "plum",
};

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

  const featuredCourses = courses.slice(0, 3);
  const totalLessons = courses.reduce((total, course) => total + course.lessonCount, 0);

  return (
    <div className={styles.site}>
      <header className={styles.header}>
        <Link href="/" className={styles.brand} aria-label="Fieldnote home">
          <span className={styles.brandMark} aria-hidden="true"><i /><i /><i /><i /></span>
          <span>Fieldnote</span>
        </Link>
        <nav className={styles.navigation} aria-label="Main navigation">
          <Link href="/courses">Courses</Link>
          <a href="#how-it-works">How it works</a>
          <Link href="/login" className={styles.loginLink}>Log in</Link>
          <Link href="/signup" className={styles.navCta}>Create account <ArrowRight size={15} strokeWidth={2} /></Link>
        </nav>
      </header>

      <main>
        <section className={styles.hero} aria-labelledby="hero-title">
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}><span className={styles.eyebrowMark} /> A learning space built around real progress</p>
            <h1 id="hero-title">Fieldnote</h1>
            <p className={styles.heroText}>Find a subject that pulls you in. Follow a clear path from first lesson to confident practice.</p>
            <div className={styles.heroActions}>
              <Link href="/courses" className={styles.primaryButton}>Explore courses <ArrowRight size={17} strokeWidth={2} /></Link>
              <Link href="/signup" className={styles.secondaryLink}>Start learning <ArrowRight size={16} strokeWidth={1.8} /></Link>
            </div>
            <div className={styles.heroFacts} aria-label="Live catalog summary">
              <span><strong>{loadState === "ready" ? courses.length : "—"}</strong> courses</span>
              <i aria-hidden="true" />
              <span><strong>{loadState === "ready" ? totalLessons.toLocaleString() : "—"}</strong> lessons</span>
              <i aria-hidden="true" />
              <span>Quizzes and exams included</span>
            </div>
          </div>
          <div className={styles.heroIndex} aria-hidden="true"><span>01</span><i /> LEARN AT YOUR PACE</div>
        </section>

        <section className={styles.showcase} aria-labelledby="showcase-title">
          <div className={styles.sectionHeader}>
            <div>
              <p className={styles.eyebrow}>THE COURSE LIBRARY</p>
              <h2 id="showcase-title">Start with a subject.</h2>
            </div>
            <Link href="/courses" className={styles.allCourses}>Browse all courses <ArrowRight size={15} strokeWidth={2} /></Link>
          </div>

          {loadState === "loading" ? (
            <div className={styles.showcaseLoading} role="status" aria-live="polite">
              <LoaderCircle size={19} strokeWidth={1.8} /> Loading courses
              <div className={styles.loadingRows} aria-hidden="true"><i /><i /><i /></div>
            </div>
          ) : null}

          {loadState === "error" ? (
            <div className={styles.showcaseState} role="alert">
              <p>Course previews are temporarily unavailable.</p>
              <button type="button" onClick={() => setReload((value) => value + 1)}><RefreshCw size={15} /> Retry</button>
            </div>
          ) : null}

          {loadState === "ready" && featuredCourses.length === 0 ? (
            <div className={styles.showcaseState}>
              <p>The course library is ready for its first courses.</p>
              <Link href="/courses">Open course library <ArrowRight size={15} /></Link>
            </div>
          ) : null}

          {loadState === "ready" && featuredCourses.length > 0 ? (
            <div className={styles.featuredGrid}>
              {featuredCourses.map((course) => {
                const CourseIcon = subjectIcons[course.subject] ?? GraduationCap;
                const tone = subjectTones[course.subject] ?? "green";
                return (
                  <Link href={`/courses/${course.id}`} className={styles.featuredCourse} key={course.id}>
                    <span className={`${styles.courseIcon} ${styles[tone]}`}><CourseIcon size={20} strokeWidth={1.8} /></span>
                    <span className={styles.courseLabel}>{course.subject} <i /> {course.level}</span>
                    <strong>{course.title}</strong>
                    <span className={styles.courseCount}>{course.lessonCount} lessons <i /> {course.quizCount} quizzes</span>
                    <span className={styles.courseArrow} aria-hidden="true"><ArrowRight size={17} strokeWidth={1.9} /></span>
                  </Link>
                );
              })}
            </div>
          ) : null}
        </section>

        <section className={styles.method} id="how-it-works" aria-labelledby="method-title">
          <div className={styles.methodHeading}>
            <p className={styles.eyebrow}>A CLEAR PATH FORWARD</p>
            <h2 id="method-title">Learn it. Try it. Know it.</h2>
            <p>Each course brings lessons and assessments together, so you can build understanding one useful step at a time.</p>
          </div>
          <div className={styles.methodSteps}>
            <article><span>01</span><BookOpen size={20} strokeWidth={1.8} /><h3>Choose a course</h3><p>Browse distinct pathways across science, arts, technology, and more.</p></article>
            <article><span>02</span><Compass size={20} strokeWidth={1.8} /><h3>Work through lessons</h3><p>Move between concepts, examples, practice, and new contexts.</p></article>
            <article><span>03</span><GraduationCap size={20} strokeWidth={1.8} /><h3>Check your progress</h3><p>Use lesson quizzes and a course exam to see what has clicked.</p></article>
          </div>
        </section>

        <section className={styles.joinBand} aria-labelledby="join-title">
          <div><p className={styles.eyebrow}>YOUR NEXT CHAPTER</p><h2 id="join-title">Make a little progress today.</h2></div>
          <div className={styles.joinActions}><Link href="/signup" className={styles.primaryButton}>Create your account <ArrowRight size={17} /></Link><Link href="/login" className={styles.joinLogin}>Already learning? Log in</Link></div>
        </section>
      </main>

      <footer className={styles.footer}>
        <Link href="/" className={styles.footerBrand}>Fieldnote</Link>
        <span>Courses, lessons, and practice in one learning space.</span>
        <div><Link href="/courses">Courses</Link><Link href="/login">Log in</Link><Link href="/signup">Sign up</Link></div>
      </footer>
    </div>
  );
}
