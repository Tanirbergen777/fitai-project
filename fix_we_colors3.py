import os
import re

file_path = r"C:\Users\alizh\PycharmProjects\FastAPIProject\frontend\src\components\workouts\WorkoutEngine.jsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Replace gradient
content = content.replace(
    "linear-gradient(180deg, #252a35 0%, #1b2029 100%)",
    "var(--card-bg)"
)

# Replace all those light gray text colors with var(--text-secondary)
gray_colors = ["#a7b0bf", "#b4bcc9", "#9ea8b8", "#90a0b5", "#c8d1df"]
for c in gray_colors:
    content = content.replace(f"color: {c};", "color: var(--text-secondary);")

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Final color fix applied to WorkoutEngine.jsx.")
