import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  Bell,
  BookOpenText,
  BrainCircuit,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  Clock3,
  Compass,
  Flame,
  GraduationCap,
  LayoutGrid,
  NotebookPen,
  PlayCircle,
  Search,
  Sparkles,
  Target,
  TrendingUp,
  User,
} from "lucide-react";

type NavItem = {
  label: string;
  count?: string;
  active?: boolean;
  icon: LucideIcon;
};

type Stat = {
  label: string;
  value: string;
  hint: string;
  tone: "green" | "blue" | "orange" | "lilac";
};

type Subject = {
  title: string;
  teacher: string;
  progress: number;
  accent: string;
  tone: "green" | "blue" | "orange";
  meta: string;
};

type Lesson = { title: string; time: string; detail: string; progress: number; };
type PracticeCard = {
  title: string;
  description: string;
  badge: string;
  tone: "green" | "blue" | "orange";
  metric: string;
};

type ScheduleEvent = {
  title: string;
  time: string;
  tag: string;
  tone: "green" | "blue" | "orange";
};

const navigation: NavItem[] = [
  { label: "Overview", icon: LayoutGrid, active: true },
  { label: "Subjects", icon: BookOpenText },
  { label: "Practice", icon: Target, count: "8" },
  { label: "Calendar", icon: CalendarDays },
  { label: "Resources", icon: NotebookPen },
];

const stats: Stat[] = [
  { label: "Courses active", value: "06", hint: "2 this week", tone: "green" },
  { label: "Study streak", value: "12d", hint: "Keep it alive", tone: "blue" },
  { label: "Mastery score", value: "84%", hint: "+7% from last month", tone: "orange" },
  { label: "Focus hours", value: "14.5h", hint: "Across 5 tasks", tone: "lilac" },
];

const subjects: Subject[] = [
  { title: "Biology", teacher: "Ms. Ellis", progress: 72, accent: "#5f8e68", tone: "green", meta: "Cell systems" },
  { title: "Mathematics", teacher: "Mr. Ali", progress: 88, accent: "#557d9a", tone: "blue", meta: "Algebra II" },
  { title: "Literature", teacher: "Dr. Patel", progress: 63, accent: "#b57b4f", tone: "orange", meta: "Modern texts" },
];

const activities: Lesson[] = [
  { title: "Photosynthesis recap", time: "Today • 4:30 PM", detail: "Review notes and complete quick check", progress: 76 },
  { title: "Trigonometry workshop", time: "Tomorrow • 9:00 AM", detail: "Practice angle challenge set", progress: 48 },
  { title: "Essay planning lab", time: "Thu • 1:15 PM", detail: "Draft thesis and outline body sections", progress: 62 },
];

const practiceCards: PracticeCard[] = [
  { title: "Mini quiz", description: "Test your recall with a 12-question sprint.", badge: "12 min", tone: "green", metric: "4 skills" },
  { title: "Concept map", description: "Link ideas across topics and build understanding.", badge: "20 min", tone: "blue", metric: "3 maps" },
  { title: "Timed solve", description: "Beat the clock on exam-style problem sets.", badge: "18 min", tone: "orange", metric: "8 tasks" },
];

const scheduleEvents: ScheduleEvent[] = [
  { title: "Chemistry lab notes", time: "Today • 3:15 PM", tag: "Revision", tone: "green" },
  { title: "Math mentoring session", time: "Tomorrow • 8:30 AM", tag: "Check-in", tone: "blue" },
  { title: "Essay draft review", time: "Thursday • 2:00 PM", tag: "Feedback", tone: "orange" },
];

const weekDays = [
  { name: "Mon", height: 36 },
  { name: "Tue", height: 49 },
  { name: "Wed", height: 28 },
  { name: "Thu", height: 58 },
  { name: "Fri", height: 38 },
  { name: "Sat", height: 42 },
  { name: "Sun", height: 54, today: true },
];

const learningTotals = [
  { label: "Completed", value: "18" },
  { label: "In progress", value: "07" },
  { label: "Upcoming", value: "05" },
];

const learningList = [
  { title: "World History timeline", detail: "3 lessons • 1 checkpoint", time: "05/12" },
  { title: "Cell transport review", detail: "2 lessons • 1 quiz", time: "Today" },
  { title: "Algebra confidence set", detail: "4 lessons • 2 tasks", time: "12/12" },
];

const featureItems = [
  { label: "Weekly focus", value: "3" },
  { label: "Tutor notes", value: "12" },
  { label: "Practice streak", value: "9d" },
  { label: "Saved clips", value: "27" },
];

export default function HomePage() {
  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label="Sidebar navigation">
        <a href="#" className="brand" aria-label="Fieldnote home">
          <span className="brand-mark" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
          </span>
          <span>Fieldnote</span>
          <span className="brand-dot">.</span>
        </a>

        <p className="side-label">MENU</p>
        <nav className="side-nav" aria-label="Main menu">
          {navigation.map(({ label, count, active, icon: Icon }) => (
            <button key={label} type="button" className={`nav-link ${active ? "is-active" : ""}`}>
              <Icon size={14} strokeWidth={2.2} />
              <span>{label}</span>
              {count ? <span className="nav-count">{count}</span> : null}
            </button>
          ))}
        </nav>

        <p className="side-label secondary-label">STUDY</p>
        <div className="sidebar-bottom">
          <div className="streak-card">
            <div className="streak-icon" aria-hidden="true">
              <Flame size={14} strokeWidth={2.2} />
            </div>
            <strong>12-day streak</strong>
            <p>Keep your momentum going with one focused lesson today.</p>
            <span className="streak-label">+3% this week</span>
          </div>

          <button type="button" className="profile-button" aria-label="Profile details">
            <span className="avatar">AJ</span>
            <span>
              <strong>Ariana J.</strong>
              <small>Year 11</small>
            </span>
            <ChevronDown size={12} strokeWidth={2} />
          </button>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <button type="button" className="menu-button" aria-label="Open menu">
            <LayoutGrid size={14} strokeWidth={2.2} />
          </button>

          <div className="breadcrumb" aria-label="Breadcrumb">
            <span>Home</span>
            <i>›</i>
            <span>Dashboard</span>
            <i>›</i>
            <strong>Today</strong>
          </div>

          <div className="top-actions">
            <label className="search-box" aria-label="Search">
              <Search size={12} strokeWidth={2.2} />
              <input type="search" placeholder="Search" aria-label="Search courses and notes" />
              <kbd>⌘K</kbd>
            </label>

            <button type="button" className="icon-button" aria-label="Notifications">
              <Bell size={14} strokeWidth={2.2} />
              <i aria-hidden="true" />
            </button>

            <button type="button" className="icon-button" aria-label="Open account menu">
              <User size={14} strokeWidth={2.2} />
            </button>

            <span className="avatar top-avatar" aria-label="Profile">AJ</span>
          </div>
        </header>

        <div className="dashboard-content">
          <div className="welcome-row">
            <div>
              <p className="eyebrow">GOOD AFTERNOON <span>•</span> Friday</p>
              <h1>
                Welcome back, Pstacks <span className="hello-mark">👋</span>
              </h1>
              <p>
                Your learning path is moving steadily. Keep your momentum with one more short,
                focused session before the weekend.
              </p>
            </div>
            <button type="button" className="quiet-button">
              <Sparkles size={13} strokeWidth={2.2} />
              Plan this week
            </button>
          </div>

          <section className="feature-banner" aria-label="Featured learning path">
            <div className="feature-copy">
              <div className="feature-label">
                <i aria-hidden="true" />
                SKILL BOOST
              </div>
              <h2>Unlock your next win in Biology.</h2>
              <p>
                Complete the <i>cell systems</i> challenge and unlock a mastery badge before your next review.
              </p>
              <Link href="/courses" className="feature-button">
                View courses <ArrowRight size={12} strokeWidth={2.3} />
              </Link>
            </div>

            <div className="feature-art" aria-hidden="true">
              <span className="art-orbit orbit-a" />
              <span className="art-orbit orbit-b" />
              <span className="art-cell cell-a" />
              <span className="art-cell cell-b" />
              <span className="art-cell cell-c" />
              <span className="cell-core" />
              <span className="art-caption">EVOLUTION MAP</span>
            </div>

            <span className="feature-index">
              <i aria-hidden="true" />
              01 / 04
            </span>
          </section>

          <section className="stats-grid" aria-label="Progress overview">
            {stats.map(({ label, value, hint, tone }) => (
              <article key={label} className="stat-card">
                <small>{label}</small>
                <div className={`stat-icon ${tone}`} aria-hidden="true">
                  {tone === "green" ? <BookOpenText size={14} strokeWidth={2.2} /> : null}
                  {tone === "blue" ? <Target size={14} strokeWidth={2.2} /> : null}
                  {tone === "orange" ? <TrendingUp size={14} strokeWidth={2.2} /> : null}
                  {tone === "lilac" ? <Clock3 size={14} strokeWidth={2.2} /> : null}
                </div>
                <strong>
                  {value}
                  <i>{tone === "orange" ? "▲" : tone === "blue" ? "•" : ""}</i>
                </strong>
                <span className="stat-hint">{hint}</span>
              </article>
            ))}
          </section>

          <section className="subject-section" aria-labelledby="subjects-heading">
            <div className="section-heading">
              <div>
                <p className="eyebrow">SUBJECTS</p>
                <h2 id="subjects-heading">
                  Learning track <small>3 active</small>
                </h2>
              </div>
              <Link href="/courses" className="text-link">
                Open catalog <ChevronRight size={12} strokeWidth={2.1} />
              </Link>
            </div>

            <div className="subject-grid">
              {subjects.map(({ title, teacher, progress, accent, tone, meta }) => (
                <article key={title} className="subject-card" style={{ borderTop: `2px solid ${accent}` }}>
                  <div className="subject-icon" style={{ background: `${accent}1A`, color: accent }} aria-hidden="true">
                    {tone === "green" ? <BookOpenText size={16} strokeWidth={2.2} /> : null}
                    {tone === "blue" ? <BrainCircuit size={16} strokeWidth={2.2} /> : null}
                    {tone === "orange" ? <Compass size={16} strokeWidth={2.2} /> : null}
                  </div>
                  <span className="subject-group">{meta}</span>
                  <button type="button" aria-label={`Open ${title}`}>
                    <ChevronRight size={12} strokeWidth={2.2} />
                  </button>
                  <h3>{title}</h3>
                  <p>{teacher} <i>•</i> {progress}% complete</p>
                  <div className="progress-track" aria-label={`${title} progress`}>
                    <b style={{ width: `${progress}%`, background: accent }} />
                  </div>
                </article>
              ))}
            </div>
          </section>

          <div className="bottom-grid">
            <section aria-labelledby="activity-heading">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">ACTIVITY</p>
                  <h2 id="activity-heading">Today&apos;s priorities</h2>
                </div>
                <button type="button" className="text-link">
                  View list <ChevronRight size={12} strokeWidth={2.1} />
                </button>
              </div>

              <div className="activity-list">
                {activities.map(({ title, time, detail, progress }) => (
                  <button key={title} type="button" className="activity-row">
                    <PlayCircle size={16} strokeWidth={2.2} />
                    <span>
                      <strong>{title}</strong>
                      <small>{time}</small>
                      <i><b style={{ width: `${progress}%` }} /></i>
                    </span>
                    <ChevronRight size={14} strokeWidth={2.1} />
                  </button>
                ))}
              </div>
            </section>

            <aside className="weekly-panel" aria-labelledby="week-heading">
              <p className="eyebrow">WEEKLY</p>
              <h2 id="week-heading">Progress</h2>
              <div className="weekly-total">
                <strong>18h</strong>
                <span>this week</span>
                <small>+4.2%</small>
              </div>

              <div className="week-bars" aria-label="Weekly progress chart">
                {weekDays.map(({ name, height, today }) => (
                  <div key={name} className={today ? "today" : ""}>
                    <i style={{ height: `${height}px` }} aria-hidden="true" />
                    <span>{name}</span>
                  </div>
                ))}
              </div>
            </aside>
          </div>

          <div className="page-title" style={{ marginTop: 30 }}>
            <div>
              <p className="eyebrow">LIBRARY</p>
              <h1>Explore your learning hub</h1>
              <p>Find the next resource, flashcard set, and guided activity based on your current goals.</p>
            </div>
            <span>
              <GraduationCap size={18} strokeWidth={2.2} />
              <strong>24</strong>
              active resources
            </span>
          </div>

          <div className="catalog-tools">
            <label className="catalog-search" aria-label="Search resources">
              <Search size={12} strokeWidth={2.2} />
              <input type="search" placeholder="Search notes, tasks, or topics" />
            </label>
            <span>Sorted by relevance</span>
          </div>

          <div className="filter-row" aria-label="Resource filters">
            {['All topics', 'Science', 'Math', 'Essay work', 'Revision', 'Labs'].map((item, index) => (
              <button key={item} type="button" className={index === 0 ? 'selected' : ''}>{item}</button>
            ))}
          </div>

          <section className="resource-banner" aria-label="Recommended challenge">
            <strong>16</strong>
            <span>core activities ready to explore</span>
            <p>New quick boosts are waiting in your personalized revision path for this week.</p>
          </section>

          <div className="feature-grid" aria-label="Quick access">
            {featureItems.map(({ label, value }) => (
              <div key={label} className="feature-item">
                <span aria-hidden="true"><Sparkles size={13} strokeWidth={2.2} /></span>
                <strong>{label}</strong>
                <small>{value}</small>
              </div>
            ))}
          </div>

          <div className="learning-totals" style={{ marginTop: 20 }}>
            {learningTotals.map(({ label, value }) => (
              <span key={label}>
                <small>{label}</small>
                <strong>{value}</strong>
              </span>
            ))}
          </div>

          <div className="practice-grid" style={{ marginTop: 20 }}>
            {practiceCards.map(({ title, description, badge, metric, tone }) => (
              <article key={title} className="practice-card">
                <div className={`practice-icon tone-${tone === 'green' ? 0 : tone === 'blue' ? 1 : 2}`} aria-hidden="true">
                  {tone === 'green' ? <Target size={18} strokeWidth={2.2} /> : null}
                  {tone === 'blue' ? <BrainCircuit size={18} strokeWidth={2.2} /> : null}
                  {tone === 'orange' ? <Sparkles size={18} strokeWidth={2.2} /> : null}
                </div>
                <small>{badge}</small>
                <h2>{title}</h2>
                <p>{description}</p>
                <div className="practice-bottom">
                  <span>{metric}</span>
                  <span>Launch <ArrowRight size={11} strokeWidth={2.2} /></span>
                </div>
              </article>
            ))}
          </div>

          <div className="schedule-panel" style={{ marginTop: 30 }}>
            <div className="schedule-date">
              <span>UPCOMING</span>
              <strong>19</strong>
              <small>September</small>
            </div>

            {scheduleEvents.map(({ title, time, tag, tone }) => (
              <div key={title} className="schedule-event">
                <i className={tone === 'green' ? 'event-green' : tone === 'blue' ? 'event-blue' : 'event-orange'} aria-hidden="true" />
                <span>
                  <strong>{title}</strong>
                  <small>{time}</small>
                </span>
                <button type="button">
                  {tag}
                  <ChevronRight size={10} strokeWidth={2.1} />
                </button>
              </div>
            ))}
          </div>

          <div className="learning-list" style={{ marginTop: 26 }}>
            {learningList.map(({ title, detail, time }) => (
              <div key={title} className="activity-row" role="listitem">
                <BookOpenText size={16} strokeWidth={2.1} />
                <span>
                  <strong>{title}</strong>
                  <small>{detail}</small>
                </span>
                <span>{time}</span>
              </div>
            ))}
          </div>

          <footer className="page-footer">
            <span>Fieldnote © 2026</span>
            <span>
              <Flame size={10} strokeWidth={2.1} />
              Keep your momentum strong
            </span>
            <button type="button">
              <CalendarDays size={10} strokeWidth={2.1} />
              View planner
            </button>
          </footer>
        </div>
      </main>
    </div>
  );
}
