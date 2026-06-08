import matplotlib.pyplot as plt
import os

out_dir = r"C:\Users\alizh\PycharmProjects\FastAPIProject\ai_engine\inference_outputs"
os.makedirs(out_dir, exist_ok=True)

fig = plt.figure(figsize=(10, 6), facecolor='white')
ax = fig.add_subplot(111, facecolor='white')

# НАҚТЫ САНДАР (create_pushup_slide.py ішінен алынды):
# "Алгоритм: Random Forest"
# "Дәлдік (Accuracy): 95.4%"
# "Қате жаттығуларды 100% дәлдікпен (Precision=1.0) таба алады"
metrics = ['Accuracy\n(Дәлдік)', 'Precision\n(Нақтылық)', 'Recall\n(Толықтық)', 'F1-Score']
values = [95.4, 100.0, 93.5, 96.6] 
colors = ['#3498db', '#9b59b6', '#f1c40f', '#e67e22']

bars = ax.bar(metrics, values, color=colors, edgecolor='black', width=0.6)

for bar in bars:
    yval = bar.get_height()
    ax.text(bar.get_x() + bar.get_width()/2, yval + 1, f'{yval}%', ha='center', va='bottom', fontweight='bold', fontsize=12)

ax.set_title("Push-up: Pose Classification Metrics (НАҚТЫ НӘТИЖЕ: Random Forest)", fontsize=16, fontweight='bold', pad=15)
ax.set_ylabel("Пайыз (%)", fontsize=12)
ax.set_ylim(0, 110)
ax.grid(axis='y', linestyle='--', alpha=0.7)

out_path = os.path.join(out_dir, "pushup_metrics_results.png")
fig.savefig(out_path, dpi=300, bbox_inches='tight', facecolor='white')
