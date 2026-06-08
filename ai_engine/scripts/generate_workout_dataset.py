import csv
import os
import random
from typing import Dict


BASE_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_PATH =os.path.join(BASE_DIR, "..", "..", "ai_engine", "models_bin", "nhanes_workout_recommender_model.pkl")


def calc_bmi(weight: float, height_cm: float) -> float:
    height_m = height_cm / 100
    return round(weight / (height_m ** 2), 1)


def choose_weight_by_goal(goal: str) -> float:
    if goal == "lose_weight":
        return round(random.uniform(72, 110), 1)
    if goal == "gain_mass":
        return round(random.uniform(55, 82), 1)
    return round(random.uniform(58, 90), 1)


def choose_height() -> float:
    return round(random.uniform(155, 192), 1)


def choose_age(level: str) -> int:
    if level == "beginner":
        return random.randint(18, 42)
    if level == "intermediate":
        return random.randint(19, 38)
    return random.randint(20, 35)


def choose_equipment(location: str) -> str:
    if location == "home":
        return random.choices(
            ["none", "dumbbells"],
            weights=[0.6, 0.4],
            k=1
        )[0]
    return random.choices(
        ["dumbbells", "machines"],
        weights=[0.35, 0.65],
        k=1
    )[0]


def choose_limitations(impact_level: str) -> str:
    if impact_level == "low":
        return random.choices(
            ["none", "knees", "back", "shoulders"],
            weights=[0.35, 0.30, 0.20, 0.15],
            k=1
        )[0]
    return random.choices(
        ["none", "knees", "back", "shoulders"],
        weights=[0.75, 0.10, 0.08, 0.07],
        k=1
    )[0]


def choose_training_focus(goal: str) -> str:
    if goal == "lose_weight":
        return random.choices(
            ["fat_loss", "endurance", "strength", "muscle"],
            weights=[0.45, 0.30, 0.10, 0.15],
            k=1
        )[0]
    if goal == "gain_mass":
        return random.choices(
            ["muscle", "strength", "fat_loss", "endurance"],
            weights=[0.50, 0.35, 0.05, 0.10],
            k=1
        )[0]
    return random.choices(
        ["strength", "endurance", "muscle", "fat_loss"],
        weights=[0.30, 0.25, 0.25, 0.20],
        k=1
    )[0]


def choose_cardio_preference(goal: str, focus: str) -> str:
    if goal == "lose_weight" or focus in ["fat_loss", "endurance"]:
        return random.choices(
            ["yes", "some", "no"],
            weights=[0.45, 0.40, 0.15],
            k=1
        )[0]
    if goal == "gain_mass":
        return random.choices(
            ["no", "some", "yes"],
            weights=[0.45, 0.40, 0.15],
            k=1
        )[0]
    return random.choices(
        ["some", "yes", "no"],
        weights=[0.50, 0.25, 0.25],
        k=1
    )[0]


def choose_impact_level(limitations: str, age: int) -> str:
    if limitations in ["knees", "back"]:
        return "low"
    if age >= 34:
        return random.choices(["low", "normal"], weights=[0.4, 0.6], k=1)[0]
    return random.choices(["low", "normal"], weights=[0.2, 0.8], k=1)[0]


def build_plan_template_id(row: Dict) -> str:
    goal = row["primary_goal"]
    level = row["training_level"]
    location = row["training_location"]
    focus = row["training_focus"]
    cardio = row["cardio_preference"]
    impact = row["impact_level"]

    if goal == "lose_weight":
        if location == "home" and level == "beginner" and impact == "low":
            return "fat_loss_home_beginner_low"
        if cardio == "yes":
            return "fat_loss_cardio_focus"
        return "fat_loss_general"

    if goal == "gain_mass":
        if location == "gym" and level in ["intermediate", "advanced"]:
            return "muscle_gym_progressive"
        if location == "home":
            return "muscle_home_basic"
        return "muscle_general"

    if goal == "keep_fit":
        if focus == "endurance":
            return "keep_fit_endurance"
        if impact == "low":
            return "keep_fit_low_impact"
        return "keep_fit_balanced"

    return "general_template"


def generate_row() -> Dict:
    primary_goal = random.choice(["lose_weight", "gain_mass", "keep_fit"])
    training_level = random.choices(
        ["beginner", "intermediate", "advanced"],
        weights=[0.45, 0.35, 0.20],
        k=1
    )[0]
    training_location = random.choice(["home", "gym"])
    gender = random.choice(["Male", "Female"])

    age = choose_age(training_level)
    height = choose_height()
    weight = choose_weight_by_goal(primary_goal)
    bmi = calc_bmi(weight, height)

    workouts_per_week = random.choice([2, 3, 4, 5, 6])
    workout_duration_minutes = random.choice([15, 20, 30, 45, 60])

    equipment = choose_equipment(training_location)
    training_focus = choose_training_focus(primary_goal)
    cardio_preference = choose_cardio_preference(primary_goal, training_focus)

    # временно limitations сначала выбираем грубо
    temp_limitations = random.choice(["none", "knees", "back", "shoulders"])
    impact_level = choose_impact_level(temp_limitations, age)
    limitations = choose_limitations(impact_level)

    row = {
        "age": age,
        "gender": gender,
        "height": height,
        "weight": weight,
        "bmi": bmi,
        "primary_goal": primary_goal,
        "training_level": training_level,
        "training_location": training_location,
        "equipment": equipment,
        "workouts_per_week": workouts_per_week,
        "workout_duration_minutes": workout_duration_minutes,
        "limitations": limitations,
        "training_focus": training_focus,
        "cardio_preference": cardio_preference,
        "impact_level": impact_level,
    }

    row["plan_template_id"] = build_plan_template_id(row)
    return row


def generate_dataset(num_rows: int = 500) -> None:
    fieldnames = [
        "age",
        "gender",
        "height",
        "weight",
        "bmi",
        "primary_goal",
        "training_level",
        "training_location",
        "equipment",
        "workouts_per_week",
        "workout_duration_minutes",
        "limitations",
        "training_focus",
        "cardio_preference",
        "impact_level",
        "plan_template_id",
    ]

    rows = [generate_row() for _ in range(num_rows)]

    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)

    with open(OUTPUT_PATH, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

    print(f"Готово. Сгенерирован датасет: {OUTPUT_PATH}")
    print(f"Количество строк: {len(rows)}")


if __name__ == "__main__":
    random.seed(42)
    generate_dataset(500)