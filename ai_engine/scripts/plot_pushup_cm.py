import seaborn as sns
import matplotlib.pyplot as plt
import numpy as np
from pathlib import Path

OUTPUT_DIR = Path(r"C:\Users\alizh\PycharmProjects\FastAPIProject\ai_engine\inference_outputs")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

def main():
    # Gradient Boosting confusion matrix for Push-up
    cm = np.array([
        [3170, 54],
        [0, 2265]
    ])
    acc = 0.9902
    
    plt.figure(figsize=(8, 6), facecolor='white')
    ax = plt.gca()
    ax.set_facecolor('white')

    labels = ['Қате (Wrong)', 'Дұрыс (Correct)']
    sns.heatmap(cm, annot=True, fmt="d", cmap="Blues",
                xticklabels=labels, yticklabels=labels,
                annot_kws={"size": 16, "weight": "bold"})

    plt.title(f"Push-up: Gradient Boosting\nДәлдік (Accuracy): {acc*100:.1f}%", fontsize=16, fontweight='bold', pad=15)
    plt.xlabel("Модельдің Жорамалы (Predicted Label)", fontsize=12, fontweight='bold')
    plt.ylabel("Нақты Дерек (True Label)", fontsize=12, fontweight='bold')

    plt.tight_layout()

    output_path = OUTPUT_DIR / "pushup_gb_confusion_matrix_kz.png"
    plt.savefig(output_path, dpi=300, facecolor='white')
    plt.close()

    print(f"Graph saved to: {output_path}")

if __name__ == "__main__":
    main()
