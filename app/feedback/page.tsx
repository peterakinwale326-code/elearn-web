"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { ArrowRight, CheckCircle2, Star } from "lucide-react";
import styles from "./feedback.module.css";

const MAX_MESSAGE_LENGTH = 1000;
const CATEGORIES = ["Course content", "Platform usability", "Technical issue", "Other"];

export default function FeedbackPage() {
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  async function submitFeedback(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setError("");

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, rating, message: message.trim() }),
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.message || "We could not send your feedback.");
      }

      setStatus("sent");
      setMessage("");
      setRating(0);
    } catch (submitError) {
      setStatus("error");
      setError(submitError instanceof Error ? submitError.message : "We could not send your feedback.");
    }
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link href="/" className={styles.brand} aria-label="Fieldnote home">
          <span className={styles.brandMark} aria-hidden="true"><i /><i /><i /><i /></span>
          <span>Fieldnote</span>
        </Link>
        <nav className={styles.nav} aria-label="Student navigation">
          <Link href="/courses">Course library</Link>
          <span aria-current="page">Feedback</span>
        </nav>
      </header>

      <section className={styles.content}>
        <div className={styles.intro}>
          <p className={styles.kicker}>FIELDNOTE</p>
          <h1>Feedback</h1>
          <p>Report a course issue or suggest a platform change.</p>
        </div>

        {status === "sent" ? (
          <div className={styles.success} role="status">
            <CheckCircle2 size={24} aria-hidden="true" />
            <div>
              <h2>Feedback submitted</h2>
              <p>Your message was recorded.</p>
            </div>
            <button type="button" onClick={() => setStatus("idle")}>Send another</button>
          </div>
        ) : (
          <form className={styles.form} onSubmit={submitFeedback}>
            <label className={styles.field}>
              <span>Category</span>
              <select value={category} onChange={(event) => setCategory(event.target.value)}>
                {CATEGORIES.map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>

            <fieldset className={styles.ratingField}>
              <legend>Rating</legend>
              <div className={styles.stars}>
                {[1, 2, 3, 4, 5].map((value) => (
                  <label key={value} className={`${styles.starChoice} ${value <= rating ? styles.selectedStar : ""}`}>
                    <input
                      type="radio"
                      name="rating"
                      value={value}
                      checked={rating === value}
                      onChange={() => setRating(value)}
                      required
                    />
                    <span className={styles.visuallyHidden}>{value} {value === 1 ? "star" : "stars"}</span>
                    <Star size={21} fill={value <= rating ? "currentColor" : "none"} aria-hidden="true" />
                  </label>
                ))}
              </div>
            </fieldset>

            <label className={styles.field}>
              <span>Your feedback</span>
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value.slice(0, MAX_MESSAGE_LENGTH))}
                placeholder="Describe the issue or change you are requesting."
                minLength={10}
                maxLength={MAX_MESSAGE_LENGTH}
                rows={5}
                required
              />
            </label>
            <div className={styles.formFoot}>
              <span>Please do not include personal information.</span>
              <span>{message.length}/{MAX_MESSAGE_LENGTH}</span>
            </div>

            {status === "error" && (
              <p className={styles.error} role="alert">
                {error}{error.toLowerCase().includes("sign in") && <> <Link href="/login">Sign in</Link></>}
              </p>
            )}

            <button className={styles.submit} type="submit" disabled={status === "sending" || rating === 0 || message.trim().length < 10}>
              {status === "sending" ? "Sending…" : "Submit feedback"}
              <ArrowRight size={16} aria-hidden="true" />
            </button>
          </form>
        )}
      </section>
    </main>
  );
}