from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Dict, Optional, Tuple

import joblib
import pandas as pd

BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parent.parent

MODEL_PATH = PROJECT_ROOT / "ai_engine" / "models_bin" / "squat_pose_rf.pkl"
FEATURES_PATH = PROJECT_ROOT / "ai_engine" / "models_bin" / "squat_pose_feature_columns.json"

_MODEL_BUNDLE: Optional[Any] = None
_FEATURE_COLUMNS: Optional[list[str]] = None


def _to_number(value: Any) -> float | None:
    if value is None:
        return None

    if isinstance(value, bool):
        return float(int(value))

    if isinstance(value, (int, float)):
        return float(value)

    try:
        text = str(value).replace(",", ".").strip()
        if text == "":
            return None
        return float(text)
    except Exception:
        return None


def _load_feature_columns_from_bundle(bundle: Any) -> list[str] | None:
    if isinstance(bundle, dict):
        for key in ["feature_columns", "features", "columns", "feature_names"]:
            columns = bundle.get(key)
            if isinstance(columns, list) and columns:
                return [str(col) for col in columns]
    return None


def _ensure_loaded() -> Tuple[Any, Any, list[str]]:
    global _MODEL_BUNDLE, _FEATURE_COLUMNS

    if _MODEL_BUNDLE is None:
        if not MODEL_PATH.exists():
            raise FileNotFoundError(f"Не найдена модель squat: {MODEL_PATH}")
        _MODEL_BUNDLE = joblib.load(MODEL_PATH)

    if _FEATURE_COLUMNS is None:
        bundle_columns = _load_feature_columns_from_bundle(_MODEL_BUNDLE)

        if bundle_columns:
            _FEATURE_COLUMNS = bundle_columns
        else:
            if not FEATURES_PATH.exists():
                raise FileNotFoundError(f"Не найден файл признаков squat: {FEATURES_PATH}")
            with open(FEATURES_PATH, "r", encoding="utf-8") as f:
                loaded = json.load(f)

            if isinstance(loaded, dict):
                loaded = loaded.get("feature_columns") or loaded.get("columns") or loaded.get("features")

            if not isinstance(loaded, list) or not loaded:
                raise ValueError("squat_pose_feature_columns.json должен содержать список признаков")

            _FEATURE_COLUMNS = [str(col) for col in loaded]

    if isinstance(_MODEL_BUNDLE, dict):
        model = _MODEL_BUNDLE.get("model") or _MODEL_BUNDLE.get("classifier") or _MODEL_BUNDLE.get("pipeline")
        imputer = _MODEL_BUNDLE.get("imputer")
    else:
        model = _MODEL_BUNDLE
        imputer = None

    if model is None:
        raise ValueError("В squat_pose_rf.pkl не найден ключ model/classifier/pipeline")

    return model, imputer, _FEATURE_COLUMNS


def _build_feature_row(features_json: Dict[str, Any]) -> pd.DataFrame:
    _, _, feature_columns = _ensure_loaded()

    row = {}
    for col in feature_columns:
        row[col] = _to_number(features_json.get(col))

    return pd.DataFrame([row], columns=feature_columns)


def _predict_class_probability(model: Any, X) -> tuple[int, float | None]:
    pred = int(model.predict(X)[0])

    score = None
    if hasattr(model, "predict_proba"):
        proba = model.predict_proba(X)[0]
        classes = list(getattr(model, "classes_", []))

        if 1 in classes:
            score = float(proba[classes.index(1)])
        elif "1" in classes:
            score = float(proba[classes.index("1")])
        elif len(proba) > 1:
            score = float(proba[1])
        elif len(proba) == 1:
            score = float(proba[0])

    return pred, score


def _rule_fallback(features_json: Dict[str, Any], reason: str = "ml_runtime_fallback") -> Dict[str, Any]:
    left_knee = _to_number(features_json.get("left_knee_angle"))
    right_knee = _to_number(features_json.get("right_knee_angle"))
    knee_values = [v for v in [left_knee, right_knee] if v is not None]

    if knee_values:
        knee_angle = min(knee_values)
        is_correct = knee_angle <= 115
        score = max(0.05, min(0.95, (130 - knee_angle) / 55))
    else:
        is_correct = False
        score = 0.35

    return {
        "is_correct": bool(is_correct),
        "score": float(round(score, 4)),
        "error_type": None if is_correct else "rule_not_deep_enough",
        "feedback": (
            "Fallback: присед засчитан."
            if is_correct
            else "Fallback: присед не засчитан. Нужно опуститься чуть ниже."
        ),
        "label_source": reason,
    }


def evaluate_squat_features(features_json: Dict[str, Any]) -> Dict[str, Any]:
    if not isinstance(features_json, dict) or not features_json:
        return _rule_fallback({}, "empty_features_fallback")

    try:
        model, imputer, _ = _ensure_loaded()
        X = _build_feature_row(features_json)

        if imputer is not None:
            X_for_model = imputer.transform(X)
        else:
            X_for_model = X.fillna(0)

        pred, score = _predict_class_probability(model, X_for_model)
        is_correct = pred == 1

        return {
            "is_correct": bool(is_correct),
            "score": score,
            "error_type": None if is_correct else "ml_wrong_depth",
            "feedback": (
                "ML: присед засчитан."
                if is_correct
                else "ML: присед не засчитан. Похоже, глубина была недостаточной."
            ),
            "label_source": "ml_rf_squat",
        }

    except Exception as error:
        fallback = _rule_fallback(features_json, "backend_rule_fallback")
        fallback["feedback"] = f"{fallback['feedback']} ML уақытша fallback режимінде: {error}"
        return fallback