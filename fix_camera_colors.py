import os

file_path = r"C:\Users\alizh\PycharmProjects\FastAPIProject\frontend\src\components\workouts\CameraCoachPanel.jsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Replace backgrounds and borders
content = content.replace("'rgba(255,255,255,0.04)'", "'var(--card-bg)'")
content = content.replace("'rgba(255, 255, 255, 0.04)'", "'var(--card-bg)'")
content = content.replace("'1px solid rgba(255,255,255,0.06)'", "'1px solid var(--border-color)'")
content = content.replace("'1px solid rgba(255, 255, 255, 0.06)'", "'1px solid var(--border-color)'")
content = content.replace("'rgba(255,255,255,0.08)'", "'var(--border-color)'")

# Replace colors
content = content.replace("'#9ea8b8'", "'var(--text-secondary)'")
content = content.replace("'#fff'", "'var(--text-primary)'")
content = content.replace("'white'", "'var(--text-primary)'")
content = content.replace("'#c9d4e4'", "'var(--text-secondary)'")
content = content.replace("'#dbefff'", "'var(--text-primary)'") # feedbackBox text
content = content.replace("'#aab3c2'", "'var(--text-secondary)'")

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Updated CameraCoachPanel.jsx with dynamic theme variables.")
