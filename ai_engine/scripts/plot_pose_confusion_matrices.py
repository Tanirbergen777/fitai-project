import json
import matplotlib.pyplot as plt
import numpy as np
from pathlib import Path

OUTPUT_DIR = Path(__file__).resolve().parent.parent / "inference_outputs"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# Презентация стиліне сай баптаулар
plt.rcParams.update({
    "figure.facecolor": "white",
    "axes.facecolor": "white",
    "text.color": "#333333",
    "xtick.color": "#333333",
    "ytick.color": "#333333",
    "font.size": 14,
})

def plot_cm(cm_data, title, filename):
    cm = np.array(cm_data)
    fig, ax = plt.subplots(figsize=(6, 5))
    
    # Көк түсті матрица
    cax = ax.matshow(cm, cmap="Blues")
    
    # Мәндерді жазу
    for (i, j), z in np.ndenumerate(cm):
        ax.text(j, i, f"{z}", ha="center", va="center", 
                color="white" if z > (cm.max()/2) else "black",
                fontsize=20, fontweight="bold")
    
    ax.set_title(title, pad=20, fontsize=18, fontweight="bold")
    ax.set_xticklabels(["", "Wrong (0)", "Correct (1)"], fontsize=14)
    ax.set_yticklabels(["", "Wrong (0)", "Correct (1)"], fontsize=14)
    ax.set_xlabel("Predicted (Модельдің болжамы)", fontsize=14)
    ax.set_ylabel("Actual (Шын мәнінде)", fontsize=14)
    ax.xaxis.set_ticks_position('bottom')
    
    plt.tight_layout()
    plt.savefig(OUTPUT_DIR / filename, dpi=200, bbox_inches="tight")
    plt.close()
    print(f"Сақталды: {filename}")

# 1. Squat (squat_pose_report.json)
squat_cm = [[532, 44], [107, 378]]
plot_cm(squat_cm, "Squat: Confusion Matrix", "squat_cm_presentation.png")

# 2. Push-up (pushup_pose_metrics.json -> RandomForest)
pushup_cm = [[974, 62], [0, 324]]
plot_cm(pushup_cm, "Push-up: Confusion Matrix", "pushup_cm_presentation.png")

# 3. Lunge (lunge_rehab24_3d_metrics.json -> RandomForest)
lunge_cm = [[30, 11], [13, 6]]
plot_cm(lunge_cm, "Lunge: Confusion Matrix", "lunge_cm_presentation.png")
