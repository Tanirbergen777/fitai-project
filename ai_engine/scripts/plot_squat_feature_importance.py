import json
from pathlib import Path

import matplotlib.pyplot as plt


BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parent.parent

REPORT_PATH = PROJECT_ROOT / "ai_engine" / "models_bin" / "squat_pose_report.json"
OUTPUT_DIR = PROJECT_ROOT / "ai_engine" / "inference_outputs"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


def main():
    if not REPORT_PATH.exists():
        raise FileNotFoundError(f"Report file not found: {REPORT_PATH}")

    with open(REPORT_PATH, "r", encoding="utf-8") as f:
        report = json.load(f)

    top_features = report.get("top_features", [])
    if not top_features:
        raise ValueError("No top_features found in squat_pose_report.json")

    top10 = top_features[:10]

    feature_names = [item["feature"] for item in top10][::-1]
    importances = [item["importance"] for item in top10][::-1]

    plt.figure(figsize=(10, 6))
    plt.barh(feature_names, importances)
    plt.title("Top-10 Squat Features")
    plt.xlabel("Importance")
    plt.ylabel("Feature")
    plt.tight_layout()

    output_path = OUTPUT_DIR / "squat_feature_importance_top10.png"
    plt.savefig(output_path, dpi=200)
    plt.close()

    print("Saved:", output_path)


if __name__ == "__main__":
    main()