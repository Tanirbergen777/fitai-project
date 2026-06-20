import os

file_path = r"C:\Users\alizh\PycharmProjects\FastAPIProject\frontend\src\components\workouts\WorkoutEngine.jsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Replace main cards background
content = content.replace(
    "linear-gradient(180deg, #232833 0%, #1b2029 100%)",
    "var(--card-bg)"
)
content = content.replace(
    "border: 1px solid rgba(255,255,255,0.07);",
    "border: 1px solid var(--border-color);"
)
content = content.replace(
    "box-shadow: 0 24px 60px rgba(0,0,0,0.32);",
    "box-shadow: var(--shadow-md, 0 10px 30px rgba(0,0,0,0.1));"
)

# Text secondary replacements for exercise plan list
content = content.replace("color: #aab3c2;", "color: var(--text-secondary);")
content = content.replace("color: #8c98a9;", "color: var(--text-secondary);")

# Also find other hardcoded dark backgrounds
content = content.replace("background: #10151d;", "background: var(--bg-main);")
content = content.replace("background: #1a1f28;", "background: var(--card-bg);")

# Update we-rest-card text color if any
# Some texts might be hardcoded to color: #fff
content = content.replace("color: #fff;", "color: var(--text-primary);")
content = content.replace("color: white;", "color: var(--text-primary);")
content = content.replace("color: #ffffff;", "color: var(--text-primary);")

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Updated WorkoutEngine.jsx with dynamic theme variables.")
