"""
schemas.py – Pydantic request / response models for EduAI v4.

All fields validated before reaching business logic.
All response models are fully JSON-serialisable.
"""

from __future__ import annotations

from typing import List, Optional
from pydantic import BaseModel, Field, field_validator


# ═══════════════════════════════════════════════════════════════════════════════
# CHAT / AI TUTOR
# ═══════════════════════════════════════════════════════════════════════════════

class ChatRequest(BaseModel):
    message: str = Field(
        ...,
        min_length=1,
        max_length=1000,
        examples=["What is a stack data structure?"],
        description="Student's CS question. Must not be blank.",
    )

    @field_validator("message")
    @classmethod
    def not_blank(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("message must not be blank or whitespace only.")
        return v.strip()


class ChatResponse(BaseModel):
    """
    Structured tutor-style response.

    answer              Short direct answer (first sentence / DIRECT ANSWER section).
    explanation         Full explanation (EXPLANATION section from LLM).
    code_example        Optional code snippet (empty string if not applicable).
    key_takeaway        One-sentence summary (KEY TAKEAWAY section).
    topic               CS topic from the matched Q&A row.
    confidence          TF-IDF cosine similarity (0.0–1.0).
    suggestion          Offline study tip from the topic knowledge base.
    suggested_questions 3 follow-up questions from the topic knowledge base.
    source              'tfidf_only' | 'llm_enhanced' | 'llm_fallback'
    """
    answer:              str        = Field(..., description="Short direct answer.")
    explanation:         str        = Field(..., description="Full explanation.")
    code_example:        str        = Field(default="", description="Code snippet or empty.")
    key_takeaway:        str        = Field(default="", description="One-line summary.")
    topic:               str        = Field(..., description="CS topic label.")
    confidence:          float      = Field(..., ge=0.0, le=1.0)
    suggestion:          str        = Field(..., description="Study guidance tip.")
    suggested_questions: List[str]  = Field(..., description="Follow-up questions.")
    source:              str        = Field(default="tfidf_only",
                                            description="Answer source identifier.")


# ═══════════════════════════════════════════════════════════════════════════════
# SCORE PREDICTION
# ═══════════════════════════════════════════════════════════════════════════════

class PredictRequest(BaseModel):
    study_hours: float = Field(
        ..., ge=0.0, le=20.0,
        examples=[5.0],
        description="Average daily study hours (0–20).",
    )
    attendance_loss: float = Field(
        ..., ge=0.0, le=200.0,
        examples=[2.0],
        description="Number of classes / sessions missed.",
    )
    prev_score1: float = Field(
        ..., ge=0.0, le=100.0,
        examples=[60.0],
        description="Previous exam score 1 (0–100).",
    )
    prev_score2: float = Field(
        ..., ge=0.0, le=100.0,
        examples=[65.0],
        description="Previous exam score 2 (0–100).",
    )


class PredictResponse(BaseModel):
    """
    predicted_score  Clamped integer prediction (0–100).
    performance      Excellent / Good / Average / Needs Improvement.
    message          Personalised feedback.
    study_advice     Optional 3-point improvement plan from Ollama (empty if offline).
    """
    predicted_score: int            = Field(..., description="Predicted score 0–100.")
    performance:     str            = Field(..., description="Performance category.")
    message:         str            = Field(..., description="Personalised feedback.")
    study_advice:    Optional[str]  = Field(default=None,
                                            description="Ollama-generated study tips.")


# ═══════════════════════════════════════════════════════════════════════════════
# QUIZ GENERATION
# ═══════════════════════════════════════════════════════════════════════════════

class QuizRequest(BaseModel):
    topic: str = Field(
        ..., min_length=1, max_length=100,
        examples=["Data Structures"],
        description="CS topic to generate quiz questions for.",
    )
    difficulty: str = Field(
        default="Medium",
        examples=["Easy", "Medium", "Hard"],
    )
    num_questions: int = Field(
        default=5, ge=1, le=10,
        description="Number of questions to generate (1–10).",
    )

    @field_validator("difficulty")
    @classmethod
    def valid_difficulty(cls, v: str) -> str:
        allowed = {"Easy", "Medium", "Hard"}
        if v not in allowed:
            raise ValueError(f"difficulty must be one of {allowed}.")
        return v


class QuizOption(BaseModel):
    letter: str   # "A", "B", "C", "D"
    text:   str


class QuizQuestion(BaseModel):
    question:       str
    options:        List[QuizOption]
    correct_answer: str
    explanation:    str
    topic:          str
    difficulty:     str


class QuizResponse(BaseModel):
    questions:  List[QuizQuestion]
    topic:      str
    difficulty: str
    total:      int


# ═══════════════════════════════════════════════════════════════════════════════
# HEALTH / STATUS
# ═══════════════════════════════════════════════════════════════════════════════

class StatusResponse(BaseModel):
    status:        str
    ollama_online: bool
    ollama_model:  str
    tfidf_loaded:  bool
    ml_loaded:     bool
    version:       str