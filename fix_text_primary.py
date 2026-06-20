import os
import glob

components_dir = r"C:\Users\alizh\PycharmProjects\FastAPIProject\frontend\src\components\workouts"
files = glob.glob(os.path.join(components_dir, "*.jsx"))

for file_path in files:
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    # I accidentally used --text-main instead of --text-primary
    content = content.replace("var(--text-main)", "var(--text-primary)")

    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)

print("Replaced --text-main with --text-primary.")
