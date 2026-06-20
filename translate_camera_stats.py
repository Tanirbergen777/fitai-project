import os
import json
import re

frontend_src = r"C:\Users\alizh\PycharmProjects\FastAPIProject\frontend\src"

# Update locales
locales_dir = os.path.join(frontend_src, "locales")
langs = ["kaz", "ru", "en"]

translations = {
    "kaz": {
        "camera": {
            "reps": "Қайталау",
            "phase": "Фаза",
            "goal": "Мақсат",
            "sec": "сек",
            "no_goal": "Мақсатсыз",
            "completed": "орындалды",
            "exercise_completed": "Жаттығу аяқталды",
            "not_completed": "Әлі аяқталған жоқ",
            "current_exercise": "Ағымдағы жаттығу:",
            "not_selected": "таңдалмаған",
            "legWidth": "Аяқтың ені",
            "kneeAngle": "Тізе бұрышы",
            "elbowAngle": "Шынтақ бұрышы",
            "hipShift": "Жамбас ауытқуы",
            "kneeHeight": "Тізе биіктігі",
            "torsoAngle": "Дене бұрышы",
            "angle": "Бұрыш",
            "feedback_normal": "Бастапқы позиция қалыпты.",
            "ready": "Дайын",
            "loading": "Жүктелуде",
            "error": "Қате"
        }
    },
    "ru": {
        "camera": {
            "reps": "Повторы",
            "phase": "Фаза",
            "goal": "Цель",
            "sec": "сек",
            "no_goal": "Без цели",
            "completed": "выполнено",
            "exercise_completed": "Упражнение завершено",
            "not_completed": "Ещё не завершено",
            "current_exercise": "Текущее упражнение:",
            "not_selected": "не выбрано",
            "legWidth": "Ширина ног",
            "kneeAngle": "Угол колена",
            "elbowAngle": "Угол локтя",
            "hipShift": "Смещение таза",
            "kneeHeight": "Высота колена",
            "torsoAngle": "Угол корпуса",
            "angle": "Угол",
            "feedback_normal": "Исходная позиция нормальная.",
            "ready": "Готово",
            "loading": "Загрузка",
            "error": "Ошибка"
        }
    },
    "en": {
        "camera": {
            "reps": "Reps",
            "phase": "Phase",
            "goal": "Goal",
            "sec": "sec",
            "no_goal": "No goal",
            "completed": "completed",
            "exercise_completed": "Exercise completed",
            "not_completed": "Not completed yet",
            "current_exercise": "Current exercise:",
            "not_selected": "not selected",
            "legWidth": "Leg width",
            "kneeAngle": "Knee angle",
            "elbowAngle": "Elbow angle",
            "hipShift": "Hip shift",
            "kneeHeight": "Knee height",
            "torsoAngle": "Torso angle",
            "angle": "Angle",
            "feedback_normal": "Starting position is normal.",
            "ready": "Ready",
            "loading": "Loading",
            "error": "Error"
        }
    }
}

for lang in langs:
    filepath = os.path.join(locales_dir, f"{lang}.json")
    if os.path.exists(filepath):
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        data["camera"] = translations[lang]["camera"]
            
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

print("Locales updated.")

panel_path = os.path.join(frontend_src, "components", "workouts", "CameraCoachPanel.jsx")
with open(panel_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add useTranslation import if not there
if "useTranslation" not in content:
    content = content.replace("import React, { useEffect", "import React, { useEffect")
    content = content.replace("import { FilesetResolver", "import { useTranslation } from 'react-i18next';\nimport { FilesetResolver")

# Add const { t } = useTranslation(); to CameraCoachPanel component
if "const { t } = useTranslation();" not in content:
    content = content.replace("export default function CameraCoachPanel({", "export default function CameraCoachPanel({\n")
    content = re.sub(r"export default function CameraCoachPanel\(\{.*?\)\s*\{", lambda m: m.group(0) + "\n  const { t } = useTranslation();\n", content, flags=re.DOTALL)

# Translate metricLabel mapper
metric_map_code = """
  const translatedMetricLabel = useMemo(() => {
    const map = {
      'Ширина ног': t('camera.legWidth', 'Ширина ног'),
      'Угол колена': t('camera.kneeAngle', 'Угол колена'),
      'Угол локтя': t('camera.elbowAngle', 'Угол локтя'),
      'Смещение таза': t('camera.hipShift', 'Смещение таза'),
      'Высота колена': t('camera.kneeHeight', 'Высота колена'),
      'Угол корпуса': t('camera.torsoAngle', 'Угол корпуса'),
      'Угол': t('camera.angle', 'Угол'),
    };
    return map[metricLabel] || metricLabel;
  }, [metricLabel, t]);

  const translatedFeedback = useMemo(() => {
    if (feedback === 'Исходная позиция нормальная.') return t('camera.feedback_normal', 'Исходная позиция нормальная.');
    return feedback;
  }, [feedback, t]);
"""

if "translatedMetricLabel" not in content:
    content = content.replace("  const videoWrapStyle = {", metric_map_code + "\n  const videoWrapStyle = {")

# Replace hardcoded strings in JSX
replacements = {
    "<span style={styles.statLabel}>Повторы</span>": "<span style={styles.statLabel}>{t('camera.reps', 'Повторы')}</span>",
    "<span style={styles.statLabel}>Фаза</span>": "<span style={styles.statLabel}>{t('camera.phase', 'Фаза')}</span>",
    "<span style={styles.statLabel}>{metricLabel}</span>": "<span style={styles.statLabel}>{translatedMetricLabel}</span>",
    "<span style={styles.progressLabel}>Цель</span>": "<span style={styles.progressLabel}>{t('camera.goal', 'Цель')}</span>",
    " ? `${elapsedWorkSeconds} / ${targetDurationSeconds ?? '—'} сек`": " ? `${elapsedWorkSeconds} / ${targetDurationSeconds ?? '—'} ${t('camera.sec', 'сек')}`",
    ": targetLabel || 'Без цели'}": ": targetLabel || t('camera.no_goal', 'Без цели')}",
    "<span>{completionPercent ?? 0}% выполнено</span>": "<span>{completionPercent ?? 0}% {t('camera.completed', 'выполнено')}</span>",
    "isTargetReached ? 'Упражнение завершено' : 'Ещё не завершено'": "isTargetReached ? t('camera.exercise_completed', 'Упражнение завершено') : t('camera.not_completed', 'Ещё не завершено')",
    "Текущее упражнение: <strong>": "{t('camera.current_exercise', 'Текущее упражнение:')} <strong>",
    "{exerciseName || 'не выбрано'}": "{exerciseName || t('camera.not_selected', 'не выбрано')}",
    "{feedback}</div>": "{translatedFeedback}</div>",
    # Model status translations
    "modelStatus === 'ready'\n              ? 'Ready'\n              : modelStatus === 'loading'\n              ? 'Loading'\n              : 'Error'": "modelStatus === 'ready'\n              ? t('camera.ready', 'Ready')\n              : modelStatus === 'loading'\n              ? t('camera.loading', 'Loading')\n              : t('camera.error', 'Error')"
}

for old, new in replacements.items():
    content = content.replace(old, new)

with open(panel_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("CameraCoachPanel updated.")
