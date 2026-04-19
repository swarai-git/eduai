# EduAI – ML-Based CS Teaching Assistant · Backend

A production-ready FastAPI backend with two AI-powered endpoints.

---

## 📁 Project Structure

```
eduai-backend/
│
├── main.py          ← FastAPI app: routes + startup lifecycle
├── models.py        ← Loads all .pkl files once at startup
├── schemas.py       ← Pydantic request/response validation
├── services.py      ← Core logic: answer_question() + predict_score()
├── requirements.txt ← Python dependencies
│
└── models/          ← 📌 PUT YOUR .pkl FILES HERE
    ├── tfidf_vectorizer.pkl    (TF-IDF vectorizer)
    ├── tfidf_matrix.pkl        (pre-built TF-IDF matrix)
    ├── qa_dataframe.pkl        (Q&A DataFrame: columns = question, answer, topic)
    └── score_predictor.pkl     (trained regression model)
```

---

## ✅ Step-by-Step Setup

### Step 1 – Install Python dependencies

```bash
pip install -r requirements.txt
```

Or install manually:

```bash
pip install fastapi uvicorn[standard] pydantic scikit-learn joblib numpy pandas
```

---

### Step 2 – Add your .pkl model files

Copy all four `.pkl` files into the `models/` subfolder:

```
eduai-backend/
└── models/
    ├── tfidf_vectorizer.pkl    ✅ place here
    ├── tfidf_matrix.pkl        ✅ place here
    ├── qa_dataframe.pkl        ✅ place here
    └── score_predictor.pkl     ✅ place here
```

> **Important:** `qa_dataframe.pkl` must contain a Pandas DataFrame with at
> least three columns: `question`, `answer`, and `topic`.

---

### Step 3 – Run the server

From inside the `eduai-backend/` folder:

```bash
uvicorn main:app --reload
```

Expected output:

```
INFO: Loading ML models…
INFO: Loading vectorizer       from models/tfidf_vectorizer.pkl
INFO: Loading tfidf_matrix     from models/tfidf_matrix.pkl
INFO: Loading qa_df            from models/qa_dataframe.pkl
INFO: Loading score_predictor  from models/score_predictor.pkl
INFO: All 4 model files loaded.
INFO: Application startup complete.
INFO: Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
```

---

### Step 4 – Open Interactive API Docs

Go to one of these in your browser:

| URL | Interface |
|-----|-----------|
| `http://127.0.0.1:8000/docs` | **Swagger UI** – try requests live |
| `http://127.0.0.1:8000/redoc` | **ReDoc** – clean reference |

In Swagger (`/docs`):
1. Click any endpoint (e.g. `POST /api/chat`)
2. Click **"Try it out"**
3. Fill in the request body
4. Click **"Execute"**
5. See the live response below

---

## 🔌 API Reference

### `GET /`  — Health Check

```bash
curl http://127.0.0.1:8000/
```

Response:
```json
{ "status": "ok", "service": "EduAI Backend" }
```

---

### `POST /api/chat`  — Q&A Chat

**Request:**
```json
{ "message": "What is a stack?" }
```

**Response (high confidence):**
```json
{
  "answer": "A stack is a linear data structure that follows the LIFO principle...",
  "topic": "data_structures",
  "confidence": 0.87
}
```

**Response (low confidence < 0.1):**
```json
{
  "answer": "I'm not confident about this answer. Try rephrasing your question or ask about a specific CS topic.",
  "topic": "unknown",
  "confidence": 0.04
}
```

**curl example:**
```bash
curl -X POST http://127.0.0.1:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is a stack?"}'
```

---

### `POST /api/ml/predict`  — Score Prediction

**Request:**
```json
{
  "study_hours": 5,
  "attendance_loss": 2,
  "prev_score1": 60,
  "prev_score2": 65
}
```

**Response:**
```json
{ "predicted_score": 72 }
```

**curl example:**
```bash
curl -X POST http://127.0.0.1:8000/api/ml/predict \
  -H "Content-Type: application/json" \
  -d '{"study_hours": 5, "attendance_loss": 2, "prev_score1": 60, "prev_score2": 65}'
```

---

## ⚠️ Error Reference

| Situation | HTTP | Detail |
|---|---|---|
| A `.pkl` file is missing | `500` on startup | Lists exactly which files are missing |
| Message is empty/blank | `422` | Pydantic validation error |
| Invalid field type | `422` | Pydantic validation error |
| `study_hours` > 24 | `422` | Out of range |
| `prev_score1` > 100 | `422` | Out of range |
| Models not loaded yet | `503` | Service unavailable |
| Inference error | `500` | Error description |

---

## 🗂️ How the Code Is Organized

| File | Responsibility |
|---|---|
| `main.py` | FastAPI app, routes, CORS, startup lifespan |
| `models.py` | Load `.pkl` files once at startup; expose via `get_models()` |
| `schemas.py` | Pydantic models: validate inputs, shape outputs |
| `services.py` | `answer_question()` and `predict_score()` — pure business logic |

**Data flow for `/api/chat`:**
```
Request JSON
  → ChatRequest (Pydantic validates)
  → answer_question(message, vectorizer, tfidf_matrix, qa_df)
      → vectorizer.transform([message])
      → cosine_similarity(question_vec, tfidf_matrix)
      → argmax → qa_df.iloc[best_idx]
  → ChatResponse (answer, topic, confidence)
```

**Data flow for `/api/ml/predict`:**
```
Request JSON
  → PredictRequest (Pydantic validates)
  → predict_score(study_hours, attendance_loss, prev_score1, prev_score2, predictor)
      → np.array([[...]])
      → predictor.predict(features)
      → round + clamp(0-100)
  → PredictResponse (predicted_score)
```