import joblib
import json
import numpy as np
from pathlib import Path
import matplotlib.pyplot as plt

BASE_DIR = Path(r"C:\Users\alizh\PycharmProjects\FastAPIProject\ai_engine\scripts")
PROJECT_ROOT = BASE_DIR.parent.parent

MODELS_DIR = PROJECT_ROOT / "ai_engine" / "models_bin"
OUTPUT_DIR = PROJECT_ROOT / "ai_engine" / "inference_outputs"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

MODEL_PATH = MODELS_DIR / "pushup_pose_rf.pkl"
FEATURES_PATH = MODELS_DIR / "pushup_pose_feature_columns.json"

TRANSLATIONS = {
    "global_timestamp_ms": "global_timestamp_ms\n(Уақыт белгісі)",
    "feature_body_line_right": "feature_body_line_right\n(Оң жақ дене түзулігі)",
    "feature_body_line_left": "feature_body_line_left\n(Сол жақ дене түзулігі)",
    "lm_29_y": "lm_29_y\n(Сол өкше биіктігі)",
    "lm_20_y": "lm_20_y\n(Оң сұқ саусақ биіктігі)",
    "lm_32_y": "lm_32_y\n(Оң аяқ ұшы биіктігі)",
    "lm_18_y": "lm_18_y\n(Оң шынашақ биіктігі)",
    "lm_16_y": "lm_16_y\n(Оң білезік биіктігі)",
    "lm_28_y": "lm_28_y\n(Оң тобық биіктігі)",
    "feature_ankle_y": "feature_ankle_y\n(Тобық биіктігі)",
    "lm_22_y": "lm_22_y\n(Оң бас бармақ биіктігі)",
    "lm_30_y": "lm_30_y\n(Оң өкше биіктігі)",
    "lm_19_y": "lm_19_y\n(Сол сұқ саусақ биіктігі)",
    "lm_4_visibility": "lm_4_visibility\n(Оң көз көрінуі)",
    "lm_14_y": "lm_14_y\n(Оң шынтақ биіктігі)"
}

def translate_feature(feat):
    return TRANSLATIONS.get(feat, feat)

def main():
    bundle = joblib.load(MODEL_PATH)
    if isinstance(bundle, dict):
        model = bundle.get("model") or bundle.get("classifier") or bundle.get("pipeline")
    else:
        model = bundle

    if hasattr(model, 'steps'):
        model = model[-1]

    with open(FEATURES_PATH, "r", encoding="utf-8") as f:
        loaded = json.load(f)
        if isinstance(loaded, dict):
            feature_columns = loaded.get("feature_columns") or loaded.get("columns") or loaded.get("features")
        else:
            feature_columns = loaded

    importances = model.feature_importances_
    indices = np.argsort(importances)[::-1]
    
    top15_indices = indices[:15]
    top15_features = [feature_columns[i] for i in top15_indices]
    top15_importances = [importances[i] for i in top15_indices]

    plot_features = [translate_feature(f) for f in top15_features][::-1]
    plot_importances = top15_importances[::-1]

    plt.figure(figsize=(12, 10), facecolor='white')
    ax = plt.gca()
    ax.set_facecolor('white')
    
    bars = plt.barh(plot_features, plot_importances, color="#e74c3c", edgecolor="black") 
    
    plt.title("Random Forest: Top-15 Push-up Features (Маңызды Белгілер)", fontsize=16, fontweight='bold', pad=20)
    plt.xlabel("Маңыздылық деңгейі (Importance Score)", fontsize=12)
    plt.ylabel("Биомеханикалық белгілер (Features)", fontsize=12)
    
    plt.grid(axis='x', linestyle='--', alpha=0.7)
    plt.tight_layout()

    output_path = OUTPUT_DIR / "pushup_feature_importance_top15_kz.png"
    plt.savefig(output_path, dpi=300, facecolor='white')
    plt.close()

    print("Saved:", output_path)

if __name__ == "__main__":
    main()
