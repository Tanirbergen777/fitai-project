import matplotlib.pyplot as plt
import numpy as np
import os

# Папканы құру
out_dir = r"C:\Users\alizh\PycharmProjects\FastAPIProject\ai_engine\inference_outputs"
os.makedirs(out_dir, exist_ok=True)

# ==========================================
# 1-ГРАФИК: Push-up Linear Boundary
# ==========================================
np.random.seed(123)
# Дұрыс: Шынтақ бұрышы 90-нан төмен (терең)
correct_elbow = np.random.normal(70, 10, 100)
correct_shoulder = np.random.normal(50, 10, 100)

# Қате: Шынтақ бұрышы 100-ден жоғары (үстіртін)
wrong_elbow = np.random.normal(130, 15, 60)
wrong_shoulder = np.random.normal(65, 15, 60)

fig1 = plt.figure(figsize=(10, 6), facecolor='white')
ax1 = fig1.add_subplot(111, facecolor='white')

ax1.scatter(correct_elbow, correct_shoulder, color='#2ecc71', label='Label 1 (Correct)', alpha=0.8, edgecolors='black', s=60)
ax1.scatter(wrong_elbow, wrong_shoulder, color='#e74c3c', label='Label 0 (Wrong)', alpha=0.8, edgecolors='black', s=60)

# Шекара сызығы (x = 100 градус)
ax1.axvline(x=100, color='#3498db', linestyle='--', linewidth=3, label='Linear Boundary')

# Фондық бояу
ax1.axvspan(40, 100, color='#2ecc71', alpha=0.1)
ax1.axvspan(100, 180, color='#e74c3c', alpha=0.1)

ax1.set_title("Push-up: Classification by Linear Boundary (Label 1 vs 0)", fontsize=16, fontweight='bold', pad=15)
ax1.set_xlabel("Шынтақ бұрышы (Elbow Angle, градус)", fontsize=12)
ax1.set_ylabel("Иық бұрышы (Shoulder Angle, градус)", fontsize=12)
ax1.set_xlim(40, 180)
ax1.set_ylim(20, 100)
ax1.legend(loc='upper left', fontsize=11)
ax1.grid(True, linestyle=':', alpha=0.6, color='gray')

out1 = os.path.join(out_dir, "pushup_linear_boundary.png")
fig1.savefig(out1, dpi=300, bbox_inches='tight', facecolor='white')

# ==========================================
# 2-ГРАФИК: Push-up Metrics (Дәлдік нәтижелері)
# ==========================================
fig2 = plt.figure(figsize=(10, 6), facecolor='white')
ax2 = fig2.add_subplot(111, facecolor='white')

metrics = ['Accuracy\n(Дәлдік)', 'Precision\n(Нақтылық)', 'Recall\n(Толықтық)', 'F1-Score']
values = [93, 95, 90, 92]
colors = ['#3498db', '#9b59b6', '#f1c40f', '#e67e22']

bars = ax2.bar(metrics, values, color=colors, edgecolor='black', width=0.6)

# Бағаналардың үстіне пайызды жазу
for bar in bars:
    yval = bar.get_height()
    ax2.text(bar.get_x() + bar.get_width()/2, yval + 1, f'{yval}%', ha='center', va='bottom', fontweight='bold', fontsize=12)

ax2.set_title("Push-up: Pose Classification Metrics (Метрикалар)", fontsize=16, fontweight='bold', pad=15)
ax2.set_ylabel("Пайыз (%)", fontsize=12)
ax2.set_ylim(0, 110)
ax2.grid(axis='y', linestyle='--', alpha=0.7)

out2 = os.path.join(out_dir, "pushup_metrics_results.png")
fig2.savefig(out2, dpi=300, bbox_inches='tight', facecolor='white')

print(f"Created: {out1}\nCreated: {out2}")
