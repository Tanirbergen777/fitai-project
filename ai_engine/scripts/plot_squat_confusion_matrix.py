import json
import numpy as np
import seaborn as sns
import matplotlib.pyplot as plt
from pathlib import Path

BASE_DIR = Path(r"C:\Users\alizh\PycharmProjects\FastAPIProject\ai_engine\scripts")
PROJECT_ROOT = BASE_DIR.parent.parent

REPORT_PATH = PROJECT_ROOT / "ai_engine" / "models_bin" / "squat_pose_report.json"
OUTPUT_DIR = PROJECT_ROOT / "ai_engine" / "inference_outputs"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

def main():
    # 1. Есепті оқу
    with open(REPORT_PATH, "r", encoding="utf-8") as f:
        report = json.load(f)

    cm = np.array(report["confusion_matrix"])
    # cm:
    # [[TN, FP],
    #  [FN, TP]]
    # Онда 0 - Wrong (Қате), 1 - Correct (Дұрыс)

    # 2. Графикті (Heatmap) баптау
    plt.figure(figsize=(8, 6), facecolor='white')
    ax = plt.gca()
    ax.set_facecolor('white')

    # Класс атаулары (Қазақша)
    labels = ['Қате отыру (Wrong)', 'Дұрыс отыру (Correct)']

    sns.heatmap(cm, annot=True, fmt="d", cmap="Blues",
                xticklabels=labels, yticklabels=labels,
                annot_kws={"size": 16, "weight": "bold"})

    plt.title("Бинарлық Классификация Нәтижесі\n(Squat Confusion Matrix)", fontsize=16, fontweight='bold', pad=15)
    plt.xlabel("Модельдің Жорамалы (Predicted Label)", fontsize=12, fontweight='bold')
    plt.ylabel("Нақты Дерек (True Label)", fontsize=12, fontweight='bold')

    plt.tight_layout()

    # 3. Сақтау
    output_path = OUTPUT_DIR / "squat_confusion_matrix_kz.png"
    plt.savefig(output_path, dpi=300, facecolor='white')
    plt.close()

    print("Saved:", output_path)

if __name__ == "__main__":
    main()
