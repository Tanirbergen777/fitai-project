import json

kaz_translations = {
    "aiPlan": {
      "mlFallback": "ML модель уақытша қолжетімсіз. Жоспар fallback planner арқылы құрылды.",
      "targetTime": "Таңдалған уақыт",
      "realTime": "Жоспар ұзақтығы",
      "exercises": "Жаттығулар",
      "start": "Жаттығуды бастау",
      "titles": {
        "gain": "AI жоспар: бұлшықет массасын арттыру",
        "lose": "AI жоспар: май жағу",
        "keep": "AI жоспар: форманы сақтау"
      }
    },
    "ai": {
      "surveyTitle": "AI арқылы жаттығу жоспарын таңдау",
      "surveySubtitle": "Анкетаны толтыр: жүйе мақсатыңа, уақытыңа, деңгейіңе және шектеулеріңе қарай жеке жаттығу жоспарын құрады.",
      "confidence": "Сенімділік",
      "source": "Дереккөз",
      "modelAccuracy": "Модель дәлдігі"
    },
    "aiSurvey": {
      "duration": "Неше минут жаттыға аласыз?",
      "focus": "Қай аймаққа көңіл бөлесіз?",
      "limitation": "Шектеулер бар ма?",
      "intensity": "Қарқын",
      "sourceTitle": "Неліктен анкета осылай құрылған?",
      "sourceText": "Сұрақтар жас, белсенділік деңгейі, мақсат, уақыт және шектеулер сияқты факторларға негізделген. Бұл факторлар NHANES/PAQ деректер құрылымына және физикалық белсенділік бойынша ұсыныстарға сәйкес келеді.",
      "building": "AI жоспар құрылып жатыр...",
      "buildPlan": "AI жоспар құру",
      "editAnswers": "Анкетаны өзгерту",
      "focusFull": "Бүкіл дене",
      "limitationNone": "Жоқ",
      "limitationKnee": "Тізе",
      "limitationBack": "Арқа/бел",
      "limitationLowImpact": "Төмен жүктеме керек",
      "limitationJoints": "Буын ауруы",
      "intensityLow": "Жеңіл",
      "intensityNormal": "Орташа",
      "intensityHigh": "Қарқынды",
      "intensityAuto": "AI арқылы таңдау"
    }
}

filename = 'frontend/src/locales/kaz.json'

with open(filename, 'r', encoding='utf-8') as f:
    data = json.load(f)

if "training" not in data:
    data["training"] = {}

# 1. Map existing general exercises to top-level categories
general = data["training"].get("general", {})
lose = data["training"].get("lose", {})

# full -> fullbody
if "full" in general:
    data["training"]["fullbody"] = general["full"]
if "chest" in general:
    data["training"]["chest"] = general["chest"]
if "abs" in general:
    data["training"]["abs"] = general["abs"]
if "arms" in general:
    data["training"]["arms"] = general["arms"]
if "legs" in general:
    data["training"]["legs"] = general["legs"]

# 2. Inject AI translations
for k, v in kaz_translations.items():
    if isinstance(v, dict):
        if k not in data["training"]:
            data["training"][k] = {}
        for sub_k, sub_v in v.items():
            data["training"][k][sub_k] = sub_v
    else:
        data["training"][k] = v

with open(filename, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("Kazakh JSON updated successfully!")
