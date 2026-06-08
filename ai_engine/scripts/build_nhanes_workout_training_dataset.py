import os
import pandas as pd


BASE_DIR = os.path.dirname(os.path.abspath(__file__))
INPUT_PATH = os.path.join(BASE_DIR, "..", "datasets", "nhanes_workout_base.csv")
OUTPUT_PATH = os.path.join(BASE_DIR, "..", "datasets", "nhanes_workout_training_dataset.csv")


def choose_primary_goal(bmi: float) -> str:
    if bmi >= 26:
        return "lose_weight"
    if bmi < 21:
        return "gain_mass"
    return "keep_fit"


def choose_training_level(age: float, activity_level: int) -> str:
    if activity_level <= 1:
        return "beginner"
    if activity_level >= 3 and age < 45:
        return "advanced"
    return "intermediate"


def choose_training_location(age: float, limitations: str) -> str:
    if limitations != "none" or age >= 55:
        return "home"
    return "gym"


def choose_equipment(location: str) -> str:
    if location == "home":
        return "none"
    return "machines"


def choose_workouts_per_week(activity_level: int) -> int:
    if activity_level <= 1:
        return 2
    if activity_level == 2:
        return 3
    if activity_level == 3:
        return 4
    return 5


def choose_duration(goal: str, age: float, limitations: str) -> int:
    if limitations != "none" or age >= 60:
        return 20
    if goal == "lose_weight":
        return 45
    if goal == "gain_mass":
        return 60
    return 30


def choose_training_focus(goal: str) -> str:
    if goal == "lose_weight":
        return "fat_loss"
    if goal == "gain_mass":
        return "muscle"
    return "endurance"


def choose_cardio_preference(goal: str, focus: str, bmi: float) -> str:
    if goal == "lose_weight" or bmi >= 28:
        return "yes"
    if goal == "gain_mass":
        return "no"
    return "some"


def choose_impact_level(age: float, limitations: str, bmi: float) -> str:
    if limitations != "none" or age >= 50 or bmi >= 30:
        return "low"
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


if __name__ == "__main__":
    main()