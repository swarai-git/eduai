import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:8000' });

// ── Chat ──────────────────────────────────────────────────────────────────────
export const sendChat = (message) =>
  api.post('/api/chat', { message });

// ── Score Prediction ──────────────────────────────────────────────────────────
export const predictScore = (data) =>
  api.post('/api/ml/predict', data);

// ── Quiz Generation (LLM-powered) ─────────────────────────────────────────────
export const generateQuiz = ({ topic, difficulty = 'Medium', num_questions = 5 }) =>
  api.post('/api/quiz/generate', { topic, difficulty, num_questions });

// ── Hint ──────────────────────────────────────────────────────────────────────
export const getHint = ({ question, topic }) =>
  api.post('/api/quiz/hint', { question, topic });

// ── Status ────────────────────────────────────────────────────────────────────
export const getStatus = () =>
  api.get('/api/status');