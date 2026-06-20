import os
import glob

components_dir = r"C:\Users\alizh\PycharmProjects\FastAPIProject\frontend\src\components\workouts"
files = glob.glob(os.path.join(components_dir, "*.jsx"))

for file_path in files:
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Replace hardcoded light gray text with CSS variable
    content = content.replace("color: #aab3c2;", "color: var(--text-secondary);")
    content = content.replace("color: #8c98a9;", "color: var(--text-secondary);")
    content = content.replace("rgba(255, 255, 255, 0.7)", "var(--text-secondary)")
    content = content.replace("rgba(255,255,255,0.7)", "var(--text-secondary)")
    
    # Replace hardcoded white borders or backgrounds
    content = content.replace("border: 1px solid rgba(255,255,255,0.08);", "border: 1px solid var(--border-color);")
    content = content.replace("border: 1px solid rgba(255, 255, 255, 0.08);", "border: 1px solid var(--border-color);")
    content = content.replace("background: rgba(255, 255, 255, 0.04);", "background: var(--card-bg);")
    content = content.replace("background: rgba(255,255,255,0.04);", "background: var(--card-bg);")
    content = content.replace("background: rgba(255,255,255,0.03);", "background: var(--card-bg);")
    content = content.replace("background: rgba(255, 255, 255, 0.03);", "background: var(--card-bg);")
    content = content.replace("background-color: rgba(255, 255, 255, 0.04);", "background-color: var(--card-bg);")
    content = content.replace("background-color: rgba(255,255,255,0.04);", "background-color: var(--card-bg);")
    
    # Shadow for cards shouldn't be so dark in light mode
    content = content.replace("box-shadow: 0 22px 50px rgba(0,0,0,0.32);", "box-shadow: var(--shadow-md);")
    content = content.replace("box-shadow: 0 16px 40px rgba(0, 0, 0, 0.4);", "box-shadow: var(--shadow-md);")

    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)

print("Replaced #aab3c2 and other hardcoded colors with CSS variables in all workout components.")
