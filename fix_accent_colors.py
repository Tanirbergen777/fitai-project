import os

# Update App.css
app_css_path = r"C:\Users\alizh\PycharmProjects\FastAPIProject\frontend\src\App.css"
with open(app_css_path, "r", encoding="utf-8") as f:
    app_css = f.read()

# Light mode
if "--accent-text" not in app_css:
    app_css = app_css.replace(
        "--hero-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);",
        "--hero-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);\n  --accent-text: #007bb5;"
    )

# Dark mode
if "--accent-text: #61dafb;" not in app_css:
    app_css = app_css.replace(
        "--hero-shadow: 0 18px 42px rgba(0,0,0,0.22);",
        "--hero-shadow: 0 18px 42px rgba(0,0,0,0.22);\n  --accent-text: #61dafb;"
    )

with open(app_css_path, "w", encoding="utf-8") as f:
    f.write(app_css)

# Update WorkoutEngine.jsx
we_path = r"C:\Users\alizh\PycharmProjects\FastAPIProject\frontend\src\components\workouts\WorkoutEngine.jsx"
with open(we_path, "r", encoding="utf-8") as f:
    we_content = f.read()

we_content = we_content.replace("color: #7ce3ff;", "color: var(--accent-text);")
we_content = we_content.replace("color: #dbefff;", "color: var(--accent-text);")
we_content = we_content.replace("color: #61dafb;", "color: var(--accent-text);") # Also replace other #61dafb static colors so they look readable on light background

with open(we_path, "w", encoding="utf-8") as f:
    f.write(we_content)

print("Updated App.css and WorkoutEngine.jsx to fix light text on light backgrounds.")
