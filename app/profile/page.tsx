"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Camera,
  CheckCircle2,
  GraduationCap,
  LockKeyhole,
  Settings2,
  UserRound,
} from "lucide-react";
import type { CourseSummary } from "@/lib/course-types";
import { getCourseImage } from "@/lib/course-images";
import styles from "./profile.module.css";

type ProfileUser = {
  id: number;
  name: string;
  email: string;
  role: string;
  profileImageUrl: string | null;
};

type ProfileResponse = {
  user?: ProfileUser;
  courses?: CourseSummary[];
  message?: string;
};

type ProfileTab = "learning" | "profile" | "settings";

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "S";
}

export default function ProfilePage() {
  const [user, setUser] = useState<ProfileUser | null>(null);
  const [courses, setCourses] = useState<CourseSummary[]>([]);
  const [activeTab, setActiveTab] = useState<ProfileTab>("learning");
  const [loading, setLoading] = useState(true);
  const [signedOut, setSignedOut] = useState(false);
  const [pageError, setPageError] = useState("");
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadProfile() {
      try {
        const response = await fetch("/api/profile", {
          cache: "no-store",
          signal: controller.signal,
        });
        const result = await response.json() as ProfileResponse;
        if (!response.ok) {
          setSignedOut(response.status === 401);
          throw new Error(result.message || "Your profile could not be loaded.");
        }
        if (!result.user) throw new Error("The profile response did not include your account.");
        setSignedOut(false);
        setUser(result.user);
        setCourses(result.courses ?? []);
        setName(result.user.name);
        setEmail(result.user.email);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setPageError(error instanceof Error ? error.message : "Your profile could not be loaded.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void loadProfile();
    return () => controller.abort();
  }, []);

  async function saveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving || !user) return;
    setSaving(true);
    setNotice("");
    setPageError("");

    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, currentPassword }),
      });
      const result = await response.json() as ProfileResponse;
      if (!response.ok || !result.user) {
        throw new Error(result.message || "Your profile could not be updated.");
      }
      setUser(result.user);
      setName(result.user.name);
      setEmail(result.user.email);
      setCurrentPassword("");
      setNotice(result.message || "Your profile was updated.");
    } catch (error) {
      setPageError(error instanceof Error ? error.message : "Your profile could not be updated.");
    } finally {
      setSaving(false);
    }
  }

  async function changePassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    if (newPassword !== confirmPassword) {
      setPageError("Your new password entries do not match.");
      setNotice("");
      return;
    }
    setSaving(true);
    setPageError("");
    setNotice("");

    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const result = await response.json() as ProfileResponse;
      if (!response.ok) throw new Error(result.message || "Your password could not be changed.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setNotice("Your password was changed.");
    } catch (error) {
      setPageError(error instanceof Error ? error.message : "Your password could not be changed.");
      setNotice("");
    } finally {
      setSaving(false);
    }
  }

  async function uploadAvatar(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    if (!file || uploading) return;
    setUploading(true);
    setPageError("");
    setNotice("");

    try {
      const formData = new FormData();
      formData.append("avatar", file);
      const response = await fetch("/api/profile/avatar", {
        method: "POST",
        body: formData,
      });
      const result = await response.json() as { profileImageUrl?: string; message?: string };
      if (!response.ok || !result.profileImageUrl) {
        throw new Error(result.message || "Your picture could not be uploaded.");
      }
      setUser((current) => current
        ? { ...current, profileImageUrl: result.profileImageUrl ?? null }
        : current);
      setNotice("Your profile picture was updated.");
    } catch (error) {
      setPageError(error instanceof Error ? error.message : "Your picture could not be uploaded.");
    } finally {
      setUploading(false);
    }
  }

  const displayName = user?.name || "Student";

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link href="/" className={styles.brand}>Fieldnote</Link>
        <nav aria-label="Main navigation">
          <Link href="/courses">Browse courses</Link>
          <Link href="/assistant">Study assistant</Link>
        </nav>
      </header>

      <div className={styles.content}>
        <div className={styles.heading}>
          <p className={styles.eyebrow}>STUDENT ACCOUNT</p>
          <h1>Your profile</h1>
          <p>Manage your learning, personal details, and account security.</p>
        </div>

        {pageError && user && (
          <div className={styles.alert} role="alert">
            {pageError}
          </div>
        )}
        {notice && (
          <div className={styles.success} role="status">
            <CheckCircle2 size={17} /> {notice}
          </div>
        )}

        {loading ? (
          <div className={styles.loading} role="status">Loading your profile…</div>
        ) : !user && signedOut ? (
          <section className={styles.signedOut}>
            <UserRound size={30} />
            <h2>Sign in to see your profile</h2>
            <p>Your enrolled courses and account settings are available after you log in.</p>
            <Link href="/login" className={styles.primaryButton}>Log in</Link>
          </section>
        ) : !user ? (
          <section className={styles.signedOut}>
            <UserRound size={30} />
            <h2>Profile unavailable</h2>
            <p>{pageError || "Your profile could not be loaded right now."}</p>
            <button
              className={styles.primaryButton}
              type="button"
              onClick={() => window.location.reload()}
            >
              Try again
            </button>
          </section>
        ) : (
          <>
            <section className={styles.identityCard}>
              <div className={styles.avatar}>
                {user.profileImageUrl
                  ? <img src={user.profileImageUrl} alt="" />
                  : <span>{initials(displayName)}</span>}
              </div>
              <div className={styles.identityText}>
                <h2>{displayName}</h2>
                <p>{user.email}</p>
                <span>{user.role === "student" ? "Student account" : `${user.role} account`}</span>
              </div>
              <label className={styles.uploadButton}>
                <Camera size={16} />
                {uploading ? "Uploading…" : "Change photo"}
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={uploadAvatar}
                  disabled={uploading}
                  aria-label="Upload profile picture"
                />
              </label>
            </section>

            <nav className={styles.tabs} aria-label="Profile sections">
              <button
                type="button"
                className={activeTab === "learning" ? styles.activeTab : ""}
                onClick={() => setActiveTab("learning")}
              >
                <BookOpen size={17} /> My learning
              </button>
              <button
                type="button"
                className={activeTab === "profile" ? styles.activeTab : ""}
                onClick={() => setActiveTab("profile")}
              >
                <UserRound size={17} /> Profile
              </button>
              <button
                type="button"
                className={activeTab === "settings" ? styles.activeTab : ""}
                onClick={() => setActiveTab("settings")}
              >
                <Settings2 size={17} /> Settings
              </button>
            </nav>

            {activeTab === "learning" && (
              <section className={styles.section}>
                <div className={styles.sectionHeading}>
                  <div>
                    <p className={styles.eyebrow}>YOUR CLASSROOM</p>
                    <h2>Enrolled courses</h2>
                  </div>
                  <span className={styles.courseCount}>{courses.length} {courses.length === 1 ? "course" : "courses"}</span>
                </div>
                {courses.length === 0 ? (
                  <div className={styles.emptyCourses}>
                    <GraduationCap size={30} />
                    <h3>No enrolled courses yet</h3>
                    <p>Explore the catalog and enroll in a course to see it here.</p>
                    <Link href="/courses" className={styles.textLink}>
                      Browse courses <ArrowRight size={16} />
                    </Link>
                  </div>
                ) : (
                  <div className={styles.courseGrid}>
                    {courses.map((course) => (
                      <Link
                        href={`/courses/${course.id}`}
                        className={styles.courseCard}
                        key={course.id}
                      >
                        <img
                          className={styles.courseImage}
                          src={getCourseImage(course.title, course.subject, course.thumbnailUrl)}
                          alt=""
                        />
                        <div className={styles.courseBody}>
                          <span>{course.subject} · {course.level}</span>
                          <h3>{course.title}</h3>
                          <p>{course.lessonCount} lessons <ArrowRight size={15} /></p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </section>
            )}

            {activeTab === "profile" && (
              <section className={styles.section}>
                <div className={styles.sectionHeading}>
                  <div>
                    <p className={styles.eyebrow}>PERSONAL INFORMATION</p>
                    <h2>Edit your profile</h2>
                  </div>
                </div>
                <form className={styles.form} onSubmit={saveProfile}>
                  <label>
                    Full name
                    <input
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      autoComplete="name"
                      minLength={2}
                      maxLength={120}
                      required
                    />
                  </label>
                  <label>
                    Email address
                    <input
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      autoComplete="email"
                      maxLength={254}
                      required
                    />
                  </label>
                  {email.trim().toLowerCase() !== user.email.toLowerCase() && (
                    <label>
                      Current password (required to change email)
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(event) => setCurrentPassword(event.target.value)}
                        autoComplete="current-password"
                        required
                      />
                    </label>
                  )}
                  <button className={styles.primaryButton} type="submit" disabled={saving}>
                    {saving ? "Saving…" : "Save profile"}
                  </button>
                </form>
              </section>
            )}

            {activeTab === "settings" && (
              <section className={styles.section}>
                <div className={styles.sectionHeading}>
                  <div>
                    <p className={styles.eyebrow}>ACCOUNT SECURITY</p>
                    <h2>Change password</h2>
                  </div>
                  <LockKeyhole size={21} />
                </div>
                <p className={styles.helpText}>
                  Use at least 8 characters with an uppercase letter, a lowercase letter, and a number.
                </p>
                <form className={styles.form} onSubmit={changePassword}>
                  <label>
                    Current password
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(event) => setCurrentPassword(event.target.value)}
                      autoComplete="current-password"
                      required
                    />
                  </label>
                  <label>
                    New password
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(event) => setNewPassword(event.target.value)}
                      autoComplete="new-password"
                      minLength={8}
                      maxLength={200}
                      required
                    />
                  </label>
                  <label>
                    Confirm new password
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      autoComplete="new-password"
                      minLength={8}
                      maxLength={200}
                      required
                    />
                  </label>
                  <button className={styles.primaryButton} type="submit" disabled={saving}>
                    {saving ? "Updating…" : "Update password"}
                  </button>
                </form>
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
}
