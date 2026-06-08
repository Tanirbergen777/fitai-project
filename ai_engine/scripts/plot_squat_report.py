import json
from pathlib import Path

import matplotlib.pyplot as plt
import numpy as np


BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parent.parent

REPORT_PATH = PROJECT_ROOT / "ai_engine" / "models_bin" / "squat_pose_report.json"
OUTPUT_DIR = PROJECT_ROOT / "ai_engine" / "inference_outputs"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


def plot_confusion_matrix(cm):
    fig, ax = plt.subplots(figsize=(6, 5))
    im = ax.imshow(cm, cmap="Blues")

    ax.set_title("Squat Confusion Matrix")
    ax.set_xlabel("Predicted")
    ax.set_ylabel("Actual")

    labels = ["Wrong", "Correct"]
    ax.set_xticks([0, 1])
    ax.set_yticks([0, 1])
    ax.set_xticklabels(labels)
    ax.set_yticklabels(labels)

    for i in range(len(cm)):
        for j in range(len(cm[i])):
            ax.text(j, i, cm[i][j], ha="center", va="center", color="black")

    fig.colorbar(im, ax=ax)
    plt.tight_layout()
    plt.savefig(OUTPUT_DIR / "squat_confusion_matrix.png", dpi=200)
    plt.close()


def plot_feature_importance(top_features):
    names = [item["feature"] for item in top_features[:10]][::-1]
    values = [item["importance"] for item in top_features[:10]][::-1]

    fig, ax = plt.subplots(figsize=(10, 6))
    ax.barh(names, values)
    ax.set_title("Top-10 Squat Features")
    ax.set_xlabel("Importance")
    plt.tight_layout()
    plt.savefig(OUTPUT_DIR / "squat_feature_importance.png", dpi=200)
    plt.close()


def main():
    if not REPORT_PATH.exists():
        raise FileNotFoundError(f"Report file not found: {REPORT_PATH}")

    with open(REPORT_PATH, "r", encoding="utf-8") as f:
        report = json.load(f)

    cm = report["confusion_matrix"]
    top_features = report.get("top_features", [])

    plot_confusion_matrix(cm)

    if top_features:
        plot_feature_importance(top_features)

    print("Saved:")
    print(OUTPUT_DIR / "squat_confusion_matrix.png")
    print(OUTPUT_DIR / "squat_feature_importance.png")


if __name__ == "__main__":
    main()