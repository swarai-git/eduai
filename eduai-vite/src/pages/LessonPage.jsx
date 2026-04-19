import React, { useState } from 'react';
import SearchIcon       from '@mui/icons-material/Search';
import TuneIcon         from '@mui/icons-material/Tune';
import StarIcon         from '@mui/icons-material/Star';
import TimerIcon        from '@mui/icons-material/Timer';
import SchoolIcon       from '@mui/icons-material/School';
import CheckCircleIcon  from '@mui/icons-material/CheckCircle';
import FlashOnIcon      from '@mui/icons-material/FlashOn';
import { useNavigate }  from 'react-router-dom';

const card = {
  background: '#fff', borderRadius: 20,
  border: '1px solid #f1f1f5', boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
};

const LESSONS = [
  { id: 'CS-101', title: 'Python Basics',                   grade: 'Grade 9',  dur: '45 Min', icon: '📝' },
  { id: 'CS-204', title: 'Introduction to Data Structures', grade: 'Grade 11', dur: '60 Min', icon: '🔷' },
  { id: 'CS-301', title: 'OOP Principles',                  grade: 'Grade 12', dur: '90 Min', icon: '🔮' },
  { id: 'CS-202', title: 'Database Normalization',           grade: 'Grade 11', dur: '60 Min', icon: '🗄️' },
  { id: 'CS-401', title: 'Recursive Algorithms',            grade: 'Grade 12', dur: '50 Min', icon: '🔁' },
  { id: 'CS-105', title: 'Memory Management',               grade: 'Grade 10', dur: '45 Min', icon: '💾' },
];

const DETAILS = {
  'CS-101': {
    confidence: 96.1, prerequisite: 'None',
    objectives: ['Understand Python syntax and basic data types.', 'Write simple functions and use loops.', 'Handle errors with try/except blocks.'],
    timeline: [
      { time: '00–10m', label: 'Introduction to Python & Setup', active: false },
      { time: '10–30m', label: 'Variables, Types, and Operators', active: true },
      { time: '30–45m', label: 'Functions and Loops Practice', active: false },
    ],
    assessment: { formative: 'In-class coding exercises', summative: 'Python syntax quiz' },
  },
  'CS-204': {
    confidence: 98.4, prerequisite: 'Array Methods',
    objectives: [
      'Students will be able to distinguish between primitive data types and composite data structures.',
      'Articulate the differences between linear and non-linear structures (Lists vs Graphs).',
      'Evaluate time complexity implications for basic stack and queue operations.',
    ],
    timeline: [
      { time: '00–10m', label: 'The "Why" Hook: Physical Analogy', active: false },
      { time: '10–35m', label: 'Live Coding: Building a Linked List', active: false },
      { time: '35–50m', label: 'Collaborative Challenge: Memory Mapping', active: true },
      { time: '50–60m', label: 'Synthesis & Exit Ticket', active: false },
    ],
    assessment: { formative: 'Think-Pair-Share Stack Logic', summative: 'Weekly ML-Graded Quiz' },
  },
  'CS-301': {
    confidence: 94.7, prerequisite: 'Python Basics',
    objectives: ['Understand the four pillars of OOP.', 'Implement inheritance and polymorphism in Python.', 'Design class hierarchies for real-world problems.'],
    timeline: [
      { time: '00–15m', label: 'OOP Concepts Overview', active: false },
      { time: '15–50m', label: 'Building a Class Hierarchy', active: true },
      { time: '50–90m', label: 'Polymorphism Workshop', active: false },
    ],
    assessment: { formative: 'Peer code review', summative: 'OOP design challenge' },
  },
  'CS-202': {
    confidence: 91.3, prerequisite: 'Database Basics',
    objectives: ['Understand 1NF, 2NF, and 3NF.', 'Identify functional dependencies.', 'Normalize a given schema to 3NF.'],
    timeline: [
      { time: '00–15m', label: 'Why Normalization Matters', active: false },
      { time: '15–45m', label: 'Normal Forms Workshop', active: true },
      { time: '45–60m', label: 'Schema Design Exercise', active: false },
    ],
    assessment: { formative: 'Whiteboard normalization', summative: 'Schema redesign project' },
  },
  'CS-401': {
    confidence: 89.2, prerequisite: 'Functions & Loops',
    objectives: ['Understand the call stack and recursion depth.', 'Implement recursive solutions for classic problems.', 'Analyze the time/space complexity of recursive algorithms.'],
    timeline: [
      { time: '00–10m', label: 'The Call Stack Visualized', active: false },
      { time: '10–35m', label: 'Coding Fibonacci & Factorial', active: true },
      { time: '35–50m', label: 'Tree Traversal Workshop', active: false },
    ],
    assessment: { formative: 'Tracing recursion diagrams', summative: 'Recursive algorithm challenge' },
  },
  'CS-105': {
    confidence: 87.5, prerequisite: 'Computer Architecture Basics',
    objectives: ['Differentiate between stack and heap memory.', 'Understand garbage collection strategies.', 'Identify common memory leaks.'],
    timeline: [
      { time: '00–10m', label: 'Memory Layout of a Program', active: false },
      { time: '10–30m', label: 'Stack vs Heap Deep Dive', active: true },
      { time: '30–45m', label: 'Debugging Memory Leaks', active: false },
    ],
    assessment: { formative: 'Memory diagram quiz', summative: 'Profiler analysis task' },
  },
};

const TABS = ['Objectives', 'Activity Timeline', 'Assessment Logic'];

export default function LessonPage() {
  const [sel, setSel] = useState('CS-204');
  const [tab, setTab] = useState('Objectives');
  const navigate = useNavigate();

  const lesson = LESSONS.find(l => l.id === sel);
  const detail = DETAILS[sel] || DETAILS['CS-204'];

  const openInTutor = () => navigate('/chat', { state: { question: `Teach me about ${lesson.title}` } });

  return (
    <div style={{ padding: 32, maxWidth: 1040 }}>
      {/* Breadcrumb */}
      <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 8, display: 'flex', gap: 6 }}>
        <span>Curriculum</span><span>›</span>
        <span style={{ color: '#6c47ff', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Lesson Planner</span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 30, fontWeight: 800, color: '#1f2937', margin: '0 0 6px' }}>Lesson Workspace</h1>
          <p style={{ fontSize: 13, color: '#9ca3af', margin: 0 }}>
            Architecting educational experiences through the lens of artificial intelligence and modular pedagogy.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {[<SearchIcon key="s" sx={{ fontSize: 20 }} />, <TuneIcon key="t" sx={{ fontSize: 20 }} />].map((ic, i) => (
            <button key={i} style={{ width: 40, height: 40, borderRadius: 10, background: '#fff', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#6b7280' }}>{ic}</button>
          ))}
        </div>
      </div>

      {/* Lesson grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 28 }}>
        {LESSONS.map(l => {
          const active = sel === l.id;
          return (
            <div
              key={l.id}
              onClick={() => { setSel(l.id); setTab('Objectives'); }}
              style={{
                padding: 20, borderRadius: 18, cursor: 'pointer', transition: 'all 0.15s',
                border: `2px solid ${active ? '#6c47ff' : '#f1f1f5'}`,
                background: active ? 'linear-gradient(145deg,#0f1729,#1e2d55)' : '#fff',
                boxShadow: active ? '0 4px 16px rgba(108,71,255,0.2)' : '0 1px 3px rgba(0,0,0,0.05)',
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.08)'; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)'; }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: active ? 'rgba(255,255,255,0.12)' : '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{l.icon}</div>
                <span style={{ fontSize: 10, fontFamily: 'monospace', color: active ? '#93c5fd' : '#9ca3af' }}>ID: {l.id}</span>
              </div>
              <h3 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 10px', color: active ? '#fff' : '#1f2937', lineHeight: 1.3 }}>{l.title}</h3>
              <div style={{ display: 'flex', gap: 14 }}>
                <span style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 3, color: active ? '#bfdbfe' : '#9ca3af' }}>
                  <SchoolIcon sx={{ fontSize: 12 }} />{l.grade}
                </span>
                <span style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 3, color: active ? '#bfdbfe' : '#9ca3af' }}>
                  <TimerIcon sx={{ fontSize: 12 }} />{l.dur}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail panel */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Left: lesson info */}
        <div style={{ ...card, overflow: 'hidden' }}>
          <div style={{ height: 130, background: 'linear-gradient(135deg,#0a0f1e,#1e2d55)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: 20 }}>
            <span style={{ fontSize: 10, color: '#93c5fd', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2 }}>Active Draft</span>
          </div>
          <div style={{ padding: 20 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1f2937', margin: '0 0 16px' }}>{lesson?.title}</h2>
            {[
              { label: 'AI Confidence', val: <span style={{ color: '#6c47ff', fontWeight: 700 }}>{detail.confidence}%</span> },
              { label: 'Prerequisite',  val: <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 999, background: '#ede9ff', color: '#6c47ff' }}>{detail.prerequisite}</span> },
            ].map(row => (
              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f9fafb' }}>
                <span style={{ fontSize: 13, color: '#6b7280' }}>{row.label}</span>{row.val}
              </div>
            ))}

            {/* Tab buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 16 }}>
              {TABS.map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 12px', borderRadius: 12, fontSize: 13,
                    fontWeight: 500, border: 'none', cursor: 'pointer', textAlign: 'left',
                    background: tab === t ? '#0f1729' : 'transparent',
                    color: tab === t ? '#fff' : '#4b5563',
                    transition: 'all 0.15s', fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  {t === 'Objectives'        && <CheckCircleIcon sx={{ fontSize: 16 }} />}
                  {t === 'Activity Timeline' && <span>🎯</span>}
                  {t === 'Assessment Logic'  && <span>📋</span>}
                  {t}
                </button>
              ))}
            </div>

            <button
              onClick={openInTutor}
              style={{
                width: '100%', marginTop: 16, padding: '11px', borderRadius: 12,
                fontWeight: 600, fontSize: 13, background: '#6c47ff', color: '#fff',
                border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: 8, fontFamily: "'DM Sans', sans-serif",
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#0f1729'}
              onMouseLeave={e => e.currentTarget.style.background = '#6c47ff'}
            >
              <FlashOnIcon sx={{ fontSize: 16 }} /> Study in AI Tutor
            </button>
          </div>
        </div>

        {/* Right: tab content */}
        <div>
          {tab === 'Objectives' && (
            <div style={{ ...card, padding: 22 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
                <StarIcon sx={{ color: '#6c47ff', fontSize: 18 }} />
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#9ca3af' }}>Learning Objectives</span>
              </div>
              {detail.objectives.map((obj, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#d1d5db', flexShrink: 0, marginTop: 2 }}>0{i + 1}</span>
                  <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.6, margin: 0 }}>{obj}</p>
                </div>
              ))}
            </div>
          )}

          {tab === 'Activity Timeline' && (
            <div style={{ ...card, padding: 22 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
                <span>🎯</span>
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#9ca3af' }}>Activity Timeline</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {detail.timeline.map((t, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 14, padding: '12px 14px',
                    borderRadius: 12, border: `1px solid ${t.active ? '#c4b5fd' : '#f3f4f6'}`,
                    background: t.active ? '#f5f3ff' : '#f9fafb',
                  }}>
                    <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#9ca3af', width: 52, flexShrink: 0 }}>{t.time}</span>
                    <span style={{ fontSize: 13, fontWeight: 500, flex: 1, color: t.active ? '#6c47ff' : '#374151' }}>{t.label}</span>
                    {t.active ? <FlashOnIcon sx={{ color: '#6c47ff', fontSize: 16 }} /> : <span style={{ color: '#d1d5db' }}>⋮</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'Assessment Logic' && (
            <div style={{ ...card, padding: 22 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
                <CheckCircleIcon sx={{ color: '#6c47ff', fontSize: 18 }} />
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#9ca3af' }}>Assessment Strategy</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  { label: 'Formative', val: detail.assessment.formative },
                  { label: 'Summative', val: detail.assessment.summative },
                ].map(a => (
                  <div key={a.label} style={{ padding: 16, background: '#f9fafb', borderRadius: 12 }}>
                    <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, color: '#9ca3af', margin: '0 0 6px' }}>{a.label}</p>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#1f2937', margin: 0 }}>{a.val}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}