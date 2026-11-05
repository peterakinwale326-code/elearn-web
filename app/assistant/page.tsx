import Link from "next/link";
import { ArrowLeft, BookOpenCheck, ShieldCheck } from "lucide-react";
import LearningAssistant from "@/components/learning-assistant";
import styles from "./assistant.module.css";

export default function AssistantPage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link href="/" className={styles.backLink}>
          <ArrowLeft size={17} /> Fieldnote
        </Link>
        <nav aria-label="Study navigation">
          <Link href="/courses">Courses</Link>
          <Link href="/profile">My profile</Link>
        </nav>
      </header>

      <section className={styles.content}>
        <span className={styles.icon}><BookOpenCheck size={22} /></span>
        <p className={styles.eyebrow}>INDEPENDENT STUDY</p>
        <h1>Learn it, don&apos;t just look it up.</h1>
        <p className={styles.intro}>
          Get help understanding ideas, planning your revision, or making extra
          practice activities. The assistant is separate from course lessons and
          assessments, and it will guide you rather than complete active tests
          or exams for you.
        </p>
        <div className={styles.notice}>
          <ShieldCheck size={18} />
          <span>Course lessons, quizzes, and exam questions are not shared with this assistant.</span>
        </div>
        <div className={styles.assistantArea}>
          <LearningAssistant
            courseId="independent-study"
            courseTitle="Independent study"
            variant="embedded"
          />
        </div>
      </section>
    </main>
  );
}
