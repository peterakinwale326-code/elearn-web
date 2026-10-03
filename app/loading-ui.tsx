import styles from "./loading-ui.module.css";

export function CourseGridSkeleton() {
  return (
    <main className={styles.page} role="status" aria-label="Loading course library" aria-busy="true">
      <div className={styles.heading}>
        <i className={styles.eyebrow} />
        <i className={styles.title} />
        <i className={styles.subtitle} />
      </div>
      <div className={styles.summary}><i /><i /><i /><i /></div>
      <div className={styles.courseGrid}>
        {Array.from({ length: 9 }, (_, index) => <article className={styles.courseCard} key={index}><i /><i /><i /><i /><i /></article>)}
      </div>
    </main>
  );
}

export function CourseDetailSkeleton() {
  return (
    <main className={`${styles.page} ${styles.detailPage}`} role="status" aria-label="Loading course details" aria-busy="true">
      <i className={styles.backLink} />
      <div className={styles.detailHeading}><i /><i /><i /><i /></div>
      <div className={styles.detailGrid}>
        <aside>{Array.from({ length: 8 }, (_, index) => <i key={index} />)}</aside>
        <section><i /><i /><i /><i /><article><i /><i /><i /><i /></article></section>
      </div>
    </main>
  );
}

export function AuthFormSkeleton() {
  return (
    <main className={`${styles.page} ${styles.authPage}`} role="status" aria-label="Loading account form" aria-busy="true">
      <i className={styles.backLink} />
      <section className={styles.authGrid}>
        <div className={styles.authForm}><i /><i /><i />{Array.from({ length: 3 }, (_, index) => <i key={index} />)}<i /></div>
        <aside><i /><i /><i /></aside>
      </section>
    </main>
  );
}
