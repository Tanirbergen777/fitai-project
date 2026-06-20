import json
import os

locales_dir = r"C:\Users\alizh\PycharmProjects\FastAPIProject\frontend\src\locales"

translations = {
    "ru": {
        "massGainPage": {
            "badge": "Тренировка на массу",
            "subtitle": "Выберите зону для акцентированной силовой тренировки, и система подготовит план с видео и таймерами.",
            "startButton": "Начать тренировку"
        },
        "loseWeightPage": {
            "badge": "Жиросжигание",
            "subtitle": "Выберите направление, а система откроет энергичный план с видео, таймером и контролем выполнения.",
            "startButton": "Начать сжигание"
        },
        "generalPage": {
            "badge": "Общая форма",
            "subtitle": "Выберите направление, чтобы поддержать тонус и здоровье с помощью умеренных нагрузок.",
            "startButton": "Начать тренировку"
        }
    },
    "en": {
        "massGainPage": {
            "badge": "Mass Gain Training",
            "subtitle": "Choose a zone for focused strength training, and the system will prepare a plan with videos and timers.",
            "startButton": "Start workout"
        },
        "loseWeightPage": {
            "badge": "Fat Loss Training",
            "subtitle": "Select a direction, and the system will open an energetic plan with videos, timers, and execution control.",
            "startButton": "Start fat burn"
        },
        "generalPage": {
            "badge": "General Training",
            "subtitle": "Select a direction to maintain tone and health with moderate exercises.",
            "startButton": "Start workout"
        }
    },
    "kaz": {
        "massGainPage": {
            "badge": "Салмақ қосу жаттығуы",
            "subtitle": "Күш жаттығулары үшін аймақты таңдаңыз, ал жүйе бейнелер мен таймерлері бар жоспар дайындайды.",
            "startButton": "Жаттығуды бастау"
        },
        "loseWeightPage": {
            "badge": "Май жағу жаттығуы",
            "subtitle": "Бағытты таңдаңыз, ал жүйе бейне, таймер және орындалуды бақылау бар энергетикалық жоспар ашады.",
            "startButton": "Май жағуды бастау"
        },
        "generalPage": {
            "badge": "Жалпы форма жаттығуы",
            "subtitle": "Орташа жүктемелермен тонус пен денсаулықты сақтау үшін бағытты таңдаңыз.",
            "startButton": "Жаттығуды бастау"
        }
    }
}

for lang, data in translations.items():
    file_path = os.path.join(locales_dir, f"{lang}.json")
    if os.path.exists(file_path):
        with open(file_path, "r", encoding="utf-8") as f:
            j = json.load(f)
            
        if "training" not in j:
            j["training"] = {}
            
        j["training"]["massGainPage"] = data["massGainPage"]
        j["training"]["loseWeightPage"] = data["loseWeightPage"]
        j["training"]["generalPage"] = data["generalPage"]
        
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(j, f, ensure_ascii=False, indent=2)

print("Translation files updated successfully.")
