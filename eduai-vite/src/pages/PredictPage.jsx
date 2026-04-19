import React, { useState } from 'react';
import Slider           from '@mui/material/Slider';
import CircularProgress from '@mui/material/CircularProgress';
import TrendingUpIcon   from '@mui/icons-material/TrendingUp';
import CheckCircleIcon  from '@mui/icons-material/CheckCircle';
import AutoAwesomeIcon  from '@mui/icons-material/AutoAwesome';
import EmojiEventsIcon  from '@mui/icons-material/EmojiEvents';
import { predictScore } from '../services/api';

/* ── Shared styles ────────────────────────────────────────────────── */
const card = {
  background: '#fff', borderRadius: 20,
  border: '1px solid #f1f1f5', boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
};

const sliderSx = {
  color: '#6c47ff', height: 4,
  '& .MuiSlider-thumb': {
    width: 18, height: 18,
    '&:hover, &.Mui-active': { boxShadow: '0 0 0 8px rgba(108,71,255,0.12)' },
  },
  '& .MuiSlider-rail': { opacity: 0.2 },
};

const METRICS = [
  { label: 'Algorithm',         val: 'Random Forest Regression' },
  { label: 'MAE (Test)',        val: '4.06 points' },
  { label: 'R² Score',          val: '0.853' },
  { label: 'Training Samples',  val: '640 records' },
];

/* ── Grade colour map ─────────────────────────────────────────────── */
const gradeInfo = score => {
  if (score >= 85) return { letter: 'A', label: 'Excellent',           color: '#6c47ff', bg: '#ede9ff', bar: '#6c47ff' };
  if (score >= 70) return { letter: 'B', label: 'Good',                color: '#3b82f6', bg: '#dbeafe', bar: '#3b82f6' };
  if (score >= 50) return { letter: 'C', label: 'Average',             color: '#f59e0b', bg: '#fef3c7', bar: '#f59e0b' };
  return               { letter: 'D', label: 'Needs Improvement',    color: '#ef4444', bg: '#fee2e2', bar: '#ef4444' };
};

/* ── Score arc (SVG semi-circle gauge) ───────────────────────────── */
function ScoreGauge({ score }) {
  const g   = gradeInfo(score);
  const pct = score / 100;
  const r   = 54;
  const cx  = 70;
  const cy  = 70;
  const arc = Math.PI;                // half circle
  const x1  = cx - r;
  const y1  = cy;
  const x2  = cx + r;
  const y2  = cy;
  // Progress arc
  const angle  = arc * pct;
  const px     = cx + r * Math.cos(Math.PI - angle);
  const py     = cy - r * Math.sin(angle);
  const large  = pct > 0.5 ? 1 : 0;

  return (
    <svg width="140" height="80" viewBox="0 0 140 80">
      {/* Track */}
      <path
        d={`M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`}
        fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="10" strokeLinecap="round"
      />
      {/* Progress */}
      {score > 0 && (
        <path
          d={`M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${px} ${py}`}
          fill="none" stroke={g.bar} strokeWidth="10" strokeLinecap="round"
        />
      )}
      {/* Score text */}
      <text x="70" y="62" textAnchor="middle" fontSize="28" fontWeight="900" fill="#fff" fontFamily="DM Sans, sans-serif">
        {score}
      </text>
      <text x="70" y="76" textAnchor="middle" fontSize="11" fill="rgba(255,255,255,0.5)" fontFamily="DM Sans, sans-serif">
        out of 100
      </text>
    </svg>
  );
}

/* ══════════════════════════════════════════════════════════════════ */
export default function PredictPage() {
  const [sh, setSh]     = useState(5);
  const [al, setAl]     = useState(3);
  const [p1, setP1]     = useState(65);
  const [p2, setP2]     = useState(70);
  const [result,  setResult]  = useState(null);   // full backend response object
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const runPredict = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await predictScore({
        study_hours:     sh,
        attendance_loss: al,
        prev_score1:     p1,
        prev_score2:     p2,
      });
      // Store the FULL response object, not just predicted_score
      setResult(res.data);
    } catch (err) {
      setError(
        !err.response
          ? 'Cannot reach backend.\n\nRun: uvicorn main:app --reload'
          : `Error ${err.response?.status}: ${err.response?.data?.detail || 'Unknown'}`
      );
    }
    setLoading(false);
  };

  const score = result?.predicted_score ?? null;
  const g     = score !== null ? gradeInfo(score) : null;

  const SLIDERS = [
    { label: 'Daily Study Hours', val: sh, set: setSh, min: 0, max: 12,  step: 0.5, fmt: v => `${v}h` },
    { label: 'Classes Missed',    val: al, set: setAl, min: 0, max: 30,  step: 1,   fmt: v => `${v}` },
    { label: 'Previous Exam 1',   val: p1, set: setP1, min: 0, max: 100, step: 1,   fmt: v => `${v}%` },
    { label: 'Previous Exam 2',   val: p2, set: setP2, min: 0, max: 100, step: 1,   fmt: v => `${v}%` },
  ];

  return (
    <div style={{ padding: '28px 32px', maxWidth: 920 }}>

      {/* ── Page header ── */}
      <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#6c47ff', margin: '0 0 5px' }}>
        ML Analytics
      </p>
      <h1 style={{ fontSize: 30, fontWeight: 800, color: '#1f2937', margin: '0 0 4px' }}>
        Score Predictor
      </h1>
      

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        {/* ══ LEFT: Input sliders ══ */}
        <div style={{ ...card, padding: 26 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1f2937', margin: '0 0 22px' }}>
            Student Features
          </h2>

          {SLIDERS.map(s => (
            <div key={s.label} style={{ marginBottom: 22 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{s.label}</label>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#6c47ff' }}>{s.fmt(s.val)}</span>
              </div>
              <Slider value={s.val} onChange={(_, v) => s.set(v)} min={s.min} max={s.max} step={s.step} sx={sliderSx} />
            </div>
          ))}

          <button
            onClick={runPredict}
            disabled={loading}
            style={{
              width: '100%', padding: '14px', borderRadius: 12,
              fontWeight: 700, fontSize: 15,
              background: loading ? '#e5e7eb' : '#0f1729',
              color:      loading ? '#9ca3af' : '#fff',
              border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'background 0.15s', fontFamily: "'DM Sans', sans-serif",
            }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#6c47ff'; }}
            onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#0f1729'; }}
          >
            {loading
              ? <><CircularProgress size={16} sx={{ color: '#9ca3af' }} /> Predicting…</>
              : <><TrendingUpIcon sx={{ fontSize: 18 }} /> Predict Exam Score</>
            }
          </button>

          {error && (
            <div style={{ marginTop: 12, padding: '12px 14px', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 12 }}>
              <p style={{ fontSize: 12, color: '#dc2626', margin: 0, whiteSpace: 'pre-line', lineHeight: 1.5 }}>{error}</p>
            </div>
          )}
        </div>

        {/* ══ RIGHT: Results ══ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* ── Prediction result card ── */}
          {score === null ? (
            <div style={{ ...card, padding: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', minHeight: 200 }}>
              <div style={{ width: 56, height: 56, borderRadius: 16, border: '2px dashed #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                <TrendingUpIcon sx={{ color: '#d1d5db', fontSize: 26 }} />
              </div>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#6b7280', margin: '0 0 4px' }}>
                Adjust the sliders and click Predict
              </p>
              <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>
                Your predicted score will appear here
              </p>
            </div>
          ) : (
            <div style={{
              borderRadius: 20, padding: '24px 26px',
              background: 'linear-gradient(145deg,#0f1729 0%,#162040 60%,#1e2d55 100%)',
            }}>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#93c5fd', margin: '0 0 16px' }}>
                Prediction Result
              </p>

              {/* Score gauge + grade badge side by side */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 16 }}>
                <ScoreGauge score={score} />
                <div>
                  <div style={{ marginBottom: 8 }}>
                    <span style={{
                      padding: '5px 14px', borderRadius: 999, fontSize: 14, fontWeight: 700,
                      background: g.bg, color: g.color,
                    }}>
                      Grade {g.letter} : {g.label}
                    </span>
                  </div>
                  
                </div>
              </div>

              {/* Progress bar */}
              <div style={{ height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 99, marginBottom: 14 }}>
                <div style={{
                  height: 6, borderRadius: 99, background: g.bar,
                  width: `${score}%`, transition: 'width 0.8s ease',
                }} />
              </div>

              {/* Performance message from backend */}
              {result.message && (
                <div style={{
                  background: 'rgba(255,255,255,0.07)',
                  borderRadius: 12, padding: '12px 14px',
                  marginBottom: result.study_advice ? 12 : 0,
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <CheckCircleIcon sx={{ fontSize: 15, color: '#86efac', flexShrink: 0, mt: '2px' }} />
                    <p style={{ fontSize: 13, color: '#e2e8f0', margin: 0, lineHeight: 1.6 }}>
                      {result.message}
                    </p>
                  </div>
                </div>
              )}

              {/* Ollama study advice from backend */}
              {result.study_advice && (
                <div style={{
                  background: 'rgba(108,71,255,0.2)',
                  border: '1px solid rgba(164,148,255,0.3)',
                  borderRadius: 12, padding: '12px 14px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                   
                    <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: '#a78bfa' }}>
                      Study Plan
                    </span>
                  </div>
                  <p style={{ fontSize: 13, color: '#c4b5fd', margin: 0, lineHeight: 1.65, whiteSpace: 'pre-line' }}>
                    {result.study_advice}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ── Input summary ── */}
          <div style={{ ...card, padding: 20 }}>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#9ca3af', margin: '0 0 12px' }}>
              Input Summary
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { l: 'Study Hours/Day', v: `${sh}h`  },
                { l: 'Classes Missed',  v: al         },
                { l: 'Prev. Score 1',   v: `${p1}%`  },
                { l: 'Prev. Score 2',   v: `${p2}%`  },
              ].map(m => (
                <div key={m.l} style={{ padding: '10px 12px', background: '#f9fafb', borderRadius: 12 }}>
                  <p style={{ fontSize: 11, color: '#9ca3af', margin: '0 0 4px' }}>{m.l}</p>
                  <p style={{ fontSize: 16, fontWeight: 700, color: '#1f2937', margin: 0 }}>{m.v}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Model metrics ── */}
         

        </div>
      </div>
    </div>
  );
}