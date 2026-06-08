from pathlib import Path
import matplotlib.pyplot as plt

OUTPUT_DIR = Path(__file__).resolve().parent.parent / "inference_outputs"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

models = ["Decision Tree", "Random Forest", "KNN"]
accuracies = [1.0000, 1.0000, 0.9209]

plt.figure(figsize=(8, 5))
bars = plt.bar(models, accuracies)

plt.title("Workout Model Accuracy Comparison")
plt.ylabel("Accuracy")
plt.ylim(0.85, 1.02)

for bar, value in zip(bars, accuracies):
    plt.text(
        bar.get_x() + bar.get_width() / 2,
        value + 0.005,
        f"{value:.4f}",
        ha="center",
        va="bottom",
        fontsize=10
    )

plt.tight_layout()
output_path = OUTPUT_DIR / "workout_model_comparison.png"
plt.savefig(output_path, dpi=200)
plt.close()

print("Saved:", output_path)