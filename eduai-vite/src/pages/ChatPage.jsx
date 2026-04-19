import React, { useState, useRef, useEffect } from 'react';
import SendIcon       from '@mui/icons-material/Send';
import AddCircleIcon  from '@mui/icons-material/AddCircle';
import WifiOffIcon    from '@mui/icons-material/WifiOff';
import Avatar         from '@mui/material/Avatar';
import CircularProgress from '@mui/material/CircularProgress';
import ReactMarkdown  from 'react-markdown';
import { sendChat }   from '../services/api';
import { useLocation } from 'react-router-dom';

/* ── Suggested quick-topics ── */
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

/* ── Topic → related chips ── */
const RELATED = {
  data_structures: ['Stacks', 'Queues', 'Trees', 'Graphs', 'Linked Lists'],
  algorithms:      ['Sorting', 'Searching', 'Dynamic Programming', 'Recursion', 'Big O'],
  python:          ['Functions', 'Classes', 'Lists', 'Dictionaries', 'Loops'],
  oop:             ['Inheritance', 'Polymorphism', 'Encapsulation', 'Abstraction'],
  databases:       ['SQL', 'Normalization', 'Indexing', 'Transactions', 'Joins'],
  default:         ['Data Structures', 'Algorithms', 'Python', 'OOP', 'Databases'],
};
const relatedFor = (topic = '') => {
  const key = Object.keys(RELATED).find(k => topic.toLowerCase().includes(k)) || 'default';
  return RELATED[key];
};

/* ── Code block component ── */
function CodeBlock({ children, filename = 'example.py' }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(String(children)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid #e5e7eb', margin: '12px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 16px', background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
        <span style={{ fontSize: 11, color: '#9ca3af', fontFamily: 'DM Mono, monospace' }}>{filename}</span>
        <button onClick={copy} style={{ fontSize: 11, color: copied ? '#10b981' : '#9ca3af', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
          {copied ? '✓ Copied' : '⧉ Copy'}
        </button>
      </div>
      <pre style={{ margin: 0, padding: '16px', background: '#0f1729', color: '#86efac', fontFamily: 'DM Mono, Consolas, monospace', fontSize: 13, lineHeight: 1.7, overflowX: 'auto' }}>
        {children}
      </pre>
    </div>
  );
}

/* ── Markdown renderer components ── */
const mdComponents = {
  h1: ({ children }) => <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0f1729', margin: '0 0 12px' }}>{children}</h1>,
  h2: ({ children }) => <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0f1729', margin: '0 0 10px' }}>{children}</h2>,
  h3: ({ children }) => <h3 style={{ fontSize: 15, fontWeight: 600, color: '#1f2937', margin: '0 0 8px' }}>{children}</h3>,
  p:  ({ children }) => <p  style={{ margin: '0 0 10px', lineHeight: 1.7, color: '#374151' }}>{children}</p>,
  strong: ({ children }) => <strong style={{ fontWeight: 700, color: '#0f1729' }}>{children}</strong>,
  em:     ({ children }) => <em style={{ fontStyle: 'italic' }}>{children}</em>,
  ul: ({ children }) => <ul style={{ margin: '0 0 10px', paddingLeft: 20, color: '#374151' }}>{children}</ul>,
  ol: ({ children }) => <ol style={{ margin: '0 0 10px', paddingLeft: 20, color: '#374151' }}>{children}</ol>,
  li: ({ children }) => <li style={{ marginBottom: 4, lineHeight: 1.6 }}>{children}</li>,
  code({ inline, children, className }) {
    if (inline) {
      return <code style={{ background: '#f3f4f6', padding: '2px 6px', borderRadius: 4, fontSize: 12, color: '#6c47ff', fontFamily: 'DM Mono, monospace' }}>{children}</code>;
    }
    const lang = className?.replace('language-', '') || 'py';
    return <CodeBlock filename={`snippet.${lang}`}>{String(children).replace(/\n$/, '')}</CodeBlock>;
  },
};

/* ── Typing indicator ── */
function TypingIndicator() {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
      <Avatar src="https://api.dicebear.com/7.x/micah/svg?seed=curator" sx={{ width: 36, height: 36, flexShrink: 0 }} />
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        background: '#fff', border: '1px solid #e5e7eb', borderRadius: 18,
        padding: '10px 16px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
      }}>
        <CircularProgress size={14} sx={{ color: '#6c47ff' }} />
        <span style={{ fontSize: 13, color: '#9ca3af' }}>The Curator is thinking…</span>
      </div>
    </div>
  );
}

/* ── Main component ── */
export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [currentTopic, setCurrentTopic] = useState('Data Structures');
  const [apiOnline, setApiOnline]       = useState(null); // null=unknown, true, false
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);
  const location  = useLocation();

  /* Handle autoSend from Library navigation */
  useEffect(() => {
    const autoQ = location.state?.autoSend;
    if (autoQ) {
      // Small delay so component is fully mounted
      setTimeout(() => send(autoQ), 300);
      // Clear state so refresh doesn't re-trigger
      window.history.replaceState({}, '');
    }
  }, []);

  /* Auto-scroll */
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);

  /* Check backend health on mount */
  useEffect(() => {
    fetch('http://localhost:8000/')
      .then(r => r.ok ? setApiOnline(true) : setApiOnline(false))
      .catch(() => setApiOnline(false));
  }, []);

  const addMessage = (msg) => setMessages(prev => [...prev, msg]);

  const send = async (text) => {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;
    setInput('');
    addMessage({ role: 'user', text: msg });
    setLoading(true);

    try {
      const res = await sendChat(msg);
      const d   = res.data;
      setApiOnline(true);
      if (d.topic && d.topic !== 'unknown') {
        setCurrentTopic(d.topic.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()));
      }
      addMessage({ role: 'ai', text: d.answer, topic: d.topic, confidence: d.confidence });
    } catch (err) {
      setApiOnline(false);
      const isOffline = !err.response;
      addMessage({
        role: 'ai',
        text: isOffline
          ? "**Backend offline.** Start the FastAPI server:\n\n```bash\nuvicorn main:app --reload\n```\n\nThen refresh and try again."
          : `**API Error ${err.response?.status}:** ${err.response?.data?.detail || 'Unknown error'}`,
        topic: 'error',
        confidence: 0,
      });
    }
    setLoading(false);
    inputRef.current?.focus();
  };

  const handleSuggestion = (q) => send(q);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>

      {/* ── Header ── */}
      <div style={{
        padding: '14px 32px', background: '#fff', borderBottom: '1px solid #f1f1f5',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
      }}>
        <nav style={{ fontSize: 14, color: '#9ca3af', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>Lessons</span>
          <span>/</span>
          <span style={{ color: '#6c47ff', fontWeight: 600 }}>{currentTopic}</span>
        </nav>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* API status dot */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#9ca3af' }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%',
              background: apiOnline === null ? '#fdcb6e' : apiOnline ? '#10b981' : '#ef4444',
              transition: 'background 0.3s',
            }} />
            {apiOnline === null ? 'Checking…' : apiOnline ? 'Backend connected' : 'Backend offline'}
          </div>
          <input
            placeholder="Search concepts..."
            style={{
              border: '1px solid #e5e7eb', borderRadius: 12,
              padding: '8px 16px', fontSize: 13, outline: 'none',
              width: 200, fontFamily: "'DM Sans', sans-serif",
            }}
          />
        </div>
      </div>

      {/* ── Body: messages + sidebar ── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* Messages */}
        <div style={{
          flex: 1, overflowY: 'auto', padding: '24px 32px',
          display: 'flex', flexDirection: 'column', gap: 24, background: '#f9fafb',
        }}>
          {/* Welcome */}
          {messages.length === 0 && !loading && (
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <Avatar src="https://api.dicebear.com/7.x/micah/svg?seed=curator" sx={{ width: 36, height: 36, flexShrink: 0 }} />
              <div style={{ maxWidth: 680 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#9ca3af' }}>The Curator</span>
                </div>
                <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 18, padding: '18px 20px', boxShadow: '0 1px 2px rgba(0,0,0,0.04)', fontSize: 14, lineHeight: 1.7, color: '#374151' }}>
                  <strong style={{ color: '#0f1729' }}>👋 Welcome to EduAI!</strong> I'm your CS teaching assistant.<br /><br />
                  Ask me anything about:<br />
                  <span style={{ color: '#6c47ff' }}>📌 Data Structures</span> · <span style={{ color: '#6c47ff' }}>📌 Algorithms</span> · <span style={{ color: '#6c47ff' }}>📌 Python</span> · <span style={{ color: '#6c47ff' }}>📌 OOP</span> · <span style={{ color: '#6c47ff' }}>📌 Databases</span>
                  <br /><br />Click a topic on the right or type your question below.
                </div>
              </div>
            </div>
          )}

          {/* Message list */}
          {messages.map((m, i) => (
            <div
              key={i}
              className="fade-in"
              style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', gap: 12 }}
            >
              {m.role === 'ai' && (
                <Avatar src="https://api.dicebear.com/7.x/micah/svg?seed=curator" sx={{ width: 36, height: 36, flexShrink: 0 }} />
              )}
              <div style={{ maxWidth: m.role === 'user' ? '60%' : 680 }}>
                {m.role === 'user' ? (
                  <div style={{
                    background: '#fff', border: '1px solid #e5e7eb',
                    borderRadius: '18px 18px 4px 18px', padding: '12px 16px',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)', fontSize: 14, color: '#1f2937', lineHeight: 1.6,
                  }}>
                    {m.text}
                  </div>
                ) : (
                  <div>
                    {/* Header row */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#9ca3af' }}>
                        {m.topic === 'error' ? 'Error' : 'Concept Explanation'}
                      </span>
                      {m.confidence > 0 && (
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: 6,
                          padding: '4px 12px', background: '#fff',
                          border: `1px solid ${m.confidence < 0.3 ? '#fde68a' : '#e5e7eb'}`,
                          borderRadius: 999, boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                        }}>
                          <span style={{ fontSize: 14, fontWeight: 800, color: m.confidence < 0.3 ? '#d97706' : '#6c47ff' }}>
                            {Math.round(m.confidence * 100)}
                          </span>
                          <span style={{ fontSize: 11, color: '#9ca3af' }}>Confidence</span>
                        </div>
                      )}
                    </div>

                    {/* Answer body */}
                    <div style={{ fontSize: 14, lineHeight: 1.7 }}>
                      <ReactMarkdown components={mdComponents}>{m.text}</ReactMarkdown>
                    </div>

                    {/* Related topics */}
                    {m.topic && !['error', 'unknown'].includes(m.topic) && (
                      <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid #f1f1f5' }}>
                        <span style={{ fontSize: 10, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: 700 }}>
                          Related Topics
                        </span>
                        <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                          {relatedFor(m.topic).map(t => (
                            <span
                              key={t}
                              onClick={() => send(`Explain ${t}`)}
                              style={{
                                padding: '4px 14px', background: '#f3f4f6', borderRadius: 999,
                                fontSize: 12, fontWeight: 500, color: '#4b5563', cursor: 'pointer',
                                transition: 'background 0.15s, color 0.15s',
                              }}
                              onMouseEnter={e => { e.currentTarget.style.background = '#ede9ff'; e.currentTarget.style.color = '#6c47ff'; }}
                              onMouseLeave={e => { e.currentTarget.style.background = '#f3f4f6'; e.currentTarget.style.color = '#4b5563'; }}
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>

        {/* ── Right panel: suggestions ── */}
        <div style={{
          width: 240, flexShrink: 0, borderLeft: '1px solid #f1f1f5',
          background: '#fff', overflowY: 'auto', padding: '20px 14px',
        }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#9ca3af', margin: '0 0 12px' }}>
            Suggested Topics
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {SUGGESTIONS.map(q => (
              <button
                key={q}
                onClick={() => handleSuggestion(q)}
                disabled={loading}
                style={{
                  textAlign: 'left', padding: '9px 12px', borderRadius: 10,
                  background: '#f9fafb', border: '1px solid #f3f4f6',
                  fontSize: 12, fontWeight: 500, color: '#4b5563', cursor: 'pointer',
                  transition: 'background 0.15s, color 0.15s, border-color 0.15s',
                  fontFamily: "'DM Sans', sans-serif", lineHeight: 1.4,
                  opacity: loading ? 0.5 : 1,
                }}
                onMouseEnter={e => { if (!loading) { e.currentTarget.style.background = '#ede9ff'; e.currentTarget.style.color = '#6c47ff'; e.currentTarget.style.borderColor = '#c4b5fd'; } }}
                onMouseLeave={e => { e.currentTarget.style.background = '#f9fafb'; e.currentTarget.style.color = '#4b5563'; e.currentTarget.style.borderColor = '#f3f4f6'; }}
              >
                {q}
              </button>
            ))}
          </div>

          {/* API offline warning */}
          {apiOnline === false && (
            <div style={{
              marginTop: 20, padding: '12px', background: '#fef2f2',
              border: '1px solid #fca5a5', borderRadius: 12,
            }}>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 6 }}>
                <WifiOffIcon sx={{ fontSize: 14, color: '#ef4444' }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: '#dc2626' }}>Backend offline</span>
              </div>
              <p style={{ fontSize: 11, color: '#991b1b', margin: 0, lineHeight: 1.5 }}>
                Run: <code style={{ fontFamily: 'DM Mono, monospace', fontSize: 10 }}>uvicorn main:app --reload</code>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Input bar ── */}
      <div style={{
        padding: '14px 32px', background: '#fff',
        borderTop: '1px solid #f1f1f5', flexShrink: 0,
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          background: '#f9fafb', border: '1.5px solid #e5e7eb',
          borderRadius: 18, padding: '8px 10px 8px 16px',
          transition: 'border-color 0.15s',
        }}
          onFocus={() => {}} // border handled inline
        >
          <button style={{ color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}>
            <AddCircleIcon sx={{ fontSize: 22 }} />
          </button>
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
            placeholder="Ask a question about CS concepts…"
            style={{
              flex: 1, background: 'transparent', border: 'none',
              outline: 'none', fontSize: 14, color: '#374151',
              fontFamily: "'DM Sans', sans-serif",
            }}
          />
          <button
            onClick={() => send()}
            disabled={loading || !input.trim()}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '9px 18px', borderRadius: 12,
              background: loading || !input.trim() ? '#e5e7eb' : '#0f1729',
              color: loading || !input.trim() ? '#9ca3af' : '#fff',
              fontWeight: 600, fontSize: 13, border: 'none',
              cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
              transition: 'background 0.15s, color 0.15s',
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {loading ? <CircularProgress size={14} sx={{ color: '#9ca3af' }} /> : <SendIcon sx={{ fontSize: 16 }} />}
            {loading ? 'Sending…' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
}