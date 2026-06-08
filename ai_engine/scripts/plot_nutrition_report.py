from pathlib import Path
import matplotlib.pyplot as plt
import numpy as np

OUTPUT_DIR = Path(__file__).resolve().parent.parent / "inference_outputs"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# train_nutrition_model.py нәтижелерің
cm = np.array([
    [19555, 445],
    [132, 19868],
])

metrics = {
    "Accuracy": 0.985575,
    "Precision (0)": 0.99,
    "Recall (0)": 0.98,
    "F1 (0)": 0.99,
    "Precision (1)": 0.98,
    "Recall (1)": 0.99,
    "F1 (1)": 0.99,
}

def plot_confusion_matrix():
    fig, ax = plt.subplots(figsize=(6, 5))
    im = ax.imshow(cm, cmap="Blues")

    ax.set_title("Nutrition Confusion Matrix")
    ax.set_xlabel("Predicted")
    ax.set_ylabel("Actual")

    labels = ["0", "1"]
    ax.set_xticks([0, 1])
    ax.set_yticks([0, 1])
    ax.set_xticklabels(labels)
    ax.set_yticklabels(labels)

    for i in range(cm.shape[0]):
        for j in range(cm.shape[1]):
            ax.text(j, i, cm[i, j], ha="center", va="center", color="black")

    fig.colorbar(im, ax=ax)
    plt.tight_layout()
    plt.savefig(OUTPUT_DIR / "nutrition_confusion_matrix.png", dpi=200)
    plt.close()

def plot_metrics_bar():
    names = list(metrics.keys())
    values = list(metrics.values())

    plt.figure(figsize=(10, 5))
    plt.bar(names, values)
    plt.title("Nutrition Model Metrics")
    plt.ylabel("Score")
    plt.ylim(0, 1.05)
    plt.xticks(rotation=20, ha="right")
    plt.tight_layout()
    plt.savefig(OUTPUT_DIR / "nutrition_model_metrics.png", dpi=200)
    plt.close()

def main():
    plot_confusion_matrix()
    plot_metrics_bar()
    print("Saved:")
    print(OUTPUT_DIR / "nutrition_confusion_matrix.png")
    print(OUTPUT_DIR / "nutrition_model_metrics.png")

if __name__ == "__main__":
    main()