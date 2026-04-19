"""
models.py – One-time model loading at application startup.

Models are loaded into a module-level dict during the FastAPI lifespan handler.
Every subsequent request reads from memory — no disk I/O per request.

Required files (place in models/ subfolder):
  models/tfidf_vectorizer.pkl
  models/tfidf_matrix.pkl
  models/qa_dataframe.pkl
  models/score_predictor.pkl
"""

import os
import joblib
import logging

from fastapi import HTTPException

logger = logging.getLogger(__name__)

_MODELS: dict = {}

MODEL_FILES = {
    "vectorizer":      "models/tfidf_vectorizer.pkl",
    "tfidf_matrix":    "models/tfidf_matrix.pkl",
    "qa_df":           "models/qa_dataframe.pkl",
    "score_predictor": "models/score_predictor.pkl",
}


def load_all_models() -> None:
    """Load every .pkl file once. Raises FileNotFoundError immediately if any is missing."""
    missing = [path for path in MODEL_FILES.values() if not os.path.exists(path)]
    if missing:
        msg = (
            "Missing model files:\n"
            + "\n".join(f"  • {p}" for p in missing)
            + "\n\nPlace all .pkl files in the models/ folder and restart."
        )
        logger.error(msg)
        raise FileNotFoundError(msg)

    for key, path in MODEL_FILES.items():
        logger.info("Loading %-20s ← %s", key, path)
        _MODELS[key] = joblib.load(path)

    logger.info("All %d model files loaded into memory.", len(_MODELS))


def get_models() -> dict:
    """Return the loaded model registry. Raises HTTP 503 if not yet loaded."""
    if not _MODELS:
        raise HTTPException(
            status_code=503,
            detail="Models are not loaded. The service may still be starting.",
        )
    return _MODELS