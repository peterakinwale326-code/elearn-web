"use client";

import { useCallback, useEffect, useState } from "react";
import "./admin.css";

type Tab = "dashboard" | "courses" | "content" | "students" | "feedback";
type Notice = { ok?: string; err?: string };

type Course = {
  id: number;
  title: string;
  subject: string;
  level: string | null;
  is_published: number | boolean;
  module_count: number;
  lesson_count: number;
};

type Student = {
  id: number;
  name: string;
  email: string;
  status: "active" | "suspended";
  created_at: string | null;
  courses_enrolled: number;
};

type ContentItem = {
  id: number;
  title: string;
  file_path: string;
  course: string | null;
  type: string;
  status: string;
  created_at: string | null;
};

type FeedbackItem = {
  id: number;
  name: string;
  category: string;
  rating: number;
  message: string;
  status: "pending" | "reviewed";
  created_at: string | null;
};

type FeedbackData = {
  pending: number;
  reviewed: number;
  avgRating: number | null;
  items: FeedbackItem[];
};

type DashboardStats = {
  totalStudents: number;
  activeCourses: number;
  pendingFeedback: number;
  totalEnrollments: number;
};

async function api<T>(url: string, opts?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...opts, cache: "no-store" });
  const data: unknown = await response.json().catch(() => ({}));
  if (!response.ok) {
    const body = data as { error?: string; message?: string };
    throw new Error(body.error || body.message || `Request failed (${response.status})`);
  }
  return data as T;
}

function useDebounced(value: string, ms = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(timeout);
  }, [value, ms]);
  return debounced;
}

const formatDate = (value: string | null | undefined) => {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleDateString();
};

function ErrorNotice({ message }: { message: string }) {
  return <p className="err" role="alert">{message}</p>;
}

function Dashboard({ onNavigate }: { onNavigate: (tab: Tab) => void }) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setStats(await api<DashboardStats>("/api/admin/stats"));
    } catch (reason) {
      setError((reason as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="panel">
      <div className="panelHeader panelHeaderRow">
        <div>
          <span className="sectionEyebrow">OVERVIEW</span>
          <h2>Platform overview</h2>
        </div>
        <button className="btn grey" type="button" onClick={() => void load()} disabled={loading}>
          {loading ? "Refreshing…" : "Refresh"}
        </button>
      </div>
      {error && <ErrorNotice message={error} />}
      <div className="cards">
        <div className="card accent">
          <span>Total students</span>
          <b>{stats?.totalStudents ?? (loading ? "…" : "—")}</b>
          <small>Registered student accounts</small>
        </div>
        <div className="card">
          <span>Published courses</span>
          <b>{stats?.activeCourses ?? (loading ? "…" : "—")}</b>
          <small>Visible in the learner portal</small>
        </div>
        <div className="card warning">
          <span>Pending feedback</span>
          <b>{stats?.pendingFeedback ?? (loading ? "…" : "—")}</b>
          <small>Waiting for an administrator</small>
        </div>
        <div className="card">
          <span>Enrollments</span>
          <b>{stats?.totalEnrollments ?? (loading ? "…" : "—")}</b>
          <small>Across all courses</small>
        </div>
      </div>
      <div className="adminQuickActions">
        <h3>Manage the learning platform</h3>
        <div className="quickActionGrid">
          <button type="button" onClick={() => onNavigate("courses")}>
            <strong>Courses</strong><span>Review course visibility and lesson totals</span>
          </button>
          <button type="button" onClick={() => onNavigate("students")}>
            <strong>Students</strong><span>Find accounts and manage access</span>
          </button>
          <button type="button" onClick={() => onNavigate("content")}>
            <strong>Learning materials</strong><span>Upload or remove course resources</span>
          </button>
          <button type="button" onClick={() => onNavigate("feedback")}>
            <strong>Feedback</strong><span>Read submissions and mark them reviewed</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function Courses() {
  const [rows, setRows] = useState<Course[]>([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);
  const debouncedQuery = useDebounced(query);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setRows(await api<Course[]>("/api/admin/courses"));
    } catch (reason) {
      setError((reason as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filteredRows = rows.filter((course) =>
    `${course.title} ${course.subject} ${course.level ?? ""}`
      .toLocaleLowerCase()
      .includes(debouncedQuery.toLocaleLowerCase()),
  );

  async function setPublished(course: Course) {
    const next = !Boolean(course.is_published);
    setSavingId(course.id);
    setError("");
    try {
      await api(`/api/admin/courses/${course.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: next }),
      });
      setRows((current) =>
        current.map((item) => item.id === course.id ? { ...item, is_published: next } : item),
      );
    } catch (reason) {
      setError((reason as Error).message);
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="panel">
      <div className="panelHeader panelHeaderRow">
        <div>
          <span className="sectionEyebrow">COURSE CATALOG</span>
          <h2>Courses</h2>
        </div>
        <button className="btn grey" type="button" onClick={() => void load()} disabled={loading}>
          {loading ? "Loading…" : "Refresh"}
        </button>
      </div>
      {error && <ErrorNotice message={error} />}
      <div className="bar">
        <input aria-label="Search courses" placeholder="Search title, subject or level" value={query} onChange={(event) => setQuery(event.target.value)} />
      </div>
      <div className="adminTableWrap">
        <table>
          <thead><tr><th>Course</th><th>Subject</th><th>Level</th><th>Modules</th><th>Lessons</th><th>Visibility</th><th>Action</th></tr></thead>
          <tbody>
            {filteredRows.map((course) => {
              const published = Boolean(course.is_published);
              return (
                <tr key={course.id}>
                  <td>{course.title}</td>
                  <td>{course.subject}</td>
                  <td>{course.level || "—"}</td>
                  <td>{course.module_count}</td>
                  <td>{course.lesson_count}</td>
                  <td><span className={`statusBadge ${published ? "active" : "suspended"}`}>{published ? "Published" : "Hidden"}</span></td>
                  <td>
                    <button className={published ? "btn grey" : "btn"} type="button" disabled={savingId === course.id} onClick={() => void setPublished(course)}>
                      {savingId === course.id ? "Saving…" : published ? "Unpublish" : "Publish"}
                    </button>
                  </td>
                </tr>
              );
            })}
            {!loading && !filteredRows.length && <tr><td colSpan={7}>{query ? "No courses match this search." : "No courses available."}</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Content() {
  const [rows, setRows] = useState<ContentItem[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [query, setQuery] = useState("");
  const [type, setType] = useState("");
  const [notice, setNotice] = useState<Notice | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const debouncedQuery = useDebounced(query);

  const load = useCallback(async () => {
    setLoading(true);
    setNotice(null);
    const params = new URLSearchParams({ q: debouncedQuery, type });
    try {
      setRows(await api<ContentItem[]>(`/api/admin/content?${params}`));
    } catch (reason) {
      setNotice({ err: (reason as Error).message });
    } finally {
      setLoading(false);
    }
  }, [debouncedQuery, type]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    api<Course[]>("/api/admin/courses")
      .then(setCourses)
      .catch((reason: Error) => setNotice({ err: reason.message }));
  }, []);

  async function upload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(null);
    setUploading(true);
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    try {
      await api("/api/admin/content", { method: "POST", body: form });
      formElement.reset();
      await load();
      setNotice({ ok: "Course material uploaded." });
    } catch (reason) {
      setNotice({ err: (reason as Error).message });
    } finally {
      setUploading(false);
    }
  }

  async function remove(item: ContentItem) {
    if (!window.confirm(`Delete "${item.title}"? This cannot be undone.`)) return;
    setNotice(null);
    try {
      await api(`/api/admin/content/${item.id}`, { method: "DELETE" });
      setRows((current) => current.filter((row) => row.id !== item.id));
      setNotice({ ok: "Course material deleted." });
    } catch (reason) {
      setNotice({ err: (reason as Error).message });
    }
  }

  return (
    <>
      <form className="form" onSubmit={upload}>
        <b>Upload course material</b>
        <input name="title" placeholder="Title" maxLength={160} required />
        <textarea name="description" placeholder="Description (optional)" rows={2} maxLength={1000} />
        <select name="type" required defaultValue="">
          <option value="" disabled>File type</option>
          <option value="PDF">PDF</option>
          <option value="Video">Video</option>
          <option value="Quiz">Quiz</option>
        </select>
        <select name="course_id" defaultValue="">
          <option value="">No course</option>
          {courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}
        </select>
        <input type="file" name="file" accept=".pdf,.mp4,.webm,.json,.csv" required />
        <button className="btn" disabled={uploading}>{uploading ? "Uploading…" : "Upload material"}</button>
        {notice?.ok && <span className="ok" role="status">{notice.ok}</span>}
        {notice?.err && <ErrorNotice message={notice.err} />}
      </form>

      <div className="bar">
        <input aria-label="Search materials" placeholder="Search by title" value={query} onChange={(event) => setQuery(event.target.value)} />
        <select aria-label="Filter by file type" value={type} onChange={(event) => setType(event.target.value)}>
          <option value="">All types</option><option value="PDF">PDF</option><option value="Video">Video</option><option value="Quiz">Quiz</option>
        </select>
        <button className="btn grey" type="button" onClick={() => void load()} disabled={loading}>Refresh list</button>
      </div>
      {notice?.err && <ErrorNotice message={notice.err} />}
      <div className="adminTableWrap">
        <table>
          <thead><tr><th>Title</th><th>Course</th><th>Type</th><th>Uploaded</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>
            {rows.map((item) => (
              <tr key={item.id}>
                <td><a href={item.file_path} target="_blank" rel="noreferrer">{item.title}</a></td>
                <td>{item.course || "—"}</td><td>{item.type}</td><td>{formatDate(item.created_at)}</td><td>{item.status}</td>
                <td><button className="btn red" type="button" onClick={() => void remove(item)}>Delete</button></td>
              </tr>
            ))}
            {!loading && !rows.length && <tr><td colSpan={6}>{query ? "No materials match this search." : "No course materials uploaded yet."}</td></tr>}
            {loading && <tr><td colSpan={6}>Loading course materials…</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}

function Students() {
  const [rows, setRows] = useState<Student[]>([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);
  const debouncedQuery = useDebounced(query);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const params = new URLSearchParams({ q: debouncedQuery, status });
    try {
      setRows(await api<Student[]>(`/api/admin/students?${params}`));
    } catch (reason) {
      setError((reason as Error).message);
    } finally {
      setLoading(false);
    }
  }, [debouncedQuery, status]);

  useEffect(() => {
    void load();
  }, [load]);

  async function setUserStatus(student: Student, nextStatus: Student["status"]) {
    setSavingId(student.id);
    setError("");
    try {
      await api(`/api/admin/students/${student.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      setRows((current) => current
        .map((row) => row.id === student.id ? { ...row, status: nextStatus } : row)
        .filter((row) => !status || row.status === status));
    } catch (reason) {
      setError((reason as Error).message);
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="panel">
      <div className="panelHeader panelHeaderRow">
        <div><span className="sectionEyebrow">LEARNER ACCOUNTS</span><h2>Students</h2></div>
        <button className="btn grey" type="button" onClick={() => void load()} disabled={loading}>{loading ? "Loading…" : "Refresh"}</button>
      </div>
      {error && <ErrorNotice message={error} />}
      <div className="bar">
        <input aria-label="Search students" placeholder="Search by name or email" value={query} onChange={(event) => setQuery(event.target.value)} />
        <select aria-label="Filter students by status" value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="">All status</option><option value="active">Active</option><option value="suspended">Suspended</option>
        </select>
      </div>
      <div className="adminTableWrap">
        <table>
          <thead><tr><th>Name</th><th>Email</th><th>Registered</th><th>Courses</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>
            {rows.map((student) => (
              <tr key={student.id}>
                <td>{student.name}</td><td>{student.email}</td><td>{formatDate(student.created_at)}</td><td>{student.courses_enrolled}</td>
                <td><span className={`statusBadge ${student.status}`}>{student.status}</span></td>
                <td><button className={student.status === "active" ? "btn grey" : "btn"} type="button" disabled={savingId === student.id} onClick={() => void setUserStatus(student, student.status === "active" ? "suspended" : "active")}>
                  {savingId === student.id ? "Saving…" : student.status === "active" ? "Suspend" : "Activate"}
                </button></td>
              </tr>
            ))}
            {!loading && !rows.length && <tr><td colSpan={6}>{query ? "No students match this search." : "No student accounts found."}</td></tr>}
            {loading && <tr><td colSpan={6}>Loading students…</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Feedback() {
  const [data, setData] = useState<FeedbackData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setData(await api<FeedbackData>("/api/admin/feedback"));
    } catch (reason) {
      setError((reason as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function review(item: FeedbackItem) {
    setSavingId(item.id);
    setError("");
    try {
      await api(`/api/admin/feedback/${item.id}`, { method: "PATCH" });
      setData((current) => current ? {
        ...current,
        pending: Math.max(0, current.pending - 1),
        reviewed: current.reviewed + 1,
        items: current.items.map((row) => row.id === item.id ? { ...row, status: "reviewed" } : row),
      } : current);
    } catch (reason) {
      setError((reason as Error).message);
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="panel">
      <div className="panelHeader panelHeaderRow">
        <div><span className="sectionEyebrow">STUDENT VOICE</span><h2>Student feedback</h2></div>
        <button className="btn grey" type="button" onClick={() => void load()} disabled={loading}>{loading ? "Loading…" : "Refresh"}</button>
      </div>
      {error && <ErrorNotice message={error} />}
      {data && <>
        <div className="cards" style={{ marginBottom: 16 }}>
          <div className="card warning"><span>Pending</span><b>{data.pending}</b><small>Awaiting review</small></div>
          <div className="card accent"><span>Reviewed</span><b>{data.reviewed}</b><small>Reviewed submissions</small></div>
          <div className="card"><span>Average rating</span><b>{data.avgRating ?? "—"}</b><small>Out of 5</small></div>
        </div>
        <div className="adminTableWrap">
          <table>
            <thead><tr><th>Student</th><th>Category</th><th>Rating</th><th>Message</th><th>Date</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              {data.items.map((item) => (
                <tr key={item.id}>
                  <td>{item.name}</td><td>{item.category}</td><td><span className="ratingPill">{item.rating}/5</span></td>
                  <td className="messageCell">{item.message}</td><td>{formatDate(item.created_at)}</td>
                  <td><span className={`statusBadge ${item.status}`}>{item.status}</span></td>
                  <td>{item.status === "pending" && <button className="btn" type="button" disabled={savingId === item.id} onClick={() => void review(item)}>{savingId === item.id ? "Saving…" : "Mark reviewed"}</button>}</td>
                </tr>
              ))}
              {!data.items.length && <tr><td colSpan={7}>No feedback has been submitted yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </>}
      {loading && !data && <p>Loading feedback…</p>}
    </div>
  );
}

const TABS: { id: Tab; label: string }[] = [
  { id: "dashboard", label: "Dashboard" },
  { id: "courses", label: "Courses" },
  { id: "content", label: "Learning materials" },
  { id: "students", label: "Students" },
  { id: "feedback", label: "Feedback" },
];

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>("dashboard");
  const title = TABS.find((item) => item.id === tab)?.label ?? "Dashboard";

  return (
    <div className="adm shell">
      <aside className="sidebar">
        <div className="brandBlock">
          <div className="brandMark" aria-hidden="true"><i /><i /><i /><i /></div>
          <div><span className="brandLabel">Fieldnote</span><small>Teaching hub</small></div>
        </div>
        <nav className="sidebarNav" aria-label="Admin dashboard">
          {TABS.map((item) => (
            <button key={item.id} type="button" className={tab === item.id ? "on" : ""} aria-pressed={tab === item.id} onClick={() => setTab(item.id)}>
              {item.label}
            </button>
          ))}
        </nav>
        <div className="sidebarFooter"><span>Workspace</span><strong>Courses · learners · feedback</strong></div>
      </aside>
      <main className="dashboardMain">
        <header className="topBar">
          <div><span className="eyebrow">Course administration</span><h1>{title}</h1></div>
          <a href="/courses" className="headerAction">View learner portal</a>
        </header>
        {tab === "dashboard" && <Dashboard onNavigate={setTab} />}
        {tab === "courses" && <Courses />}
        {tab === "content" && <Content />}
        {tab === "students" && <Students />}
        {tab === "feedback" && <Feedback />}
      </main>
    </div>
  );
}
