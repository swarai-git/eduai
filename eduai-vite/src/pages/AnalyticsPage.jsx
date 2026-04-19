import React, { useState, useEffect, useRef } from 'react';
import TrendingUpIcon          from '@mui/icons-material/TrendingUp';
import TrendingDownIcon        from '@mui/icons-material/TrendingDown';
import EmojiEventsIcon         from '@mui/icons-material/EmojiEvents';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import FilterListIcon          from '@mui/icons-material/FilterList';
import DownloadIcon            from '@mui/icons-material/Download';
import InfoOutlinedIcon        from '@mui/icons-material/InfoOutlined';

/* ─── shared card style ─────────────────────────────────── */
const card = {
  background: '#fff', borderRadius: 20,
  border: '1px solid #f1f1f5', boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
};

/* ─── data ──────────────────────────────────────────────── */
const WEEKLY_DATA = {
  'This Week':  [72, 78, 75, 83, 85, 88, 85],
  'Last Week':  [65, 70, 68, 74, 79, 80, 77],
  'Two Weeks Ago': [58, 62, 67, 70, 72, 75, 71],
};
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const TOPICS = [
  { label: 'Python',          score: 88, prev: 84, color: '#6c47ff', questions: 24, time: '4.2h' },
  { label: 'Data Structures', score: 92, prev: 89, color: '#3b82f6', questions: 31, time: '6.1h' },
  { label: 'Algorithms',      score: 78, prev: 82, color: '#10b981', questions: 18, time: '3.5h' },
  { label: 'OOP',             score: 85, prev: 80, color: '#f59e0b', questions: 20, time: '3.8h' },
  { label: 'Databases',       score: 91, prev: 88, color: '#ef4444', questions: 27, time: '5.0h' },
  { label: 'Networking',      score: 74, prev: 71, color: '#8b5cf6', questions: 12, time: '2.1h' },
];

const ALL_ROWS = [
  { date: '2023-10-24', topic: 'Data Structures', score: 92, total: 100, diff: 'Medium', status: 'DISTINCTION', sc: '#10b981', sb: '#d1fae5' },
  { date: '2023-10-22', topic: 'Algorithms',      score: 78, total: 100, diff: 'Hard',   status: 'PROFICIENT',  sc: '#8b5cf6', sb: '#ede9fe' },
  { date: '2023-10-19', topic: 'Databases',       score: 85, total: 100, diff: 'Medium', status: 'MERIT',       sc: '#06b6d4', sb: '#cffafe' },
  { date: '2023-10-17', topic: 'Python',          score: 88, total: 100, diff: 'Easy',   status: 'DISTINCTION', sc: '#10b981', sb: '#d1fae5' },
  { date: '2023-10-14', topic: 'OOP',             score: 74, total: 100, diff: 'Medium', status: 'PROFICIENT',  sc: '#8b5cf6', sb: '#ede9fe' },
  { date: '2023-10-12', topic: 'Networking',      score: 68, total: 100, diff: 'Hard',   status: 'PASS',        sc: '#f59e0b', sb: '#fef3c7' },
  { date: '2023-10-10', topic: 'Data Structures', score: 95, total: 100, diff: 'Hard',   status: 'DISTINCTION', sc: '#10b981', sb: '#d1fae5' },
  { date: '2023-10-08', topic: 'Algorithms',      score: 81, total: 100, diff: 'Medium', status: 'MERIT',       sc: '#06b6d4', sb: '#cffafe' },
];

const KPIS = [
  { label: 'Overall Average',  val: '85%',         sub: '+3% this week',  dc: '#10b981', up: true,  icon: <TrendingUpIcon sx={{ fontSize: 20 }} /> },
  { label: 'Quizzes Done',     val: '12',           sub: '+3 this week',   dc: '#10b981', up: true,  icon: <EmojiEventsIcon sx={{ fontSize: 20 }} /> },
  { label: 'Top Topic',        val: 'Data Struct.', sub: '92% avg score',  dc: '#10b981', up: true,  icon: <EmojiEventsIcon sx={{ fontSize: 20 }} /> },
  { label: 'Study Streak',     val: '7 days',       sub: 'Personal best!', dc: '#f59e0b', up: true,  icon: <LocalFireDepartmentIcon sx={{ fontSize: 20 }} /> },
];

/* ─── animated counter hook ─────────────────────────────── */
function useCountUp(target, duration = 800) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / (duration / 16);
    const t = setInterval(() => {
      start = Math.min(start + step, target);
      setVal(Math.round(start));
      if (start >= target) clearInterval(t);
    }, 16);
    return () => clearInterval(t);
  }, [target]);
  return val;
}

/* ─── animated bar ──────────────────────────────────────── */
function AnimatedBar({ pct, color, delay = 0 }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(pct), delay + 100);
    return () => clearTimeout(t);
  }, [pct, delay]);
  return (
    <div style={{ height: 7, background: '#f3f4f6', borderRadius: 99, overflow: 'hidden' }}>
      <div style={{ height: 7, borderRadius: 99, background: color, width: `${width}%`, transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)' }} />
    </div>
  );
}

/* ─── bar chart column ──────────────────────────────────── */
function BarCol({ score, max, isToday, day, delay }) {
  const [h, setH] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setH(Math.round((score / max) * 120)), delay);
    return () => clearTimeout(t);
  }, [score, max, delay]);
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
      <span style={{ fontSize: 11, fontWeight: 600, color: isToday ? '#6c47ff' : '#6b7280' }}>{score}</span>
      <div
        style={{
          width: '100%', height: `${h}px`, borderRadius: '7px 7px 0 0',
          background: isToday ? 'linear-gradient(180deg,#7c3aed,#6c47ff)' : '#ede9ff',
          transition: 'height 0.6s cubic-bezier(0.4,0,0.2,1)',
          cursor: 'pointer', position: 'relative',
        }}
        onMouseEnter={e => { if (!isToday) e.currentTarget.style.background = '#c4b5fd'; }}
        onMouseLeave={e => { if (!isToday) e.currentTarget.style.background = '#ede9ff'; }}
        title={`${day}: ${score}%`}
      />
      <span style={{ fontSize: 10, color: '#9ca3af' }}>{day}</span>
    </div>
  );
}

/* ──────────────────────────────────────────────────────── */
export default function AnalyticsPage() {
  const [weekFilter,    setWeekFilter]    = useState('This Week');
  const [topicFilter,   setTopicFilter]   = useState('All');
  const [diffFilter,    setDiffFilter]    = useState('All');
  const [sortCol,       setSortCol]       = useState('date');
  const [sortDir,       setSortDir]       = useState('desc');
  const [hoveredTopic,  setHoveredTopic]  = useState(null);
  const [showTable,     setShowTable]     = useState(true);

  const weekScores = WEEKLY_DATA[weekFilter];
  const maxScore   = Math.max(...weekScores);
  const todayIdx   = weekFilter === 'This Week' ? 5 : 6;
  const avgWeek    = Math.round(weekScores.reduce((a,b) => a+b, 0) / weekScores.length);

  /* filter table */
  const filtered = ALL_ROWS
    .filter(r => topicFilter === 'All' || r.topic === topicFilter)
    .filter(r => diffFilter  === 'All' || r.diff  === diffFilter)
    .sort((a, b) => {
      const va = sortCol === 'score' ? a.score : a.date;
      const vb = sortCol === 'score' ? b.score : b.date;
      return sortDir === 'desc' ? (va > vb ? -1 : 1) : (va < vb ? -1 : 1);
    });

  const toggleSort = col => {
    if (sortCol === col) setSortDir(d => d === 'desc' ? 'asc' : 'desc');
    else { setSortCol(col); setSortDir('desc'); }
  };

  const exportCSV = () => {
    const rows = [['Date','Topic','Score','Difficulty','Status'], ...filtered.map(r => [r.date, r.topic, `${r.score}/100`, r.diff, r.status])];
    const csv  = rows.map(r => r.join(',')).join('\n');
    const url  = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    Object.assign(document.createElement('a'), { href: url, download: 'analytics.csv' }).click();
  };

  const topicCount = score => score >= 85 ? 'Excellent' : score >= 70 ? 'Good' : 'Needs work';

  return (
    <div style={{ padding: '28px 32px', maxWidth: 980 }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28 }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#6c47ff', margin: '0 0 5px' }}>Student Analytics</p>
          <h1 style={{ fontSize: 30, fontWeight: 800, color: '#1f2937', margin: '0 0 4px' }}>Performance Overview</h1>
          <p style={{ fontSize: 13, color: '#9ca3af', margin: 0 }}>Tracking progress across all CS topics and sessions</p>
        </div>
        <button
          onClick={exportCSV}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', background: '#0f1729', color: '#fff', border: 'none', borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}
          onMouseEnter={e => e.currentTarget.style.background = '#6c47ff'}
          onMouseLeave={e => e.currentTarget.style.background = '#0f1729'}
        >
          <DownloadIcon sx={{ fontSize: 16 }} /> Export CSV
        </button>
      </div>

      {/* ── KPI cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}>
        {KPIS.map((k, i) => (
          <div key={i} style={{ ...card, padding: 20 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#ede9ff', color: '#6c47ff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
              {k.icon}
            </div>
            <p style={{ fontSize: 10, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1.5, margin: '0 0 4px', fontWeight: 700 }}>{k.label}</p>
            <p style={{ fontSize: 24, fontWeight: 800, color: '#1f2937', margin: '0 0 4px' }}>{k.val}</p>
            <p style={{ fontSize: 11, color: k.dc, margin: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
              {k.up ? <TrendingUpIcon sx={{ fontSize: 12 }} /> : <TrendingDownIcon sx={{ fontSize: 12 }} />}
              {k.sub}
            </p>
          </div>
        ))}
      </div>

      {/* ── Charts row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>

        {/* Bar chart */}
        <div style={{ ...card, padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
            <div>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: '#1f2937', margin: '0 0 3px' }}>Weekly Score Trend</h2>
              <p style={{ fontSize: 11, color: '#9ca3af', margin: 0 }}>
                Avg: <strong style={{ color: '#6c47ff' }}>{avgWeek}%</strong>
              </p>
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              {Object.keys(WEEKLY_DATA).map(w => (
                <button
                  key={w}
                  onClick={() => setWeekFilter(w)}
                  style={{
                    padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 600, border: 'none', cursor: 'pointer',
                    background: weekFilter === w ? '#6c47ff' : '#f3f4f6',
                    color:      weekFilter === w ? '#fff'    : '#6b7280',
                    fontFamily: "'DM Sans',sans-serif",
                  }}
                >
                  {w === 'This Week' ? 'This' : w === 'Last Week' ? 'Last' : '2W Ago'}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 160 }}>
            {weekScores.map((s, i) => (
              <BarCol key={i} score={s} max={maxScore} isToday={i === todayIdx} day={DAYS[i]} delay={i * 60} />
            ))}
          </div>
        </div>

        {/* Topic performance with hover details */}
        <div style={{ ...card, padding: 24 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#1f2937', margin: '0 0 4px' }}>Topic Performance</h2>
          <p style={{ fontSize: 11, color: '#9ca3af', margin: '0 0 18px' }}>Click a topic for details</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
            {TOPICS.map((t, i) => {
              const isHovered = hoveredTopic === t.label;
              return (
                <div
                  key={t.label}
                  onClick={() => setHoveredTopic(hoveredTopic === t.label ? null : t.label)}
                  style={{ cursor: 'pointer', padding: isHovered ? '10px 12px' : '0', background: isHovered ? '#f9fafb' : 'transparent', borderRadius: 10, transition: 'all 0.2s' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>{t.label}</span>
                      {t.score > t.prev
                        ? <span style={{ fontSize: 10, color: '#10b981', background: '#d1fae5', padding: '1px 6px', borderRadius: 99, fontWeight: 700 }}>↑{t.score - t.prev}%</span>
                        : <span style={{ fontSize: 10, color: '#ef4444', background: '#fee2e2', padding: '1px 6px', borderRadius: 99, fontWeight: 700 }}>↓{t.prev - t.score}%</span>
                      }
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: t.color }}>{t.score}%</span>
                  </div>
                  <AnimatedBar pct={t.score} color={t.color} delay={i * 80} />
                  {isHovered && (
                    <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                      <span style={{ fontSize: 11, color: '#6b7280' }}>📝 {t.questions} questions</span>
                      <span style={{ fontSize: 11, color: '#6b7280' }}>⏱ {t.time} studied</span>
                      <span style={{ fontSize: 11, color: t.color, fontWeight: 600 }}>{topicCount(t.score)}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Performance heatmap (mini) ── */}
      <div style={{ ...card, padding: 24, marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: '#1f2937', margin: '0 0 3px' }}>Score Distribution</h2>
            <p style={{ fontSize: 11, color: '#9ca3af', margin: 0 }}>All quiz attempts by score range</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', height: 80 }}>
          {[
            { range: '0–49',  count: 1, color: '#fee2e2', tc: '#ef4444' },
            { range: '50–59', count: 1, color: '#fef3c7', tc: '#f59e0b' },
            { range: '60–69', count: 1, color: '#fef3c7', tc: '#f59e0b' },
            { range: '70–79', count: 3, color: '#dbeafe', tc: '#3b82f6' },
            { range: '80–89', count: 5, color: '#ede9ff', tc: '#6c47ff' },
            { range: '90–100',count: 3, color: '#d1fae5', tc: '#10b981' },
          ].map((b, i) => {
            const maxC = 5;
            return (
              <div key={b.range} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: b.tc }}>{b.count}</span>
                <div style={{ width: '100%', borderRadius: '6px 6px 0 0', background: b.color, height: `${(b.count / maxC) * 52}px`, border: `1px solid ${b.tc}30` }} />
                <span style={{ fontSize: 9, color: '#9ca3af', textAlign: 'center' }}>{b.range}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Table with filters ── */}
      <div style={{ ...card, overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #f9fafb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: '#1f2937', margin: '0 0 2px' }}>Quiz Attempts</h2>
            <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>{filtered.length} of {ALL_ROWS.length} sessions</p>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <FilterListIcon sx={{ fontSize: 16, color: '#9ca3af' }} />
            {/* Topic filter */}
            <select
              value={topicFilter}
              onChange={e => setTopicFilter(e.target.value)}
              style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: '5px 10px', fontSize: 12, color: '#374151', outline: 'none', background: '#fff', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}
            >
              <option value="All">All Topics</option>
              {[...new Set(ALL_ROWS.map(r => r.topic))].map(t => <option key={t}>{t}</option>)}
            </select>
            {/* Difficulty filter */}
            <select
              value={diffFilter}
              onChange={e => setDiffFilter(e.target.value)}
              style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: '5px 10px', fontSize: 12, color: '#374151', outline: 'none', background: '#fff', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}
            >
              <option value="All">All Difficulties</option>
              <option>Easy</option><option>Medium</option><option>Hard</option>
            </select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>
            No results match the current filters.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {[
                  { label: 'Date',       col: 'date'  },
                  { label: 'Topic',      col: null    },
                  { label: 'Score',      col: 'score' },
                  { label: 'Difficulty', col: null    },
                  { label: 'Status',     col: null    },
                ].map(h => (
                  <th
                    key={h.label}
                    onClick={() => h.col && toggleSort(h.col)}
                    style={{
                      padding: '10px 24px', textAlign: 'left', fontSize: 10,
                      fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase',
                      letterSpacing: 1.5, borderBottom: '1px solid #f9fafb',
                      cursor: h.col ? 'pointer' : 'default',
                      userSelect: 'none',
                    }}
                  >
                    {h.label}
                    {h.col === sortCol && (
                      <span style={{ marginLeft: 4 }}>{sortDir === 'desc' ? '↓' : '↑'}</span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => (
                <tr
                  key={i}
                  style={{ borderBottom: i < filtered.length - 1 ? '1px solid #f9fafb' : 'none', transition: 'background 0.12s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}
                >
                  <td style={{ padding: '14px 24px', fontSize: 12, color: '#9ca3af' }}>
                    {new Date(r.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td style={{ padding: '14px 24px', fontSize: 14, fontWeight: 500, color: '#1f2937' }}>{r.topic}</td>
                  <td style={{ padding: '14px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: '#1f2937' }}>{r.score}/100</span>
                      <div style={{ width: 40, height: 4, background: '#f3f4f6', borderRadius: 99, overflow: 'hidden' }}>
                        <div style={{ height: 4, background: r.score >= 85 ? '#10b981' : r.score >= 70 ? '#6c47ff' : '#f59e0b', width: `${r.score}%`, borderRadius: 99 }} />
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '14px 24px' }}>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 999, background: '#f3f4f6', color: '#6b7280' }}>{r.diff}</span>
                  </td>
                  <td style={{ padding: '14px 24px' }}>
                    <span style={{ padding: '4px 12px', borderRadius: 999, fontSize: 11, fontWeight: 700, background: r.sb, color: r.sc }}>{r.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}