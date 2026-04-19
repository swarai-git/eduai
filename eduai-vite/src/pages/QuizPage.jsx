import React, { useState, useCallback } from 'react';
import AutoAwesomeIcon       from '@mui/icons-material/AutoAwesome';
import TrendingUpIcon        from '@mui/icons-material/TrendingUp';
import CheckCircleIcon       from '@mui/icons-material/CheckCircle';
import CancelIcon            from '@mui/icons-material/Cancel';
import LightbulbIcon         from '@mui/icons-material/Lightbulb';
import RefreshIcon           from '@mui/icons-material/Refresh';
import CircularProgress      from '@mui/icons-material/Refresh'; // placeholder, real below
import MuiCircularProgress   from '@mui/material/CircularProgress';
import { generateQuiz, getHint } from '../services/api';

const card = {
  background: '#fff', borderRadius: 20,
  border: '1px solid #f1f1f5', boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
};

const TOPICS = [
  'Data Structures', 'Algorithms', 'Python', 'OOP',
  'Databases', 'Recursion', 'Sorting Algorithms',
  'Graph Theory', 'Dynamic Programming', 'Memory Management',
  'Web Development', 'Binary Trees', 'Hash Tables', 'Linked Lists',
];
const DIFFS = ['Easy', 'Medium', 'Hard'];
const COUNTS = [3, 5, 7, 10];

const RECENT_RESULTS = [
  { date: '24 OCT 2023', topic: 'Data Structures', score: '92/100', status: 'DISTINCTION', sc: '#10b981', sb: '#d1fae5', icon: '🔷' },
  { date: '22 OCT 2023', topic: 'Algorithms',      score: '78/100', status: 'PROFICIENT',  sc: '#8b5cf6', sb: '#ede9fe', icon: '⚙️' },
  { date: '19 OCT 2023', topic: 'Database Systems', score: '85/100', status: 'MERIT',       sc: '#06b6d4', sb: '#cffafe', icon: '🗄️' },
];

/* ── Results screen ─────────────────────────────────────────────────────────── */
function ResultsScreen({ topic, score, total, answers, questions, onRetry }) {
  const pct = Math.round((score / total) * 100);
  const grade =
    pct >= 90 ? { g: 'A+', c: '#10b981', bg: '#d1fae5' } :
    pct >= 80 ? { g: 'A',  c: '#6c47ff', bg: '#ede9ff' } :
    pct >= 70 ? { g: 'B',  c: '#3b82f6', bg: '#dbeafe' } :
    pct >= 60 ? { g: 'C',  c: '#f59e0b', bg: '#fef3c7' } :
                { g: 'F',  c: '#ef4444', bg: '#fee2e2' };

  return (
    <div style={{ padding: 32, maxWidth: 600 }}>
      <div style={{
        width: 110, height: 110, borderRadius: '50%',
        background: 'linear-gradient(135deg,#6c47ff,#0f1729)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 20px',
      }}>
        <span style={{ fontSize: 30, fontWeight: 900, color: '#fff' }}>{pct}%</span>
      </div>
      <h1 style={{ fontSize: 32, fontWeight: 800, color: '#1f2937', textAlign: 'center', marginBottom: 6 }}>
        Quiz Complete!
      </h1>
      <p style={{ color: '#6b7280', textAlign: 'center', marginBottom: 6 }}>
        <strong>{score}</strong> correct out of <strong>{total}</strong> on <strong>{topic}</strong>
      </p>
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <span style={{ padding: '6px 18px', borderRadius: 999, fontWeight: 700, fontSize: 15, background: grade.bg, color: grade.c }}>
          Grade {grade.g}
        </span>
      </div>

      {/* Detailed review */}
      <div style={{ ...card, padding: 20, marginBottom: 20 }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#9ca3af', margin: '0 0 16px' }}>
          Answer Review
        </p>
        {questions.map((q, i) => {
          const a = answers[i];
          const correct = a?.sel === q.correct_answer;
          return (
            <div key={i} style={{ padding: '14px 0', borderBottom: i < questions.length - 1 ? '1px solid #f9fafb' : 'none' }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 6 }}>
                {correct
                  ? <CheckCircleIcon sx={{ fontSize: 18, color: '#10b981', flexShrink: 0 }} />
                  : <CancelIcon      sx={{ fontSize: 18, color: '#ef4444', flexShrink: 0 }} />
                }
                <span style={{ fontSize: 13, fontWeight: 600, color: '#1f2937', lineHeight: 1.5 }}>{q.question}</span>
              </div>
              {!correct && a?.sel && (
                <p style={{ fontSize: 12, color: '#6b7280', margin: '4px 0 4px 28px' }}>
                  You answered <strong style={{ color: '#ef4444' }}>{a.sel}</strong> · Correct: <strong style={{ color: '#10b981' }}>{q.correct_answer}</strong>
                </p>
              )}
              <p style={{ fontSize: 12, color: '#6b7280', margin: '4px 0 0 28px', fontStyle: 'italic', lineHeight: 1.5 }}>
                💡 {q.explanation}
              </p>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        <button
          onClick={onRetry}
          style={{
            flex: 1, padding: '14px', borderRadius: 12, fontWeight: 700, fontSize: 15,
            background: '#6c47ff', color: '#fff', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          <RefreshIcon sx={{ fontSize: 18 }} /> Generate New Quiz
        </button>
      </div>
    </div>
  );
}

/* ── Quiz screen ─────────────────────────────────────────────────────────────── */
function QuizScreen({ topic, diff, questions, onDone }) {
  const [cur,      setCur]      = useState(0);
  const [sel,      setSel]      = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [answers,  setAnswers]  = useState([]);
  const [hint,     setHint]     = useState('');
  const [hintLoad, setHintLoad] = useState(false);

  const q       = questions[cur];
  const correct = sel === q.correct_answer;

  const fetchHint = async () => {
    setHintLoad(true);
    try {
      const res = await getHint({ question: q.question, topic: q.topic });
      setHint(res.data.hint);
    } catch {
      setHint('Think about the fundamental definition of the concept being asked about.');
    }
    setHintLoad(false);
  };

  const submit = () => { if (sel) setRevealed(true); };

  const next = () => {
    const newAnswers = [...answers, { sel, correct: q.correct_answer }];
    setAnswers(newAnswers);
    if (cur + 1 < questions.length) {
      setCur(cur + 1); setSel(null); setRevealed(false); setHint('');
    } else {
      const score = newAnswers.filter(a => a.sel === a.correct).length;
      onDone(score, newAnswers);
    }
  };

  const optStyle = (letter) => {
    if (!revealed) {
      return sel === letter
        ? { bg: '#f5f3ff', border: '#6c47ff', color: '#4c1d95', weight: 600 }
        : { bg: '#f9fafb', border: '#e5e7eb', color: '#374151', weight: 500 };
    }
    if (letter === q.correct_answer) return { bg: '#d1fae5', border: '#10b981', color: '#065f46', weight: 700 };
    if (letter === sel)              return { bg: '#fee2e2', border: '#ef4444', color: '#991b1b', weight: 600 };
    return { bg: '#f9fafb', border: '#e5e7eb', color: '#9ca3af', weight: 400 };
  };

  return (
    <div style={{ padding: 32, maxWidth: 680 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div>
          <p style={{ fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 2, margin: '0 0 4px', fontWeight: 700 }}>
            {topic}
          </p>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1f2937', margin: 0 }}>
            Question <span style={{ color: '#6c47ff' }}>{cur + 1}</span>
            <span style={{ color: '#9ca3af', fontWeight: 400, fontSize: 18 }}> of {questions.length}</span>
          </h1>
        </div>
        <span style={{ padding: '5px 14px', borderRadius: 999, background: '#ede9ff', color: '#6c47ff', fontSize: 12, fontWeight: 700 }}>
          {diff}
        </span>
      </div>

      {/* Progress */}
      <div style={{ height: 5, background: '#f3f4f6', borderRadius: 99, marginBottom: 24 }}>
        <div style={{
          height: 5, background: 'linear-gradient(90deg,#6c47ff,#a78bfa)', borderRadius: 99,
          width: `${(cur / questions.length) * 100}%`, transition: 'width 0.4s',
        }} />
      </div>

      {/* Question card */}
      <div style={{ ...card, padding: 26, marginBottom: 14 }}>
        <p style={{ fontSize: 16, fontWeight: 600, color: '#1f2937', marginBottom: 22, lineHeight: 1.6 }}>
          {q.question}
        </p>

        {/* Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {q.options.map((opt) => {
            const s = optStyle(opt.letter);
            return (
              <button
                key={opt.letter}
                onClick={() => !revealed && setSel(opt.letter)}
                disabled={revealed}
                style={{
                  textAlign: 'left', padding: '13px 16px', borderRadius: 12,
                  fontSize: 14, fontWeight: s.weight, cursor: revealed ? 'default' : 'pointer',
                  border: `2px solid ${s.border}`, background: s.bg, color: s.color,
                  transition: 'all 0.15s', fontFamily: "'DM Sans', sans-serif",
                  display: 'flex', alignItems: 'center', gap: 12,
                }}
                onMouseEnter={e => { if (!revealed && sel !== opt.letter) { e.currentTarget.style.borderColor = '#c4b5fd'; e.currentTarget.style.background = '#faf5ff'; } }}
                onMouseLeave={e => { if (!revealed && sel !== opt.letter) { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.background = '#f9fafb'; } }}
              >
                <span style={{
                  width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                  background: sel === opt.letter && !revealed ? '#6c47ff' : revealed && opt.letter === q.correct_answer ? '#10b981' : revealed && opt.letter === sel ? '#ef4444' : 'rgba(0,0,0,0.06)',
                  color: (sel === opt.letter && !revealed) || (revealed && (opt.letter === q.correct_answer || opt.letter === sel)) ? '#fff' : '#6b7280',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: 12, transition: 'all 0.15s',
                }}>
                  {opt.letter}
                </span>
                {opt.text}
              </button>
            );
          })}
        </div>

        {/* Explanation after reveal */}
        {revealed && (
          <div style={{
            marginTop: 16, padding: '14px 16px', borderRadius: 12,
            background: correct ? '#f0fdf4' : '#fff7ed',
            border: `1px solid ${correct ? '#86efac' : '#fcd34d'}`,
          }}>
            <p style={{ fontSize: 13, color: correct ? '#15803d' : '#92400e', margin: 0, lineHeight: 1.6 }}>
              <strong>{correct ? '✓ Correct! ' : '✗ Incorrect. '}</strong>
              {q.explanation}
            </p>
          </div>
        )}

        {/* Hint box */}
        {hint && !revealed && (
          <div style={{ marginTop: 14, padding: '12px 16px', borderRadius: 12, background: '#fffbeb', border: '1px solid #fde68a' }}>
            <p style={{ fontSize: 13, color: '#92400e', margin: 0, lineHeight: 1.5 }}>
              <LightbulbIcon sx={{ fontSize: 14, verticalAlign: 'middle', marginRight: 6 }} />
              <strong>Hint: </strong>{hint}
            </p>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 10 }}>
        {!revealed ? (
          <>
            {/* Hint button */}
            {!hint && (
              <button
                onClick={fetchHint}
                disabled={hintLoad}
                style={{
                  padding: '12px 20px', borderRadius: 12, fontWeight: 600, fontSize: 13,
                  background: '#fff', color: '#6c47ff', border: '2px solid #e5e7eb',
                  cursor: hintLoad ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                  fontFamily: "'DM Sans', sans-serif", transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#c4b5fd'; e.currentTarget.style.background = '#faf5ff'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.background = '#fff'; }}
              >
                {hintLoad ? <MuiCircularProgress size={14} sx={{ color: '#6c47ff' }} /> : <LightbulbIcon sx={{ fontSize: 16 }} />}
                Hint
              </button>
            )}
            <button
              onClick={submit} disabled={!sel}
              style={{
                flex: 1, padding: '13px', borderRadius: 12, fontWeight: 700, fontSize: 15,
                background: sel ? '#0f1729' : '#e5e7eb', color: sel ? '#fff' : '#9ca3af',
                border: 'none', cursor: sel ? 'pointer' : 'not-allowed',
                transition: 'background 0.15s, color 0.15s', fontFamily: "'DM Sans', sans-serif",
              }}
              onMouseEnter={e => { if (sel) e.currentTarget.style.background = '#6c47ff'; }}
              onMouseLeave={e => { if (sel) e.currentTarget.style.background = '#0f1729'; }}
            >
              Check Answer
            </button>
          </>
        ) : (
          <button
            onClick={next}
            style={{
              flex: 1, padding: '13px', borderRadius: 12, fontWeight: 700, fontSize: 15,
              background: '#6c47ff', color: '#fff', border: 'none', cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif", transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#0f1729'}
            onMouseLeave={e => e.currentTarget.style.background = '#6c47ff'}
          >
            {cur + 1 === questions.length ? 'See Results →' : 'Next Question →'}
          </button>
        )}
      </div>
    </div>
  );
}

/* ── Generating screen ────────────────────────────────────────────────────────── */
function GeneratingScreen({ topic, difficulty }) {
  return (
    <div style={{ padding: 32, maxWidth: 480, textAlign: 'center' }}>
      <div style={{
        width: 80, height: 80, borderRadius: '50%',
        background: 'linear-gradient(135deg,#6c47ff,#0f1729)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '60px auto 24px',
      }}>
        <AutoAwesomeIcon sx={{ fontSize: 36, color: '#fff' }} />
      </div>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1f2937', marginBottom: 8 }}>
        Generating Your Quiz…
      </h2>
      
      <MuiCircularProgress sx={{ color: '#6c47ff' }} />
      <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 16 }}>
        This takes a few seconds…
      </p>
    </div>
  );
}

/* ── Error screen ─────────────────────────────────────────────────────────────── */
function ErrorScreen({ error, onRetry }) {
  const isApiKey = error?.includes('ANTHROPIC_API_KEY');
  return (
    <div style={{ padding: 32, maxWidth: 480 }}>
      <div style={{ ...card, padding: 28, textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>⚠️</div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1f2937', marginBottom: 12 }}>
          {isApiKey ? 'API Key Required' : 'Generation Failed'}
        </h2>
        <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.6, marginBottom: 20 }}>
          {error}
        </p>
        {isApiKey && (
          <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 12, padding: '14px', textAlign: 'left', marginBottom: 20 }}>
            <p style={{ fontSize: 12, color: '#374151', margin: '0 0 8px', fontWeight: 600 }}>To enable quiz generation:</p>
            <p style={{ fontSize: 12, color: '#6b7280', margin: 0, fontFamily: 'DM Mono, monospace', lineHeight: 2 }}>
              1. Create <code>.env</code> in backend folder<br />
              2. Add: <code>ANTHROPIC_API_KEY=sk-ant-...</code><br />
              3. Restart: <code>uvicorn main:app --reload</code>
            </p>
          </div>
        )}
        <button
          onClick={onRetry}
          style={{
            padding: '12px 28px', borderRadius: 12, fontWeight: 700, fontSize: 14,
            background: '#6c47ff', color: '#fff', border: 'none', cursor: 'pointer',
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          Try Again
        </button>
      </div>
    </div>
  );
}

/* ── Main page ────────────────────────────────────────────────────────────────── */
export default function QuizPage() {
  const [topic,     setTopic]     = useState('Data Structures');
  const [diff,      setDiff]      = useState('Medium');
  const [count,     setCount]     = useState(5);
  const [phase,     setPhase]     = useState('setup');   // setup | generating | quiz | done | error
  const [questions, setQuestions] = useState([]);
  const [score,     setScore]     = useState(0);
  const [answers,   setAnswers]   = useState([]);
  const [error,     setError]     = useState('');

  const startQuiz = useCallback(async () => {
    setPhase('generating');
    setError('');
    try {
      const res = await generateQuiz({ topic, difficulty: diff, num_questions: count });
      setQuestions(res.data.questions);
      setPhase('quiz');
    } catch (err) {
      const detail = err.response?.data?.detail || err.message || 'Unknown error';
      setError(detail);
      setPhase('error');
    }
  }, [topic, diff, count]);

  const onDone = (s, a) => { setScore(s); setAnswers(a); setPhase('done'); };
  const onRetry = ()    => { setPhase('setup'); setScore(0); setAnswers([]); setQuestions([]); };

  if (phase === 'generating') return <GeneratingScreen topic={topic} difficulty={diff} />;
  if (phase === 'quiz')       return <QuizScreen topic={topic} diff={diff} questions={questions} onDone={onDone} />;
  if (phase === 'done')       return <ResultsScreen topic={topic} score={score} total={questions.length} answers={answers} questions={questions} onRetry={onRetry} />;
  if (phase === 'error')      return <ErrorScreen error={error} onRetry={onRetry} />;

  /* ── Setup screen ── */
  return (
    <div style={{ padding: 32, maxWidth: 960 }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#6c47ff', margin: '0 0 6px' }}>
          Session Lab
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: '#1f2937', margin: 0 }}>Quiz Generator</h1>
         
        </div>
        
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 28 }}>
        {/* Setup card */}
        <div style={{ ...card, padding: 26 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1f2937', margin: '0 0 4px' }}>Setup Parameters</h2>
         

          {/* Topic */}
          <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#6b7280', display: 'block', marginBottom: 8 }}>
            Curriculum Topic
          </label>
          <select
            value={topic} onChange={e => setTopic(e.target.value)}
            style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 12, padding: '12px 14px', fontSize: 14, color: '#374151', outline: 'none', marginBottom: 18, background: '#fff', fontFamily: "'DM Sans', sans-serif", cursor: 'pointer' }}
          >
            {TOPICS.map(t => <option key={t}>{t}</option>)}
          </select>

          {/* Difficulty */}
          <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#6b7280', display: 'block', marginBottom: 8 }}>
            Difficulty
          </label>
          <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
            {DIFFS.map(d => (
              <button key={d} onClick={() => setDiff(d)}
                style={{ flex: 1, padding: '10px 0', borderRadius: 12, fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer', background: diff === d ? '#0f1729' : '#f3f4f6', color: diff === d ? '#fff' : '#6b7280', transition: 'all 0.15s', fontFamily: "'DM Sans', sans-serif" }}
              >{d}</button>
            ))}
          </div>

          {/* Question count */}
          <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#6b7280', display: 'block', marginBottom: 8 }}>
            Number of Questions
          </label>
          <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
            {COUNTS.map(n => (
              <button key={n} onClick={() => setCount(n)}
                style={{ flex: 1, padding: '10px 0', borderRadius: 12, fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer', background: count === n ? '#6c47ff' : '#f3f4f6', color: count === n ? '#fff' : '#6b7280', transition: 'all 0.15s', fontFamily: "'DM Sans', sans-serif" }}
              >{n}</button>
            ))}
          </div>

          <button
            onClick={startQuiz}
            style={{
              width: '100%', padding: '15px', borderRadius: 12, fontWeight: 700, fontSize: 15,
              background: '#0f1729', color: '#fff', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              fontFamily: "'DM Sans', sans-serif", transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#6c47ff'}
            onMouseLeave={e => e.currentTarget.style.background = '#0f1729'}
          >
            <AutoAwesomeIcon sx={{ fontSize: 18 }} /> Generate & Start Quiz
          </button>
        </div>

       
       
      </div>

      {/* Recent results */}
      <div style={{ ...card, overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid #f9fafb' }}>
          <div>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: '#1f2937', margin: '0 0 2px' }}>Recent Results</h2>
            <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>Historical performance across modules</p>
          </div>
          <button style={{ fontSize: 13, fontWeight: 600, color: '#6c47ff', background: 'none', border: 'none', cursor: 'pointer' }}>
            Export Transcript ↓
          </button>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Execution Date', 'Topic', 'Score', 'Status'].map(h => (
                <th key={h} style={{ padding: '10px 24px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1.5, borderBottom: '1px solid #f9fafb' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {RECENT_RESULTS.map((r, i) => (
              <tr key={i} style={{ borderBottom: i < RECENT_RESULTS.length - 1 ? '1px solid #f9fafb' : 'none' }}>
                <td style={{ padding: '14px 24px', fontSize: 13, color: '#6b7280' }}>{r.date}</td>
                <td style={{ padding: '14px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 16 }}>{r.icon}</span>
                    <span style={{ fontSize: 14, fontWeight: 500, color: '#1f2937' }}>{r.topic}</span>
                  </div>
                </td>
                <td style={{ padding: '14px 24px', fontSize: 14, fontWeight: 700, color: '#1f2937' }}>{r.score}</td>
                <td style={{ padding: '14px 24px' }}>
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