import os

components_dir = r"C:\Users\alizh\PycharmProjects\FastAPIProject\frontend\src\components\workouts"

# Update LoseWeightWorkout.jsx
file_path = os.path.join(components_dir, "LoseWeightWorkout.jsx")
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace(
    '<span className="lw-badge">Fat loss training</span>',
    '<span className="lw-badge">{t(\'training.loseWeightPage.badge\')}</span>'
)
content = content.replace(
    '<span className="bodypart-hint">Start fat burn ›</span>',
    '<span className="bodypart-hint">{t(\'training.loseWeightPage.startButton\')} ›</span>'
)
content = content.replace(
    'Выберите направление, а система откроет энергичный план с видео,\n              таймером и контролем выполнения.',
    '{t(\'training.loseWeightPage.subtitle\')}'
)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

# Update GeneralWorkout.jsx
file_path = os.path.join(components_dir, "GeneralWorkout.jsx")
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace(
    '<span className="gw-badge">General training</span>',
    '<span className="gw-badge">{t(\'training.generalPage.badge\')}</span>'
)
content = content.replace(
    '<span className="bodypart-hint">Start workout ›</span>',
    '<span className="bodypart-hint">{t(\'training.generalPage.startButton\')} ›</span>'
)
content = content.replace(
    'Выберите направление, чтобы поддержать тонус и здоровье с помощью\n              умеренных нагрузок.',
    '{t(\'training.generalPage.subtitle\')}'
)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Replaced hardcoded strings with translation keys in LoseWeightWorkout.jsx and GeneralWorkout.jsx.")
