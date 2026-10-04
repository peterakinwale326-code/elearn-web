
"use client";

import Link from "next/link";
import {
  ArrowRight,
  Atom,
  BookOpen,
  BriefcaseBusiness,
  Calculator,
  CheckCircle2,
  Code2,
  Compass,
  GraduationCap,
  HeartPulse,
  Landmark,
  Languages,
  Music2,
  Palette,
  RefreshCw,
  Sparkles,
  Play,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { CourseSummary } from "@/lib/course-types";
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

const subjectImages: Record<string, string> = {
  Science: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=900&q=80",
  Mathematics: "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=900&q=80",
  English: "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&w=900&q=80",
  History: "https://images.unsplash.com/photo-1461360228754-6e81c478b882?auto=format&fit=crop&w=900&q=80",
  Technology: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80",
  Business: "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=900&q=80",
  Art: "https://images.unsplash.com/photo-1561214115-f2f134cc4912?auto=format&fit=crop&w=900&q=80",
  Languages: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=900&q=80",
  Geography: "https://images.unsplash.com/photo-1524666041070-9cffc8c7a4d0?auto=format&fit=crop&w=900&q=80",
  "Computer Science": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80",
  Health: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=900&q=80",
  Music: "https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?auto=format&fit=crop&w=900&q=80",
};

const fallbackImage =
  "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1000&q=80";

function getCourseImage(subject: string, thumbnailUrl?: string | null) {
  return thumbnailUrl || subjectImages[subject] || fallbackImage;
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
  const subjects = Array.from(
    new Set(courses.map((course) => course.subject)),
  ).slice(0, 6);

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
          <a href="#how-it-works">How it works</a>
          <Link href="/login" className={styles.loginLink}>Log in</Link>
          <Link href="/signup" className={styles.navCta}>
            Get started <ArrowRight size={15} />
          </Link>
        </nav>
      </header>

      <main>
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <div className={styles.heroCopy}>
              <div className={styles.trustBadge}>
                <span><Sparkles size={13} /></span>
                Learning made clearer
              </div>

              <h1>
                Learn today.
                <br />
                <em>Grow tomorrow.</em>
              </h1>

              <p>
                Explore engaging courses, learn at your own pace, practice
                what you know, and track your progress from one simple
                learning space.
              </p>

              <div className={styles.heroActions}>
                <Link href="/courses" className={styles.primaryButton}>
                  Explore courses <ArrowRight size={17} />
                </Link>
                <Link href="/signup" className={styles.watchButton}>
                  <span><Play size={14} fill="currentColor" /></span>
                  Start learning
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
                  <strong>100%</strong>
                  <span>Learn at your pace</span>
                </div>
              </div>
            </div>

            <div className={styles.heroVisual}>
              <div className={styles.heroImage}>
                <img src={fallbackImage} alt="Students learning together" />
                <div className={styles.imageOverlay} />
              </div>

              <div className={styles.floatingProgress}>
                <div className={styles.progressIcon}><CheckCircle2 size={18} /></div>
                <div>
                  <strong>Keep learning</strong>
                  <span>Small progress adds up.</span>
                </div>
              </div>

              <div className={styles.floatingCard}>
                <GraduationCap size={18} />
                <strong>Learn smarter</strong>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.trustedStrip}>
          <span>LEARN ACROSS</span><i />
          <strong>SCIENCE</strong><i />
          <strong>MATHEMATICS</strong><i />
          <strong>TECHNOLOGY</strong><i />
          <strong>ARTS</strong><i />
          <strong>LANGUAGES</strong>
        </section>

        <section className={styles.coursesSection}>
          <div className={styles.sectionHeader}>
            <div>
              <span className={styles.sectionEyebrow}>COURSE LIBRARY</span>
              <h2>Learn something new.</h2>
              <p>Find a course that matches your interests and start building useful knowledge.</p>
            </div>
            <Link href="/courses" className={styles.viewAll}>
              View all courses <ArrowRight size={16} />
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
              <h3>No courses available yet</h3>
              <p>The course library is being prepared. Check back soon for new learning opportunities.</p>
              <Link href="/courses" className={styles.retryButton}>
                Explore library <ArrowRight size={15} />
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
                      <img src={getCourseImage(course.subject, course.thumbnailUrl)} alt="" loading="lazy" />
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
                        <span>Start learning</span>
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
                <span className={styles.sectionEyebrow}>EXPLORE</span>
                <h2>Find your subject.</h2>
                <p>Jump into the area you want to understand better.</p>
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

        <section className={styles.method} id="how-it-works">
          <div className={styles.methodIntro}>
            <span className={styles.sectionEyebrow}>HOW IT WORKS</span>
            <h2>A simpler way to learn.</h2>
            <p>Everything you need to move from understanding a concept to confidently applying it.</p>
          </div>

          <div className={styles.methodSteps}>
            <article>
              <span className={styles.stepNumber}>01</span>
              <div className={styles.stepIcon}><BookOpen size={21} /></div>
              <h3>Choose</h3>
              <p>Find a course that matches what you want to learn.</p>
            </article>
            <article>
              <span className={styles.stepNumber}>02</span>
              <div className={styles.stepIcon}><Compass size={21} /></div>
              <h3>Learn</h3>
              <p>Work through structured lessons and practical examples.</p>
            </article>
            <article>
              <span className={styles.stepNumber}>03</span>
              <div className={styles.stepIcon}><GraduationCap size={21} /></div>
              <h3>Practice</h3>
              <p>Use quizzes and assessments to check your understanding.</p>
            </article>
          </div>
        </section>

        <section className={styles.joinBand}>
          <div>
            <span className={styles.sectionEyebrow}>READY TO START?</span>
            <h2>Your next lesson is waiting.</h2>
            <p>Build knowledge one lesson at a time.</p>
          </div>
          <div className={styles.joinActions}>
            <Link href="/signup" className={styles.primaryButton}>
              Create account <ArrowRight size={17} />
            </Link>
            <Link href="/courses" className={styles.joinSecondary}>Browse courses</Link>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <Link href="/" className={styles.footerBrand}>
          <span className={styles.brandMark} aria-hidden="true"><i /><i /><i /><i /></span>
          Fieldnote
        </Link>
        <span>A simple learning space for curious minds.</span>
        <div>
          <Link href="/courses">Courses</Link>
          <Link href="/login">Log in</Link>
          <Link href="/signup">Sign up</Link>
        </div>
      </footer>
    </div>
  );
}
