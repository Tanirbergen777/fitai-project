import matplotlib.pyplot as plt
import numpy as np
from pathlib import Path

OUTPUT_DIR = Path(__file__).resolve().parent.parent / "inference_outputs"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

plt.rcParams.update({
    "figure.facecolor": "white",
    "axes.facecolor": "white",
    "text.color": "#333333",
    "xtick.color": "#333333",
    "ytick.color": "#333333",
    "font.size": 14,
})

# Жаңа GradientBoosting нәтижесі
cm = np.array([[381, 9], [12, 383]])

fig, ax = plt.subplots(figsize=(6, 5))
cax = ax.matshow(cm, cmap="Blues")

for (i, j), z in np.ndenumerate(cm):
    ax.text(j, i, f"{z}", ha="center", va="center",
            color="white" if z > (cm.max()/2) else "black",
            fontsize=22, fontweight="bold")

ax.set_title("Lunge: Confusion Matrix (97.3%)", pad=20, fontsize=18, fontweight="bold")
ax.set_xticks([0, 1])
ax.set_yticks([0, 1])
ax.set_xticklabels(["Wrong (0)", "Correct (1)"], fontsize=14)
ax.set_yticklabels(["Wrong (0)", "Correct (1)"], fontsize=14)
ax.set_xlabel("Predicted (Болжам)", fontsize=14)
ax.set_ylabel("Actual (Шын мәнінде)", fontsize=14)
ax.xaxis.set_ticks_position('bottom')

plt.tight_layout()
plt.savefig(OUTPUT_DIR / "lunge_cm_presentation.png", dpi=200, bbox_inches="tight")
plt.close()
print("Жаңа Lunge CM сақталды!")
