import React, { useState } from 'react';
import Slider             from '@mui/material/Slider';
import CircularProgress   from '@mui/material/CircularProgress';
import TrendingUpIcon     from '@mui/icons-material/TrendingUp';
import CheckCircleIcon    from '@mui/icons-material/CheckCircle';
import { predictScore }   from '../services/api';

const card = {
  background: '#fff', borderRadius: 20,
  border: '1px solid #f1f1f5', boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
};

const getGrade = s => {
  if (s >= 90) return { g: 'A+', c: '#10b981', bg: '#d1fae5', label: 'Outstanding' };
  if (s >= 80) return { g: 'A',  c: '#6c47ff', bg: '#ede9ff', label: 'Excellent' };
  if (s >= 70) return { g: 'B',  c: '#3b82f6', bg: '#dbeafe', label: 'Good' };
  if (s >= 60) return { g: 'C',  c: '#f59e0b', bg: '#fef3c7', label: 'Average' };
  if (s >= 50) return { g: 'D',  c: '#f97316', bg: '#ffedd5', label: 'Below Average' };
  return             { g: 'F',  c: '#ef4444', bg: '#fee2e2', label: 'Needs Improvement' };
};

const METRICS = [
  { label: 'Algorithm',        val: 'Random Forest Regression' },
  { label: 'MAE (Test)',       val: '4.06 points' },
  { label: 'R² Score',        val: '0.853' },
  { label: 'Training Samples', val: '640 records' },
];

const sliderSx = {
  color: '#6c47ff',
  height: 4,
  '& .MuiSlider-thumb': { width: 18, height: 18, '&:hover, &.Mui-active': { boxShadow: '0 0 0 8px rgba(108,71,255,0.12)' } },
  '& .MuiSlider-rail':  { opacity: 0.2 },
};

export default function PredictPage() {
  const [sh, setSh] = useState(5);
  const [al, setAl] = useState(3);
  const [p1, setP1] = useState(65);
  const [p2, setP2] = useState(70);
  const [result,  setResult]  = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const predict = async () => {
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
      setResult(res.data.predicted_score);
    } catch (err) {
      const isOffline = !err.response;
      setError(
        isOffline
          ? 'Cannot reach backend. Make sure FastAPI is running:\n\nuvicorn main:app --reload'
          : `API Error ${err.response?.status}: ${err.response?.data?.detail || 'Unknown error'}`
      );
    }
    setLoading(false);
  };

  const g = result !== null ? getGrade(result) : null;

  const SLIDERS = [
    { label: 'Daily Study Hours', val: sh, set: setSh, min: 0, max: 12,  step: 0.5, fmt: v => `${v}h` },
    { label: 'Classes Missed',    val: al, set: setAl, min: 0, max: 30,  step: 1,   fmt: v => `${v}` },
    { label: 'Previous Exam 1',   val: p1, set: setP1, min: 0, max: 100, step: 1,   fmt: v => `${v}%` },
    { label: 'Previous Exam 2',   val: p2, set: setP2, min: 0, max: 100, step: 1,   fmt: v => `${v}%` },
  ];

  return (
    <div style={{ padding: 32, maxWidth: 860 }}>
      <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#6c47ff', margin: '0 0 6px' }}>ML Analytics</p>
      <h1 style={{ fontSize: 30, fontWeight: 800, color: '#1f2937', margin: '0 0 4px' }}>Score Predictor</h1>
      <p style={{ fontSize: 13, color: '#9ca3af', marginBottom: 28 }}>
        Random Forest Regression — trained on 800 synthetic student records (MAE: 4.06, R²: 0.853)
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* ── Left: sliders ── */}
        <div style={{ ...card, padding: 26 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1f2937', margin: '0 0 22px' }}>Student Features</h2>

          {SLIDERS.map(s => (
            <div key={s.label} style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{s.label}</label>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#6c47ff', minWidth: 40, textAlign: 'right' }}>
                  {s.fmt(s.val)}
                </span>
              </div>
              <Slider
                value={s.val}
                onChange={(_, v) => s.set(v)}
                min={s.min} max={s.max} step={s.step}
                sx={sliderSx}
              />
            </div>
          ))}

          <button
            onClick={predict}
            disabled={loading}
            style={{
              width: '100%', padding: '14px', borderRadius: 12,
              fontWeight: 700, fontSize: 15,
              background: loading ? '#e5e7eb' : '#0f1729',
              color: loading ? '#9ca3af' : '#fff',
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

        {/* ── Right: result + summary + metrics ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Result card */}
          {result === null ? (
            <div style={{ ...card, padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', minHeight: 190 }}>
              <div style={{ width: 58, height: 58, borderRadius: 16, border: '2px dashed #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <TrendingUpIcon sx={{ color: '#d1d5db', fontSize: 28 }} />
              </div>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#6b7280', margin: '0 0 4px' }}>Adjust parameters and click predict</p>
              <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>Your predicted score will appear here</p>
            </div>
          ) : (
            <div style={{
              borderRadius: 20, padding: 26,
              background: 'linear-gradient(145deg,#0f1729 0%,#162040 55%,#1e2d55 100%)',
              color: '#fff',
            }}>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#93c5fd', margin: '0 0 12px' }}>
                Prediction Result
              </p>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, marginBottom: 16 }}>
                <span style={{ fontSize: 80, fontWeight: 900, lineHeight: 1, color: '#fff' }}>{result}</span>
                <div style={{ paddingBottom: 8 }}>
                  <div style={{ fontSize: 22, color: '#93c5fd' }}>/100</div>
                  <span style={{
                    display: 'inline-block', marginTop: 6, padding: '4px 14px',
                    borderRadius: 999, fontSize: 13, fontWeight: 700,
                    background: g.bg, color: g.c,
                  }}>
                    Grade {g.g} — {g.label}
                  </span>
                </div>
              </div>
              <div style={{ height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 99, marginBottom: 10 }}>
                <div style={{ height: 6, borderRadius: 99, background: '#6c47ff', width: `${result}%`, transition: 'width 0.6s ease' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <CheckCircleIcon sx={{ fontSize: 14, color: '#86efac' }} />
                <p style={{ fontSize: 12, color: '#93c5fd', margin: 0, fontStyle: 'italic' }}>
                  Based on your study habits and previous performance
                </p>
              </div>
            </div>
          )}

          {/* Input summary */}
          <div style={{ ...card, padding: 20 }}>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#9ca3af', margin: '0 0 12px' }}>Input Summary</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { l: 'Study Hours/Day', v: `${sh}h`   },
                { l: 'Classes Missed',  v: al          },
                { l: 'Prev. Score 1',   v: `${p1}%`   },
                { l: 'Prev. Score 2',   v: `${p2}%`   },
              ].map(m => (
                <div key={m.l} style={{ padding: '10px 12px', background: '#f9fafb', borderRadius: 12 }}>
                  <p style={{ fontSize: 11, color: '#9ca3af', margin: '0 0 4px' }}>{m.l}</p>
                  <p style={{ fontSize: 16, fontWeight: 700, color: '#1f2937', margin: 0 }}>{m.v}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Model metrics */}
          <div style={{ ...card, padding: 20 }}>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#9ca3af', margin: '0 0 12px' }}>Model Metrics</p>
            {METRICS.map((m, i) => (
              <div key={m.label} style={{
                display: 'flex', justifyContent: 'space-between', padding: '9px 0',
                borderBottom: i < METRICS.length - 1 ? '1px solid #f9fafb' : 'none',
              }}>
                <span style={{ fontSize: 13, color: '#6b7280' }}>{m.label}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#1f2937' }}>{m.val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}