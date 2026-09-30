"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, LoaderCircle, LockKeyhole, Mail, UserRound } from "lucide-react";
import { useState, type FormEvent } from "react";
import styles from "./auth-form.module.css";

type AuthMode = "login" | "signup";
type FormState = "idle" | "loading" | "error" | "success";
type AuthFormProps = { mode: AuthMode };

type ApiResult = { message?: string; error?: string };

export default function AuthForm({ mode }: AuthFormProps) {
  const [formState, setFormState] = useState<FormState>("idle");
  const [message, setMessage] = useState("");
  const isSignup = mode === "signup";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormState("loading");
    setMessage("");

    const form = new FormData(event.currentTarget);
    const payload = {
      ...(isSignup ? { name: String(form.get("name") ?? "").trim() } : {}),
      email: String(form.get("email") ?? "").trim(),
      password: String(form.get("password") ?? ""),
    };

    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => ({})) as ApiResult;

      if (!response.ok) {
        setFormState("error");
        setMessage(result.message ?? result.error ?? (response.status === 503
          ? "Authentication is not connected yet. Start the Node API and check its configuration."
          : "We couldn’t complete that request. Check your details and try again."));
        return;
      }

      if (isSignup) {
        setFormState("success");
        setMessage(result.message ?? "Your account was created. You can now log in.");
        return;
      }

      window.location.assign("/courses");
    } catch {
      setFormState("error");
      setMessage("Could not reach the authentication service. Check that your Node API is running.");
    }
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link href="/" className={styles.brand} aria-label="Fieldnote home">
          <span className={styles.brandMark} aria-hidden="true"><i /><i /><i /><i /></span>
          <span>Fieldnote</span>
        </Link>
        <Link href="/courses" className={styles.backLink}><ArrowLeft size={15} /> Browse courses</Link>
      </header>

      <section className={styles.authLayout} aria-labelledby="auth-title">
        <div className={styles.formPanel}>
          <p className={styles.eyebrow}>{isSignup ? "START LEARNING" : "WELCOME BACK"}</p>
          <h1 id="auth-title">{isSignup ? "Create your account." : "Log in to Fieldnote."}</h1>
          <p className={styles.intro}>{isSignup ? "Save your place and build a learning routine that works for you." : "Pick up where your learning left off."}</p>

          <form className={styles.form} onSubmit={handleSubmit}>
            {isSignup ? (
              <label className={styles.field}>
                <span>Name</span>
                <span className={styles.inputWrap}><UserRound size={17} strokeWidth={1.8} /><input name="name" type="text" autoComplete="name" minLength={2} maxLength={120} required placeholder="Your name" /></span>
              </label>
            ) : null}
            <label className={styles.field}>
              <span>Email address</span>
              <span className={styles.inputWrap}><Mail size={17} strokeWidth={1.8} /><input name="email" type="email" autoComplete="email" required placeholder="you@example.com" /></span>
            </label>
            <label className={styles.field}>
              <span>Password</span>
              <span className={styles.inputWrap}><LockKeyhole size={17} strokeWidth={1.8} /><input name="password" type="password" autoComplete={isSignup ? "new-password" : "current-password"} minLength={8} required placeholder="At least 8 characters" /></span>
            </label>

            {message ? <p className={formState === "error" ? styles.errorMessage : styles.successMessage} role={formState === "error" ? "alert" : "status"}>{message}</p> : null}

            <button className={styles.submitButton} type="submit" disabled={formState === "loading"}>
              {formState === "loading" ? <><LoaderCircle size={17} /> {isSignup ? "Creating account…" : "Logging in…"}</> : <>{isSignup ? "Create account" : "Log in"} <ArrowRight size={16} /></>}
            </button>
          </form>

          <p className={styles.switchMode}>
            {isSignup ? "Already have an account? " : "New to Fieldnote? "}
            <Link href={isSignup ? "/login" : "/signup"}>{isSignup ? "Log in" : "Create an account"}</Link>
          </p>
          <p className={styles.privacyNote}>Your password is sent only to the configured authentication service over the app’s server-side route.</p>
        </div>

        <aside className={styles.sidePanel}>
          <span className={styles.panelIcon}><LockKeyhole size={20} strokeWidth={1.7} /></span>
          <p className={styles.sideEyebrow}>YOUR LEARNING SPACE</p>
          <h2>One step at a time adds up.</h2>
          <p>Explore distinct courses, move through focused lessons, and check what you know with quizzes and exams.</p>
          <Link href="/courses" className={styles.sideLink}>See the course library <ArrowRight size={15} /></Link>
        </aside>
      </section>

      <footer className={styles.footer}><span>Fieldnote</span><span>Learning, with room to make it yours.</span></footer>
    </main>
  );
}
