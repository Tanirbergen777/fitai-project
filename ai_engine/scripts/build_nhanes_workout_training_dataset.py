import os
import random
import pandas as pd


BASE_DIR = os.path.dirname(os.path.abspath(__file__))
INPUT_PATH = os.path.join(BASE_DIR, "..", "datasets", "nhanes_workout_base.csv")
OUTPUT_PATH = os.path.join(BASE_DIR, "..", "datasets", "nhanes_workout_training_dataset.csv")


def choose_primary_goal(bmi: float) -> str:
    if bmi >= 30:
        return "lose_weight"
    if bmi < 21:
        return "gain_mass"
    return random.choices(
        ["keep_fit", "gain_mass", "lose_weight"],
        weights=[0.55, 0.20, 0.25],
        k=1
    )[0]


def choose_training_level(age: float, activity_level: int) -> str:
    if activity_level <= 1:
        return "beginner"
    if activity_level == 2:
        return random.choices(
            ["beginner", "intermediate"],
            weights=[0.55, 0.45],
            k=1
        )[0]
    if activity_level >= 4 and age < 45:
        return random.choices(
            ["intermediate", "advanced"],
            weights=[0.55, 0.45],
            k=1
        )[0]
    return "intermediate"


def choose_training_location(age: float, limitations: str) -> str:
    if limitations != "none":
        return random.choices(["home", "gym"], weights=[0.65, 0.35], k=1)[0]
    if age >= 55:
        return random.choices(["home", "gym"], weights=[0.55, 0.45], k=1)[0]
    return random.choices(["home", "gym"], weights=[0.45, 0.55], k=1)[0]


def choose_equipment(location: str) -> str:
    if location == "home":
        return random.choices(["none", "dumbbells"], weights=[0.65, 0.35], k=1)[0]
    return random.choices(["dumbbells", "machines"], weights=[0.35, 0.65], k=1)[0]


def choose_workouts_per_week(activity_level: int) -> int:
    if activity_level <= 1:
        return random.choice([2, 3])
    if activity_level == 2:
        return random.choice([3, 4])
    if activity_level == 3:
        return random.choice([4, 5])
    return random.choice([4, 5, 6])


def choose_duration(goal: str, age: float, limitations: str) -> int:
    if limitations != "none" or age >= 65:
        return random.choice([15, 20, 30])
    if goal == "lose_weight":
        return random.choice([20, 30, 45])
    if goal == "gain_mass":
        return random.choice([30, 45, 60])
    return random.choice([20, 30, 45])


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


def choose_cardio_preference(goal: str, focus: str, bmi: float) -> str:
    if goal == "lose_weight" or focus in ["fat_loss", "endurance"] or bmi >= 28:
        return random.choices(["yes", "some", "no"], weights=[0.45, 0.40, 0.15], k=1)[0]
    if goal == "gain_mass":
        return random.choices(["no", "some", "yes"], weights=[0.45, 0.40, 0.15], k=1)[0]
    return random.choices(["some", "yes", "no"], weights=[0.50, 0.25, 0.25], k=1)[0]


def choose_impact_level(age: float, limitations: str, bmi: float) -> str:
    if limitations != "none":
        return "low"
    if age >= 60 or bmi >= 32:
        return random.choices(["low", "normal"], weights=[0.6, 0.4], k=1)[0]
    if age >= 45 or bmi >= 28:
        return random.choices(["low", "normal"], weights=[0.35, 0.65], k=1)[0]
    return "normal"


def build_plan_template_id(row) -> str:
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


def main():
    df = pd.read_csv(INPUT_PATH)

    df = df.dropna(subset=["age", "gender", "height", "weight", "bmi", "activity_level"]).copy()

    df["primary_goal"] = df["bmi"].apply(choose_primary_goal)
    df["training_level"] = df.apply(
        lambda row: choose_training_level(row["age"], int(row["activity_level"])),
        axis=1
    )
    df["training_location"] = df.apply(
        lambda row: choose_training_location(row["age"], row["limitations"]),
        axis=1
    )
    df["equipment"] = df["training_location"].apply(choose_equipment)
    df["workouts_per_week"] = df["activity_level"].apply(lambda x: choose_workouts_per_week(int(x)))
    df["workout_duration_minutes"] = df.apply(
        lambda row: choose_duration(row["primary_goal"], row["age"], row["limitations"]),
        axis=1
    )
    df["training_focus"] = df["primary_goal"].apply(choose_training_focus)
    df["cardio_preference"] = df.apply(
        lambda row: choose_cardio_preference(
            row["primary_goal"],
            row["training_focus"],
            row["bmi"]
        ),
        axis=1
    )
    df["impact_level"] = df.apply(
        lambda row: choose_impact_level(
            row["age"],
            row["limitations"],
            row["bmi"]
        ),
        axis=1
    )

    df["plan_template_id"] = df.apply(build_plan_template_id, axis=1)

    result = df[
        [
            "seqn",
            "age",
            "gender",
            "height",
            "weight",
            "bmi",
            "waist",
            "hip",
            "arm",
            "activity_level",
            "limitations",
            "primary_goal",
            "training_level",
            "training_location",
            "equipment",
            "workouts_per_week",
            "workout_duration_minutes",
            "training_focus",
            "cardio_preference",
            "impact_level",
            "plan_template_id",
        ]
    ].copy()

    result.to_csv(OUTPUT_PATH, index=False, encoding="utf-8")

    print("Готово.")
    print(f"Сохранено в: {OUTPUT_PATH}")
    print(f"Строк: {len(result)}")
    print(result.head(10).to_string(index=False))


if __name__ == "__main__":
    random.seed(42)
    main()