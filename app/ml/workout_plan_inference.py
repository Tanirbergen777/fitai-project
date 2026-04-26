from __future__ import annotations

from pathlib import Path
from typing import Any, Dict, Optional

import joblib
import pandas as pd


BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parent.parent

MODEL_PATH = PROJECT_ROOT / "ai_engine" / "models_bin" / "workout_plan_selector.pkl"

_MODEL_BUNDLE: Optional[dict] = None


def _ensure_loaded() -> dict:
    global _MODEL_BUNDLE

    if _MODEL_BUNDLE is None:
        if not MODEL_PATH.exists():
            raise FileNotFoundError(f"Workout plan model not found: {MODEL_PATH}")

        _MODEL_BUNDLE = joblib.load(MODEL_PATH)

    return _MODEL_BUNDLE


def _safe_float(value: Any, default: float) -> float:
    try:
        if value is None or value == "":
            return default
        return float(value)
    except Exception:
        return default


def _safe_int(value: Any, default: int) -> int:
    try:
        if value is None or value == "":
            return default
        return int(value)
    except Exception:
        return default


def _calc_bmi(weight: float, height: float) -> float:
    if height <= 0:
        return 24.0

    h = height / 100
    return round(weight / (h * h), 2)


def _map_focus(goal: str, focus: str) -> str:
    if focus == "cardio":
        return "endurance"

    if goal == "lose_weight":
        if focus in ["full", "legs", "abs"]:
            return "fat_loss"
        return "endurance"

    if goal == "gain_mass":
        if focus in ["chest", "arms", "legs", "full"]:
            return "muscle"
        return "strength"

    if focus == "cardio":
        return "endurance"

    if focus in ["chest", "arms", "legs"]:
        return "strength"

    return "strength"


def _map_activity_level(training_level: str) -> int:
    if training_level == "beginner":
        return 1
    if training_level == "intermediate":
        return 3
    if training_level == "advanced":
        return 4
    return 2


def _map_workouts_per_week(training_level: str, duration: int) -> int:
    if training_level == "beginner":
        return 3
    if training_level == "intermediate":
        return 4
    if duration >= 45:
        return 5
    return 4


def build_feature_row(payload: Dict[str, Any]) -> Dict[str, Any]:
    goal = payload.get("goal") or payload.get("primary_goal") or "keep_fit"
    level = payload.get("level") or payload.get("training_level") or "beginner"
    duration = _safe_int(payload.get("duration") or payload.get("workout_duration_minutes"), 15)
    focus = payload.get("focus") or "full"
    limitation = payload.get("limitation") or payload.get("limitations") or "none"
    cardio = payload.get("cardio") or payload.get("cardio_preference") or "some"
    location = payload.get("location") or payload.get("training_location") or "home"
    equipment = payload.get("equipment") or "none"
    intensity = payload.get("intensity") or "normal"

    age = _safe_float(payload.get("age"), 25)
    height = _safe_float(payload.get("height"), 170)
    weight = _safe_float(payload.get("weight"), 70)
    bmi = _safe_float(payload.get("bmi"), _calc_bmi(weight, height))

    impact_level = "low" if limitation != "none" or intensity == "low" else "normal"

    return {
        "age": age,
        "gender": payload.get("gender") or "unknown",
        "height": height,
        "weight": weight,
        "bmi": bmi,
        "waist": _safe_float(payload.get("waist"), 0),
        "hip": _safe_float(payload.get("hip"), 0),
        "arm": _safe_float(payload.get("arm"), 0),
        "activity_level": _map_activity_level(level),
        "limitations": limitation,
        "primary_goal": goal,
        "training_level": level,
        "training_location": location,
        "equipment": equipment,
        "workouts_per_week": _map_workouts_per_week(level, duration),
        "workout_duration_minutes": duration,
        "training_focus": _map_focus(goal, focus),
        "cardio_preference": cardio,
        "impact_level": impact_level,
    }


def predict_workout_plan(payload: Dict[str, Any]) -> Dict[str, Any]:
    bundle = _ensure_loaded()

    model = bundle["model"]
    numeric_features = bundle["numeric_features"]
    categorical_features = bundle["categorical_features"]
    feature_columns = numeric_features + categorical_features

    row = build_feature_row(payload)
    X = pd.DataFrame([row], columns=feature_columns)

    prediction = str(model.predict(X)[0])

    confidence = None
    top_predictions = []

    if hasattr(model, "predict_proba"):
        probabilities = model.predict_proba(X)[0]
        classes = list(model.classes_)

        pairs = sorted(
            zip(classes, probabilities),
            key=lambda item: item[1],
            reverse=True,
        )

        confidence = float(pairs[0][1])

        top_predictions = [
            {
                "plan_template_id": str(label),
                "probability": float(prob),
            }
            for label, prob in pairs[:3]
        ]

    return {
        "plan_template_id": prediction,
        "confidence": confidence,
        "top_predictions": top_predictions,
        "features": row,
        "model_accuracy": bundle.get("accuracy"),
        "model_name": "RandomForestClassifier workout_plan_selector",
        "label_source": "ml_nhanes_workout_plan",
    }