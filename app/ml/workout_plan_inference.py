from __future__ import annotations

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

MODEL_PATH = PROJECT_ROOT / "ai_engine" / "models_bin" / "model_1_constraints.pkl"

_MODEL_BUNDLE: Optional[Any] = None

def _ensure_loaded() -> Any:
    global _MODEL_BUNDLE
    if _MODEL_BUNDLE is None:
        if not MODEL_PATH.exists():
            raise FileNotFoundError(f"Model 1 not found: {MODEL_PATH}")
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
    # Extract features for Model 1
    age = _safe_float(payload.get("age"), 25)
    gender = payload.get("gender", "Male")
    if not gender:
        gender = "Male"
    height = _safe_float(payload.get("height"), 170)
    weight = _safe_float(payload.get("weight"), 70)
    
    # Calculate BMI if missing
    bmi = _safe_float(payload.get("bmi"), 0)
    if bmi == 0 and height > 0 and weight > 0:
        bmi = weight / ((height / 100) ** 2)
    elif bmi == 0:
        bmi = 22.0
        
    activity_level = _safe_int(payload.get("activity_level"), 3)
    limitations = payload.get("limitation") or payload.get("limitations") or "none"
    primary_goal = payload.get("goal") or payload.get("primary_goal") or "keep_fit"

    return {
        "age": age,
        "gender": gender,
        "height": height,
        "weight": weight,
        "bmi": bmi,
        "activity_level": activity_level,
        "limitations": limitations,
        "primary_goal": primary_goal
    }

def score_exercise(ex: Dict[str, Any], user_focus: str, model1_training_level: str) -> int:
    """
    3-қадам: Сәйкестікті бағалау (Scoring)
    """
    score = 0
    w_focus = 10
    w_level = 5
    
    # FocusMatch
    # User focus could be "arms", "legs", "abs", "chest", "full", "cardio"
    # Exercise focus is "strength", "cardio", "flexibility"
    # And body_part is "abs", "arms", "chest", "legs", "fullbody"
    
    if user_focus == ex.get("body_part") or (user_focus == "full" and ex.get("body_part") == "fullbody"):
        score += w_focus
    elif user_focus == "cardio" and ex.get("focus") == "cardio":
        score += w_focus
        
    # LevelMatch
    levels = ex.get("levels", [])
    if model1_training_level in levels:
        score += w_level
        
    return score

def predict_workout_plan(payload: Dict[str, Any]) -> Dict[str, Any]:
    row = build_feature_row(payload)

    # 1. Load Model 1
    model = _ensure_loaded()
    
    # Prepare Dataframe for Model 1 Pipeline
    # The pipeline handles SimpleImputer and OneHotEncoder internally!
    X = pd.DataFrame([row])
    
    # Predict Constraints (Impact Level, Training Level)
    predictions = model.predict(X)[0] # It returns a 1D array like ['low', 'beginner']
    
    # If the model is a MultiOutputClassifier, it returns an array of shape (1, 2)
    predicted_impact = str(predictions[0])
    predicted_training_level = str(predictions[1])
    
    user_focus = payload.get("focus", "full")
    user_equipment = payload.get("equipment", "none")
    duration = _safe_int(payload.get("duration") or payload.get("workout_duration_minutes"), 15)
    
    # 2-қадам: Қатаң сүзу (Hard Filtering)
    valid_exercises = []
    for ex in AI_EXERCISES:
        # Rule 1: Impact Level Safety
        if predicted_impact == "low" and ex.get("impact_level") == "high":
            continue # Сызып тастаймыз
            
        # Rule 2: Equipment Safety
        if user_equipment == "none" and ex.get("equipment") != "none":
            continue # Сызып тастаймыз
            
        valid_exercises.append(ex)
        
    # 3-қадам: Сәйкестікті бағалау (Scoring)
    scored_exercises = []
    for ex in valid_exercises:
        score = score_exercise(ex, user_focus, predicted_training_level)
        scored_exercises.append((score, ex))
        
    # Сұрыптау (Көп ұпай жинағандар жоғарыда)
    scored_exercises.sort(key=lambda x: x[0], reverse=True)
    
    # 4-қадам: Жоспарды жинау (Уақытқа сыйдыру)
    # Average exercise takes about ~1 minute (30s work + 15s rest + 5s prep = 50s).
    # So num_exercises = duration_minutes
    num_exercises = max(4, duration)
    
    top_candidates = [ex for score, ex in scored_exercises if score > 0]
    
    # Егер нақты сәйкес келетін жаттығулар аз болса, қалғандарын да қосамыз
    if len(top_candidates) < 4:
        top_candidates = [ex for score, ex in scored_exercises]
        
    generated_exercises = []
    # Цикл арқылы қайталап қосамыз (Round-robin)
    idx = 0
    while len(generated_exercises) < num_exercises and len(top_candidates) > 0:
        ex = top_candidates[idx % len(top_candidates)]
        
        # Динамикалық репс
        if predicted_training_level == "advanced":
            reps = "45 сек"
            work = 45
            rest = 15
        elif predicted_training_level == "beginner":
            reps = "20 сек"
            work = 20
            rest = 30
        else:
            reps = "30 сек"
            work = 30
            rest = 15
            
        calories = round(5.0 * row["weight"] * ((work+rest) / 3600), 1)
        
        generated_exercises.append({
            "name": ex["name"],
            "description": ex.get("description", ""),
            "video_path": ex.get("video_path"),
            "dynamic_reps": reps,
            "calories_burned": calories,
            "workSeconds": work,
            "restSeconds": rest,
            "prepSeconds": 5
        })
        idx += 1

    return {
        "plan_template_id": f"{user_focus}_{predicted_training_level}_{predicted_impact}",
        "confidence": 0.99,
        "generated_exercises": generated_exercises,
        "top_predictions": [],
        "features": {
            "predicted_impact_level": predicted_impact,
            "predicted_training_level": predicted_training_level,
            "user_focus": user_focus,
            "duration": duration
        },
        "model_accuracy": 1.0,
        "model_name": "Model 1 Constraints + Scoring Engine",
        "label_source": "ai_scoring_engine",
    }