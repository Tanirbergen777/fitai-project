import os
import json

locales_dir = r"C:\Users\alizh\PycharmProjects\FastAPIProject\frontend\src\locales"
files = {
    "ru": os.path.join(locales_dir, "ru.json"),
    "kaz": os.path.join(locales_dir, "kaz.json"),
    "en": os.path.join(locales_dir, "en.json")
}

translations = {
    "ru": {
        "title": "Редактировать профиль",
        "username": "Имя пользователя",
        "usernamePlaceholder": "Введите имя",
        "birthDate": "Дата рождения",
        "weight": "Вес (кг)",
        "height": "Рост (см)",
        "bmiLabel": "ИМТ:",
        "targetBmiLabel": "Целевой ИМТ:",
        "goal": "Цель",
        "goalOptions": {
            "weightLoss": "Похудение",
            "muscleGain": "Набор массы",
            "maintain": "Улучшение формы"
        },
        "targetWeight": "Желаемый вес (кг)",
        "targetWeightPlaceholder": "Например, 75",
        "targetWeeks": "Желаемый срок (в неделях)",
        "targetWeeksPlaceholder": "Например, 12",
        "mlLoading": "⏳ ML анализирует срок...",
        "mlGoodVerdict": "✅ ML Вердикт: Отлично! Это здоровая и достижимая цель.",
        "mlOptimalPlan": "Оптимальный план:",
        "timesPerWeek": "раз в неделю",
        "perWorkout": "За тренировку:",
        "min": "мин.",
        "burnAbout": "(сжигать около",
        "kcal": "ккал)",
        "mlBadVerdict": "⚠️ ML Вердикт: Слишком быстро! Для безопасности мы рекомендуем минимум {{weeks}} недель.",
        "mlHeavyPlan": "Если оставите этот срок, потребуется:",
        "heavyWorkouts": "тяжелых тренировок в неделю",
        "save": "СОХРАНИТЬ ИЗМЕНЕНИЯ",
        "errors": {
            "weightLossRule": "Для цели \"Похудение\" желаемый вес должен быть меньше текущего.",
            "muscleGainRule": "Для цели \"Набор массы\" желаемый вес должен быть больше текущего.",
            "bmiWarning": "Ваш целевой вес приведет к ИМТ {{bmi}} ({{category}}). Это может быть вредно для здоровья. Вы уверены, что хотите продолжить?",
            "attention": "Внимание:",
            "gotIt": "Понятно",
            "yesSave": "Да, сохранить",
            "cancel": "Отмена"
        },
        "bmiCategories": {
            "underweight": "Недостаточный вес",
            "normal": "Норма",
            "overweight": "Избыточный вес",
            "obese1": "Ожирение 1 степени",
            "obese2": "Ожирение 2 степени",
            "obese3": "Ожирение 3 степени"
        }
    },
    "kaz": {
        "title": "Профильді өңдеу",
        "username": "Пайдаланушы аты",
        "usernamePlaceholder": "Атыңызды енгізіңіз",
        "birthDate": "Туған күні",
        "weight": "Салмақ (кг)",
        "height": "Бойы (см)",
        "bmiLabel": "ДСИ:",
        "targetBmiLabel": "Мақсатты ДСИ:",
        "goal": "Мақсат",
        "goalOptions": {
            "weightLoss": "Салмақ тастау",
            "muscleGain": "Салмақ қосу",
            "maintain": "Форманы жақсарту"
        },
        "targetWeight": "Қажетті салмақ (кг)",
        "targetWeightPlaceholder": "Мысалы, 75",
        "targetWeeks": "Қажетті мерзім (апта)",
        "targetWeeksPlaceholder": "Мысалы, 12",
        "mlLoading": "⏳ ML мерзімді талдауда...",
        "mlGoodVerdict": "✅ ML Үкімі: Тамаша! Бұл денсаулыққа пайдалы және қол жетімді мақсат.",
        "mlOptimalPlan": "Оңтайлы жоспар:",
        "timesPerWeek": "рет аптасына",
        "perWorkout": "Бір жаттығу:",
        "min": "мин.",
        "burnAbout": "(шамамен",
        "kcal": "ккал жағу)",
        "mlBadVerdict": "⚠️ ML Үкімі: Тым жылдам! Қауіпсіздік үшін кем дегенде {{weeks}} апта ұсынамыз.",
        "mlHeavyPlan": "Осы мерзімді қалдырсаңыз, мынадай жүктеме қажет:",
        "heavyWorkouts": "ауыр жаттығу аптасына",
        "save": "ӨЗГЕРІСТЕРДІ САҚТАУ",
        "errors": {
            "weightLossRule": "\"Салмақ тастау\" мақсаты үшін қалаулы салмақ қазіргі салмақтан аз болуы керек.",
            "muscleGainRule": "\"Салмақ қосу\" мақсаты үшін қалаулы салмақ қазіргі салмақтан көп болуы керек.",
            "bmiWarning": "Сіздің мақсатты салмағыңыз ДСИ көрсеткішін {{bmi}} ({{category}}) етеді. Бұл денсаулыққа зиян болуы мүмкін. Жалғастырғыңыз келе ме?",
            "attention": "Назар аударыңыз:",
            "gotIt": "Түсінікті",
            "yesSave": "Иә, сақтау",
            "cancel": "Болдырмау"
        },
        "bmiCategories": {
            "underweight": "Салмақ жетіспеушілігі",
            "normal": "Қалыпты",
            "overweight": "Артық салмақ",
            "obese1": "1-ші дәрежелі семіздік",
            "obese2": "2-ші дәрежелі семіздік",
            "obese3": "3-ші дәрежелі семіздік"
        }
    },
    "en": {
        "title": "Edit Profile",
        "username": "Username",
        "usernamePlaceholder": "Enter your name",
        "birthDate": "Date of Birth",
        "weight": "Weight (kg)",
        "height": "Height (cm)",
        "bmiLabel": "BMI:",
        "targetBmiLabel": "Target BMI:",
        "goal": "Goal",
        "goalOptions": {
            "weightLoss": "Weight Loss",
            "muscleGain": "Muscle Gain",
            "maintain": "Improve Shape"
        },
        "targetWeight": "Target Weight (kg)",
        "targetWeightPlaceholder": "E.g., 75",
        "targetWeeks": "Target Timeframe (weeks)",
        "targetWeeksPlaceholder": "E.g., 12",
        "mlLoading": "⏳ ML is analyzing timeframe...",
        "mlGoodVerdict": "✅ ML Verdict: Great! This is a healthy and achievable goal.",
        "mlOptimalPlan": "Optimal plan:",
        "timesPerWeek": "times a week",
        "perWorkout": "Per workout:",
        "min": "min.",
        "burnAbout": "(burn around",
        "kcal": "kcal)",
        "mlBadVerdict": "⚠️ ML Verdict: Too fast! For safety, we recommend at least {{weeks}} weeks.",
        "mlHeavyPlan": "If you keep this timeframe, you'll need:",
        "heavyWorkouts": "heavy workouts per week",
        "save": "SAVE CHANGES",
        "errors": {
            "weightLossRule": "For 'Weight Loss', target weight must be less than current weight.",
            "muscleGainRule": "For 'Muscle Gain', target weight must be greater than current weight.",
            "bmiWarning": "Your target weight will lead to a BMI of {{bmi}} ({{category}}). This might be harmful to your health. Are you sure you want to continue?",
            "attention": "Warning:",
            "gotIt": "Got it",
            "yesSave": "Yes, save",
            "cancel": "Cancel"
        },
        "bmiCategories": {
            "underweight": "Underweight",
            "normal": "Normal",
            "overweight": "Overweight",
            "obese1": "Obesity Class I",
            "obese2": "Obesity Class II",
            "obese3": "Obesity Class III"
        }
    }
}

for lang, filepath in files.items():
    if os.path.exists(filepath):
        print(f"Reading {filepath}...")
        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)
        
        if "profile" not in data:
            data["profile"] = {}
            
        data["profile"]["editModal"] = translations[lang]
        
        print(f"Writing {filepath}...")
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

print("Double checked and updated translations successfully!")
