"""
ollama_client.py
────────────────
Single module that owns ALL communication with the local Ollama server.

Responsibilities
────────────────
• Check whether Ollama is reachable (is_available).
• Send a prompt and get a raw text reply (ask).
• Validate the reply has enough words; retry once with a stricter prompt if not.
• Expose the model name as a single constant (OLLAMA_MODEL) so nothing else
  hard-codes it.

No other file imports requests or talks to localhost:11434.
"""

from __future__ import annotations

import logging
import os
import time
from typing import Optional

import requests

logger = logging.getLogger(__name__)

# ── Configuration ─────────────────────────────────────────────────────────────
OLLAMA_BASE_URL: str = os.getenv("OLLAMA_URL", "http://localhost:11434")
OLLAMA_MODEL:    str = os.getenv("OLLAMA_MODEL", "llama3")   # change to mistral / phi3 if needed

# Timeouts (seconds)
CONNECT_TIMEOUT  = 3
RESPONSE_TIMEOUT = 120   # LLM can be slow; give it 2 minutes

# Quality gate: if the reply has fewer words than this we retry once
MIN_WORD_COUNT = 80


# ── Availability check ────────────────────────────────────────────────────────

def is_available() -> bool:
    """
    Return True if the Ollama server is reachable.
    Used by startup and by the /api/status endpoint.
    """
    try:
        r = requests.get(f"{OLLAMA_BASE_URL}/api/tags",
                         timeout=CONNECT_TIMEOUT)
        return r.status_code == 200
    except Exception:
        return False


# ── Core ask function ─────────────────────────────────────────────────────────

def ask(prompt: str, *, retry_if_short: bool = True) -> Optional[str]:
    """
    Send `prompt` to Ollama and return the model's text response.

    Parameters
    ----------
    prompt          : The full prompt string to send.
    retry_if_short  : If True and the reply has < MIN_WORD_COUNT words,
                      append "Please give a longer, more detailed answer."
                      and call the model once more.

    Returns
    -------
    str  – The model reply (stripped).
    None – If the server is unreachable or returns an error.
    """
    payload = {
        "model":  OLLAMA_MODEL,
        "prompt": prompt,
        "stream": False,           # we want the full reply at once
    }

    try:
        t0 = time.perf_counter()
        response = requests.post(
            f"{OLLAMA_BASE_URL}/api/generate",
            json=payload,
            timeout=(CONNECT_TIMEOUT, RESPONSE_TIMEOUT),
        )
        elapsed = time.perf_counter() - t0

        if response.status_code != 200:
            logger.error("Ollama returned HTTP %d: %s",
                         response.status_code, response.text[:200])
            return None

        text = response.json().get("response", "").strip()
        word_count = len(text.split())
        logger.info("Ollama reply: %d words  (%.1fs)", word_count, elapsed)

        # ── Quality gate: retry once if reply is too short ────────────────────
        if retry_if_short and word_count < MIN_WORD_COUNT:
            logger.info("Reply too short (%d words) – retrying with stricter prompt.",
                        word_count)
            longer_prompt = (
                prompt
                + "\n\nIMPORTANT: Your previous answer was too brief. "
                  "Please provide a detailed explanation with at least 120 words, "
                  "including a clear definition, step-by-step breakdown, "
                  "and a practical example."
            )
            retry_response = requests.post(
                f"{OLLAMA_BASE_URL}/api/generate",
                json={**payload, "prompt": longer_prompt},
                timeout=(CONNECT_TIMEOUT, RESPONSE_TIMEOUT),
            )
            if retry_response.status_code == 200:
                retry_text = retry_response.json().get("response", "").strip()
                if len(retry_text.split()) > word_count:
                    logger.info("Retry produced longer answer (%d words).",
                                len(retry_text.split()))
                    return retry_text

        return text if text else None

    except requests.exceptions.ConnectionError:
        logger.error("Ollama is not running.  Start it with: ollama serve")
        return None
    except requests.exceptions.Timeout:
        logger.error("Ollama request timed out after %ds.", RESPONSE_TIMEOUT)
        return None
    except Exception as exc:
        logger.exception("Unexpected error calling Ollama: %s", exc)
        return None