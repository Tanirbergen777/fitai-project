import json
import os

locales_dir = r"C:\Users\alizh\PycharmProjects\FastAPIProject\frontend\src\locales"

data = {
    "en": {
        "title": "Your Progress (ML Goals)",
        "subtitle": "Based on AI recommendations",
        "weeks_label": "Duration (weeks)",
        "workouts_label": "Workouts (week)",
        "calories_label": "Calories (today)",
        "duration_label": "Time (today)",
        "calories_suffix": "kcal",
        "duration_suffix": "min"
    },
    "ru": {
        "title": "Ваш Прогресс (ML Цели)",
        "subtitle": "Основано на рекомендациях ИИ",
        "weeks_label": "Срок (недели)",
        "workouts_label": "Тренировки (неделя)",
        "calories_label": "Калории (сегодня)",
        "duration_label": "Время (сегодня)",
        "calories_suffix": "ккал",
        "duration_suffix": "мин"
    },
    "kaz": {
        "title": "Сіздің Прогрессіңіз (ML Мақсаттар)",
        "subtitle": "AI ұсыныстары негізінде",
        "weeks_label": "Мерзімі (апта)",
        "workouts_label": "Жаттығу (апта)",
        "calories_label": "Калория (бүгін)",
        "duration_label": "Уақыт (бүгін)",
        "calories_suffix": "ккал",
        "duration_suffix": "мин"
    }
}

for lang, vals in data.items():
    file_path = os.path.join(locales_dir, f"{lang}.json")
    if os.path.exists(file_path):
        with open(file_path, "r", encoding="utf-8") as f:
            content = json.load(f)
        
        if "dashboard" not in content:
            content["dashboard"] = {}
            
        content["dashboard"]["ml_progress"] = vals
        
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(content, f, ensure_ascii=False, indent=2)
        print(f"Updated {lang}.json")
    else:
        print(f"File {file_path} not found")
