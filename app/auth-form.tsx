"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, Circle, LoaderCircle, LockKeyhole, Mail, RefreshCw, UserRound } from "lucide-react";
import { useState, type FormEvent } from "react";
import styles from "./auth-form.module.css";

type AuthMode = "login" | "signup";
type FormState = "idle" | "loading" | "resending" | "error" | "success";
type AuthFormProps = { mode: AuthMode };
type FieldName = "name" | "email" | "password" | "code";

type ApiResult = { message?: string; error?: string; challengeToken?: string };

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function AuthForm({ mode }: AuthFormProps) {
  const [formState, setFormState] = useState<FormState>("idle");
  const [message, setMessage] = useState("");
  const [stage, setStage] = useState<"credentials" | "verify">("credentials");
  const [challengeToken, setChallengeToken] = useState("");
  const [challengeEmail, setChallengeEmail] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [touched, setTouched] = useState<Record<FieldName, boolean>>({ name: false, email: false, password: false, code: false });
  const [attempted, setAttempted] = useState(false);
  const isSignup = mode === "signup";
  const normalizedName = name.trim().replace(/\s+/g, " ");
  const normalizedEmail = email.trim().toLowerCase();
  const emailValid = normalizedEmail.length <= 254 && emailPattern.test(normalizedEmail);
  const nameValid = normalizedName.length >= 2 && normalizedName.length <= 120;
  const passwordRequirements = [
    { label: "At least 8 characters", valid: password.length >= 8 },
    { label: "One uppercase letter", valid: /[A-Z]/.test(password) },
    { label: "One lowercase letter", valid: /[a-z]/.test(password) },
    { label: "One number", valid: /\d/.test(password) },
    { label: "No more than 200 characters", valid: password.length <= 200 },
  ];
  const passwordValid = password.length >= 8 && password.length <= 200 && (!isSignup || passwordRequirements.slice(1, 4).every((item) => item.valid));
  const codeValid = /^\d{6}$/.test(code);
  const formValid = stage === "verify" ? codeValid : emailValid && passwordValid && (!isSignup || nameValid);
  const busy = formState === "loading" || formState === "resending";

  function markTouched(field: FieldName) {
    setTouched((previous) => ({ ...previous, [field]: true }));
  }
  function clearMessageOnEdit() {
    if (formState === "error" || formState === "success") {
      setFormState("idle");
      setMessage("");
    }
  }

  function showError(field: FieldName) {
    return attempted || touched[field];
  }

  const nameError = normalizedName.length === 0
    ? "Name is required."
    : normalizedName.length < 2
      ? "Use at least 2 characters."
      : normalizedName.length > 120
        ? "Name must be 120 characters or fewer."
        : "";
  const emailError = normalizedEmail.length === 0
    ? "Email address is required."
    : normalizedEmail.length > 254
      ? "Email must be 254 characters or fewer."
      : !emailPattern.test(normalizedEmail)
        ? "Enter a valid email address."
        : "";
  const passwordError = password.length === 0
    ? "Password is required."
    : password.length < 8
      ? "Use at least 8 characters."
      : password.length > 200
        ? "Password must be 200 characters or fewer."
        : isSignup && !passwordRequirements.slice(1, 4).every((item) => item.valid)
          ? "Meet the remaining password requirements."
        : "";
  const codeError = code.length > 0 && !codeValid ? "Enter all 6 digits." : "";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAttempted(true);
    if (!emailValid || !passwordValid || (isSignup && !nameValid)) return;
    setFormState("loading");
    setMessage("");

    const payload = {
      ...(isSignup ? { name: normalizedName } : {}),
      email: normalizedEmail,
      password,
    };

    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => ({})) as ApiResult;

      if (!isSignup && response.status === 202 && result.challengeToken) {
        setChallengeToken(result.challengeToken);
        setChallengeEmail(payload.email);
        setPassword("");
        setStage("verify");
        setFormState("success");
        setMessage(result.message ?? "A sign-in code was sent to your email.");
        return;
      }

      if (!response.ok) {
        setFormState("error");
        setMessage(result.message ?? result.error ?? (response.status === 503
          ? "Authentication is not connected yet. Start the Node API and check its configuration."
          : "We couldn’t complete that request. Check your details and try again."));
        return;
      }

      if (isSignup) {
        setPassword("");
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

  async function handleVerify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAttempted(true);
    if (!codeValid) return;
    setFormState("loading");
    setMessage("");

    try {
      const response = await fetch("/api/auth/verify-2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challengeToken, code }),
      });
      const result = await response.json().catch(() => ({})) as ApiResult;
      if (!response.ok) {
        setFormState("error");
        setMessage(result.message ?? "That code could not be verified. Try again.");
        return;
      }
      window.location.assign("/courses");
    } catch {
      setFormState("error");
      setMessage("Could not reach the authentication service. Try again.");
    }
  }

  async function handleResend() {
    setFormState("resending");
    setMessage("");
    try {
      const response = await fetch("/api/auth/resend-2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challengeToken }),
      });
      const result = await response.json().catch(() => ({})) as ApiResult;
      if (!response.ok) {
        setFormState("error");
        setMessage(result.message ?? "Could not resend the code. Try again later.");
        return;
      }
      if (result.challengeToken) setChallengeToken(result.challengeToken);
      setFormState("success");
      setMessage(result.message ?? "A new sign-in code was sent.");
    } catch {
      setFormState("error");
      setMessage("Could not reach the authentication service. Try again.");
    }
  }

  function useDifferentAccount() {
    setStage("credentials");
    setChallengeToken("");
    setChallengeEmail("");
    setPassword("");
    setCode("");
    setMessage("");
    setFormState("idle");
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
          <h1 id="auth-title">{isSignup ? "Create your account." : stage === "verify" ? "Check your email." : "Log in to Fieldnote."}</h1>
          <p className={styles.intro}>
            {isSignup
              ? "Save your place and build a learning routine that works for you."
              : stage === "verify"
                ? `Enter the six-digit sign-in code sent to ${challengeEmail}. It expires in 10 minutes.`
                : "Pick up where your learning left off."}
          </p>

          {isSignup && formState === "success" ? (
            <div className={styles.signupSuccess}>
              <p className={styles.successMessage} role="status">{message || "Your account was created."}</p>
              <Link href="/login" className={styles.submitButton}>Go to log in <ArrowRight size={16} /></Link>
            </div>
          ) : (
          <>
          <form className={styles.form} noValidate onSubmit={stage === "verify" ? handleVerify : handleSubmit}>
            {stage === "verify" ? (
              <div className={styles.field}>
                <label htmlFor="email-code">Email verification code</label>
                <span className={styles.inputWrap}><Mail size={17} strokeWidth={1.8} /><input id="email-code" name="code" type="text" inputMode="numeric" autoComplete="one-time-code" value={code} maxLength={16} placeholder="000000" aria-label="Six-digit email code" aria-invalid={showError("code") && !codeValid} aria-describedby="code-count code-error" onChange={(event) => { setCode(event.target.value.replace(/\D/g, "").slice(0, 6)); clearMessageOnEdit(); }} onBlur={() => markTouched("code")} /></span>
                <span className={styles.fieldMeta}><span id="code-error">{showError("code") && !codeValid ? (codeError || "Enter the six-digit code.") : "Enter the 6-digit code from your email."}</span><span id="code-count">{code.length}/6</span></span>
              </div>
            ) : isSignup ? (
              <div className={styles.field}>
                <label htmlFor="account-name">Name</label>
                <span className={styles.inputWrap}><UserRound size={17} strokeWidth={1.8} /><input id="account-name" name="name" type="text" autoComplete="name" value={name} maxLength={120} placeholder="Your name" aria-invalid={showError("name") && !nameValid} aria-describedby="name-count name-error" onChange={(event) => { setName(event.target.value); clearMessageOnEdit(); }} onBlur={() => { setName((value) => value.trim().replace(/\s+/g, " ")); markTouched("name"); }} /></span>
                <span className={styles.fieldMeta}><span id="name-error" className={showError("name") && nameError ? styles.inlineError : ""}>{showError("name") && nameError ? nameError : "Use the name you want shown on your learning account."}</span><span id="name-count">{name.length}/120</span></span>
              </div>
            ) : null}
            {stage === "credentials" ? (
              <>
                <div className={styles.field}>
                  <label htmlFor="account-email">Email address</label>
                  <span className={styles.inputWrap}><Mail size={17} strokeWidth={1.8} /><input id="account-email" name="email" type="email" autoComplete="email" value={email} maxLength={254} placeholder="you@example.com" aria-invalid={showError("email") && Boolean(emailError)} aria-describedby="email-count email-error" onChange={(event) => { setEmail(event.target.value); clearMessageOnEdit(); }} onBlur={() => { setEmail((value) => value.trim().toLowerCase()); markTouched("email"); }} /></span>
                  <span className={styles.fieldMeta}><span id="email-error" className={showError("email") && emailError ? styles.inlineError : ""}>{showError("email") && emailError ? emailError : "We’ll send sign-in codes to this address."}</span><span id="email-count">{email.length}/254</span></span>
                </div>
                <div className={styles.field}>
                  <label htmlFor="account-password">Password</label>
                  <span className={styles.inputWrap}><LockKeyhole size={17} strokeWidth={1.8} /><input id="account-password" name="password" type="password" autoComplete={isSignup ? "new-password" : "current-password"} value={password} maxLength={200} placeholder={isSignup ? "Create a password" : "Your password"} aria-invalid={showError("password") && Boolean(passwordError)} aria-describedby="password-count password-error" onChange={(event) => { setPassword(event.target.value); clearMessageOnEdit(); }} onBlur={() => markTouched("password")} /></span>
                  <span className={styles.fieldMeta}><span id="password-error" className={showError("password") && passwordError ? styles.inlineError : ""}>{showError("password") && passwordError ? passwordError : isSignup ? "Use the checklist below to make a strong password." : "Enter your account password."}</span><span id="password-count">{password.length}/200</span></span>
                  {isSignup ? (
                    <>
                    <p id="password-requirements-title" className={styles.rulesTitle}>Password requirements</p>
                    <ul className={styles.passwordChecklist} aria-labelledby="password-requirements-title">
                      {passwordRequirements.map((requirement) => (
                        <li className={requirement.valid ? styles.requirementMet : styles.requirementMissing} key={requirement.label}>
                          {requirement.valid ? <Check size={14} aria-hidden="true" /> : <Circle size={14} aria-hidden="true" />}
                          {requirement.label}
                        </li>
                      ))}
                    </ul>
                    </>
                  ) : null}
                </div>
              </>
            ) : null}

            {message ? <p className={formState === "error" ? styles.errorMessage : styles.successMessage} role={formState === "error" ? "alert" : "status"}>{message}</p> : null}

            {!message && formState !== "loading" && formState !== "resending" ? (
              <p className={formValid ? styles.formReady : styles.formHint} role="status">
                {formValid ? "Everything looks good. You can continue." : stage === "verify" ? "Enter all 6 digits to verify your email." : "Complete the missing fields to continue."}
              </p>
            ) : null}

            <button className={styles.submitButton} type="submit" disabled={!formValid || busy || (isSignup && formState === "success")}>
              {formState === "loading"
                ? <><LoaderCircle size={17} /> {stage === "verify" ? "Verifying code…" : isSignup ? "Creating account…" : "Checking details…"}</>
                : formState === "resending"
                  ? <><LoaderCircle size={17} /> Sending a new code…</>
                : isSignup && formState === "success"
                  ? <>Account created <Check size={16} /></>
                : <>{stage === "verify" ? "Verify code" : isSignup ? "Create account" : "Continue"} <ArrowRight size={16} /></>}
            </button>
            {busy ? <p className={styles.pendingState} role="status"><LoaderCircle size={15} /> Working securely…</p> : null}
          </form>

          {!isSignup && stage === "verify" ? (
            <div className={styles.verifyActions}>
              <button type="button" onClick={handleResend} disabled={busy}><RefreshCw size={14} /> Resend code</button>
              <button type="button" onClick={useDifferentAccount}>Use a different email</button>
            </div>
          ) : null}

          <p className={styles.switchMode}>
            {isSignup ? "Already have an account? " : "New to Fieldnote? "}
            <Link href={isSignup ? "/login" : "/signup"}>{isSignup ? "Log in" : "Create an account"}</Link>
          </p>
          <p className={styles.privacyNote}>Your password is sent only to the configured authentication service over the app’s server-side route.</p>
          </>
          )}
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
