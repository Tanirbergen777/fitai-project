import json
from pathlib import Path
import matplotlib.pyplot as plt

BASE_DIR = Path(r"C:\Users\alizh\PycharmProjects\FastAPIProject\ai_engine\scripts")
PROJECT_ROOT = BASE_DIR.parent.parent

REPORT_PATH = PROJECT_ROOT / "ai_engine" / "models_bin" / "squat_pose_report.json"
OUTPUT_DIR = PROJECT_ROOT / "ai_engine" / "inference_outputs"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# MediaPipe нүктелерінің Қазақша аудармалары
TRANSLATIONS = {
    "wlm_19_y": "wlm_19_y\n(Сол қол сұқ саусақ биіктігі)",
    "wlm_20_y": "wlm_20_y\n(Оң қол сұқ саусақ биіктігі)",
    "wlm_17_y": "wlm_17_y\n(Сол қол шынашақ биіктігі)",
    "wlm_18_y": "wlm_18_y\n(Оң қол шынашақ биіктігі)",
    "wlm_21_y": "wlm_21_y\n(Сол қол бас бармақ биіктігі)",
    "wlm_22_y": "wlm_22_y\n(Оң қол бас бармақ биіктігі)",
    "wlm_15_y": "wlm_15_y\n(Сол білезік биіктігі)",
    "wlm_16_y": "wlm_16_y\n(Оң білезік биіктігі)",
    "feature_left_elbow_angle": "left_elbow_angle\n(Сол шынтақ бұрышы)",
    "feature_right_elbow_angle": "right_elbow_angle\n(Оң шынтақ бұрышы)",
    "feature_left_knee_angle": "left_knee_angle\n(Сол тізе бұрышы)",
    "feature_right_knee_angle": "right_knee_angle\n(Оң тізе бұрышы)",
    "wlm_23_y": "wlm_23_y\n(Сол жамбас биіктігі)",
    "wlm_24_y": "wlm_24_y\n(Оң жамбас биіктігі)",
    "wlm_25_y": "wlm_25_y\n(Сол тізе биіктігі)",
    "wlm_26_y": "wlm_26_y\n(Оң тізе биіктігі)",
    "wlm_27_y": "wlm_27_y\n(Сол тобық биіктігі)",
    "wlm_28_y": "wlm_28_y\n(Оң тобық биіктігі)",
    "feature_shoulder_width": "shoulder_width\n(Иық ені)",
    "feature_hip_offset": "hip_offset\n(Жамбас ауытқуы)"
}

def translate_feature(feat):
    # Егер сөздікте болса, қазақшасын береді, болмаса өзін қайтарады
    return TRANSLATIONS.get(feat, feat)

def main():
    with open(REPORT_PATH, "r", encoding="utf-8") as f:
        report = json.load(f)

    top_features = report.get("top_features", [])
    
    # ТОП-15 белгіні алу
    top15 = top_features[:15]

    feature_names = [translate_feature(item["feature"]) for item in top15][::-1]
    importances = [item["importance"] for item in top15][::-1]

    plt.figure(figsize=(12, 10), facecolor='white')
    ax = plt.gca()
    ax.set_facecolor('white')
    
    # Көк түсті бағаналар
    bars = plt.barh(feature_names, importances, color="#2980b9", edgecolor="black")
    
    plt.title("Random Forest: Top-15 Squat Features (Маңызды Белгілер)", fontsize=16, fontweight='bold', pad=20)
    plt.xlabel("Маңыздылық деңгейі (Importance Score)", fontsize=12)
    plt.ylabel("Биомеханикалық белгілер (Features)", fontsize=12)
    
    plt.grid(axis='x', linestyle='--', alpha=0.7)
    plt.tight_layout()

    output_path = OUTPUT_DIR / "squat_feature_importance_top15_kz.png"
    plt.savefig(output_path, dpi=300, facecolor='white')
    plt.close()

    print("Saved:", output_path)

if __name__ == "__main__":
    main()
