"""
EDA скрипт — дипломдық презентация үшін графиктер жасайды.
Әр dataset бойынша:
  1. Жалпы ақпарат (shape, dtypes)
  2. Бос мәндер (Missing Values)
  3. Класс үлестірімі (Class Distribution)
  4. Гистограмма (Feature Distribution)
  5. Корреляция (Heatmap)
  6. Boxplot (Feature by Class)

Нәтижелер: ai_engine/inference_outputs/eda_presentation/ папкасына сақталады
"""

import os
from pathlib import Path

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import pandas as pd
import numpy as np
import seaborn as sns

# --- Paths ---
BASE_DIR = Path(__file__).resolve().parent.parent
DATASETS_DIR = BASE_DIR / "datasets"
OUTPUT_DIR = BASE_DIR / "inference_outputs" / "eda_presentation"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

plt.rcParams.update({
    "figure.facecolor": "white",
    "axes.facecolor": "white",
    "axes.edgecolor": "#CCCCCC",
    "axes.labelcolor": "#333333",
    "text.color": "#333333",
    "xtick.color": "#333333",
    "ytick.color": "#333333",
    "grid.color": "#EEEEEE",
    "font.size": 12,
})

ACCENT = "#2ECC71"
ACCENT2 = "#3498DB"
ACCENT3 = "#E74C3C"
ACCENT4 = "#9B59B6"


def save(fig, name):
    path = OUTPUT_DIR / f"{name}.png"
    fig.savefig(path, dpi=200, bbox_inches="tight")
    plt.close(fig)
    print(f"  ✅ {path}")


# =====================================================
# 1. NHANES WORKOUT DATASET
# =====================================================
def eda_nhanes():
    print("\n" + "=" * 60)
    print("🏋️ NHANES Workout Dataset — EDA")
    print("=" * 60)

    df = pd.read_csv(DATASETS_DIR / "nhanes_workout_training_dataset.csv")
    print(f"  Shape: {df.shape}")
    print(f"  Columns: {list(df.columns)}")

    # --- 1a. Missing values ---
    missing = df.isnull().sum()
    missing = missing[missing > 0].sort_values(ascending=False)

    fig, ax = plt.subplots(figsize=(10, 6))
    if len(missing) > 0:
        bars = ax.barh(missing.index[::-1], missing.values[::-1], color=ACCENT3)
        ax.set_title("NHANES — Бос мәндер (Missing Values)", fontsize=16, fontweight="bold")
        ax.set_xlabel("Бос мәндер саны")
        for bar, val in zip(bars, missing.values[::-1]):
            ax.text(bar.get_width() + 5, bar.get_y() + bar.get_height() / 2,
                    str(val), va="center", color="#333333", fontsize=10)
    else:
        ax.text(0.5, 0.5, "✅ Бос мәндер жоқ!", ha="center", va="center",
                fontsize=20, color=ACCENT, transform=ax.transAxes)
        ax.set_title("NHANES — Бос мәндер (Missing Values)", fontsize=16, fontweight="bold")
        ax.axis("off")
    save(fig, "nhanes_missing_values")

    # --- 1b. Class distribution (plan_template_id) ---
    class_counts = df["plan_template_id"].value_counts()

    fig, ax = plt.subplots(figsize=(12, 6))
    colors = sns.color_palette("husl", len(class_counts))
    bars = ax.bar(range(len(class_counts)), class_counts.values, color=colors)
    ax.set_xticks(range(len(class_counts)))
    ax.set_xticklabels(class_counts.index, rotation=45, ha="right", fontsize=9)
    ax.set_title("NHANES — Жоспар шаблондарының үлестірімі", fontsize=16, fontweight="bold")
    ax.set_ylabel("Жолдар саны")
    for bar, val in zip(bars, class_counts.values):
        ax.text(bar.get_x() + bar.get_width() / 2, bar.get_height() + 20,
                str(val), ha="center", color="#333333", fontsize=9)
    save(fig, "nhanes_class_distribution")

    # --- 1c. BMI distribution ---
    fig, ax = plt.subplots(figsize=(10, 5))
    ax.hist(df["bmi"].dropna(), bins=40, color=ACCENT2, alpha=0.85, edgecolor="#0D1117")
    ax.set_title("NHANES — BMI үлестірімі", fontsize=16, fontweight="bold")
    ax.set_xlabel("BMI")
    ax.set_ylabel("Жиілік (Frequency)")
    ax.axvline(df["bmi"].mean(), color=ACCENT, linestyle="--", linewidth=2, label=f'Орташа: {df["bmi"].mean():.1f}')
    ax.legend()
    save(fig, "nhanes_bmi_distribution")

    # --- 1d. Age distribution ---
    fig, ax = plt.subplots(figsize=(10, 5))
    ax.hist(df["age"].dropna(), bins=30, color=ACCENT4, alpha=0.85, edgecolor="#0D1117")
    ax.set_title("NHANES — Жас үлестірімі", fontsize=16, fontweight="bold")
    ax.set_xlabel("Жас")
    ax.set_ylabel("Жиілік (Frequency)")
    save(fig, "nhanes_age_distribution")

    # --- 1e. Correlation heatmap ---
    numeric_cols = ["age", "height", "weight", "bmi", "waist", "hip", "arm",
                    "activity_level", "workout_duration_minutes", "workouts_per_week"]
    numeric_cols = [c for c in numeric_cols if c in df.columns]
    corr = df[numeric_cols].corr()

    fig, ax = plt.subplots(figsize=(10, 8))
    sns.heatmap(corr, annot=True, fmt=".2f", cmap="coolwarm", center=0,
                ax=ax, linewidths=0.5, linecolor="#30363D",
                cbar_kws={"shrink": 0.8})
    ax.set_title("NHANES — Корреляция матрицасы", fontsize=16, fontweight="bold")
    save(fig, "nhanes_correlation_heatmap")

    # --- 1f. Dataset info summary ---
    fig, ax = plt.subplots(figsize=(8, 5))
    ax.axis("off")
    info_text = (
        f"📊 NHANES Workout Dataset\n\n"
        f"Жолдар саны:  {df.shape[0]:,}\n"
        f"Бағандар саны:  {df.shape[1]}\n"
        f"Бос мәндер:  {df.isnull().sum().sum()}\n"
        f"Класстар саны:  {df['plan_template_id'].nunique()}\n"
        f"BMI орташа:  {df['bmi'].mean():.1f}\n"
        f"Жас диапазоны:  {int(df['age'].min())} — {int(df['age'].max())}"
    )
    ax.text(0.5, 0.5, info_text, ha="center", va="center", fontsize=16,
            fontfamily="monospace", color="#333333", transform=ax.transAxes,
            bbox=dict(boxstyle="round,pad=1", facecolor="#F5F5F5", edgecolor=ACCENT))
    ax.set_title("NHANES — Жалпы ақпарат", fontsize=16, fontweight="bold")
    save(fig, "nhanes_dataset_info")


# =====================================================
# 2. NUTRITION DATASET
# =====================================================
def eda_nutrition():
    print("\n" + "=" * 60)
    print("🥗 Nutrition Dataset — EDA")
    print("=" * 60)

    df = pd.read_csv(DATASETS_DIR / "nutrition_recommendation_sampled.csv")
    print(f"  Shape: {df.shape}")

    # --- 2a. Missing values ---
    missing = df.isnull().sum()
    missing = missing[missing > 0].sort_values(ascending=False)

    fig, ax = plt.subplots(figsize=(10, 6))
    if len(missing) > 0:
        bars = ax.barh(missing.index[::-1], missing.values[::-1], color=ACCENT3)
        ax.set_title("Nutrition — Бос мәндер", fontsize=16, fontweight="bold")
        ax.set_xlabel("Бос мәндер саны")
    else:
        ax.text(0.5, 0.5, "✅ Бос мәндер жоқ!", ha="center", va="center",
                fontsize=20, color=ACCENT, transform=ax.transAxes)
        ax.set_title("Nutrition — Бос мәндер", fontsize=16, fontweight="bold")
        ax.axis("off")
    save(fig, "nutrition_missing_values")

    # --- 2b. Label distribution ---
    label_counts = df["label"].value_counts()

    fig, ax = plt.subplots(figsize=(8, 5))
    colors_list = [ACCENT if l == "good" else ACCENT2 if l == "ok" else ACCENT3 for l in label_counts.index]
    bars = ax.bar(label_counts.index, label_counts.values, color=colors_list)
    ax.set_title("Nutrition — Label үлестірімі", fontsize=16, fontweight="bold")
    ax.set_ylabel("Жолдар саны")
    for bar, val in zip(bars, label_counts.values):
        ax.text(bar.get_x() + bar.get_width() / 2, bar.get_height() + 200,
                f"{val:,}", ha="center", color="#333333", fontsize=12)
    save(fig, "nutrition_label_distribution")

    # --- 2c. Calories distribution ---
    fig, ax = plt.subplots(figsize=(10, 5))
    ax.hist(df["calories"].dropna(), bins=50, color=ACCENT2, alpha=0.85, edgecolor="#0D1117")
    ax.set_title("Nutrition — Калория үлестірімі", fontsize=16, fontweight="bold")
    ax.set_xlabel("Калория (kcal)")
    ax.set_ylabel("Жиілік")
    save(fig, "nutrition_calories_distribution")

    # --- 2d. Macros boxplot ---
    macros = ["calories", "protein", "fat", "carbs"]
    fig, axes = plt.subplots(1, 4, figsize=(16, 5))
    colors_macro = [ACCENT, ACCENT2, ACCENT3, ACCENT4]
    for i, (col, color) in enumerate(zip(macros, colors_macro)):
        bp = axes[i].boxplot(df[col].dropna(), patch_artist=True)
        bp["boxes"][0].set_facecolor(color)
        bp["boxes"][0].set_alpha(0.7)
        bp["medians"][0].set_color("white")
        axes[i].set_title(col.capitalize(), fontsize=14, fontweight="bold")
    fig.suptitle("Nutrition — Макронутриенттер", fontsize=16, fontweight="bold")
    save(fig, "nutrition_macros_boxplot")

    # --- 2e. Goal distribution ---
    goal_counts = df["goal"].value_counts()

    fig, ax = plt.subplots(figsize=(10, 5))
    colors_g = sns.color_palette("husl", len(goal_counts))
    bars = ax.bar(goal_counts.index, goal_counts.values, color=colors_g)
    ax.set_title("Nutrition — Мақсат бойынша үлестірім", fontsize=16, fontweight="bold")
    ax.set_ylabel("Жолдар саны")
    ax.set_xticklabels(goal_counts.index, rotation=30, ha="right")
    save(fig, "nutrition_goal_distribution")

    # --- 2f. Dataset info ---
    fig, ax = plt.subplots(figsize=(8, 5))
    ax.axis("off")
    info_text = (
        f"📊 Nutrition Dataset\n\n"
        f"Жолдар саны:  {df.shape[0]:,}\n"
        f"Бағандар саны:  {df.shape[1]}\n"
        f"Бос мәндер:  {df.isnull().sum().sum()}\n"
        f"Label түрлері:  {df['label'].nunique()}\n"
        f"Мақсат түрлері:  {df['goal'].nunique()}\n"
        f"Калория диапазоны:  {df['calories'].min():.0f} — {df['calories'].max():.0f}"
    )
    ax.text(0.5, 0.5, info_text, ha="center", va="center", fontsize=16,
            fontfamily="monospace", color="#333333", transform=ax.transAxes,
            bbox=dict(boxstyle="round,pad=1", facecolor="#F5F5F5", edgecolor=ACCENT))
    ax.set_title("Nutrition — Жалпы ақпарат", fontsize=16, fontweight="bold")
    save(fig, "nutrition_dataset_info")


# =====================================================
# 3. SQUAT POSE DATASET
# =====================================================
def eda_squat():
    print("\n" + "=" * 60)
    print("🦵 Squat Pose Dataset — EDA")
    print("=" * 60)

    df = pd.read_csv(DATASETS_DIR / "video_pose_frames.csv")
    df = df[df["exercise_name"] == "squat"].copy()
    print(f"  Shape: {df.shape}")

    feature_cols = [c for c in df.columns if c.startswith("feature_")]

    # --- 3a. Missing values ---
    missing = df[feature_cols].isnull().sum()
    missing = missing[missing > 0].sort_values(ascending=False).head(15)

    fig, ax = plt.subplots(figsize=(10, 6))
    if len(missing) > 0:
        bars = ax.barh(missing.index[::-1], missing.values[::-1], color=ACCENT3)
        ax.set_title("Squat — Бос мәндер (Top 15)", fontsize=16, fontweight="bold")
        ax.set_xlabel("Бос мәндер саны")
    else:
        ax.text(0.5, 0.5, "✅ Бос мәндер жоқ!", ha="center", va="center",
                fontsize=20, color=ACCENT, transform=ax.transAxes)
        ax.set_title("Squat — Бос мәндер", fontsize=16, fontweight="bold")
        ax.axis("off")
    save(fig, "squat_missing_values")

    # --- 3b. Class distribution ---
    class_counts = df["target_is_correct"].value_counts().sort_index()
    labels = ["Wrong (0)", "Correct (1)"]
    values = [int(class_counts.get(0, 0)), int(class_counts.get(1, 0))]

    fig, ax = plt.subplots(figsize=(7, 5))
    bars = ax.bar(labels, values, color=[ACCENT3, ACCENT])
    ax.set_title("Squat — Класс үлестірімі", fontsize=16, fontweight="bold")
    ax.set_ylabel("Кадрлар саны")
    for bar, val in zip(bars, values):
        ax.text(bar.get_x() + bar.get_width() / 2, bar.get_height() + 20,
                str(val), ha="center", color="#333333", fontsize=14)
    save(fig, "squat_class_distribution")

    # --- 3c. Knee angle histogram ---
    for feat in ["feature_left_knee_angle", "feature_right_knee_angle"]:
        if feat in df.columns:
            fig, ax = plt.subplots(figsize=(10, 5))
            wrong = df[df["target_is_correct"] == 0][feat].dropna()
            correct = df[df["target_is_correct"] == 1][feat].dropna()
            ax.hist(correct, bins=30, alpha=0.7, color=ACCENT, label="Correct")
            ax.hist(wrong, bins=30, alpha=0.7, color=ACCENT3, label="Wrong")
            ax.set_title(f"Squat — {feat}", fontsize=14, fontweight="bold")
            ax.set_xlabel("Бұрыш (градус)")
            ax.set_ylabel("Жиілік")
            ax.legend()
            save(fig, f"squat_{feat}_histogram")
            break

    # --- 3d. Boxplot by class ---
    chosen = "feature_left_knee_angle" if "feature_left_knee_angle" in df.columns else feature_cols[0]
    wrong_vals = df[df["target_is_correct"] == 0][chosen].dropna()
    correct_vals = df[df["target_is_correct"] == 1][chosen].dropna()

    fig, ax = plt.subplots(figsize=(7, 5))
    bp = ax.boxplot([wrong_vals, correct_vals], labels=["Wrong", "Correct"], patch_artist=True)
    bp["boxes"][0].set_facecolor(ACCENT3)
    bp["boxes"][1].set_facecolor(ACCENT)
    for median in bp["medians"]:
        median.set_color("#333333")
    ax.set_title(f"Squat — {chosen} (Класс бойынша)", fontsize=14, fontweight="bold")
    ax.set_ylabel("Мән")
    save(fig, "squat_feature_boxplot")

    # --- 3e. Dataset info ---
    fig, ax = plt.subplots(figsize=(8, 5))
    ax.axis("off")
    info_text = (
        f"📊 Squat Pose Dataset\n\n"
        f"Кадрлар саны:  {df.shape[0]:,}\n"
        f"Feature саны:  {len(feature_cols)}\n"
        f"Correct кадрлар:  {values[1]:,}\n"
        f"Wrong кадрлар:  {values[0]:,}\n"
        f"Бос мәндер:  {df[feature_cols].isnull().sum().sum()}"
    )
    ax.text(0.5, 0.5, info_text, ha="center", va="center", fontsize=16,
            fontfamily="monospace", color="#333333", transform=ax.transAxes,
            bbox=dict(boxstyle="round,pad=1", facecolor="#F5F5F5", edgecolor=ACCENT))
    ax.set_title("Squat — Жалпы ақпарат", fontsize=16, fontweight="bold")
    save(fig, "squat_dataset_info")


# =====================================================
# 4. PUSHUP POSE DATASET
# =====================================================
def eda_pushup():
    print("\n" + "=" * 60)
    print("💪 Push-up Pose Dataset — EDA")
    print("=" * 60)

    df = pd.read_csv(DATASETS_DIR / "pushup_pose_frame_dataset.csv")
    print(f"  Shape: {df.shape}")

    feature_cols = [c for c in df.columns if c.startswith("feature_")]
    label_col = "is_correct" if "is_correct" in df.columns else "label"

    # --- 4a. Class distribution ---
    class_counts = df[label_col].value_counts().sort_index()
    labels = ["Wrong (0)", "Correct (1)"]
    values = [int(class_counts.get(0, 0)), int(class_counts.get(1, 0))]

    fig, ax = plt.subplots(figsize=(7, 5))
    bars = ax.bar(labels, values, color=[ACCENT3, ACCENT])
    ax.set_title("Push-up — Class Distribution", fontsize=16, fontweight="bold")
    ax.set_ylabel("Frames")
    for bar, val in zip(bars, values):
        ax.text(bar.get_x() + bar.get_width() / 2, bar.get_height() + 20,
                str(val), ha="center", color="#333333", fontsize=14)
    save(fig, "pushup_class_distribution")

    # --- 4b. Missing values ---
    missing = df[feature_cols].isnull().sum()
    missing = missing[missing > 0].sort_values(ascending=False).head(15)

    fig, ax = plt.subplots(figsize=(10, 6))
    if len(missing) > 0:
        bars = ax.barh(missing.index[::-1], missing.values[::-1], color=ACCENT3)
        ax.set_title("Push-up — Missing Values (Top 15)", fontsize=16, fontweight="bold")
    else:
        ax.text(0.5, 0.5, "No missing values!", ha="center", va="center",
                fontsize=20, color=ACCENT, transform=ax.transAxes)
        ax.set_title("Push-up — Missing Values", fontsize=16, fontweight="bold")
        ax.axis("off")
    save(fig, "pushup_missing_values")

    # --- 4c. Feature histogram ---
    elbow_cols = [c for c in feature_cols if "elbow" in c.lower()]
    if elbow_cols:
        chosen = elbow_cols[0]
        fig, ax = plt.subplots(figsize=(10, 5))
        wrong = df[df[label_col] == 0][chosen].dropna()
        correct = df[df[label_col] == 1][chosen].dropna()
        ax.hist(correct, bins=30, alpha=0.7, color=ACCENT, label="Correct")
        ax.hist(wrong, bins=30, alpha=0.7, color=ACCENT3, label="Wrong")
        ax.set_title(f"Push-up — {chosen}", fontsize=14, fontweight="bold")
        ax.set_xlabel("Value")
        ax.set_ylabel("Frequency")
        ax.legend()
        save(fig, "pushup_feature_histogram")

    # --- 4d. Dataset info ---
    fig, ax = plt.subplots(figsize=(8, 5))
    ax.axis("off")
    info_text = (
        f"Push-up Pose Dataset\n\n"
        f"Frames:  {df.shape[0]:,}\n"
        f"Features:  {len(feature_cols)}\n"
        f"Correct:  {values[1]:,}\n"
        f"Wrong:  {values[0]:,}\n"
        f"Videos:  100"
    )
    ax.text(0.5, 0.5, info_text, ha="center", va="center", fontsize=16,
            fontfamily="monospace", color="#333333", transform=ax.transAxes,
            bbox=dict(boxstyle="round,pad=1", facecolor="#F5F5F5", edgecolor=ACCENT))
    ax.set_title("Push-up — Жалпы ақпарат", fontsize=16, fontweight="bold")
    save(fig, "pushup_dataset_info")


# =====================================================
# 5. LUNGE DATASET
# =====================================================
def eda_lunge():
    print("\n" + "=" * 60)
    print("🦿 Lunge Dataset — EDA")
    print("=" * 60)

    df = pd.read_csv(DATASETS_DIR / "rehab24_lunge_3d_features.csv")
    print(f"  Shape: {df.shape}")

    feature_cols = [c for c in df.columns if c.startswith("feature_")]
    label_col = "is_correct" if "is_correct" in df.columns else "label"

    # --- 5a. Class distribution ---
    class_counts = df[label_col].value_counts().sort_index()

    fig, ax = plt.subplots(figsize=(7, 5))
    colors_l = [ACCENT3, ACCENT] if len(class_counts) == 2 else sns.color_palette("husl", len(class_counts))
    bars = ax.bar(class_counts.index.astype(str), class_counts.values, color=colors_l)
    ax.set_title("Lunge — Класс үлестірімі", fontsize=16, fontweight="bold")
    ax.set_ylabel("Жолдар саны")
    for bar, val in zip(bars, class_counts.values):
        ax.text(bar.get_x() + bar.get_width() / 2, bar.get_height() + 1,
                str(val), ha="center", color="#333333", fontsize=14)
    save(fig, "lunge_class_distribution")

    # --- 5b. Dataset info ---
    fig, ax = plt.subplots(figsize=(8, 5))
    ax.axis("off")
    info_text = (
        f"📊 Lunge Rehab24 Dataset\n\n"
        f"Жолдар саны:  {df.shape[0]:,}\n"
        f"Feature саны:  {len(feature_cols)}\n"
        f"Класстар:  {df[label_col].nunique()}\n"
        f"Видеолар:  9"
    )
    ax.text(0.5, 0.5, info_text, ha="center", va="center", fontsize=16,
            fontfamily="monospace", color="#333333", transform=ax.transAxes,
            bbox=dict(boxstyle="round,pad=1", facecolor="#F5F5F5", edgecolor=ACCENT))
    ax.set_title("Lunge — Жалпы ақпарат", fontsize=16, fontweight="bold")
    save(fig, "lunge_dataset_info")


# =====================================================
# MAIN
# =====================================================
if __name__ == "__main__":
    print("🎯 EDA для дипломдық презентация — басталды!\n")

    eda_nhanes()
    eda_nutrition()
    eda_squat()
    eda_pushup()
    eda_lunge()

    print("\n" + "=" * 60)
    print(f"✅ Барлық графиктер сақталды: {OUTPUT_DIR}")
    print("=" * 60)
    
    # Сақталған файлдар тізімі
    files = sorted(OUTPUT_DIR.glob("*.png"))
    print(f"\n📁 Жалпы {len(files)} график:")
    for f in files:
        print(f"   • {f.name}")
