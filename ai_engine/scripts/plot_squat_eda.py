import os
from pathlib import Path

import matplotlib.pyplot as plt
import pandas as pd

BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parent.parent

DATA_PATH = PROJECT_ROOT / "ai_engine" / "datasets" / "video_pose_frames.csv"
OUTPUT_DIR = PROJECT_ROOT / "ai_engine" / "inference_outputs"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


def pick_feature(feature_columns):
    preferred = [
        "feature_left_elbow_angle",
        "feature_right_elbow_angle",
        "feature_left_knee_angle",
        "feature_right_knee_angle",
        "feature_left_hip_angle",
        "feature_right_hip_angle",
    ]
    for name in preferred:
        if name in feature_columns:
            return name
    return feature_columns[0] if feature_columns else None


def main():
    if not DATA_PATH.exists():
        raise FileNotFoundError(f"Dataset not found: {DATA_PATH}")

    df = pd.read_csv(DATA_PATH)

    # тек squat
    df = df[df["exercise_name"] == "squat"].copy()
    if df.empty:
        raise ValueError("No rows found for exercise_name='squat'")

    if "target_is_correct" not in df.columns:
        raise ValueError("Column target_is_correct not found")

    # feature columns
    feature_columns = [
        col for col in df.columns
        if col.startswith("feature_") or col.startswith("lm_") or col.startswith("wlm_")
    ]

    if not feature_columns:
        raise ValueError("No feature columns found")

    # -----------------------------
    # 1) Class distribution by video
    # -----------------------------
    if "video_name" in df.columns:
        video_labels = (
            df.groupby("video_name", as_index=False)["target_is_correct"]
            .first()
            .copy()
        )
        class_counts = video_labels["target_is_correct"].value_counts().sort_index()
    else:
        class_counts = df["target_is_correct"].value_counts().sort_index()

    labels = ["Wrong", "Correct"]
    values = [
        int(class_counts.get(0, 0)),
        int(class_counts.get(1, 0)),
    ]

    plt.figure(figsize=(7, 5))
    plt.bar(labels, values)
    plt.title("Squat Class Distribution")
    plt.ylabel("Count")
    plt.tight_layout()
    plt.savefig(OUTPUT_DIR / "squat_class_distribution.png", dpi=200)
    plt.close()

    # -----------------------------
    # 2) Missing values summary
    # -----------------------------
    missing = df[feature_columns].isna().sum()
    missing = missing[missing > 0].sort_values(ascending=False).head(15)

    plt.figure(figsize=(10, 6))
    if len(missing) > 0:
        plt.barh(missing.index[::-1], missing.values[::-1])
        plt.title("Missing Values by Feature")
        plt.xlabel("Missing count")
    else:
        plt.text(0.5, 0.5, "No missing values in selected features",
                 ha="center", va="center", fontsize=14)
        plt.title("Missing Values by Feature")
        plt.axis("off")
    plt.tight_layout()
    plt.savefig(OUTPUT_DIR / "squat_missing_values.png", dpi=200)
    plt.close()

    # -----------------------------
    # 3) Histogram of one feature
    # -----------------------------
    chosen_feature = pick_feature(feature_columns)
    if chosen_feature is None:
        raise ValueError("Could not choose a feature for histogram")

    series = df[chosen_feature].dropna()

    plt.figure(figsize=(8, 5))
    plt.hist(series, bins=30)
    plt.title(f"Feature Distribution: {chosen_feature}")
    plt.xlabel(chosen_feature)
    plt.ylabel("Frequency")
    plt.tight_layout()
    plt.savefig(OUTPUT_DIR / "squat_feature_histogram.png", dpi=200)
    plt.close()

    # -----------------------------
    # 4) Boxplot by class
    # -----------------------------
    wrong_values = df[df["target_is_correct"] == 0][chosen_feature].dropna()
    correct_values = df[df["target_is_correct"] == 1][chosen_feature].dropna()

    plt.figure(figsize=(7, 5))
    plt.boxplot([wrong_values, correct_values], labels=["Wrong", "Correct"])
    plt.title(f"Feature Spread by Class: {chosen_feature}")
    plt.ylabel(chosen_feature)
    plt.tight_layout()
    plt.savefig(OUTPUT_DIR / "squat_feature_boxplot.png", dpi=200)
    plt.close()

    print("Saved files:")
    print(OUTPUT_DIR / "squat_class_distribution.png")
    print(OUTPUT_DIR / "squat_missing_values.png")
    print(OUTPUT_DIR / "squat_feature_histogram.png")
    print(OUTPUT_DIR / "squat_feature_boxplot.png")


if __name__ == "__main__":
    main()