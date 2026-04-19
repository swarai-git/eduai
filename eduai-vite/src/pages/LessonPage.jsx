import React, { useState, useEffect } from 'react';
import SearchIcon      from '@mui/icons-material/Search';
import TuneIcon        from '@mui/icons-material/Tune';
import StarIcon        from '@mui/icons-material/Star';
import TimerIcon       from '@mui/icons-material/Timer';
import SchoolIcon      from '@mui/icons-material/School';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import FlashOnIcon     from '@mui/icons-material/FlashOn';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import BookmarkIcon    from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import PlayArrowIcon   from '@mui/icons-material/PlayArrow';
import { useNavigate } from 'react-router-dom';

/* ── shared card ──────────────────────────────────────────────── */
const card = {
  background: '#fff', borderRadius: 20,
  border: '1px solid #f1f1f5', boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
};

/* ── data ─────────────────────────────────────────────────────── */
const LESSONS = [
  { id: 'CS-101', title: 'Python Basics',                    grade: 'Grade 9',  dur: '45 Min', icon: '📝', tag: 'Beginner',  color: '#10b981' },
  { id: 'CS-204', title: 'Introduction to Data Structures',  grade: 'Grade 11', dur: '60 Min', icon: '🔷', tag: 'Core',      color: '#6c47ff' },
  { id: 'CS-301', title: 'OOP Principles',                   grade: 'Grade 12', dur: '90 Min', icon: '🔮', tag: 'Core',      color: '#6c47ff' },
  { id: 'CS-202', title: 'Database Normalization',            grade: 'Grade 11', dur: '60 Min', icon: '🗄️', tag: 'Advanced',  color: '#3b82f6' },
  { id: 'CS-401', title: 'Recursive Algorithms',             grade: 'Grade 12', dur: '50 Min', icon: '🔁', tag: 'Advanced',  color: '#3b82f6' },
  { id: 'CS-105', title: 'Memory Management',                grade: 'Grade 10', dur: '45 Min', icon: '💾', tag: 'Core',      color: '#6c47ff' },
];

const DETAILS = {
  'CS-101': {
    confidence: 96.1, prerequisite: 'None', progress: 100,
    description: 'Master Python fundamentals including syntax, data types, control flow, and functions.',
    objectives: [
      'Understand Python syntax and basic data types.',
      'Write simple functions, loops, and conditionals.',
      'Handle errors with try/except blocks.',
      'Work with lists, tuples, and dictionaries.',
    ],
    timeline: [
      { time: '00–10m', label: 'Introduction to Python & Setup', active: false, done: true },
      { time: '10–30m', label: 'Variables, Types, and Operators', active: false, done: true },
      { time: '30–45m', label: 'Functions and Loops Practice',   active: true,  done: false },
    ],
    assessment: { formative: 'In-class coding exercises', summative: 'Python syntax quiz' },
    aiQuestions: [
      'What is the difference between a list and a tuple in Python?',
      'How do Python functions work?',
      'Explain list comprehensions in Python',
    ],
  },
  'CS-204': {
    confidence: 98.4, prerequisite: 'Array Methods', progress: 65,
    description: 'Explore fundamental data structures including arrays, linked lists, stacks, queues, and trees.',
    objectives: [
      'Distinguish between primitive data types and composite data structures.',
      'Articulate the differences between linear and non-linear structures.',
      'Evaluate time complexity for basic stack and queue operations.',
      'Implement a linked list from scratch in Python.',
    ],
    timeline: [
      { time: '00–10m', label: 'The "Why" Hook: Physical Analogy',           active: false, done: true  },
      { time: '10–35m', label: 'Live Coding: Building a Linked List',        active: false, done: true  },
      { time: '35–50m', label: 'Collaborative Challenge: Memory Mapping',    active: true,  done: false },
      { time: '50–60m', label: 'Synthesis & Exit Ticket',                    active: false, done: false },
    ],
    assessment: { formative: 'Think-Pair-Share Stack Logic', summative: 'Weekly ML-Graded Quiz' },
    aiQuestions: [
      'What is a linked list and how does it work?',
      'Explain the difference between a stack and a queue',
      'What is Big O notation for data structure operations?',
    ],
  },
  'CS-301': {
    confidence: 94.7, prerequisite: 'Python Basics', progress: 30,
    description: 'Learn the four pillars of Object-Oriented Programming and how to apply them in Python.',
    objectives: [
      'Understand the four pillars of OOP: encapsulation, inheritance, polymorphism, abstraction.',
      'Implement inheritance and polymorphism in Python.',
      'Design class hierarchies for real-world problems.',
      'Understand the difference between composition and inheritance.',
    ],
    timeline: [
      { time: '00–15m', label: 'OOP Concepts Overview',     active: false, done: true  },
      { time: '15–50m', label: 'Building a Class Hierarchy', active: true,  done: false },
      { time: '50–90m', label: 'Polymorphism Workshop',      active: false, done: false },
    ],
    assessment: { formative: 'Peer code review', summative: 'OOP design challenge' },
    aiQuestions: [
      'What is object-oriented programming?',
      'Explain inheritance in Python with an example',
      'What is the difference between inheritance and composition?',
    ],
  },
  'CS-202': {
    confidence: 91.3, prerequisite: 'Database Basics', progress: 0,
    description: 'Understand how to design efficient, normalized relational database schemas.',
    objectives: [
      'Understand 1NF, 2NF, and 3NF normalisation rules.',
      'Identify functional dependencies in data models.',
      'Normalize a given schema to 3NF.',
      'Understand the trade-offs of normalisation vs denormalisation.',
    ],
    timeline: [
      { time: '00–15m', label: 'Why Normalization Matters', active: false, done: false },
      { time: '15–45m', label: 'Normal Forms Workshop',     active: false, done: false },
      { time: '45–60m', label: 'Schema Design Exercise',    active: false, done: false },
    ],
    assessment: { formative: 'Whiteboard normalization', summative: 'Schema redesign project' },
    aiQuestions: [
      'What is database normalization?',
      'Explain the difference between 1NF 2NF and 3NF',
      'What is a foreign key in SQL?',
    ],
  },
  'CS-401': {
    confidence: 89.2, prerequisite: 'Functions & Loops', progress: 0,
    description: 'Master recursive thinking and apply it to classic computer science problems.',
    objectives: [
      'Understand the call stack and recursion depth.',
      'Implement recursive solutions for classic problems (Fibonacci, factorial).',
      'Analyze time/space complexity of recursive algorithms.',
      'Compare recursion with iterative solutions.',
    ],
    timeline: [
      { time: '00–10m', label: 'The Call Stack Visualized',       active: false, done: false },
      { time: '10–35m', label: 'Coding Fibonacci & Factorial',    active: false, done: false },
      { time: '35–50m', label: 'Tree Traversal Workshop',         active: false, done: false },
    ],
    assessment: { formative: 'Tracing recursion diagrams', summative: 'Recursive algorithm challenge' },
    aiQuestions: [
      'How does recursion work in Python?',
      'What is the base case in recursion?',
      'Explain recursive tree traversal',
    ],
  },
  'CS-105': {
    confidence: 87.5, prerequisite: 'Computer Architecture Basics', progress: 0,
    description: 'Understand how programs use memory, including stack vs heap allocation and garbage collection.',
    objectives: [
      'Differentiate between stack and heap memory.',
      'Understand garbage collection strategies.',
      'Identify common memory leaks.',
      'Understand pointers and references.',
    ],
    timeline: [
      { time: '00–10m', label: 'Memory Layout of a Program', active: false, done: false },
      { time: '10–30m', label: 'Stack vs Heap Deep Dive',    active: false, done: false },
      { time: '30–45m', label: 'Debugging Memory Leaks',     active: false, done: false },
    ],
    assessment: { formative: 'Memory diagram quiz', summative: 'Profiler analysis task' },
    aiQuestions: [
      'What is the difference between stack and heap memory?',
      'How does garbage collection work?',
      'What causes memory leaks in programs?',
    ],
  },
};

const TABS = ['Objectives', 'Activity Timeline', 'Assessment Logic'];

/* ── progress ring ───────────────────────────────────────────── */
function ProgressRing({ pct, size = 44, stroke = 4, color = '#6c47ff' }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#f3f4f6" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1)' }}
      />
    </svg>
  );
}

/* ════════════════════════════════════════════════════════════════ */
export default function LessonPage() {
  const [sel,         setSel]         = useState('CS-204');
  const [tab,         setTab]         = useState('Objectives');
  const [search,      setSearch]      = useState('');
  const [tagFilter,   setTagFilter]   = useState('All');
  const [bookmarked,  setBookmarked]  = useState(new Set(['CS-204']));
  const [showSearch,  setShowSearch]  = useState(false);
  const navigate = useNavigate();

  const lesson = LESSONS.find(l => l.id === sel);
  const detail = DETAILS[sel] || DETAILS['CS-204'];

  /* filter lessons */
  const filtered = LESSONS.filter(l => {
    const matchSearch = !search || l.title.toLowerCase().includes(search.toLowerCase());
    const matchTag    = tagFilter === 'All' || l.tag === tagFilter;
    return matchSearch && matchTag;
  });

  const toggleBookmark = (e, id) => {
    e.stopPropagation();
    setBookmarked(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const openInTutor = (question) => {
    navigate('/chat', { state: { autoSend: question } });
  };

  const tags = ['All', 'Beginner', 'Core', 'Advanced'];

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1060 }}>

      {/* ── Header ── */}
      <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 6, display: 'flex', gap: 6, alignItems: 'center' }}>
        <span>Curriculum</span><span>›</span>
        <span style={{ color: '#6c47ff', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Lesson Planner</span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 30, fontWeight: 800, color: '#1f2937', margin: '0 0 5px' }}>Lesson Workspace</h1>
          <p style={{ fontSize: 13, color: '#9ca3af', margin: 0 }}>
            Architecting educational experiences through AI and modular pedagogy.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {showSearch && (
            <input
              autoFocus
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search lessons…"
              style={{ border: '1px solid #e5e7eb', borderRadius: 10, padding: '8px 14px', fontSize: 13, outline: 'none', width: 200, fontFamily: "'DM Sans',sans-serif" }}
            />
          )}
          <button onClick={() => setShowSearch(v => !v)} style={{ width: 40, height: 40, borderRadius: 10, background: showSearch ? '#ede9ff' : '#fff', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: showSearch ? '#6c47ff' : '#6b7280' }}>
            <SearchIcon sx={{ fontSize: 20 }} />
          </button>
          <button style={{ width: 40, height: 40, borderRadius: 10, background: '#fff', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#6b7280' }}>
            <TuneIcon sx={{ fontSize: 20 }} />
          </button>
        </div>
      </div>

      {/* ── Tag filter ── */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
        {tags.map(t => (
          <button
            key={t}
            onClick={() => setTagFilter(t)}
            style={{
              padding: '5px 14px', borderRadius: 99, fontSize: 12, fontWeight: 600,
              border: 'none', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif",
              background: tagFilter === t ? '#0f1729' : '#f3f4f6',
              color:      tagFilter === t ? '#fff'    : '#6b7280',
              transition: 'all 0.15s',
            }}
          >{t}</button>
        ))}
        <span style={{ marginLeft: 'auto', fontSize: 12, color: '#9ca3af', alignSelf: 'center' }}>
          {filtered.length} lessons
        </span>
      </div>

      {/* ── Lesson grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 24 }}>
        {filtered.length === 0 ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '32px', color: '#9ca3af', fontSize: 14 }}>
            No lessons match "{search}"
          </div>
        ) : filtered.map(l => {
          const active     = sel === l.id;
          const isBookmark = bookmarked.has(l.id);
          const prog       = DETAILS[l.id]?.progress ?? 0;
          return (
            <div
              key={l.id}
              onClick={() => { setSel(l.id); setTab('Objectives'); }}
              style={{
                padding: 18, borderRadius: 18, cursor: 'pointer', transition: 'all 0.18s',
                border:      `2px solid ${active ? '#6c47ff' : '#f1f1f5'}`,
                background:  active ? 'linear-gradient(145deg,#0f1729,#1e2d55)' : '#fff',
                boxShadow:   active ? '0 4px 16px rgba(108,71,255,0.2)' : '0 1px 3px rgba(0,0,0,0.05)',
                position: 'relative',
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.09)'; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)'; }}
            >
              {/* Bookmark icon */}
              <button
                onClick={e => toggleBookmark(e, l.id)}
                style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: isBookmark ? '#f59e0b' : (active ? 'rgba(255,255,255,0.3)' : '#d1d5db') }}
              >
                {isBookmark ? <BookmarkIcon sx={{ fontSize: 16 }} /> : <BookmarkBorderIcon sx={{ fontSize: 16 }} />}
              </button>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div style={{ width: 38, height: 38, borderRadius: 11, background: active ? 'rgba(255,255,255,0.12)' : '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17 }}>{l.icon}</div>
                <span style={{ fontSize: 9, fontFamily: 'monospace', color: active ? '#93c5fd' : '#9ca3af', marginRight: 20 }}>ID: {l.id}</span>
              </div>

              <h3 style={{ fontSize: 13, fontWeight: 700, margin: '0 0 8px', color: active ? '#fff' : '#1f2937', lineHeight: 1.35, paddingRight: 8 }}>{l.title}</h3>

              <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                <span style={{ fontSize: 10, display: 'flex', alignItems: 'center', gap: 3, color: active ? '#bfdbfe' : '#9ca3af' }}>
                  <SchoolIcon sx={{ fontSize: 11 }} />{l.grade}
                </span>
                <span style={{ fontSize: 10, display: 'flex', alignItems: 'center', gap: 3, color: active ? '#bfdbfe' : '#9ca3af' }}>
                  <TimerIcon sx={{ fontSize: 11 }} />{l.dur}
                </span>
              </div>

              {/* Tag + progress row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{
                  fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 99,
                  background: active ? 'rgba(255,255,255,0.12)' : `${l.color}18`,
                  color:      active ? '#c4b5fd'                : l.color,
                  textTransform: 'uppercase', letterSpacing: 0.5,
                }}>{l.tag}</span>
                {prog > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <div style={{ width: 36, height: 3, background: active ? 'rgba(255,255,255,0.15)' : '#f3f4f6', borderRadius: 99 }}>
                      <div style={{ height: 3, background: active ? '#c4b5fd' : l.color, width: `${prog}%`, borderRadius: 99 }} />
                    </div>
                    <span style={{ fontSize: 9, color: active ? '#93c5fd' : '#9ca3af', fontWeight: 600 }}>{prog}%</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Detail panel ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 20 }}>

        {/* ── Left panel ── */}
        <div style={{ ...card, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {/* Dark header with progress ring */}
          <div style={{ background: 'linear-gradient(135deg,#0a0f1e,#1e2d55)', padding: '20px 20px 18px', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: 9, color: '#93c5fd', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2 }}>Active Draft</span>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: '#fff', margin: '6px 0 0', lineHeight: 1.35 }}>{lesson?.title}</h2>
              </div>
              <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                <ProgressRing pct={detail.progress} size={46} stroke={4} color={detail.progress === 100 ? '#10b981' : '#a78bfa'} />
                <span style={{ position: 'absolute', fontSize: 10, fontWeight: 700, color: '#fff' }}>{detail.progress}%</span>
              </div>
            </div>
            {detail.description && (
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', margin: '10px 0 0', lineHeight: 1.55 }}>
                {detail.description}
              </p>
            )}
          </div>

          <div style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column' }}>
            {/* Meta rows */}
            {[
              { label: 'AI Confidence', val: <span style={{ color: '#6c47ff', fontWeight: 700 }}>{detail.confidence}%</span> },
              { label: 'Prerequisite',  val: <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 999, background: '#ede9ff', color: '#6c47ff' }}>{detail.prerequisite}</span> },
              { label: 'Progress',      val: (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 60, height: 4, background: '#f3f4f6', borderRadius: 99 }}>
                    <div style={{ height: 4, background: '#6c47ff', width: `${detail.progress}%`, borderRadius: 99 }} />
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#6c47ff' }}>{detail.progress}%</span>
                </div>
              )},
            ].map(row => (
              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: '1px solid #f9fafb' }}>
                <span style={{ fontSize: 12, color: '#6b7280' }}>{row.label}</span>
                {row.val}
              </div>
            ))}

            {/* Tab buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginTop: 14 }}>
              {TABS.map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 9,
                    padding: '9px 12px', borderRadius: 11, fontSize: 13,
                    fontWeight: 500, border: 'none', cursor: 'pointer', textAlign: 'left',
                    background: tab === t ? '#0f1729' : 'transparent',
                    color:      tab === t ? '#fff'    : '#4b5563',
                    transition: 'all 0.15s', fontFamily: "'DM Sans',sans-serif",
                  }}
                  onMouseEnter={e => { if (tab !== t) e.currentTarget.style.background = '#f5f3ff'; }}
                  onMouseLeave={e => { if (tab !== t) e.currentTarget.style.background = 'transparent'; }}
                >
                  {t === 'Objectives'        && <CheckCircleIcon sx={{ fontSize: 15 }} />}
                  {t === 'Activity Timeline' && <span style={{ fontSize: 13 }}>🎯</span>}
                  {t === 'Assessment Logic'  && <span style={{ fontSize: 13 }}>📋</span>}
                  {t}
                </button>
              ))}
            </div>

            {/* CTA buttons */}
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <button
                onClick={() => openInTutor(`Teach me about ${lesson?.title}`)}
                style={{
                  flex: 1, padding: '10px', borderRadius: 11,
                  fontWeight: 600, fontSize: 12, background: '#6c47ff', color: '#fff',
                  border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', gap: 6, fontFamily: "'DM Sans',sans-serif",
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#0f1729'}
                onMouseLeave={e => e.currentTarget.style.background = '#6c47ff'}
              >
                <AutoAwesomeIcon sx={{ fontSize: 14 }} /> Ask AI Tutor
              </button>
              <button
                onClick={() => openInTutor(`Generate a quiz about ${lesson?.title}`)}
                style={{
                  flex: 1, padding: '10px', borderRadius: 11,
                  fontWeight: 600, fontSize: 12, background: '#f5f3ff', color: '#6c47ff',
                  border: '1px solid #c4b5fd', cursor: 'pointer', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', gap: 6,
                  fontFamily: "'DM Sans',sans-serif", transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#ede9ff'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#f5f3ff'; }}
              >
                <PlayArrowIcon sx={{ fontSize: 14 }} /> Take Quiz
              </button>
            </div>
          </div>
        </div>

        {/* ── Right panel: tab content ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Objectives */}
          {tab === 'Objectives' && (
            <div style={{ ...card, padding: 22 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
                <StarIcon sx={{ color: '#6c47ff', fontSize: 17 }} />
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#9ca3af' }}>Learning Objectives</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {detail.objectives.map((obj, i) => (
                  <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{ width: 22, height: 22, borderRadius: 6, background: '#f5f3ff', color: '#6c47ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0, marginTop: 1 }}>
                      {String(i + 1).padStart(2, '0')}
                    </div>
                    <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.65, margin: 0 }}>{obj}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Activity Timeline */}
          {tab === 'Activity Timeline' && (
            <div style={{ ...card, padding: 22 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
                <span>🎯</span>
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#9ca3af' }}>Activity Timeline</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {detail.timeline.map((t, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 14, padding: '12px 14px',
                    borderRadius: 12,
                    border: `1px solid ${t.active ? '#c4b5fd' : t.done ? '#bbf7d0' : '#f3f4f6'}`,
                    background: t.active ? '#f5f3ff' : t.done ? '#f0fdf4' : '#f9fafb',
                    transition: 'all 0.2s',
                  }}>
                    <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#9ca3af', width: 52, flexShrink: 0 }}>{t.time}</span>
                    <span style={{ fontSize: 13, fontWeight: 500, flex: 1, color: t.active ? '#6c47ff' : t.done ? '#15803d' : '#374151' }}>
                      {t.label}
                    </span>
                    {t.done   && <CheckCircleIcon sx={{ fontSize: 16, color: '#10b981' }} />}
                    {t.active && <FlashOnIcon     sx={{ fontSize: 16, color: '#6c47ff' }} />}
                    {!t.done && !t.active && <span style={{ color: '#d1d5db', fontSize: 16 }}>○</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Assessment */}
          {tab === 'Assessment Logic' && (
            <div style={{ ...card, padding: 22 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
                <CheckCircleIcon sx={{ color: '#6c47ff', fontSize: 17 }} />
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#9ca3af' }}>Assessment Strategy</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                {[
                  { label: 'Formative', val: detail.assessment.formative, icon: '📝', color: '#ede9ff', tc: '#6c47ff' },
                  { label: 'Summative', val: detail.assessment.summative, icon: '📊', color: '#dbeafe', tc: '#3b82f6' },
                ].map(a => (
                  <div key={a.label} style={{ padding: 16, background: a.color, borderRadius: 14 }}>
                    <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, color: a.tc, margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: 5 }}>
                      {a.icon} {a.label}
                    </p>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#1f2937', margin: 0 }}>{a.val}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Tutor quick questions */}
          <div style={{ ...card, padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <AutoAwesomeIcon sx={{ color: '#6c47ff', fontSize: 16 }} />
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#9ca3af' }}>Ask AI Tutor About This Lesson</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {detail.aiQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => openInTutor(q)}
                  style={{
                    textAlign: 'left', padding: '10px 14px', borderRadius: 11,
                    background: '#f9fafb', border: '1px solid #f3f4f6',
                    fontSize: 13, color: '#374151', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    gap: 10, fontFamily: "'DM Sans',sans-serif", transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#f5f3ff'; e.currentTarget.style.color = '#6c47ff'; e.currentTarget.style.borderColor = '#c4b5fd'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#f9fafb'; e.currentTarget.style.color = '#374151'; e.currentTarget.style.borderColor = '#f3f4f6'; }}
                >
                  <span>{q}</span>
                  <span style={{ fontSize: 14, flexShrink: 0 }}>→</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}