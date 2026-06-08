import matplotlib.pyplot as plt
from pathlib import Path

OUTPUT_DIR = Path(__file__).resolve().parent.parent / "inference_outputs"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# Презентация стиліне сай ақ фонды баптаулар
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

# Nutrition тестілерінен алынған нақты нәтижелер
results = {
    "Decision Tree": 0.9721,
    "Random Forest": 0.9855,
    "KNN": 0.8708,
}

models = list(results.keys())
scores = list(results.values())

# Акцент түсі (Random Forest-ті бөлектеу үшін)
colors = ["#3498DB", "#2ECC71", "#E74C3C"] # көк (DT), жасыл (RF - таңдалған), қызыл (KNN)

plt.figure(figsize=(8, 5))
bars = plt.bar(models, scores, color=colors)

plt.title("Тамақтану (Nutrition) моделін таңдау", fontsize=16, fontweight="bold")
plt.ylabel("Дәлдік (Accuracy)", fontsize=14)
plt.ylim(0, 1.1)

# Бағаналардың үстіне пайыздарды жазу
for bar, value in zip(bars, scores):
    plt.text(
        bar.get_x() + bar.get_width() / 2,
        value + 0.02,
        f"{value * 100:.1f}%",
        ha="center",
        va="bottom",
        fontsize=12,
        fontweight="bold",
        color="#333333"
    )

plt.tight_layout()
output_path = OUTPUT_DIR / "nutrition_model_comparison_presentation.png"
plt.savefig(output_path, dpi=200, bbox_inches="tight")
plt.close()

print(f"График сақталды: {output_path}")
