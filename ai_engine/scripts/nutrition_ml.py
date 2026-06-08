from pathlib import Path
from typing import Dict, Any
import joblib
import pandas as pd

MODEL_PATH = Path(__file__).resolve().parent.parent / "models_bin" / "nutrition_recommender.pkl"

_model = None


def load_nutrition_model():
    global _model
    if _model is None:
        _model = joblib.load(MODEL_PATH)
    return _model


def build_feature_row(
    food: Dict[str, Any],
    goal: str,
    meal_slot: str,
    budget: str,
    late_meals: str,
    cooking_mode: str,
    meals_per_day: int,
    preference: str,
    allergy: str,
    already_selected_today: int,
):
    return {
        "food_id": food["id"],
        "goal": goal,
        "meal_slot": meal_slot,
        "budget": budget,
        "late_meals": late_meals,
        "cooking_mode": cooking_mode,
        "meals_per_day": meals_per_day,
        "preference": preference,
        "allergy": allergy,
        "already_selected_today": already_selected_today,
        "calories": food["calories"],
        "protein": food["protein"],
        "fat": food["fat"],
        "carbs": food["carbs"],
        "is_breakfast_food": int("breakfast" in food["meal_slots"]),
        "is_lunch_food": int("lunch" in food["meal_slots"]),
        "is_snack_food": int("snack" in food["meal_slots"]),
        "is_dinner_food": int("dinner" in food["meal_slots"]),
        "is_late_food": int("late" in food["meal_slots"]),
        "matches_preference": int(preference != "none" and preference in food["preference_tags"]),
        "has_allergy_conflict": int(allergy != "none" and allergy in food["allergens"]),
    }


def predict_food_probability(feature_row: Dict[str, Any]) -> float:
    model = load_nutrition_model()
    X = pd.DataFrame([feature_row])
    proba = model.predict_proba(X)[0][1]
    return float(proba)