import React from 'react';
import TrendingUpIcon          from '@mui/icons-material/TrendingUp';
import EmojiEventsIcon         from '@mui/icons-material/EmojiEvents';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';

const card = {
  background: '#fff', borderRadius: 20,
  border: '1px solid #f1f1f5', boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
};

const TOPICS = [
  { label: 'Python',          score: 88, color: '#6c47ff' },
  { label: 'Data Structures', score: 92, color: '#3b82f6' },
  { label: 'Algorithms',      score: 78, color: '#10b981' },
  { label: 'OOP',             score: 85, color: '#f59e0b' },
  { label: 'Databases',       score: 91, color: '#ef4444' },
];

const WEEKLY = [72, 78, 75, 83, 85, 88, 85];
const DAYS   = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MAX    = Math.max(...WEEKLY);
const TODAY  = 5; // Saturday

const ROWS = [
  { topic: 'Data Structures', score: '92/100', diff: 'Medium', status: 'DISTINCTION', sc: '#10b981', sb: '#d1fae5' },
  { topic: 'Algorithms',      score: '78/100', diff: 'Hard',   status: 'PROFICIENT',  sc: '#8b5cf6', sb: '#ede9fe' },
  { topic: 'Database Systems',score: '85/100', diff: 'Medium', status: 'MERIT',       sc: '#06b6d4', sb: '#cffafe' },
  { topic: 'Python',          score: '88/100', diff: 'Easy',   status: 'DISTINCTION', sc: '#10b981', sb: '#d1fae5' },
];

const KPIS = [
  { label: 'Overall Average',  val: '85%',          icon: <TrendingUpIcon          sx={{ fontSize: 20 }} />, delta: '+3% this week',   dc: '#10b981' },
  { label: 'Quizzes Done',     val: '12',            icon: <EmojiEventsIcon         sx={{ fontSize: 20 }} />, delta: '+3 this week',    dc: '#10b981' },
  { label: 'Top Topic',        val: 'Data Struct.',  icon: <EmojiEventsIcon         sx={{ fontSize: 20 }} />, delta: '92% avg score',   dc: '#10b981' },
  { label: 'Study Streak',     val: '7 days',        icon: <LocalFireDepartmentIcon sx={{ fontSize: 20 }} />, delta: 'Personal best!',  dc: '#f59e0b' },
];

export default function AnalyticsPage() {
  return (
    <div style={{ padding: 32, maxWidth: 920 }}>
      <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#6c47ff', margin: '0 0 6px' }}>
        Student Analytics
      </p>
      <h1 style={{ fontSize: 30, fontWeight: 800, color: '#1f2937', margin: '0 0 4px' }}>Performance Overview</h1>
      <p style={{ fontSize: 13, color: '#9ca3af', marginBottom: 28 }}>Tracking progress across all CS topics and sessions</p>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}>
        {KPIS.map((k, i) => (
          <div key={i} style={{ ...card, padding: 20 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#ede9ff', color: '#6c47ff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
              {k.icon}
            </div>
            <p style={{ fontSize: 10, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1.5, margin: '0 0 4px', fontWeight: 700 }}>{k.label}</p>
            <p style={{ fontSize: 24, fontWeight: 800, color: '#1f2937', margin: '0 0 4px' }}>{k.val}</p>
            <p style={{ fontSize: 11, color: k.dc, margin: 0 }}>{k.delta}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Bar chart */}
        <div style={{ ...card, padding: 24 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#1f2937', margin: '0 0 4px' }}>Weekly Score Trend</h2>
          <p style={{ fontSize: 11, color: '#9ca3af', margin: '0 0 20px' }}>Daily quiz performance this week</p>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 150 }}>
            {WEEKLY.map((s, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: i === TODAY ? '#6c47ff' : '#374151' }}>{s}</span>
                <div style={{
                  width: '100%', borderRadius: '6px 6px 0 0',
                  background: i === TODAY ? '#6c47ff' : '#ede9ff',
                  height: `${Math.round((s / MAX) * 110)}px`,
                  transition: 'height 0.4s, background 0.2s',
                  cursor: 'pointer',
                }}
                  onMouseEnter={e => { if (i !== TODAY) e.currentTarget.style.background = '#c4b5fd'; }}
                  onMouseLeave={e => { if (i !== TODAY) e.currentTarget.style.background = '#ede9ff'; }}
                />
                <span style={{ fontSize: 10, color: '#9ca3af' }}>{DAYS[i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Topic bars */}
        <div style={{ ...card, padding: 24 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#1f2937', margin: '0 0 4px' }}>Topic Performance</h2>
          <p style={{ fontSize: 11, color: '#9ca3af', margin: '0 0 20px' }}>Average score by curriculum area</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {TOPICS.map(t => (
              <div key={t.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>{t.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: t.color }}>{t.score}%</span>
                </div>
                <div style={{ height: 6, background: '#f3f4f6', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{ height: 6, borderRadius: 99, background: t.color, width: `${t.score}%`, transition: 'width 0.6s' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div style={{ ...card, overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #f9fafb' }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1f2937', margin: '0 0 2px' }}>Recent Quiz Attempts</h2>
          <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>All sessions across topics</p>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Topic', 'Score', 'Difficulty', 'Status'].map(h => (
                <th key={h} style={{ padding: '10px 24px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1.5, borderBottom: '1px solid #f9fafb' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((r, i) => (
              <tr key={i} style={{ borderBottom: i < ROWS.length - 1 ? '1px solid #f9fafb' : 'none' }}>
                <td style={{ padding: '16px 24px', fontSize: 14, fontWeight: 500, color: '#1f2937' }}>{r.topic}</td>
                <td style={{ padding: '16px 24px', fontSize: 14, fontWeight: 700, color: '#1f2937' }}>{r.score}</td>
                <td style={{ padding: '16px 24px' }}>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 999, background: '#f3f4f6', color: '#6b7280' }}>{r.diff}</span>
                </td>
                <td style={{ padding: '16px 24px' }}>
                  <span style={{ padding: '4px 12px', borderRadius: 999, fontSize: 11, fontWeight: 700, background: r.sb, color: r.sc }}>{r.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}