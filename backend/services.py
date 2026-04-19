"""
services.py – Business logic for EduAI v4.

All AI runs locally:
  • TF-IDF retrieval   (your .pkl files)
  • Ollama LLM         (local llama3 / mistral, no internet)

Public API
──────────
  answer_question(message, vectorizer, tfidf_matrix, qa_df)  → ChatResponse
  predict_score(study_hours, attendance_loss, prev_score1, prev_score2, predictor)
                                                              → PredictResponse
  generate_quiz(topic, difficulty, num_questions)             → QuizResponse
"""

from __future__ import annotations

import logging
import re
from typing import List, Tuple

import numpy as np
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
from fastapi import HTTPException

from schemas import (
    ChatResponse, PredictResponse,
    QuizResponse, QuizQuestion, QuizOption,
)
from ollama_client import ask as ollama_ask, is_available as ollama_available
from prompts import (
    build_chat_prompt,
    build_fallback_chat_prompt,
    build_quiz_prompt,
    build_score_advice_prompt,
)
from response_parser import parse_chat_response, parse_quiz_response

logger = logging.getLogger(__name__)


# ═══════════════════════════════════════════════════════════════════════════════
# ── CONSTANTS
# ═══════════════════════════════════════════════════════════════════════════════

# TF-IDF scores below this → too weak to seed the LLM; use LLM-only fallback
LOW_CONFIDENCE_THRESHOLD = 0.10

# TF-IDF scores above this → good enough to skip the LLM entirely and return fast
HIGH_CONFIDENCE_THRESHOLD = 0.95

SCORE_MIN, SCORE_MAX = 0, 100


# ═══════════════════════════════════════════════════════════════════════════════
# ── TOPIC KNOWLEDGE BASE  (offline — no API)
# ═══════════════════════════════════════════════════════════════════════════════

_TOPIC_DATA: dict[str, dict] = {
    "data_structures": {
        "suggestion": (
            "Practise implementing Stacks, Queues, and Linked Lists from scratch "
            "in Python. Draw memory diagrams to visualise pointer relationships."
        ),
        "suggested_questions": [
            "What is the difference between a stack and a queue?",
            "How does a linked list differ from an array in memory?",
            "What is a binary search tree and how do insertions work?",
        ],
    },
    "algorithms": {
        "suggestion": (
            "Focus on Big-O notation for every algorithm you study. "
            "Code Bubble Sort, Merge Sort, and Binary Search from memory."
        ),
        "suggested_questions": [
            "What is the time complexity of merge sort?",
            "How does binary search work on a sorted array?",
            "What is the difference between BFS and DFS graph traversal?",
        ],
    },
    "python": {
        "suggestion": (
            "Write at least one small Python program daily. "
            "Master list comprehensions, generators, and decorators."
        ),
        "suggested_questions": [
            "What is the difference between a list and a tuple in Python?",
            "How do Python dictionaries work internally?",
            "What are Python decorators and when should you use them?",
        ],
    },
    "oop": {
        "suggestion": (
            "Model real-world objects as classes and practice building "
            "inheritance hierarchies. Implement all four OOP pillars."
        ),
        "suggested_questions": [
            "What is the difference between inheritance and composition?",
            "How does method overriding work in Python?",
            "What is encapsulation and why is it important?",
        ],
    },
    "databases": {
        "suggestion": (
            "Write SQL queries daily against a local SQLite database. "
            "Study normalisation from 1NF through 3NF."
        ),
        "suggested_questions": [
            "What is the difference between INNER JOIN and LEFT JOIN?",
            "What is database normalisation and why does it matter?",
            "How does an index improve SQL query performance?",
        ],
    },
    "operating_systems": {
        "suggestion": (
            "Study CPU scheduling algorithms and memory management. "
            "Use Linux ps and top commands to observe real process behaviour."
        ),
        "suggested_questions": [
            "What is the difference between a process and a thread?",
            "How does virtual memory work?",
            "What is deadlock and how can it be prevented?",
        ],
    },
    "networking": {
        "suggestion": (
            "Learn the OSI model layer by layer. "
            "Use Wireshark offline to inspect packet captures."
        ),
        "suggested_questions": [
            "What is the difference between TCP and UDP?",
            "How does the DNS resolution process work step by step?",
            "What is subnetting and why is it used?",
        ],
    },
    "general": {
        "suggestion": (
            "Explore CS fundamentals: data structures, algorithms, "
            "operating systems, and databases are the best starting points."
        ),
        "suggested_questions": [
            "What are the most important data structures to learn?",
            "What is Big-O notation?",
            "What is the difference between compiled and interpreted languages?",
        ],
    },
}

_TOPIC_ALIASES: dict[str, str] = {
    "data_structures":      "data_structures",
    "linked_list":          "data_structures",
    "stack":                "data_structures",
    "queue":                "data_structures",
    "tree":                 "data_structures",
    "graph":                "data_structures",
    "heap":                 "data_structures",
    "hash":                 "data_structures",
    "algorithms":           "algorithms",
    "sorting":              "algorithms",
    "searching":            "algorithms",
    "recursion":            "algorithms",
    "dynamic_programming":  "algorithms",
    "big_o":                "algorithms",
    "python":               "python",
    "oop":                  "oop",
    "object_oriented":      "oop",
    "classes":              "oop",
    "inheritance":          "oop",
    "databases":            "databases",
    "sql":                  "databases",
    "normalization":        "databases",
    "os":                   "operating_systems",
    "operating_systems":    "operating_systems",
    "process":              "operating_systems",
    "memory":               "operating_systems",
    "networking":           "networking",
    "network":              "networking",
    "tcp":                  "networking",
    "ip":                   "networking",
}


def _canonical_topic(raw: str) -> str:
    key = raw.lower().strip().replace(" ", "_")
    return _TOPIC_ALIASES.get(key, _TOPIC_ALIASES.get(raw.lower().strip(), "general"))


def _topic_guidance(raw: str) -> Tuple[str, List[str]]:
    data = _TOPIC_DATA.get(_canonical_topic(raw), _TOPIC_DATA["general"])
    return data["suggestion"], data["suggested_questions"]


# ═══════════════════════════════════════════════════════════════════════════════
# ── TEXT HELPERS
# ═══════════════════════════════════════════════════════════════════════════════

def _first_sentence(text: str, max_chars: int = 200) -> str:
    """Return the first meaningful sentence (≥10 chars) from text."""
    clean = re.sub(r"\s+", " ", text.strip())
    for sent in re.split(r"(?<=[.!?])\s+", clean):
        sent = sent.strip()
        if len(sent) >= 10 and not re.match(r"^[A-Z][a-z]+:\s*$", sent):
            return sent[:max_chars] + ("..." if len(sent) > max_chars else "")
    return clean[:max_chars]


# ═══════════════════════════════════════════════════════════════════════════════
# ── CHAT / AI TUTOR
# ═══════════════════════════════════════════════════════════════════════════════

def answer_question(
    message: str,
    vectorizer,
    tfidf_matrix,
    qa_df: pd.DataFrame,
) -> ChatResponse:
    """
    Hybrid TF-IDF + Ollama answer pipeline.

    Decision tree
    ─────────────
    confidence ≥ HIGH (0.70) and Ollama offline
        → return TF-IDF answer directly (fast path)

    confidence ≥ LOW (0.20) and Ollama online
        → use TF-IDF answer as seed → LLM expands it  ← best quality

    confidence < LOW (0.20) and Ollama online
        → LLM answers from its own weights (no seed)

    confidence < LOW and Ollama offline
        → polite fallback with topic guidance
    """
    try:
        # ── Step 1: TF-IDF retrieval ──────────────────────────────────────────
        q_vec        = vectorizer.transform([message])
        similarities = cosine_similarity(q_vec, tfidf_matrix).flatten()
        best_idx     = int(np.argmax(similarities))
        confidence   = float(round(float(similarities[best_idx]), 4))

        ollama_up    = ollama_available()

        logger.info(
            "TF-IDF confidence=%.4f  ollama_online=%s  question='%s'",
            confidence, ollama_up, message[:80],
        )

        # ── Step 2: Extract TF-IDF match ─────────────────────────────────────
        best_row   = qa_df.iloc[best_idx]
        raw_answer = str(best_row.get("answer", "")).strip() or "No reference answer available."
        raw_topic  = str(best_row.get("topic",  "general")).strip()

        suggestion, suggested_questions = _topic_guidance(raw_topic)

        # ── Step 3a: High confidence + Ollama offline → fast TF-IDF response ──
        if confidence >= HIGH_CONFIDENCE_THRESHOLD and not ollama_up:
            logger.info("High confidence + Ollama offline → returning TF-IDF answer.")
            return ChatResponse(
                answer=_first_sentence(raw_answer),
                explanation=raw_answer,
                code_example="",
                key_takeaway="",
                topic=raw_topic,
                confidence=confidence,
                suggestion=suggestion,
                suggested_questions=suggested_questions,
                source="tfidf_only",
            )

        # ── Step 3b: Good TF-IDF seed + Ollama online → LLM expansion ─────────
        if confidence >= LOW_CONFIDENCE_THRESHOLD and ollama_up:
            logger.info("Seeding LLM with TF-IDF answer (confidence=%.4f).", confidence)
            prompt   = build_chat_prompt(message, raw_answer, raw_topic)
            llm_text = ollama_ask(prompt)

            if llm_text:
                parsed = parse_chat_response(llm_text)
                return ChatResponse(
                    answer=parsed["answer"],
                    explanation=parsed["explanation"],
                    code_example=parsed.get("code_example", ""),
                    key_takeaway=parsed.get("key_takeaway", ""),
                    topic=raw_topic,
                    confidence=confidence,
                    suggestion=suggestion,
                    suggested_questions=suggested_questions,
                    source="llm_enhanced",
                )
            # LLM failed mid-flight → fall back to TF-IDF
            logger.warning("LLM call failed — falling back to TF-IDF answer.")
            return ChatResponse(
                answer=_first_sentence(raw_answer),
                explanation=raw_answer,
                code_example="",
                key_takeaway="",
                topic=raw_topic,
                confidence=confidence,
                suggestion=suggestion,
                suggested_questions=suggested_questions,
                source="tfidf_only",
            )

        # ── Step 3c: Low confidence + Ollama online → LLM answers from weights ─
        if ollama_up:
            logger.info("Low TF-IDF confidence → LLM fallback (no seed).")
            prompt   = build_fallback_chat_prompt(message)
            llm_text = ollama_ask(prompt)

            if llm_text:
                parsed = parse_chat_response(llm_text)
                # topic detection from question itself when TF-IDF is weak
                detected_topic = _detect_topic_from_text(message)
                sugg, sq = _topic_guidance(detected_topic)
                return ChatResponse(
                    answer=parsed["answer"],
                    explanation=parsed["explanation"],
                    code_example=parsed.get("code_example", ""),
                    key_takeaway=parsed.get("key_takeaway", ""),
                    topic=detected_topic,
                    confidence=confidence,
                    suggestion=sugg,
                    suggested_questions=sq,
                    source="llm_fallback",
                )

        # ── Step 3d: Low confidence + Ollama offline → static fallback ─────────
        logger.info("Low confidence + Ollama offline → static fallback.")
        return ChatResponse(
            answer=(
                "I'm not confident about this question. "
                "Try rephrasing it or ask about a specific CS topic."
            ),
            explanation=(
                "My knowledge base covers data structures, algorithms, Python, "
                "OOP, databases, operating systems, and networking. "
                'Try asking: "What is a binary search tree?" or "How does recursion work?"'
            ),
            code_example="",
            key_takeaway=(
                "Start Ollama (ollama serve) for richer answers on questions "
                "outside the built-in knowledge base."
            ),
            topic="unknown",
            confidence=confidence,
            suggestion=suggestion,
            suggested_questions=suggested_questions,
            source="tfidf_only",
        )

    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Unexpected error in answer_question: %s", exc)
        raise HTTPException(status_code=500, detail=f"Chat inference failed: {exc}") from exc


def _detect_topic_from_text(text: str) -> str:
    """Lightweight keyword scan to detect a topic when TF-IDF confidence is low."""
    t = text.lower()
    for kw, topic in [
        ("stack", "data_structures"), ("queue", "data_structures"),
        ("linked list", "data_structures"), ("tree", "data_structures"),
        ("graph", "data_structures"), ("sort", "algorithms"),
        ("search", "algorithms"), ("recursion", "algorithms"),
        ("big o", "algorithms"), ("big-o", "algorithms"),
        ("python", "python"), ("class", "oop"), ("inherit", "oop"),
        ("encapsul", "oop"), ("polymorphism", "oop"),
        ("sql", "databases"), ("database", "databases"),
        ("normaliz", "databases"), ("process", "operating_systems"),
        ("thread", "operating_systems"), ("memory", "operating_systems"),
        ("tcp", "networking"), ("ip address", "networking"),
        ("network", "networking"),
    ]:
        if kw in t:
            return topic
    return "general"


# ═══════════════════════════════════════════════════════════════════════════════
# ── SCORE PREDICTION
# ═══════════════════════════════════════════════════════════════════════════════

def _classify_performance(score: int) -> Tuple[str, str]:
    """Map a clamped score to (performance_label, feedback_message)."""
    if score >= 85:
        return (
            "Excellent",
            "Outstanding performance! You have a strong grasp of the material. "
            "Challenge yourself with harder problems and explore advanced topics.",
        )
    if score >= 70:
        return (
            "Good",
            "You are performing well. Your study habits are paying off. "
            "Focus on the specific areas where you lost marks to reach Excellent.",
        )
    if score >= 50:
        return (
            "Average",
            "You have a basic understanding but there is clear room for growth. "
            "Increase study hours, review past mistakes, and practise more questions.",
        )
    return (
        "Needs Improvement",
        "Significant gaps remain. Revisit core concepts, attend every class, "
        "and aim for at least 4–5 focused study hours per day. Seek help early.",
    )


def predict_score(
    study_hours:     float,
    attendance_loss: float,
    prev_score1:     float,
    prev_score2:     float,
    predictor,
) -> PredictResponse:
    """
    Predict exam score → classify performance → optionally add Ollama study advice.

    Feature order matches model training exactly:
      [study_hours, attendance_loss, prev_score1, prev_score2]
    """
    try:
        # ── ML prediction ─────────────────────────────────────────────────────
        features        = np.array(
            [[study_hours, attendance_loss, prev_score1, prev_score2]],
            dtype=np.float64,
        )
        raw_score       = float(predictor.predict(features)[0])
        predicted_score = max(SCORE_MIN, min(SCORE_MAX, int(round(raw_score))))
        performance, message = _classify_performance(predicted_score)

        logger.info(
            "Predict: [%.1f, %.1f, %.1f, %.1f] → raw=%.2f  clamped=%d  band=%s",
            study_hours, attendance_loss, prev_score1, prev_score2,
            raw_score, predicted_score, performance,
        )

        # ── Optional Ollama study advice ──────────────────────────────────────
        study_advice: str | None = None
        if ollama_available():
            prompt = build_score_advice_prompt(
                predicted_score, performance, study_hours, attendance_loss,
            )
            advice_text = ollama_ask(prompt, retry_if_short=False)
            if advice_text:
                study_advice = advice_text.strip()
                logger.info("Ollama provided personalised study advice.")

        return PredictResponse(
            predicted_score=predicted_score,
            performance=performance,
            message=message,
            study_advice=study_advice,
        )

    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Unexpected error in predict_score: %s", exc)
        raise HTTPException(status_code=500, detail=f"Score prediction failed: {exc}") from exc


# ═══════════════════════════════════════════════════════════════════════════════
# ── QUIZ GENERATION
# ═══════════════════════════════════════════════════════════════════════════════

def generate_quiz(topic: str, difficulty: str, num_questions: int) -> QuizResponse:
    """
    Generate a multiple-choice quiz via Ollama.

    Hybrid approach
    ───────────────
    • The prompt enforces MCQ structure (our template).
    • The LLM fills in CS content for the given topic.
    • response_parser.parse_quiz_response() parses the output into objects.
    • If Ollama is offline, raise HTTP 503 with a clear message.
    """
    if not ollama_available():
        raise HTTPException(
            status_code=503,
            detail=(
                "Quiz generation requires Ollama to be running locally. "
                "Start it with: ollama serve"
            ),
        )

    prompt   = build_quiz_prompt(topic, difficulty, num_questions)
    llm_text = ollama_ask(prompt, retry_if_short=False)

    if not llm_text:
        raise HTTPException(
            status_code=502,
            detail="Ollama did not return a response. Check that the model is loaded.",
        )

    raw_questions = parse_quiz_response(llm_text, topic, difficulty)

    if not raw_questions:
        raise HTTPException(
            status_code=502,
            detail=(
                "Could not parse any questions from the model output. "
                "Try again — the model occasionally produces malformed output."
            ),
        )

    # Convert raw dicts to Pydantic objects
    questions: List[QuizQuestion] = []
    for q in raw_questions:
        options = [QuizOption(letter=o["letter"], text=o["text"]) for o in q["options"]]
        questions.append(QuizQuestion(
            question=q["question"],
            options=options,
            correct_answer=q["correct_answer"],
            explanation=q["explanation"],
            topic=q["topic"],
            difficulty=q["difficulty"],
        ))

    logger.info(
        "Quiz generated: topic='%s'  difficulty='%s'  questions=%d",
        topic, difficulty, len(questions),
    )

    return QuizResponse(
        questions=questions,
        topic=topic,
        difficulty=difficulty,
        total=len(questions),
    )