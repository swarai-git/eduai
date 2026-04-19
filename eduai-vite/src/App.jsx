import React from 'react';
import { BrowserRouter, Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Avatar from '@mui/material/Avatar';

import DashboardIcon      from '@mui/icons-material/Dashboard';
import SmartToyIcon       from '@mui/icons-material/SmartToy';
import QuizIcon           from '@mui/icons-material/Quiz';
import LibraryBooksIcon   from '@mui/icons-material/LibraryBooks';
import BarChartIcon       from '@mui/icons-material/BarChart';
import ShowChartIcon      from '@mui/icons-material/ShowChart';
import AddIcon            from '@mui/icons-material/Add';
import HelpOutlineIcon from '@mui/icons-material/HelpOutlineOutlined';
import DashboardPage  from './pages/DashboardPage';
import ChatPage       from './pages/ChatPage';
import QuizPage       from './pages/QuizPage';
import LessonPage     from './pages/LessonPage';
import AnalyticsPage  from './pages/AnalyticsPage';
import PredictPage    from './pages/PredictPage';

const muiTheme = createTheme({
  typography: { fontFamily: "'DM Sans', sans-serif" },
  palette: { primary: { main: '#6c47ff' } },
  components: {
    MuiCssBaseline: { styleOverrides: { body: { backgroundColor: '#f3f4f8' } } },
    MuiSlider: {
      styleOverrides: {
        root:  { color: '#6c47ff', height: 4 },
        thumb: { width: 18, height: 18, '&:hover': { boxShadow: '0 0 0 8px rgba(108,71,255,0.12)' } },
        rail:  { opacity: 0.2, backgroundColor: '#6c47ff' },
        track: { border: 'none' },
      },
    },
  },
});

const NAV = [
  { label: 'Dashboard',       icon: <DashboardIcon    sx={{ fontSize: 18 }} />, to: '/' },
  { label: 'AI Tutor',        icon: <SmartToyIcon     sx={{ fontSize: 18 }} />, to: '/chat' },
  { label: 'Practice',        icon: <QuizIcon         sx={{ fontSize: 18 }} />, to: '/quiz' },
  { label: 'Library',         icon: <LibraryBooksIcon sx={{ fontSize: 18 }} />, to: '/lessons' },
  { label: 'Analytics',       icon: <BarChartIcon     sx={{ fontSize: 18 }} />, to: '/analytics' },
  { label: 'Score Predictor', icon: <ShowChartIcon    sx={{ fontSize: 18 }} />, to: '/predict' },
];

function Sidebar() {
  const navigate = useNavigate();

  return (
    <aside style={{
      position: 'fixed', top: 0, left: 0, height: '100vh', width: 224,
      backgroundColor: '#ffffff', borderRight: '1px solid #f1f1f5',
      display: 'flex', flexDirection: 'column', zIndex: 50,
    }}>
      {/* Logo */}
      <div style={{ padding: '20px 20px 8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 10, background: '#6c47ff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <SmartToyIcon sx={{ fontSize: 18, color: '#fff' }} />
          </div>
          <span style={{ fontWeight: 800, fontSize: 18, color: '#0f1729', letterSpacing: '-0.3px' }}>EduAI</span>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {NAV.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Bottom */}
      <div style={{ marginTop: 'auto', padding: '0 16px 20px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        <button
          onClick={() => navigate('/chat')}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            width: '100%', padding: '11px 16px', borderRadius: 12,
            background: '#0f1729', color: '#fff', fontWeight: 600, fontSize: 14,
            border: 'none', cursor: 'pointer', marginBottom: 6,
            fontFamily: "'DM Sans', sans-serif", transition: 'background 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#6c47ff'}
          onMouseLeave={e => e.currentTarget.style.background = '#0f1729'}
        >
          <AddIcon sx={{ fontSize: 18 }} /> New Session
        </button>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 12px', borderRadius: 12, background: '#f9fafb', marginBottom: 4,
        }}>
          <Avatar
            src="https://api.dicebear.com/7.x/micah/svg?seed=curator"
            sx={{ width: 34, height: 34 }}
          />
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#1f2937' }}>The Curator</div>
            <div style={{ fontSize: 11, color: '#9ca3af' }}>CS Assistant</div>
          </div>
        </div>

        <a href="#" className="sidebar-link" style={{ fontSize: 13, padding: '7px 12px' }}>
          <HelpOutlineIcon sx={{ fontSize: 16 }} /> Documentation
        </a>
        <a href="#" className="sidebar-link" style={{ fontSize: 13, padding: '7px 12px' }}>
          <HelpOutlineIcon sx={{ fontSize: 16 }} /> Support
        </a>
      </div>
    </aside>
  );
}

export default function App() {
  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <BrowserRouter>
        <div style={{ display: 'flex', minHeight: '100vh' }}>
          <Sidebar />
          <main style={{ marginLeft: 224, flex: 1, minHeight: '100vh', overflowY: 'auto' }}>
            <Routes>
              <Route path="/"          element={<DashboardPage />} />
              <Route path="/chat"      element={<ChatPage />} />
              <Route path="/quiz"      element={<QuizPage />} />
              <Route path="/lessons"   element={<LessonPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/predict"   element={<PredictPage />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}