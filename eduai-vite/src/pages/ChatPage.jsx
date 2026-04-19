import React, { useState, useRef, useEffect } from 'react';
import SendIcon         from '@mui/icons-material/Send';
import AddCircleIcon    from '@mui/icons-material/AddCircle';
import WifiOffIcon      from '@mui/icons-material/WifiOff';
import AutoAwesomeIcon  from '@mui/icons-material/AutoAwesome';
import StorageIcon      from '@mui/icons-material/Storage';
import ExpandMoreIcon   from '@mui/icons-material/ExpandMore';
import ExpandLessIcon   from '@mui/icons-material/ExpandLess';
import Avatar           from '@mui/material/Avatar';
import CircularProgress from '@mui/material/CircularProgress';
import ReactMarkdown    from 'react-markdown';
import { sendChat }     from '../services/api';

/* ── Suggested topics ────────────────────────────────────────────────── */
const SUGGESTIONS = [
  'What is a stack data structure?',
  'Explain linked lists in Python',
  'What is Big O notation?',
  'How does recursion work?',
  'What is a binary search tree?',
  'Explain sorting algorithms',
  'What is dynamic programming?',
  'What is object-oriented programming?',
  'How does a hash table work?',
  'What is database normalization?',
];

/* ── Inline styles ───────────────────────────────────────────────────── */
const S = {
  card: {
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: 16,
    padding: '18px 20px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
  },
};

/* ── Copy-enabled code block ─────────────────────────────────────────── */
function CodeBlock({ children }) {
  const [copied, setCopied] = useState(false);
  const code = String(children).replace(/\n$/, '');
  return (
    <div style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid #e5e7eb', margin: '10px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 14px', background: '#f3f4f6', borderBottom: '1px solid #e5e7eb' }}>
        <span style={{ fontSize: 11, color: '#9ca3af', fontFamily: 'monospace' }}>python</span>
        <button
          onClick={() => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
          style={{ fontSize: 11, color: copied ? '#10b981' : '#9ca3af', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          {copied ? '✓ Copied' : '⧉ Copy'}
        </button>
      </div>
      <pre style={{ margin: 0, padding: '14px 16px', background: '#0f1729', color: '#86efac', fontFamily: 'monospace', fontSize: 13, lineHeight: 1.7, overflowX: 'auto' }}>
        {code}
      </pre>
    </div>
  );
}

/* ── Markdown renderer ───────────────────────────────────────────────── */
const mdComponents = {
  p:      ({ children }) => <p style={{ margin: '0 0 10px', lineHeight: 1.75, color: '#374151', fontSize: 14 }}>{children}</p>,
  h1:     ({ children }) => <h1 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: '0 0 8px' }}>{children}</h1>,
  h2:     ({ children }) => <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: '0 0 6px' }}>{children}</h2>,
  h3:     ({ children }) => <h3 style={{ fontSize: 14, fontWeight: 600, color: '#1f2937', margin: '0 0 4px' }}>{children}</h3>,
  strong: ({ children }) => <strong style={{ fontWeight: 700, color: '#111827' }}>{children}</strong>,
  em:     ({ children }) => <em style={{ fontStyle: 'italic', color: '#4b5563' }}>{children}</em>,
  ul:     ({ children }) => <ul style={{ paddingLeft: 20, margin: '0 0 10px', color: '#374151' }}>{children}</ul>,
  ol:     ({ children }) => <ol style={{ paddingLeft: 20, margin: '0 0 10px', color: '#374151' }}>{children}</ol>,
  li:     ({ children }) => <li style={{ marginBottom: 5, lineHeight: 1.65, fontSize: 14 }}>{children}</li>,
  blockquote: ({ children }) => (
    <blockquote style={{ borderLeft: '3px solid #c4b5fd', paddingLeft: 12, margin: '8px 0', color: '#6b7280', fontStyle: 'italic', fontSize: 14 }}>
      {children}
    </blockquote>
  ),
  code({ inline, children, className }) {
    if (inline) return (
      <code style={{ background: '#f3f4f6', padding: '2px 5px', borderRadius: 4, fontSize: 12, color: '#7c3aed', fontFamily: 'monospace' }}>
        {children}
      </code>
    );
    return <CodeBlock>{children}</CodeBlock>;
  },
};

/* ── Confidence badge ────────────────────────────────────────────────── */
function ConfBadge({ confidence }) {
  const pct  = Math.round(confidence * 100);
  const col  = pct >= 60 ? '#6c47ff' : pct >= 30 ? '#d97706' : '#ef4444';
  const bg   = pct >= 60 ? '#f5f3ff' : pct >= 30 ? '#fffbeb' : '#fef2f2';
  const bdr  = pct >= 60 ? '#c4b5fd' : pct >= 30 ? '#fde68a' : '#fca5a5';
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', background: bg, border: `1px solid ${bdr}`, borderRadius: 999 }}>
      <span style={{ fontSize: 14, fontWeight: 800, color: col }}>{pct}</span>
      <span style={{ fontSize: 11, color: '#9ca3af' }}>Confidence</span>
    </span>
  );
}

/* ── Source badge ────────────────────────────────────────────────────── */
function SrcBadge({ source }) {
  if (source === 'llm_enhanced' || source === 'llm_fallback') return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', background: '#ede9ff', borderRadius: 99, fontSize: 10, fontWeight: 700, color: '#6c47ff' }}>
      <AutoAwesomeIcon sx={{ fontSize: 10 }} /> AI Enhanced
    </span>
  );
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', background: '#f3f4f6', borderRadius: 99, fontSize: 10, fontWeight: 700, color: '#6b7280' }}>
      <StorageIcon sx={{ fontSize: 10 }} /> Knowledge Base
    </span>
  );
}

/* ── Typing indicator ────────────────────────────────────────────────── */
function Typing() {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <Avatar src="https://api.dicebear.com/7.x/micah/svg?seed=curator" sx={{ width: 34, height: 34, flexShrink: 0 }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: '10px 16px' }}>
        <CircularProgress size={13} sx={{ color: '#6c47ff' }} />
        <span style={{ fontSize: 13, color: '#9ca3af' }}>The Curator is thinking…</span>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   AI MESSAGE — the core component
   ══════════════════════════════════════════════════════════════════════ */
function AiMessage({ msg, onAsk }) {
  const [showExtras, setShowExtras] = useState(false);
  const isError = msg.topic === 'error';

  // Decide what to show as the "main body"
  // Priority: explanation > answer (if explanation is empty, fall back to answer)
  const mainBody = msg.explanation && msg.explanation.trim()
    ? msg.explanation
    : msg.answer;

  // Short summary line at the top (only show if different from mainBody)
  const summaryLine = (msg.explanation && msg.explanation.trim() && msg.answer && msg.answer !== msg.explanation)
    ? msg.answer
    : null;

  const hasExtras = (msg.key_takeaway?.trim()) ||
                    (msg.code_example?.trim()) ||
                    (msg.suggested_questions?.length > 0);

  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
      <Avatar src="https://api.dicebear.com/7.x/micah/svg?seed=curator" sx={{ width: 34, height: 34, flexShrink: 0, mt: '2px' }} />

      <div style={{ flex: 1, minWidth: 0, maxWidth: 720 }}>

        {/* ── Row: label + source badge + confidence ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, flexWrap: 'wrap', gap: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#9ca3af' }}>
              {isError ? 'Error' : 'Concept Explanation'}
            </span>
            {!isError && msg.source && <SrcBadge source={msg.source} />}
          </div>
          {msg.confidence > 0 && <ConfBadge confidence={msg.confidence} />}
        </div>

        {/* ── Summary line (short direct answer) ── */}
        {summaryLine && (
          <div style={{
            background: isError ? '#fef2f2' : '#f5f3ff',
            border: `1px solid ${isError ? '#fca5a5' : '#c4b5fd'}`,
            borderRadius: 10, padding: '10px 14px', marginBottom: 12,
            fontSize: 14, fontWeight: 600,
            color: isError ? '#991b1b' : '#4c1d95', lineHeight: 1.55,
          }}>
            {summaryLine}
          </div>
        )}

        {/* ── Main explanation body ── */}
        <div style={{ ...S.card, marginBottom: hasExtras ? 10 : 0 }}>
          {!msg.explanation?.trim() && !msg.answer?.trim() ? (
            <p style={{ fontSize: 14, color: '#9ca3af', margin: 0, fontStyle: 'italic' }}>
              No explanation received. The model may still be loading.
            </p>
          ) : (
            <ReactMarkdown components={mdComponents}>{mainBody}</ReactMarkdown>
          )}
        </div>

        {/* ── Expandable extras (code, key takeaway, follow-up questions) ── */}
        {hasExtras && (
          <div>
            <button
              onClick={() => setShowExtras(v => !v)}
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#6c47ff', fontSize: 12, fontWeight: 600,
                padding: '4px 0', marginBottom: showExtras ? 10 : 0,
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {showExtras ? <ExpandLessIcon sx={{ fontSize: 16 }} /> : <ExpandMoreIcon sx={{ fontSize: 16 }} />}
              {showExtras ? 'Hide details' : 'Show code, key takeaway & follow-ups'}
            </button>

            {showExtras && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

                {/* Code example */}
                {msg.code_example?.trim() && (
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: '#9ca3af', margin: '0 0 6px' }}>
                      Code Example
                    </p>
                    <ReactMarkdown components={mdComponents}>{
                      msg.code_example.includes('```')
                        ? msg.code_example
                        : '```python\n' + msg.code_example + '\n```'
                    }</ReactMarkdown>
                  </div>
                )}

                {/* Key takeaway */}
                {msg.key_takeaway?.trim() && (
                  <div style={{
                    display: 'flex', alignItems: 'flex-start', gap: 8,
                    background: '#fffbeb', border: '1px solid #fde68a',
                    borderRadius: 10, padding: '10px 14px',
                  }}>
                    <span style={{ fontSize: 14, flexShrink: 0 }}>💡</span>
                    <p style={{ fontSize: 13, color: '#92400e', margin: 0, lineHeight: 1.55 }}>
                      <strong>Key takeaway: </strong>{msg.key_takeaway}
                    </p>
                  </div>
                )}

                {/* Follow-up questions */}
                {msg.suggested_questions?.length > 0 && (
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: '#9ca3af', margin: '0 0 8px' }}>
                      Explore Next
                    </p>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {msg.suggested_questions.map(q => (
                        <button
                          key={q}
                          onClick={() => onAsk(q)}
                          style={{
                            padding: '5px 12px', background: '#f5f3ff',
                            border: '1px solid #c4b5fd', borderRadius: 999,
                            fontSize: 12, fontWeight: 500, color: '#6c47ff',
                            cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = '#ede9ff'}
                          onMouseLeave={e => e.currentTarget.style.background = '#f5f3ff'}
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   MAIN PAGE
   ══════════════════════════════════════════════════════════════════════ */
export default function ChatPage() {
  const [messages,     setMessages]     = useState([]);
  const [input,        setInput]        = useState('');
  const [loading,      setLoading]      = useState(false);
  const [currentTopic, setCurrentTopic] = useState('Computer Science');
  const [apiOnline,    setApiOnline]    = useState(null);
  const [ollamaOnline, setOllamaOnline] = useState(null);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    fetch('http://localhost:8000/')
      .then(r => r.ok ? setApiOnline(true) : setApiOnline(false))
      .catch(() => setApiOnline(false));

    fetch('http://localhost:8000/api/status')
      .then(r => r.json())
      .then(d => setOllamaOnline(d.ollama_online ?? false))
      .catch(() => setOllamaOnline(false));
  }, []);

  const send = async (text) => {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: msg }]);
    setLoading(true);

    try {
      const res = await sendChat(msg);
      const d   = res.data;
      setApiOnline(true);
      if (d.source === 'llm_enhanced' || d.source === 'llm_fallback') setOllamaOnline(true);
      if (d.topic && d.topic !== 'unknown') {
        setCurrentTopic(d.topic.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()));
      }
      setMessages(prev => [...prev, {
        role:                'ai',
        answer:              d.answer              ?? '',
        explanation:         d.explanation         ?? '',
        code_example:        d.code_example        ?? '',
        key_takeaway:        d.key_takeaway        ?? '',
        suggestion:          d.suggestion          ?? '',
        suggested_questions: d.suggested_questions ?? [],
        topic:               d.topic               ?? 'general',
        confidence:          d.confidence          ?? 0,
        source:              d.source              ?? 'tfidf_only',
      }]);
    } catch (err) {
      setApiOnline(false);
      setMessages(prev => [...prev, {
        role: 'ai',
        answer: !err.response
          ? '⚠ Backend offline — run: uvicorn main:app --reload'
          : `⚠ Error ${err.response?.status}: ${err.response?.data?.detail || 'Unknown'}`,
        explanation: '', code_example: '', key_takeaway: '',
        suggestion: '', suggested_questions: [],
        topic: 'error', confidence: 0, source: 'error',
      }]);
    }
    setLoading(false);
    inputRef.current?.focus();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>

      {/* ── Header ── */}
      <div style={{ padding: '13px 28px', background: '#fff', borderBottom: '1px solid #f1f1f5', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <nav style={{ fontSize: 14, color: '#9ca3af', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>Lessons</span><span>/</span>
          <span style={{ color: '#6c47ff', fontWeight: 600 }}>{currentTopic}</span>
        </nav>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#9ca3af' }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: ollamaOnline ? '#a78bfa' : '#d1d5db' }} />
            {ollamaOnline ? 'Ollama active' : 'Ollama offline'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#9ca3af' }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: apiOnline === null ? '#fcd34d' : apiOnline ? '#10b981' : '#ef4444' }} />
            {apiOnline === null ? 'Checking…' : apiOnline ? 'Backend connected' : 'Backend offline'}
          </div>
          <input
            placeholder="Search concepts..."
            style={{ border: '1px solid #e5e7eb', borderRadius: 10, padding: '7px 14px', fontSize: 13, outline: 'none', width: 190, fontFamily: "'DM Sans', sans-serif" }}
          />
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '28px 28px', display: 'flex', flexDirection: 'column', gap: 28, background: '#f9fafb' }}>

          {/* Welcome */}
          {messages.length === 0 && !loading && (
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <Avatar src="https://api.dicebear.com/7.x/micah/svg?seed=curator" sx={{ width: 34, height: 34, flexShrink: 0 }} />
              <div style={{ ...S.card, maxWidth: 560, fontSize: 14, lineHeight: 1.75, color: '#374151' }}>
                <strong style={{ fontSize: 16, color: '#111827' }}>👋 Welcome to EduAI!</strong>
                <br /><br />
                Ask me anything about Computer Science. I'll give you a full explanation — not just a one-liner.
                <br /><br />
                {ollamaOnline
                  ? <span style={{ color: '#059669', fontWeight: 600 }}>✓ Ollama is running — you'll get detailed AI answers.</span>
                  : <span style={{ color: '#9ca3af' }}>Tip: run <code style={{ fontFamily: 'monospace', fontSize: 12 }}>ollama serve</code> for richer answers.</span>
                }
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
              {m.role === 'user' ? (
                <div style={{
                  background: '#fff', border: '1px solid #e5e7eb',
                  borderRadius: '16px 16px 4px 16px', padding: '11px 16px',
                  maxWidth: '58%', fontSize: 14, color: '#1f2937', lineHeight: 1.65,
                }}>
                  {m.text}
                </div>
              ) : (
                <AiMessage msg={m} onAsk={send} />
              )}
            </div>
          ))}

          {loading && <Typing />}
          <div ref={bottomRef} />
        </div>

        {/* Right panel */}
        <div style={{ width: 230, flexShrink: 0, borderLeft: '1px solid #f1f1f5', background: '#fff', overflowY: 'auto', padding: '18px 12px' }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#9ca3af', margin: '0 0 10px' }}>
            Suggested Topics
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {SUGGESTIONS.map(q => (
              <button
                key={q}
                onClick={() => send(q)}
                disabled={loading}
                style={{
                  textAlign: 'left', padding: '8px 11px', borderRadius: 9,
                  background: '#f9fafb', border: '1px solid #f3f4f6',
                  fontSize: 12, fontWeight: 500, color: '#4b5563', cursor: 'pointer',
                  fontFamily: "'DM Sans', sans-serif", lineHeight: 1.4, opacity: loading ? 0.5 : 1,
                  transition: 'all 0.12s',
                }}
                onMouseEnter={e => { if (!loading) { e.currentTarget.style.background = '#ede9ff'; e.currentTarget.style.color = '#6c47ff'; e.currentTarget.style.borderColor = '#c4b5fd'; } }}
                onMouseLeave={e => { e.currentTarget.style.background = '#f9fafb'; e.currentTarget.style.color = '#4b5563'; e.currentTarget.style.borderColor = '#f3f4f6'; }}
              >
                {q}
              </button>
            ))}
          </div>

          {/* Ollama status */}
          <div style={{ marginTop: 18, padding: 11, background: ollamaOnline ? '#f5f3ff' : '#f9fafb', border: `1px solid ${ollamaOnline ? '#c4b5fd' : '#e5e7eb'}`, borderRadius: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: ollamaOnline ? '#a78bfa' : '#d1d5db' }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: ollamaOnline ? '#6c47ff' : '#6b7280' }}>
                {ollamaOnline ? 'Ollama online' : 'Ollama offline'}
              </span>
            </div>
            <p style={{ fontSize: 11, color: ollamaOnline ? '#7c3aed' : '#9ca3af', margin: 0, lineHeight: 1.5 }}>
              {ollamaOnline ? 'Getting full AI-powered answers.' : 'Run: ollama serve'}
            </p>
          </div>

          {apiOnline === false && (
            <div style={{ marginTop: 10, padding: 11, background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 10 }}>
              <div style={{ display: 'flex', gap: 5, alignItems: 'center', marginBottom: 4 }}>
                <WifiOffIcon sx={{ fontSize: 13, color: '#ef4444' }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: '#dc2626' }}>Backend offline</span>
              </div>
              <p style={{ fontSize: 11, color: '#991b1b', margin: 0 }}>
                uvicorn main:app --reload
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Input ── */}
      <div style={{ padding: '13px 28px', background: '#fff', borderTop: '1px solid #f1f1f5', flexShrink: 0 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: '#f9fafb', border: '1.5px solid #e5e7eb',
          borderRadius: 16, padding: '7px 8px 7px 14px',
        }}>
          <button style={{ color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <AddCircleIcon sx={{ fontSize: 21 }} />
          </button>
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
            placeholder="Ask a question about CS concepts…"
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 14, color: '#374151', fontFamily: "'DM Sans', sans-serif" }}
          />
          <button
            onClick={() => send()}
            disabled={loading || !input.trim()}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '8px 16px', borderRadius: 10,
              background: loading || !input.trim() ? '#e5e7eb' : '#0f1729',
              color:      loading || !input.trim() ? '#9ca3af' : '#fff',
              fontWeight: 600, fontSize: 13, border: 'none',
              cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
              fontFamily: "'DM Sans', sans-serif", transition: 'background 0.15s',
            }}
            onMouseEnter={e => { if (!loading && input.trim()) e.currentTarget.style.background = '#6c47ff'; }}
            onMouseLeave={e => { if (!loading && input.trim()) e.currentTarget.style.background = '#0f1729'; }}
          >
            {loading ? <CircularProgress size={13} sx={{ color: '#9ca3af' }} /> : <SendIcon sx={{ fontSize: 15 }} />}
            {loading ? 'Thinking…' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
}