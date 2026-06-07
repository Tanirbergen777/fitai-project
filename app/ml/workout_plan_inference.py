from __future__ import annotations

import os
import sys
from pathlib import Path
from typing import Any, Dict, Optional
import random

import joblib
import pandas as pd

BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parent.parent

# Add PROJECT_ROOT to sys.path so we can import exercise_catalog
if str(PROJECT_ROOT) not in sys.path:
    sys.path.append(str(PROJECT_ROOT))

from ai_engine.scripts.exercise_catalog import AI_EXERCISES

MODEL_PATH = PROJECT_ROOT / "ai_engine" / "models_bin" / "new_workout_plan_selector.pkl"

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


def build_feature_row(payload: Dict[str, Any]) -> Dict[str, Any]:
    # Extract only the 9 features required for the new model
    age = _safe_float(payload.get("age"), 25)
    gender = payload.get("gender", "Male")
    if not gender:
        gender = "Male"
    height = _safe_float(payload.get("height"), 170)
    weight = _safe_float(payload.get("weight"), 70)
    goal = payload.get("goal") or payload.get("primary_goal") or "keep_fit"
    focus = payload.get("focus") or "full"
    limitation = payload.get("limitation") or payload.get("limitations") or "none"
    intensity = payload.get("intensity") or "normal"
    duration = _safe_int(payload.get("duration") or payload.get("workout_duration_minutes"), 15)

    return {
        "age": age,
        "gender": gender,
        "height": height,
        "weight": weight,
        "goal": goal,
        "focus": focus,
        "limitations": limitation,
        "intensity": intensity,
        "duration": duration
    }


def generate_dynamic_workout(plan_template_id: str, row: Dict[str, Any]) -> list:
    """
    Dynamically fetches and parameterizes exercises from the catalog 
    based on predicted plan and user metrics (age, weight, duration).
    """
    goal = row["goal"]
    limitations = row["limitations"]
    duration = row["duration"]
    weight = row["weight"]
    age = row["age"]
    focus = row["focus"]
    intensity = row["intensity"]
    
    valid_exercises = []
    for ex in AI_EXERCISES:
        # Match goal
        if goal in ex.get("goal_tags", []):
            # Match focus (if focus is not 'full')
            if focus != "full" and focus != "cardio":
                ex_body_part = ex.get("body_part", "")
                if ex_body_part != focus and "full" not in ex_body_part:
                    continue
                    
            # Safe logic for joints limitation
            if limitations == "joints" and ("прыжки" in ex["name"].lower() or "jump" in ex["name"].lower()):
                continue
            valid_exercises.append(ex)
            
    # Fallback if too few exercises after focus filtering
    if len(valid_exercises) < 3:
        for ex in AI_EXERCISES:
            if goal in ex.get("goal_tags", []) and ex not in valid_exercises:
                valid_exercises.append(ex)
            
    # Calculate how many exercises fit in the duration (assume ~2-3 mins per exercise)
    num_exercises = max(3, duration // 3)
    
    if len(valid_exercises) > num_exercises:
        selected = random.sample(valid_exercises, num_exercises)
    else:
        selected = valid_exercises
        
    generated = []
    for ex in selected:
        # Dynamic calculation based on Age, Weight and Intensity
        if intensity == "high":
            reps = "4 подхода по 20 рет"
            rest = 20
        elif intensity == "low" or age > 50:
            reps = "2 подхода по 10 рет (жеңілдетілген)"
            rest = 45
        elif age < 18:
            reps = "2 подхода по 12 рет"
            rest = 30
        else:
            reps = "3 подхода по 15 рет"
            rest = 30
            
        # Calories = MET * weight_kg * time_hours. Assuming MET=5.0 for average resistance/cardio.
        # Time per exercise ~ 2.5 minutes
        calories = round(5.0 * weight * (2.5 / 60), 1)
        
        generated.append({
            "name": ex["name"],
            "description": ex["description"],
            "video_path": ex.get("video_path"),
            "dynamic_reps": reps,
            "calories_burned": calories,
            "rest_seconds": rest
        })
        
    return generated


def predict_workout_plan(payload: Dict[str, Any]) -> Dict[str, Any]:
    row = build_feature_row(payload)

    # KIDS SAFETY BYPASS:
    if row["age"] < 18:
        # Provide safe defaults and immediately generate a child-friendly plan
        plan_id = "kids_active_play_safe"
        return {
            "plan_template_id": plan_id,
            "confidence": 1.0,
            "generated_exercises": generate_dynamic_workout(plan_id, row),
            "top_predictions": [{"plan_template_id": plan_id, "probability": 1.0}],
            "features": row,
            "model_accuracy": 1.0,
            "model_name": "Hardcoded Rules (Kids Safety)",
            "label_source": "rule_based_child_safety",
        }

    bundle = _ensure_loaded()
    model = bundle["model"]
    numeric_features = bundle["numeric_features"]
    categorical_features = bundle["categorical_features"]
    label_encoders = bundle["label_encoders"]

    # Transform categorical values
    encoded_row = dict(row)
    for col in categorical_features:
        le = label_encoders[col]
        val = str(encoded_row[col])
        # Handle unseen labels gracefully (fallback to first class)
        if val in le.classes_:
            encoded_row[col] = le.transform([val])[0]
        else:
            encoded_row[col] = le.transform([le.classes_[0]])[0]

    feature_columns = numeric_features + categorical_features
    X = pd.DataFrame([encoded_row], columns=feature_columns)

    prediction = str(model.predict(X)[0])

    confidence = None
    top_predictions = []

    if hasattr(model, "predict_proba"):
        probabilities = model.predict_proba(X)[0]
        classes = list(model.classes_)
        pairs = sorted(zip(classes, probabilities), key=lambda item: item[1], reverse=True)
        confidence = float(pairs[0][1])
        top_predictions = [
            {"plan_template_id": str(label), "probability": float(prob)}
            for label, prob in pairs[:3]
        ]

    # Dynamically generate exercises based on prediction and features
    generated_exercises = generate_dynamic_workout(prediction, row)

    return {
        "plan_template_id": prediction,
        "confidence": confidence,
        "generated_exercises": generated_exercises,
        "top_predictions": top_predictions,
        "features": row,
        "model_accuracy": bundle.get("accuracy"),
        "model_name": "RandomForestClassifier (New Architecture)",
        "label_source": "ai_dynamic_workout_v2",
    }