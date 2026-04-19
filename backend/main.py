"""
EduAI – CS Teaching Assistant  v4.0
100 % offline — Ollama (local LLM) + TF-IDF .pkl models

Endpoints
─────────
GET  /                    → health check
GET  /api/status          → Ollama + model status
POST /api/chat            → hybrid TF-IDF + Ollama Q&A
POST /api/ml/predict      → ML score prediction + optional study advice
POST /api/quiz/generate   → Ollama-powered quiz generation
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from models  import load_all_models, get_models
from schemas import (
    ChatRequest, ChatResponse,
    PredictRequest, PredictResponse,
    QuizRequest, QuizResponse,
    StatusResponse,
)
from services        import answer_question, predict_score, generate_quiz
from ollama_client   import is_available as ollama_available, OLLAMA_MODEL

# ── Logging ────────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(levelname)-8s  %(name)s – %(message)s",
)
logger = logging.getLogger(__name__)


# ── Lifespan ───────────────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("EduAI v4 starting — loading ML models…")
    load_all_models()
    olup = ollama_available()
    logger.info("Ollama (%s): %s", OLLAMA_MODEL, "ONLINE ✓" if olup else "OFFLINE (TF-IDF-only mode)")
    logger.info("Ready to accept requests.")
    yield
    logger.info("EduAI shutting down.")


# ── App ────────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="EduAI – CS Teaching Assistant (offline)",
    description=(
        "Fully offline AI backend.\n\n"
        "Uses **local Ollama LLM** (llama3 / mistral) + **TF-IDF .pkl models**.\n\n"
        "No internet required after setup. No API keys needed."
    ),
    version="4.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ═══════════════════════════════════════════════════════════════════════════════
# ROUTES
# ═══════════════════════════════════════════════════════════════════════════════

@app.get("/", tags=["Health"])
def root():
    """Basic health check — confirms server is running."""
    return {
        "status":  "ok",
        "service": "EduAI Backend",
        "version": "4.0.0",
        "mode":    "offline",
    }


@app.get("/api/status", response_model=StatusResponse, tags=["Health"])
def status():
    """
    Returns the live state of every backend component.

    Useful for the frontend to show whether Ollama is running
    and which features are available.
    """
    models_loaded = bool(get_models())
    return StatusResponse(
        status="ok",
        ollama_online=ollama_available(),
        ollama_model=OLLAMA_MODEL,
        tfidf_loaded=models_loaded,
        ml_loaded=models_loaded,
        version="4.0.0",
    )


@app.post(
    "/api/chat",
    response_model=ChatResponse,
    tags=["AI Tutor"],
    summary="Ask the CS tutor a question",
)
def chat(request: ChatRequest):
    """
    Hybrid TF-IDF + Ollama Q&A endpoint.

    **Flow:**
    - TF-IDF retrieves the closest knowledge-base match.
    - If confidence ≥ 0.20 **and** Ollama is running:
      the TF-IDF answer seeds the LLM → rich tutoring response.
    - If confidence < 0.20 **and** Ollama is running:
      Ollama answers from its own weights.
    - If Ollama is offline:
      returns TF-IDF answer with structured guidance.

    **Response includes:**
    `answer`, `explanation`, `code_example`, `key_takeaway`,
    `topic`, `confidence`, `suggestion`, `suggested_questions`, `source`
    """
    m = get_models()
    return answer_question(
        message=request.message,
        vectorizer=m["vectorizer"],
        tfidf_matrix=m["tfidf_matrix"],
        qa_df=m["qa_df"],
    )


@app.post(
    "/api/ml/predict",
    response_model=PredictResponse,
    tags=["Score Predictor"],
    summary="Predict student exam score",
)
def predict(request: PredictRequest):
    """
    ML regression prediction with performance interpretation.

    Feature order (fixed): study_hours → attendance_loss → prev_score1 → prev_score2

    **Response includes:**
    `predicted_score`, `performance`, `message`, `study_advice` (Ollama, optional)

    Performance bands: 85+ Excellent · 70–84 Good · 50–69 Average · <50 Needs Improvement
    """
    m = get_models()
    return predict_score(
        study_hours=request.study_hours,
        attendance_loss=request.attendance_loss,
        prev_score1=request.prev_score1,
        prev_score2=request.prev_score2,
        predictor=m["score_predictor"],
    )


@app.post(
    "/api/quiz/generate",
    response_model=QuizResponse,
    tags=["Quiz"],
    summary="Generate a CS quiz with Ollama",
)
def quiz(request: QuizRequest):
    """
    Generate multiple-choice CS quiz questions using the local Ollama LLM.

    **Requires Ollama to be running:** `ollama serve`

    Each question includes 4 options, the correct answer, and an explanation.

    **Request:**
    ```json
    { "topic": "Data Structures", "difficulty": "Medium", "num_questions": 5 }
    ```
    """
    return generate_quiz(
        topic=request.topic,
        difficulty=request.difficulty,
        num_questions=request.num_questions,
    )