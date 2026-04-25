from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Dict, Optional

import joblib
import pandas as pd


BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parent.parent

MODEL_PATH = PROJECT_ROOT / "ai_engine" / "models_bin" / "squat_pose_rf.pkl"
FEATURES_PATH = PROJECT_ROOT / "ai_engine" / "models_bin" / "squat_pose_feature_columns.json"

_MODEL_BUNDLE: Optional[dict] = None
_FEATURE_COLUMNS: Optional[list[str]] = None


def _ensure_loaded():
    global _MODEL_BUNDLE, _FEATURE_COLUMNS

    if _MODEL_BUNDLE is None:
        if not MODEL_PATH.exists():
            raise FileNotFoundError(f"Не найдена модель squat: {MODEL_PATH}")
        _MODEL_BUNDLE = joblib.load(MODEL_PATH)

    if _FEATURE_COLUMNS is None:
        if not FEATURES_PATH.exists():
            raise FileNotFoundError(f"Не найден файл признаков squat: {FEATURES_PATH}")
        with open(FEATURES_PATH, "r", encoding="utf-8") as f:
            _FEATURE_COLUMNS = json.load(f)


def _build_feature_row(features_json: Dict[str, Any]) -> pd.DataFrame:
    _ensure_loaded()

    row = {}
    for col in _FEATURE_COLUMNS:
        value = features_json.get(col)
        row[col] = value

    return pd.DataFrame([row], columns=_FEATURE_COLUMNS)


def evaluate_squat_features(features_json: Dict[str, Any]) -> Dict[str, Any]:
    _ensure_loaded()

    model = _MODEL_BUNDLE["model"]
    imputer = _MODEL_BUNDLE["imputer"]

    X = _build_feature_row(features_json)
    X_imp = imputer.transform(X)

    pred = int(model.predict(X_imp)[0])

    score = None
    if hasattr(model, "predict_proba"):
        proba = model.predict_proba(X_imp)[0]
        # вероятность класса 1 = correct
        score = float(proba[1])

    is_correct = pred == 1
    error_type = None if is_correct else "ml_wrong_depth"

    feedback = (
        "ML: присед засчитан."
        if is_correct
        else "ML: присед не засчитан. Похоже, глубина была недостаточной."
    )

    return {
        "is_correct": is_correct,
        "score": score,
        "error_type": error_type,
        "feedback": feedback,
        "label_source": "ml_rf_squat",
    }