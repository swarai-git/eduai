"""
prompts.py – All Ollama prompt templates.

Root cause of the empty explanation bug:
  Local LLMs (llama3, mistral) often ignore elaborate heading formats and
  write in free prose instead. The old headings "DIRECT ANSWER:" etc. were
  being missed by the parser, leaving explanation = "".

Fix:
  Use a much simpler two-part format:
    ANSWER: <one sentence>
    EXPLANATION: <full paragraphs>

  This is short enough that the LLM reliably uses it, and the parser
  can find it with a simple split.
"""

from __future__ import annotations


# ══════════════════════════════════════════════════════════════════════
# CHAT – main Q&A prompt (TF-IDF seed available)
# ══════════════════════════════════════════════════════════════════════

def build_chat_prompt(question: str, tfidf_answer: str, topic: str) -> str:
    """
    Give the LLM the short TF-IDF seed and ask it to expand into a full
    tutoring response. Uses a simple 4-part format the parser can reliably find.
    """
    return (
        f"You are a Computer Science tutor. A student asked:\n"
        f'"{question}"\n\n'
        f"The short reference answer is: {tfidf_answer}\n\n"
        f"Write a complete tutoring response using EXACTLY this format "
        f"(use the labels on their own lines):\n\n"
        f"ANSWER:\n"
        f"Write one clear sentence directly answering the question.\n\n"
        f"EXPLANATION:\n"
        f"Write at least 4 sentences explaining:\n"
        f"- What {topic} means and why it matters\n"
        f"- How it works step by step\n"
        f"- A real-world analogy or example\n\n"
        f"CODE EXAMPLE:\n"
        f"Show a short Python example. If not applicable write: Not applicable.\n\n"
        f"KEY TAKEAWAY:\n"
        f"Write one sentence summarising the most important point.\n\n"
        f"Rules:\n"
        f"- Start your response immediately with 'ANSWER:' — no preamble.\n"
        f"- Do not write 'Sure!' or 'Of course!'.\n"
        f"- The EXPLANATION must be at least 80 words.\n"
        f"- Write for a university computer science student."
    )


# ══════════════════════════════════════════════════════════════════════
# CHAT – fallback prompt (no TF-IDF seed, LLM answers from weights)
# ══════════════════════════════════════════════════════════════════════

def build_fallback_chat_prompt(question: str) -> str:
    """
    Used when TF-IDF confidence is too low to provide a useful seed.
    The LLM answers entirely from its own knowledge.
    """
    return (
        f"You are a Computer Science tutor. A student asked:\n"
        f'"{question}"\n\n'
        f"Write a complete tutoring response using EXACTLY this format "
        f"(use the labels on their own lines):\n\n"
        f"ANSWER:\n"
        f"Write one clear sentence directly answering the question.\n\n"
        f"EXPLANATION:\n"
        f"Write at least 4 sentences explaining the concept fully, including "
        f"how it works and a real-world example or analogy.\n\n"
        f"CODE EXAMPLE:\n"
        f"Show a short Python example. If not applicable write: Not applicable.\n\n"
        f"KEY TAKEAWAY:\n"
        f"Write one sentence summarising the most important point.\n\n"
        f"Rules:\n"
        f"- Start immediately with 'ANSWER:' — no preamble.\n"
        f"- Do not write 'Sure!' or 'Great question!'.\n"
        f"- The EXPLANATION must be at least 80 words.\n"
        f"- If the question is not about computer science, say so politely.\n"
        f"- Write for a university computer science student."
    )


# ══════════════════════════════════════════════════════════════════════
# QUIZ GENERATION
# ══════════════════════════════════════════════════════════════════════

def build_quiz_prompt(topic: str, difficulty: str, num_questions: int) -> str:
    difficulty_guidance = {
        "Easy":   "Focus on definitions and basic recognition.",
        "Medium": "Test understanding — how things work, comparisons, trade-offs.",
        "Hard":   "Require analysis — edge cases, complexity, design decisions.",
    }.get(difficulty, "Test understanding at an intermediate level.")

    return (
        f"You are a Computer Science quiz writer.\n"
        f"Generate exactly {num_questions} multiple-choice question(s) about: {topic}\n"
        f"Difficulty: {difficulty} — {difficulty_guidance}\n\n"
        f"For EACH question use EXACTLY this format:\n\n"
        f"QUESTION [number]:\n"
        f"[question text]\n\n"
        f"A) [option]\n"
        f"B) [option]\n"
        f"C) [option]\n"
        f"D) [option]\n\n"
        f"CORRECT: [A, B, C, or D]\n\n"
        f"EXPLANATION:\n"
        f"[2-3 sentences explaining why the answer is correct]\n\n"
        f"---\n\n"
        f"Rules:\n"
        f"- Each question tests a different concept within {topic}.\n"
        f"- Options must be plausible.\n"
        f"- Separate questions with --- on its own line.\n"
        f"- Do NOT add any text before QUESTION 1."
    )


# ══════════════════════════════════════════════════════════════════════
# SCORE ADVICE
# ══════════════════════════════════════════════════════════════════════

def build_score_advice_prompt(
    predicted_score: int,
    performance: str,
    study_hours: float,
    attendance_loss: float,
) -> str:
    return (
        f"A CS student's predicted exam score is {predicted_score}/100 ({performance}).\n"
        f"They study {study_hours} hours/day and have missed {attendance_loss} classes.\n\n"
        f"Write exactly 3 numbered, specific, actionable study recommendations.\n"
        f"Format:\n"
        f"1. [recommendation]\n"
        f"2. [recommendation]\n"
        f"3. [recommendation]\n\n"
        f"Keep each to 1-2 sentences. Be direct. Do not add a preamble."
    )