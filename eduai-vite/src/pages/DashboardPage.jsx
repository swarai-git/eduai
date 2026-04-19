import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import BarChartIcon    from '@mui/icons-material/BarChart';
import FlashOnIcon     from '@mui/icons-material/FlashOn';
import PsychologyIcon  from '@mui/icons-material/Psychology';
import TrendingUpIcon  from '@mui/icons-material/TrendingUp';
import Avatar          from '@mui/material/Avatar';
import LinearProgress  from '@mui/material/LinearProgress';

const card = {
  background: '#fff', borderRadius: 20,
  border: '1px solid #f1f1f5', boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
};

export default function DashboardPage() {
  const [time, setTime] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const upd = () =>
      setTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
    upd();
    const t = setInterval(upd, 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{ padding: 32, maxWidth: 920 }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#6c47ff', margin: '0 0 6px' }}>
            Student Portal
          </p>
          <h1 style={{ fontSize: 36, fontWeight: 800, color: '#0f1729', margin: '0 0 8px', lineHeight: 1.1 }}>
            Welcome back, Alex!
          </h1>
          <p style={{ fontSize: 14, color: '#6b7280', maxWidth: 420, margin: 0 }}>
            Your Tutor has prepared new insights for you today!
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexShrink: 0 }}>
          <div style={{
            padding: '8px 16px', background: '#fff', borderRadius: 12,
            border: '1px solid #f1f1f5', boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            fontWeight: 600, fontSize: 14, color: '#374151', fontFamily: 'monospace',
          }}>{time}</div>
          <button style={{
            width: 40, height: 40, borderRadius: 12, border: '1px solid #f1f1f5',
            background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: '#9ca3af',
          }}>
            <NotificationsNoneIcon sx={{ fontSize: 20 }} />
          </button>
        </div>
      </div>

      {/* ── Main 2-col grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 32 }}>

        {/* Predicted Grade — spans 2 rows */}
        <div style={{
          gridRow: 'span 2',
          background: 'linear-gradient(145deg,#0f1729 0%,#162040 55%,#1e2d55 100%)',
          borderRadius: 20, padding: 28, display: 'flex', flexDirection: 'column', color: '#fff',
          minHeight: 320,
        }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#93c5fd', margin: '0 0 4px' }}>
            Strategic Analytics
          </p>
          <p style={{ fontWeight: 700, fontSize: 17, margin: '0 0 20px' }}>Predicted Grade</p>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 130, fontWeight: 900, lineHeight: 1, color: '#fff', userSelect: 'none' }}>A</span>
          </div>
          <div style={{ marginTop: 20 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '8px 16px', borderRadius: 999,
              background: 'rgba(108,71,255,0.25)', color: '#c4b5fd',
              fontSize: 13, fontWeight: 600, marginBottom: 14,
            }}>
              <TrendingUpIcon sx={{ fontSize: 16 }} /> 94% Confidence
            </div>
            <p style={{ fontSize: 13, fontStyle: 'italic', color: '#bfdbfe', lineHeight: 1.6, margin: 0 }}>
              Based on your current study habits and consistent quiz performance.
            </p>
          </div>
        </div>

        {/* Progress at a Glance */}
        <div style={{ ...card, padding: 20 }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#9ca3af', margin: '0 0 14px' }}>
            Progress at a Glance
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: '#ede9ff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                <CheckCircleOutlinedIcon sx={{ color: '#6c47ff', fontSize: 20 }} />
              </div>
              <p style={{ fontSize: 10, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 4px' }}>
                Quizzes Completed
              </p>
              <p style={{ fontSize: 30, fontWeight: 800, color: '#1f2937', margin: '0 0 4px' }}>12</p>
              <p style={{ fontSize: 11, color: '#10b981', margin: 0, display: 'flex', alignItems: 'center', gap: 2 }}>
                <TrendingUpIcon sx={{ fontSize: 12 }} /> +3 this week
              </p>
            </div>
            <div>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: '#ede9ff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                <BarChartIcon sx={{ color: '#6c47ff', fontSize: 20 }} />
              </div>
              <p style={{ fontSize: 10, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 4px' }}>
                Avg. Score
              </p>
              <p style={{ fontSize: 30, fontWeight: 800, color: '#1f2937', margin: '0 0 8px' }}>
                85<span style={{ fontSize: 16, color: '#9ca3af' }}>%</span>
              </p>
              <LinearProgress
                variant="determinate" value={85}
                sx={{ height: 6, borderRadius: 3, bgcolor: '#f0eeff', '& .MuiLinearProgress-bar': { bgcolor: '#6c47ff', borderRadius: 3 } }}
              />
            </div>
          </div>
        </div>

        {/* AI Interactions */}
        <div style={{ ...card, padding: 20 }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#9ca3af', margin: '0 0 6px' }}>
            AI Interactions
          </p>
          <p style={{ fontSize: 30, fontWeight: 800, color: '#1f2937', margin: '0 0 4px' }}>42</p>
          <p style={{ fontSize: 13, color: '#9ca3af', margin: '0 0 14px' }}>
            Chat Sessions with "The Curator"
          </p>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ display: 'flex' }}>
              {[1, 2, 3].map(i => (
                <Avatar
                  key={i}
                  src={`https://api.dicebear.com/7.x/micah/svg?seed=${i}`}
                  sx={{ width: 28, height: 28, border: '2px solid white', marginLeft: i > 1 ? '-8px' : 0 }}
                />
              ))}
              <div style={{
                width: 28, height: 28, borderRadius: '50%', background: '#ede9ff',
                border: '2px solid white', marginLeft: -8,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, fontWeight: 700, color: '#6c47ff',
              }}>+8</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <h2 style={{ fontSize: 17, fontWeight: 700, color: '#1f2937', margin: '0 0 16px' }}>Quick Actions</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {[
          { label: 'Start a Quiz',   desc: 'Challenge yourself with personalized questions.', icon: <FlashOnIcon sx={{ color: '#6c47ff', fontSize: 22 }} />, to: '/quiz' },
          { label: 'Ask a Question', desc: 'Get immediate, context-aware answers from your curator.',  icon: <PsychologyIcon sx={{ color: '#6c47ff', fontSize: 22 }} />, to: '/chat' },
        ].map(a => (
          <button
            key={a.label}
            onClick={() => navigate(a.to)}
            style={{
              display: 'flex', alignItems: 'center', gap: 16,
              padding: 20, background: '#fff', borderRadius: 20,
              border: '1px solid #f1f1f5', boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              textAlign: 'left', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
              transition: 'box-shadow 0.15s, transform 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 20px rgba(108,71,255,0.12)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';        e.currentTarget.style.transform = 'none'; }}
          >
            <div style={{ width: 48, height: 48, borderRadius: 14, background: '#ede9ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {a.icon}
            </div>
            <div>
              <p style={{ fontWeight: 700, fontSize: 15, color: '#1f2937', margin: '0 0 4px' }}>{a.label}</p>
              <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>{a.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}