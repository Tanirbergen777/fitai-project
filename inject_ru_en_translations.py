import json

ru_translations = {
    "aiPlan": {
      "mlFallback": "ML модель временно недоступна. План создан с помощью fallback planner.",
      "targetTime": "Выбранное время",
      "realTime": "Длительность плана",
      "exercises": "Упражнения",
      "start": "Начать тренировку"
    },
    "ai": {
      "surveyTitle": "Выбор плана тренировок с помощью AI",
      "surveySubtitle": "Заполните анкету: система создаст индивидуальный план тренировок в зависимости от ваших целей, времени, уровня и ограничений.",
      "confidence": "Уверенность",
      "source": "Источник",
      "modelAccuracy": "Точность модели"
    },
    "aiSurvey": {
      "duration": "Сколько минут можете тренироваться?",
      "focus": "На какую зону сделаем акцент?",
      "limitation": "Есть ли ограничения?",
      "intensity": "Интенсивность",
      "sourceTitle": "Почему анкета составлена именно так?",
      "sourceText": "Вопросы основаны на таких факторах, как возраст, уровень активности, цель, время и ограничения. Эти факторы соответствуют структуре данных NHANES/PAQ и рекомендациям по физической активности.",
      "building": "AI план создается...",
      "buildPlan": "Создать AI план",
      "editAnswers": "Изменить анкету",
      "focusFull": "Все тело",
      "limitationNone": "Нет",
      "limitationKnee": "Колени",
      "limitationBack": "Спина/поясница",
      "limitationLowImpact": "Нужна низкая нагрузка",
      "intensityLow": "Легкая",
      "intensityNormal": "Средняя",
      "intensityHigh": "Высокая",
      "intensityAuto": "Выбрать с помощью AI"
    }
}

en_translations = {
    "aiPlan": {
      "mlFallback": "ML model is temporarily unavailable. Plan generated using fallback planner.",
      "targetTime": "Selected Time",
      "realTime": "Plan Duration",
      "exercises": "Exercises",
      "start": "Start Workout"
    },
    "ai": {
      "surveyTitle": "Choose a workout plan with AI",
      "surveySubtitle": "Fill out the survey: the system will create a personalized workout plan based on your goals, time, level, and limitations.",
      "confidence": "Confidence",
      "source": "Source",
      "modelAccuracy": "Model accuracy"
    },
    "aiSurvey": {
      "duration": "How many minutes can you work out?",
      "focus": "Which area to focus on?",
      "limitation": "Any limitations?",
      "intensity": "Intensity",
      "sourceTitle": "Why is the survey structured this way?",
      "sourceText": "The questions are based on factors like age, activity level, goal, time, and limitations. These factors align with the NHANES/PAQ data structure and physical activity recommendations.",
      "building": "Building AI plan...",
      "buildPlan": "Generate AI Plan",
      "editAnswers": "Edit Answers",
      "focusFull": "Full body",
      "limitationNone": "None",
      "limitationKnee": "Knee",
      "limitationBack": "Back/Lower Back",
      "limitationLowImpact": "Low impact needed",
      "intensityLow": "Low",
      "intensityNormal": "Normal",
      "intensityHigh": "High",
      "intensityAuto": "Select with AI"
    }
}

def update_file(filename, update_dict):
    try:
        with open(filename, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except:
        data = {}
        
    if "training" not in data:
        data["training"] = {}
        
    for k, v in update_dict.items():
        if isinstance(v, dict):
            if k not in data["training"]:
                data["training"][k] = {}
            for sub_k, sub_v in v.items():
                data["training"][k][sub_k] = sub_v
        else:
            data["training"][k] = v
            
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

update_file('frontend/src/locales/ru.json', ru_translations)
update_file('frontend/src/locales/en.json', en_translations)
print("RU and EN json files updated with flattened AI training translations.")
