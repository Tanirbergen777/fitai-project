import os

file_path = r"C:\Users\alizh\PycharmProjects\FastAPIProject\frontend\src\components\workouts\WorkoutEngine.jsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Replace light borders
content = content.replace(
    "border-bottom: 1px solid rgba(255,255,255,0.05);",
    "border-bottom: 1px solid var(--border-color);"
)
content = content.replace(
    "border-bottom: 1px solid rgba(255, 255, 255, 0.05);",
    "border-bottom: 1px solid var(--border-color);"
)

# Text secondary
content = content.replace("color: #8f99aa;", "color: var(--text-secondary);")
content = content.replace("color: #96a0b1;", "color: var(--text-secondary);")

# Also the very dark gradient fallback
content = content.replace("linear-gradient(180deg, rgba(28,31,36,0.98), rgba(28,31,36,0.86))", "var(--card-bg)")
content = content.replace("background: rgba(7, 10, 16, 0.72);", "background: var(--bg-main);")

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Updated more minor colors in WorkoutEngine.jsx.")
