import json
import os

locales_dir = r"C:\Users\alizh\PycharmProjects\FastAPIProject\frontend\src\locales"

updates = {
    "en": "Your Progress",
    "ru": "Ваш Прогресс",
    "kaz": "Сіздің Прогрессіңіз"
}

for lang, new_title in updates.items():
    file_path = os.path.join(locales_dir, f"{lang}.json")
    if os.path.exists(file_path):
        with open(file_path, "r", encoding="utf-8") as f:
            content = json.load(f)
        
        if "dashboard" in content and "ml_progress" in content["dashboard"]:
            content["dashboard"]["ml_progress"]["title"] = new_title
        
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(content, f, ensure_ascii=False, indent=2)
        print(f"Updated {lang}.json")
