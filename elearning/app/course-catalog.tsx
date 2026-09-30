"use client";

import Link from "next/link";
import {
  Atom,
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  Calculator,
  Code2,
  Compass,
  Cpu,
  GraduationCap,
  HeartPulse,
  Landmark,
  Languages,
  LoaderCircle,
  Music2,
  Palette,
  Search,
  SlidersHorizontal,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { CourseSummary } from "@/lib/course-types";
import styles from "./course-catalog.module.css";

type CatalogState = "loading" | "ready" | "error";
type SortMode = "title" | "subject" | "lessons";

const subjectIcons: Record<string, LucideIcon> = {
  Science: Atom,
  Mathematics: Calculator,
  English: BookOpen,
  History: Landmark,
  Technology: Cpu,
  Business: BriefcaseBusiness,
  Art: Palette,
  Languages,
  Geography: Compass,
  "Computer Science": Code2,
  Health: HeartPulse,
  Music: Music2,
};

const subjectTones: Record<string, string> = {
  Science: "mint",
  Mathematics: "blue",
  English: "rose",
  History: "gold",
  Technology: "slate",
  Business: "orange",
  Art: "coral",
  Languages: "teal",
  Geography: "leaf",
  "Computer Science": "navy",
  Health: "aqua",
  Music: "plum",
};

export default function CourseCatalog() {
  const [courses, setCourses] = useState<CourseSummary[]>([]);
  const [state, setState] = useState<CatalogState>("loading");
  const [search, setSearch] = useState("");
  const [activeSubject, setActiveSubject] = useState("All subjects");
  const [level, setLevel] = useState("All levels");
  const [sort, setSort] = useState<SortMode>("title");
  const [requestKey, setRequestKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setState("loading");

    fetch("/api/courses", { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("Catalog request failed");
        return (await response.json()) as CourseSummary[];
      })
      .then((data) => {
        setCourses(data);
        setState("ready");
      })
      .catch((error: unknown) => {
        if (error instanceof Error && error.name === "AbortError") return;
        setState("error");
      });

    return () => controller.abort();
  }, [requestKey]);

  const subjects = ["All subjects", ...new Set(courses.map((course) => course.subject))];
  const levels = ["All levels", ...new Set(courses.map((course) => course.level))];
  const normalizedSearch = search.trim().toLocaleLowerCase();
  const filteredCourses = courses
    .filter((course) => activeSubject === "All subjects" || course.subject === activeSubject)
    .filter((course) => level === "All levels" || course.level === level)
    .filter((course) => {
      if (!normalizedSearch) return true;
      return `${course.title} ${course.subject} ${course.level} ${course.description}`
        .toLocaleLowerCase()
        .includes(normalizedSearch);
    })
    .sort((a, b) => {
      if (sort === "lessons") return b.lessonCount - a.lessonCount || a.title.localeCompare(b.title);
      if (sort === "subject") return a.subject.localeCompare(b.subject) || a.title.localeCompare(b.title);
      return a.title.localeCompare(b.title);
    });

  const lessonTotal = courses.reduce((total, course) => total + course.lessonCount, 0);
  const quizTotal = courses.reduce((total, course) => total + course.quizCount, 0);
  const examTotal = courses.filter((course) => course.examPassingScore !== null).length;
  const Icon = subjectIcons[activeSubject] ?? GraduationCap;

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link href="/" className={styles.brand} aria-label="Fieldnote home">
          <span className={styles.brandMark} aria-hidden="true"><i /><i /><i /><i /></span>
          <span>Fieldnote</span>
        </Link>
        <nav className={styles.headerNav} aria-label="Primary navigation">
          <span className={styles.currentNav}><BookOpen size={16} strokeWidth={2} /> Course library</span>
          <Link href="/courses">All courses <ArrowRight size={14} strokeWidth={2} /></Link>
        </nav>
        <span className={styles.headerNote}>LEARNING SPACE</span>
      </header>

      <section className={styles.intro} aria-labelledby="catalog-title">
        <div>
          <p className={styles.kicker}>YOUR COURSE CATALOG</p>
          <h1 id="catalog-title">Find your next subject.</h1>
          <p className={styles.introText}>Distinct courses, lessons, and assessments from your learning database.</p>
        </div>
        <div className={styles.stats} aria-label="Catalog totals">
          <div><strong>{state === "ready" ? courses.length : "—"}</strong><span>courses</span></div>
          <div><strong>{state === "ready" ? lessonTotal.toLocaleString() : "—"}</strong><span>lessons</span></div>
          <div><strong>{state === "ready" ? quizTotal.toLocaleString() : "—"}</strong><span>quizzes</span></div>
          <div><strong>{state === "ready" ? examTotal : "—"}</strong><span>exams</span></div>
        </div>
      </section>

      <section className={styles.controls} aria-label="Find and filter courses">
        <label className={styles.searchBox}>
          <Search size={18} strokeWidth={1.8} aria-hidden="true" />
          <span className={styles.visuallyHidden}>Search courses</span>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by course, subject, or topic"
          />
          {search ? <button type="button" onClick={() => setSearch("")} aria-label="Clear search">×</button> : null}
        </label>
        <label className={styles.selectBox}>
          <SlidersHorizontal size={16} strokeWidth={1.8} aria-hidden="true" />
          <span className={styles.visuallyHidden}>Sort courses</span>
          <select value={sort} onChange={(event) => setSort(event.target.value as SortMode)}>
            <option value="title">Sort: A to Z</option>
            <option value="subject">Sort: subject</option>
            <option value="lessons">Sort: most lessons</option>
          </select>
        </label>
      </section>

      {state === "ready" && courses.length > 0 ? (
        <div className={styles.filterBar} aria-label="Course filters">
          <div className={styles.subjectFilters} role="group" aria-label="Filter by subject">
            {subjects.map((subject) => (
              <button
                key={subject}
                type="button"
                className={activeSubject === subject ? styles.selectedFilter : styles.filterButton}
                aria-pressed={activeSubject === subject}
                onClick={() => setActiveSubject(subject)}
              >
                {subject}
              </button>
            ))}
          </div>
          <label className={styles.levelSelect}>
            <span>Level</span>
            <select value={level} onChange={(event) => setLevel(event.target.value)}>
              {levels.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
        </div>
      ) : null}

      <div className={styles.resultsLine} aria-live="polite">
        <h2>{state === "ready" ? "Available courses" : "Course library"}</h2>
        {state === "ready" && courses.length > 0 ? <span>{filteredCourses.length} shown</span> : null}
      </div>

      {state === "loading" ? (
        <section className={styles.loadingState} role="status" aria-live="polite">
          <LoaderCircle size={22} strokeWidth={1.8} aria-hidden="true" />
          <span>Loading courses…</span>
          <div className={styles.skeletonGrid} aria-hidden="true">
            {[0, 1, 2, 3, 4, 5].map((item) => <div className={styles.skeleton} key={item} />)}
          </div>
        </section>
      ) : null}

      {state === "error" ? (
        <section className={styles.statePanel} role="alert">
          <div className={`${styles.stateIcon} ${styles.errorIcon}`}><BookOpen size={21} strokeWidth={1.8} /></div>
          <h3>Course library unavailable</h3>
          <p>We couldn’t reach the course database. Check the connection and try again.</p>
          <button type="button" className={styles.primaryButton} onClick={() => setRequestKey((key) => key + 1)}>
            Try again <ArrowRight size={15} strokeWidth={2} />
          </button>
        </section>
      ) : null}

      {state === "ready" && courses.length === 0 ? (
        <section className={styles.statePanel}>
          <div className={styles.stateIcon}><GraduationCap size={22} strokeWidth={1.8} /></div>
          <h3>No courses in the library yet</h3>
          <p>Once course records are added to the database, they’ll appear here.</p>
          <Link href="/courses" className={styles.secondaryButton}>Open course library <ArrowRight size={15} strokeWidth={2} /></Link>
        </section>
      ) : null}

      {state === "ready" && courses.length > 0 && filteredCourses.length === 0 ? (
        <section className={styles.statePanel}>
          <div className={styles.stateIcon}><Search size={21} strokeWidth={1.8} /></div>
          <h3>No courses match those filters</h3>
          <p>Adjust the search or clear the selected subject and level.</p>
          <button type="button" className={styles.secondaryButton} onClick={() => { setSearch(""); setActiveSubject("All subjects"); setLevel("All levels"); }}>
            Clear filters
          </button>
        </section>
      ) : null}

      {state === "ready" && filteredCourses.length > 0 ? (
        <section className={styles.courseGrid} aria-label="Course results">
          {filteredCourses.map((course, index) => {
            const CourseIcon = subjectIcons[course.subject] ?? GraduationCap;
            const tone = subjectTones[course.subject] ?? "mint";
            return (
              <article className={styles.courseCard} key={course.id}>
                <div className={styles.cardTop}>
                  <span className={`${styles.subjectIcon} ${styles[tone]}`}><CourseIcon size={20} strokeWidth={1.8} /></span>
                  <div className={styles.courseMeta}>
                    <span>{course.subject}</span>
                    <span className={styles.levelBadge}>{course.level}</span>
                  </div>
                </div>
                <h3>{course.title}</h3>
                <p className={styles.description}>{course.description}</p>
                <div className={styles.courseCounts}>
                  <span><BookOpen size={14} strokeWidth={1.8} /> {course.lessonCount} lessons</span>
                  <span><GraduationCap size={14} strokeWidth={1.8} /> {course.quizCount} quizzes</span>
                  {course.examPassingScore !== null ? <span>{course.examQuestionCount} exam questions</span> : <span>No final exam</span>}
                </div>
                <Link href={`/courses/${course.id}`} className={styles.cardLink}>
                  Open course <ArrowRight size={16} strokeWidth={2} />
                </Link>
              </article>
            );
          })}
        </section>
      ) : null}

      <footer className={styles.footer}>
        <span>Fieldnote learning catalog</span>
        <span><Icon size={14} strokeWidth={1.8} /> {state === "ready" ? `${courses.length} courses from your database` : "Connected course content"}</span>
      </footer>
    </main>
  );
}
