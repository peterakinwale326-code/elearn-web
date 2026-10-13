"use client";

import { useEffect, useState, useCallback } from "react";
import "./admin.css";

async function api(url: string, opts?: RequestInit) {
  const response = await fetch(url, opts);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error((data as { error?: string; message?: string }).error || (data as { error?: string; message?: string }).message || "Request failed");
  return data;
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
  return new Date(value).toLocaleDateString();
};

function Dashboard() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    api("/api/admin/stats").then(setStats).catch(() => setStats({}));
  }, []);

  if (!stats) return <p>Loading...</p>;

  return (
    <div className="panel">
      <div className="panelHeader">
        <div>
          <span className="sectionEyebrow">OVERVIEW</span>
          <h2>Learning performance</h2>
        </div>
      </div>

      <div className="cards">
        <div className="card accent">
          <span>Total Students</span>
          <b>{stats.totalStudents ?? "-"}</b>
          <small>Active learners</small>
        </div>
        <div className="card">
          <span>Active Courses</span>
          <b>{stats.activeCourses ?? "-"}</b>
          <small>Current catalog</small>
        </div>
        <div className="card warning">
          <span>Pending Feedback</span>
          <b>{stats.pendingFeedback ?? "-"}</b>
          <small>Needs review</small>
        </div>
      </div>
    </div>
  );
}

function Content() {
  const [rows, setRows] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [type, setType] = useState("");
  const [message, setMessage] = useState<{ ok?: string; err?: string } | null>(null);
  const debouncedQuery = useDebounced(query);

  const load = useCallback(() => {
    const params = new URLSearchParams({ q: debouncedQuery, type });
    api(`/api/admin/content?${params}`).then(setRows).catch((error: Error) => setMessage({ err: error.message }));
  }, [debouncedQuery, type]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    api("/api/admin/courses").then(setCourses).catch(() => {});
  }, []);

  async function upload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    const form = new FormData(event.currentTarget);
    try {
      await api("/api/admin/content", { method: "POST", body: form });
      event.currentTarget.reset();
      setMessage({ ok: "File uploaded successfully" });
      load();
    } catch (error) {
      setMessage({ err: (error as Error).message });
    }
  }

  async function remove(id: number | string) {
    if (!confirm("Delete this item?")) return;
    await api(`/api/admin/content/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <>
      <form className="form" onSubmit={upload}>
        <b>Add New Material</b>
        <input name="title" placeholder="Material title" required />
        <textarea name="description" placeholder="Description" rows={2} />
        <select name="type" required defaultValue="">
          <option value="" disabled>File type</option>
          <option>PDF</option>
          <option>Video</option>
          <option>Quiz</option>
        </select>
        <select name="course_id" defaultValue="">
          <option value="">No course</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>{course.title}</option>
          ))}
        </select>
        <input type="file" name="file" required />
        <button className="btn">Upload File</button>
        {message?.ok && <span className="ok">{message.ok}</span>}
        {message?.err && <span className="err">{message.err}</span>}
      </form>

      <div className="bar">
        <input placeholder="Search by title" value={query} onChange={(event) => setQuery(event.target.value)} />
        <select value={type} onChange={(event) => setType(event.target.value)}>
          <option value="">All types</option>
          <option>PDF</option>
          <option>Video</option>
          <option>Quiz</option>
        </select>
      </div>

      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Course</th>
            <th>Type</th>
            <th>Uploaded</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((item) => (
            <tr key={item.id}>
              <td>
                <a href={item.file_path} target="_blank" rel="noreferrer">{item.title}</a>
              </td>
              <td>{item.course || "-"}</td>
              <td>{item.type}</td>
              <td>{formatDate(item.created_at)}</td>
              <td>{item.status}</td>
              <td><button className="btn red" onClick={() => remove(item.id)}>Delete</button></td>
            </tr>
          ))}
          {!rows.length && <tr><td colSpan={6}>No content found</td></tr>}
        </tbody>
      </table>
    </>
  );
}

function Students() {
  const [rows, setRows] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const debouncedQuery = useDebounced(query);

  const load = useCallback(() => {
    const params = new URLSearchParams({ q: debouncedQuery, status });
    api(`/api/admin/students?${params}`).then(setRows).catch(() => {});
  }, [debouncedQuery, status]);

  useEffect(() => {
    load();
  }, [load]);

  async function setUserStatus(id: number | string, nextStatus: "active" | "suspended") {
    await api(`/api/admin/students/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });
    load();
  }

  return (
    <>
      <div className="bar">
        <input placeholder="Search by name or email" value={query} onChange={(event) => setQuery(event.target.value)} />
        <select value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="">All status</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Registered</th>
            <th>Courses</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((student) => (
            <tr key={student.id}>
              <td>{student.id}</td>
              <td>{student.name}</td>
              <td>{student.email}</td>
              <td>{formatDate(student.created_at)}</td>
              <td>{student.courses_enrolled}</td>
              <td>{student.status}</td>
              <td>
                {student.status === "active" ? (
                  <button className="btn grey" onClick={() => setUserStatus(student.id, "suspended")}>Suspend</button>
                ) : (
                  <button className="btn" onClick={() => setUserStatus(student.id, "active")}>Activate</button>
                )}
              </td>
            </tr>
          ))}
          {!rows.length && <tr><td colSpan={7}>No students found</td></tr>}
        </tbody>
      </table>
    </>
  );
}

function Feedback() {
  const [data, setData] = useState<any>(null);
  const load = useCallback(() => {
    api("/api/admin/feedback").then(setData).catch(() => {});
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function review(id: number | string) {
    await api(`/api/admin/feedback/${id}`, { method: "PATCH" });
    load();
  }

  if (!data) return <p>Loading...</p>;

  return (
    <div className="panel">
      <div className="panelHeader">
        <div>
          <span className="sectionEyebrow">STUDENT VOICE</span>
          <h2>Feedback and ratings</h2>
        </div>
      </div>

      <div className="cards" style={{ marginBottom: 16 }}>
        <div className="card warning">
          <span>Pending</span>
          <b>{data.pending}</b>
          <small>Awaiting review</small>
        </div>
        <div className="card accent">
          <span>Reviewed</span>
          <b>{data.reviewed}</b>
          <small>Settled</small>
        </div>
        <div className="card">
          <span>Average rating</span>
          <b>{data.avgRating ?? "-"}</b>
          <small>Out of 5</small>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th>Student</th>
            <th>Category</th>
            <th>Rating</th>
            <th>Message</th>
            <th>Date</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((item: any) => (
            <tr key={item.id}>
              <td>{item.name}</td>
              <td>{item.category}</td>
              <td><span className="ratingPill">{item.rating}/5</span></td>
              <td className="messageCell">{item.message}</td>
              <td>{formatDate(item.created_at)}</td>
              <td><span className={`statusBadge ${item.status}`}>{item.status}</span></td>
              <td>{item.status === "pending" && <button className="btn" onClick={() => review(item.id)}>Mark reviewed</button>}</td>
            </tr>
          ))}
          {!data.items.length && <tr><td colSpan={7}>No feedback yet</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

const TABS = [
  ["dashboard", "Dashboard", Dashboard],
  ["content", "All Content", Content],
  ["students", "Students", Students],
  ["feedback", "Feedback", Feedback],
] as const;

export default function AdminPage() {
  const [tab, setTab] = useState<(typeof TABS)[number][0]>("dashboard");
  const Active = TABS.find((item) => item[0] === tab)![2];

  return (
    <div className="adm">
      <aside>
        {TABS.map(([key, label]) => (
          <button key={key} className={tab === key ? "on" : ""} onClick={() => setTab(key)}>{label}</button>
        ))}
      </aside>
      <main>
        <h1>{TABS.find((item) => item[0] === tab)![1]}</h1>
        <Active />
      </main>
    </div>
  );
}
