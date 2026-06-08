import matplotlib.pyplot as plt
import numpy as np
import os

# 1. Папканы құру (егер жоқ болса)
out_dir = r"C:\Users\alizh\PycharmProjects\FastAPIProject\ai_engine\inference_outputs"
os.makedirs(out_dir, exist_ok=True)
out_path = os.path.join(out_dir, "linear_boundary_classification.png")

# 2. Мәліметтер (Кездейсоқ, бірақ логикаға сай)
np.random.seed(42)
correct_knee = np.random.normal(100, 10, 100)
correct_hip = np.random.normal(85, 10, 100)

wrong_knee = np.random.normal(140, 15, 60)
wrong_hip = np.random.normal(110, 15, 60)

# 3. Графиктің артқы фонын АҚ (White) қылу
fig = plt.figure(figsize=(10, 6), facecolor='white')
ax = fig.add_subplot(111)
ax.set_facecolor('white')

# 4. Нүктелерді салу
ax.scatter(correct_knee, correct_hip, color='#2ecc71', label='Label 1 (Correct)', alpha=0.8, edgecolors='black', s=60)
ax.scatter(wrong_knee, wrong_hip, color='#e74c3c', label='Label 0 (Wrong)', alpha=0.8, edgecolors='black', s=60)

# 5. Сызықтық шекара (Linear Boundary)
x_line = np.linspace(70, 170, 100)
y_line = -0.4 * x_line + 140

ax.plot(x_line, y_line, color='#3498db', linestyle='--', linewidth=3, label='Linear Boundary')

# Фондық бояу
ax.fill_between(x_line, y_line, 0, color='#2ecc71', alpha=0.1)
ax.fill_between(x_line, y_line, 200, color='#e74c3c', alpha=0.1)

# 6. Дизайн және Мәтіндер
ax.set_title("Classification by Linear Boundary (Label 1 vs Label 0)", fontsize=16, fontweight='bold', pad=15)
ax.set_xlabel("Тізе бұрышы (Knee Angle, градус)", fontsize=12)
ax.set_ylabel("Жамбас бұрышы (Hip Angle, градус)", fontsize=12)

ax.set_xlim(70, 170)
ax.set_ylim(50, 150)
ax.legend(loc='upper right', fontsize=11)
ax.grid(True, linestyle=':', alpha=0.6, color='gray')

# 7. Файлды сақтау (Ақ фонмен, мөлдір емес)
plt.savefig(out_path, dpi=300, bbox_inches='tight', facecolor='white', transparent=False)
print(f"Saved to {out_path}")
