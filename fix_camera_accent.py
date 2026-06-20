import os

file_path = r"C:\Users\alizh\PycharmProjects\FastAPIProject\frontend\src\components\workouts\CameraCoachPanel.jsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("'#61dafb'", "'var(--accent-text)'")
content = content.replace("color: '#61dafb'", "color: 'var(--accent-text)'")

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Updated CameraCoachPanel.jsx with --accent-text.")
