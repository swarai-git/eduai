"""
response_parser.py – Parses Ollama plain-text output into structured dicts.

Why plain text instead of JSON?
  Local LLMs produce reliable JSON only ~60% of the time.
  Parsing our own labelled format is much more robust.

This version handles three real scenarios:
  1. LLM follows the format exactly    → clean parse
  2. LLM writes in free prose          → whole text becomes explanation
  3. LLM partially follows the format  → extract what we can, fill the rest
"""

from __future__ import annotations

import re
import logging
from typing import Any

logger = logging.getLogger(__name__)


# ══════════════════════════════════════════════════════════════════════════════
# CHAT RESPONSE PARSER
# ══════════════════════════════════════════════════════════════════════════════

# All valid section labels (we try multiple spellings local models produce)
_ANSWER_LABELS      = r"(?:ANSWER|DIRECT ANSWER|SHORT ANSWER|RESPONSE)"
_EXPLANATION_LABELS = r"(?:EXPLANATION|FULL EXPLANATION|DETAILS|DETAIL)"
_CODE_LABELS        = r"(?:CODE EXAMPLE|CODE|EXAMPLE|PYTHON EXAMPLE)"
_TAKEAWAY_LABELS    = r"(?:KEY TAKEAWAY|TAKEAWAY|SUMMARY|KEY POINT)"

# Master split: find any section label at the start of a line
_SECTION_PATTERN = re.compile(
    rf"^({_ANSWER_LABELS}|{_EXPLANATION_LABELS}|{_CODE_LABELS}|{_TAKEAWAY_LABELS})\s*:?\s*$",
    re.IGNORECASE | re.MULTILINE,
)


def _split_into_sections(raw: str) -> dict[str, str]:
    """
    Split raw LLM text on labelled section headings.
    Returns a dict mapping normalised label → section body text.
    """
    sections: dict[str, str] = {}
    parts = _SECTION_PATTERN.split(raw)
    # parts = [text_before, label1, body1, label2, body2, ...]
    i = 1
    while i < len(parts) - 1:
        label = parts[i].strip().upper()
        body  = parts[i + 1].strip() if (i + 1) < len(parts) else ""
        # Remove trailing separator lines
        body = re.sub(r"\n[-─═]{3,}\s*$", "", body).strip()
        sections[label] = body
        i += 2
    return sections


def _normalise_label(sections: dict[str, str], *candidates: str) -> str:
    """Return the body for the first matching label, or empty string."""
    for c in candidates:
        for key, val in sections.items():
            if c.upper() in key:
                return val
    return ""


def _clean_code(raw: str) -> str:
    """Strip placeholder strings from code blocks."""
    if not raw:
        return ""
    low = raw.lower().strip()
    if low in ("not applicable.", "not applicable", "n/a", "none", ""):
        return ""
    return raw


def parse_chat_response(raw_text: str) -> dict[str, str]:
    """
    Parse an LLM chat response into four named fields.

    Handles:
      • Properly formatted responses  (finds sections by label)
      • Free-prose responses           (whole text → explanation)
      • Inline labels on same line as content (e.g. "ANSWER: A hash table is...")
    """
    result = {
        "answer":       "",
        "explanation":  "",
        "code_example": "",
        "key_takeaway": "",
    }

    # ── Try splitting by block headings (labels on their own line) ────────────
    sections = _split_into_sections(raw_text)

    if sections:
        result["answer"]       = _normalise_label(sections, "ANSWER")
        result["explanation"]  = _normalise_label(sections, "EXPLANATION", "DETAIL")
        result["code_example"] = _clean_code(_normalise_label(sections, "CODE"))
        result["key_takeaway"] = _normalise_label(sections, "TAKEAWAY", "SUMMARY")

    # ── Try inline labels (label: content on same line) ───────────────────────
    if not result["answer"]:
        m = re.search(
            rf"^{_ANSWER_LABELS}\s*:\s*(.+?)(?=\n\n|\n{_EXPLANATION_LABELS}|$)",
            raw_text, re.IGNORECASE | re.DOTALL | re.MULTILINE,
        )
        if m:
            result["answer"] = m.group(1).strip()

    if not result["explanation"]:
        m = re.search(
            rf"^{_EXPLANATION_LABELS}\s*:\s*(.+?)(?=\n\n{_CODE_LABELS}|\n\n{_TAKEAWAY_LABELS}|$)",
            raw_text, re.IGNORECASE | re.DOTALL | re.MULTILINE,
        )
        if m:
            result["explanation"] = m.group(1).strip()

    if not result["code_example"]:
        m = re.search(
            rf"^{_CODE_LABELS}\s*:\s*(.+?)(?=\n\n{_TAKEAWAY_LABELS}|$)",
            raw_text, re.IGNORECASE | re.DOTALL | re.MULTILINE,
        )
        if m:
            result["code_example"] = _clean_code(m.group(1).strip())

    if not result["key_takeaway"]:
        m = re.search(
            rf"^{_TAKEAWAY_LABELS}\s*:\s*(.+?)$",
            raw_text, re.IGNORECASE | re.DOTALL | re.MULTILINE,
        )
        if m:
            result["key_takeaway"] = m.group(1).strip()

    # ── Final fallbacks: LLM wrote free prose without any labels ─────────────
    if not result["explanation"] and not result["answer"]:
        # Whole response is unstructured — use it all as the explanation
        result["explanation"] = raw_text.strip()
        logger.info("Parser: no section labels found — using full text as explanation.")

    if not result["answer"] and result["explanation"]:
        # Extract first sentence as the short answer
        sentences = re.split(r"(?<=[.!?])\s+", result["explanation"])
        for s in sentences:
            s = s.strip()
            if len(s) > 15:
                result["answer"] = s[:220] + ("…" if len(s) > 220 else "")
                break

    if not result["answer"]:
        result["answer"] = "See the explanation below."

    # ── Populate empty explanation from full raw text if still missing ────────
    if not result["explanation"]:
        result["explanation"] = raw_text.strip()

    # ── Remove the answer sentence from the beginning of explanation ──────────
    # (Avoid showing the same sentence twice)
    if (
        result["answer"]
        and result["explanation"].startswith(result["answer"][:40])
    ):
        rest = result["explanation"][len(result["answer"]):].strip()
        if len(rest) > 20:
            result["explanation"] = rest

    # ── Clean up code ─────────────────────────────────────────────────────────
    result["code_example"] = _clean_code(result["code_example"])

    # ── Default key takeaway ──────────────────────────────────────────────────
    if not result["key_takeaway"]:
        result["key_takeaway"] = ""

    logger.debug(
        "Parsed: answer=%d chars  explanation=%d chars  code=%d chars  takeaway=%d chars",
        len(result["answer"]), len(result["explanation"]),
        len(result["code_example"]), len(result["key_takeaway"]),
    )

    return result


# ══════════════════════════════════════════════════════════════════════════════
# QUIZ RESPONSE PARSER
# ══════════════════════════════════════════════════════════════════════════════

def parse_quiz_response(
    raw_text: str, topic: str, difficulty: str
) -> list[dict[str, Any]]:
    """Parse numbered MCQ blocks from Ollama quiz output."""
    questions: list[dict[str, Any]] = []
    blocks = re.split(r"\n---\n|\n---$|(?=\nQUESTION\s+\d+)", raw_text.strip())

    for block in blocks:
        block = block.strip()
        if not block:
            continue
        q = _parse_question_block(block, topic, difficulty)
        if q:
            questions.append(q)

    if not questions:
        logger.warning("Quiz parser: 0 questions found. Raw:\n%s", raw_text[:400])

    return questions


def _parse_question_block(
    block: str, topic: str, difficulty: str
) -> dict[str, Any] | None:
    """Parse one MCQ block into a dict."""
    # Question text
    q_match = re.search(
        r"QUESTION\s*\d+\s*:?\s*(.*?)(?=\nA\)|\nA\.|\n\n)", block,
        re.DOTALL | re.IGNORECASE,
    )
    if q_match:
        question_text = q_match.group(1).strip()
    else:
        lines = [l.strip() for l in block.splitlines() if l.strip()]
        question_text = lines[0] if lines else ""

    if len(question_text) < 10:
        return None

    # Options
    options = []
    for letter in ("A", "B", "C", "D"):
        m = re.search(
            rf"^{letter}[)\.]\s*(.*?)(?=^[A-D][)\.]\s|^CORRECT|^EXPLANATION|$)",
            block, re.MULTILINE | re.DOTALL | re.IGNORECASE,
        )
        if m:
            text = m.group(1).strip().splitlines()[0].strip()
            if text:
                options.append({"letter": letter, "text": text})

    if len(options) < 2:
        return None

    # Correct answer
    c_match = re.search(r"CORRECT\s*:?\s*([A-D])", block, re.IGNORECASE)
    correct = c_match.group(1).upper() if c_match else options[0]["letter"]
    if correct not in {o["letter"] for o in options}:
        correct = options[0]["letter"]

    # Explanation
    e_match = re.search(
        r"EXPLANATION\s*:?\s*(.*?)$", block, re.DOTALL | re.IGNORECASE
    )
    explanation = e_match.group(1).strip() if e_match else "No explanation provided."

    return {
        "question":       question_text,
        "options":        options,
        "correct_answer": correct,
        "explanation":    explanation,
        "topic":          topic,
        "difficulty":     difficulty,
    }