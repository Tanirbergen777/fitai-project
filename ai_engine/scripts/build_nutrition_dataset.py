from pathlib import Path
from itertools import product
import csv
import random

from nutrition_catalog import NUTRITION_CATALOG

GOALS = ["gain_mass", "lose_weight", "keep_fit"]
MEAL_SLOTS = ["breakfast", "lunch", "snack", "dinner", "late"]
BUDGETS = ["low", "medium", "high"]
LATE_MEALS_OPTIONS = ["avoid", "sometimes", "okay"]
COOKING_MODES = ["cook", "order", "both"]
MEALS_PER_DAY_OPTIONS = [3, 4, 5, 6]

PREFERENCE_OPTIONS = [
    "none",
    "high_protein",
    "balanced",
    "low_carb",
    "quick_meals",
    "no_sugar",
    "vegetarian",
]

ALLERGY_OPTIONS = [
    "none",
    "nuts",
    "milk",
    "eggs",
    "gluten",
    "fish",
]

OUTPUT_PATH = Path(__file__).resolve().parent.parent / "datasets" / "nutrition_recommendation_data.csv"


def calculate_rule_label(
    food: dict,
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
    score = 0

    if goal in food["goal_tags"]:
        score += 4
    else:
        score -= 4

    if meal_slot == "late":
        if any(slot in food["meal_slots"] for slot in ["late", "snack", "dinner"]):
            score += 3
        else:
            score -= 4
    else:
        if meal_slot in food["meal_slots"]:
            score += 3
        else:
            score -= 3

    if preference != "none":
        if preference in food["preference_tags"]:
            score += 2
        else:
            score -= 1

    if allergy != "none" and allergy in food["allergens"]:
        score -= 8

    if already_selected_today == 1:
        score -= 5

    if meal_slot == "late":
        if food["calories"] > 400:
            score -= 3
        if late_meals == "avoid":
            score -= 1

    if goal == "lose_weight":
        if food["calories"] <= 350:
            score += 2
        if food["calories"] > 500:
            score -= 3
        if food["protein"] >= 20:
            score += 1

    if goal == "gain_mass":
        if food["calories"] >= 500:
            score += 2
        if food["protein"] >= 20:
            score += 1
        if food["calories"] < 250:
            score -= 2

    if goal == "keep_fit":
        if 250 <= food["calories"] <= 500:
            score += 2
        if food["protein"] >= 18:
            score += 1

    if preference == "low_carb":
        if food["carbs"] <= 25:
            score += 2
        else:
            score -= 2

    if preference == "high_protein":
        if food["protein"] >= 20:
            score += 2
        else:
            score -= 2

    if preference == "no_sugar":
        if food["calories"] < 350:
            score += 1

    if preference == "quick_meals":
        if "quick_meals" in food["preference_tags"]:
            score += 1

    if preference == "vegetarian":
        vegetarian_hint_words = [
            "каша", "йогурт", "творог", "омлет", "сырники", "салат",
            "смузи", "хумус", "яблоко", "груша", "банан", "кефир"
        ]
        is_probably_vegetarian = any(word in food["name"].lower() for word in vegetarian_hint_words)
        if "vegetarian" in food["preference_tags"] or is_probably_vegetarian:
            score += 2
        else:
            score -= 3

    if budget == "low":
        if food["calories"] > 650:
            score -= 1

    if meals_per_day >= 5 and meal_slot == "snack":
        score += 1
    if meals_per_day <= 3 and meal_slot == "late":
        score -= 1

    label = 1 if score >= 3 else 0
    return label, score


def build_dataset():
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)

    fieldnames = [
        "food_id",
        "food_name",
        "goal",
        "meal_slot",
        "budget",
        "late_meals",
        "cooking_mode",
        "meals_per_day",
        "preference",
        "allergy",
        "already_selected_today",
        "calories",
        "protein",
        "fat",
        "carbs",
        "is_breakfast_food",
        "is_lunch_food",
        "is_snack_food",
        "is_dinner_food",
        "is_late_food",
        "matches_preference",
        "has_allergy_conflict",
        "label",
        "rule_score",
    ]

    rows = []

    for food in NUTRITION_CATALOG:
        for (
            goal,
            meal_slot,
            budget,
            late_meals,
            cooking_mode,
            meals_per_day,
            preference,
            allergy,
            already_selected_today,
        ) in product(
            GOALS,
            MEAL_SLOTS,
            BUDGETS,
            LATE_MEALS_OPTIONS,
            COOKING_MODES,
            MEALS_PER_DAY_OPTIONS,
            PREFERENCE_OPTIONS,
            ALLERGY_OPTIONS,
            [0, 1],
        ):
            label, rule_score = calculate_rule_label(
                food=food,
                goal=goal,
                meal_slot=meal_slot,
                budget=budget,
                late_meals=late_meals,
                cooking_mode=cooking_mode,
                meals_per_day=meals_per_day,
                preference=preference,
                allergy=allergy,
                already_selected_today=already_selected_today,
            )

            rows.append({
                "food_id": food["id"],
                "food_name": food["name"],
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
                "label": label,
                "rule_score": rule_score,
            })

    random.shuffle(rows)

    with open(OUTPUT_PATH, "w", newline="", encoding="utf-8-sig") as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

    print(f"Готово. Датасет сохранен: {OUTPUT_PATH}")
    print(f"Всего строк: {len(rows)}")


if __name__ == "__main__":
    build_dataset()