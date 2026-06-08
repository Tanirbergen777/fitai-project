import matplotlib.pyplot as plt
import os

# Папканы құру
out_dir = r"C:\Users\alizh\PycharmProjects\FastAPIProject\ai_engine\inference_outputs"
os.makedirs(out_dir, exist_ok=True)

# ==========================================
# 2-ГРАФИК: Squat Metrics (Дәлдік нәтижелері - НАҚТЫ САНДАРМЕН)
# ==========================================
fig = plt.figure(figsize=(10, 6), facecolor='white')
ax = fig.add_subplot(111, facecolor='white')

# Confusion Matrix негізінде есептелген нақты сандар:
# TP = 378, TN = 532, FP = 44, FN = 107
# Accuracy = (378+532) / 1061 = 85.8%
# Precision = 378 / (378+44) = 89.6%
# Recall = 378 / (378+107) = 77.9%
# F1-Score = 2 * (0.896 * 0.779) / (0.896 + 0.779) = 83.3%

metrics = ['Accuracy\n(Дәлдік)', 'Precision\n(Нақтылық)', 'Recall\n(Толықтық)', 'F1-Score']
values = [85.8, 89.6, 77.9, 83.3] 
colors = ['#3498db', '#9b59b6', '#f1c40f', '#e67e22']

bars = ax.bar(metrics, values, color=colors, edgecolor='black', width=0.6)

# Бағаналардың үстіне пайызды жазу
for bar in bars:
    yval = bar.get_height()
    ax.text(bar.get_x() + bar.get_width()/2, yval + 1.5, f'{yval}%', ha='center', va='bottom', fontweight='bold', fontsize=12)

ax.set_title("Squat: Pose Classification Metrics (Нақты Нәтижелер)", fontsize=16, fontweight='bold', pad=15)
ax.set_ylabel("Пайыз (%)", fontsize=12)
ax.set_ylim(0, 110)
ax.grid(axis='y', linestyle='--', alpha=0.7)

out_path = os.path.join(out_dir, "squat_metrics_results.png")
fig.savefig(out_path, dpi=300, bbox_inches='tight', facecolor='white')

print(f"Created/Updated: {out_path}")
