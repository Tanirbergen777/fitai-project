import os
import re

file_path = r"C:\Users\alizh\PycharmProjects\FastAPIProject\frontend\src\components\EditProfileModal.jsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add useTranslation import
if "useTranslation" not in content:
    content = content.replace(
        "import { API_BASE_URL } from '../config/api';",
        "import { API_BASE_URL } from '../config/api';\nimport { useTranslation } from 'react-i18next';"
    )

# 2. Add t hook inside the component
if "const { t } = useTranslation();" not in content:
    content = content.replace(
        "const EditProfileModal = ({ user, aiResult, onClose, onSave }) => {",
        "const EditProfileModal = ({ user, aiResult, onClose, onSave }) => {\n  const { t } = useTranslation();"
    )

# 3. Replace BMI calculate categories
content = content.replace("category = 'Недостаточный вес';", "category = t('profile.editModal.bmiCategories.underweight');")
content = content.replace("category = 'Норма';", "category = t('profile.editModal.bmiCategories.normal');")
content = content.replace("category = 'Избыточный вес';", "category = t('profile.editModal.bmiCategories.overweight');")
content = content.replace("category = 'Ожирение 1 степени';", "category = t('profile.editModal.bmiCategories.obese1');")
content = content.replace("category = 'Ожирение 2 степени';", "category = t('profile.editModal.bmiCategories.obese2');")
content = content.replace("category = 'Ожирение 3 степени';", "category = t('profile.editModal.bmiCategories.obese3');")

# 4. Replace warnings
content = content.replace(
    "'Для цели \"Похудение\" желаемый вес должен быть меньше текущего.'",
    "t('profile.editModal.errors.weightLossRule')"
)
content = content.replace(
    "'Для цели \"Набор массы\" желаемый вес должен быть больше текущего.'",
    "t('profile.editModal.errors.muscleGainRule')"
)
content = content.replace(
    "`Ваш целевой вес приведет к ИМТ ${bmi.toFixed(1)} (${category}). Это может быть вредно для здоровья. Вы уверены, что хотите продолжить?`",
    "t('profile.editModal.errors.bmiWarning', { bmi: bmi.toFixed(1), category: category })"
)

# 5. JSX replacements
content = content.replace("Редактировать профиль", "{t('profile.editModal.title')}")
content = content.replace("Имя пользователя\n          </label>", "{t('profile.editModal.username')}\n          </label>")
content = content.replace("placeholder=\"Введите имя\"", "placeholder={t('profile.editModal.usernamePlaceholder')}")

content = content.replace("Дата рождения\n          </label>", "{t('profile.editModal.birthDate')}\n          </label>")

content = content.replace("Вес (кг)\n              </label>", "{t('profile.editModal.weight')}\n              </label>")
content = content.replace("Рост (см)\n              </label>", "{t('profile.editModal.height')}\n              </label>")

content = content.replace("<span>ИМТ:</span>", "<span>{t('profile.editModal.bmiLabel')}</span>")

content = content.replace("Цель\n          </label>", "{t('profile.editModal.goal')}\n          </label>")

# We also need to map the hardcoded database values to display values for options
content = content.replace(
    '<option value="Похудение">Похудение</option>',
    '<option value="Похудение">{t("profile.editModal.goalOptions.weightLoss")}</option>'
)
content = content.replace(
    '<option value="Набор массы">Набор массы</option>',
    '<option value="Набор массы">{t("profile.editModal.goalOptions.muscleGain")}</option>'
)
content = content.replace(
    '<option value="Улучшение формы">Улучшение формы</option>',
    '<option value="Улучшение формы">{t("profile.editModal.goalOptions.maintain")}</option>'
)

content = content.replace("Желаемый вес (кг)\n              </label>", "{t('profile.editModal.targetWeight')}\n              </label>")
content = content.replace("placeholder=\"Например, 75\"", "placeholder={t('profile.editModal.targetWeightPlaceholder')}")

content = content.replace("Целевой ИМТ:", "{t('profile.editModal.targetBmiLabel')}")

content = content.replace("Желаемый срок (в неделях)\n              </label>", "{t('profile.editModal.targetWeeks')}\n              </label>")
content = content.replace("placeholder=\"Например, 12\"", "placeholder={t('profile.editModal.targetWeeksPlaceholder')}")

content = content.replace("⏳ ML анализирует срок...", "{t('profile.editModal.mlLoading')}")

content = content.replace("✅ ML Вердикт: Отлично! Это здоровая и достижимая цель.", "{t('profile.editModal.mlGoodVerdict')}")
content = content.replace("Оптимальный план: <strong>", "{t('profile.editModal.mlOptimalPlan')} <strong>")
content = content.replace("раз в неделю</strong>", "{t('profile.editModal.timesPerWeek')}</strong>")
content = content.replace("За тренировку: <strong>", "{t('profile.editModal.perWorkout')} <strong>")
content = content.replace("мин.</strong>", "{t('profile.editModal.min')}</strong>")
content = content.replace("(сжигать около <strong>", "{t('profile.editModal.burnAbout')} <strong>")
content = content.replace("ккал</strong>)", "{t('profile.editModal.kcal')}")

content = content.replace("⚠️ ML Вердикт: Слишком быстро! Для безопасности мы рекомендуем минимум {Math.ceil(mlVerdict.recommended_days / 7)} недель.", "{t('profile.editModal.mlBadVerdict', { weeks: Math.ceil(mlVerdict.recommended_days / 7) })}")
content = content.replace("Если оставите этот срок, потребуется: <strong>", "{t('profile.editModal.mlHeavyPlan')} <strong>")
content = content.replace("тяжелых тренировок в неделю</strong>", "{t('profile.editModal.heavyWorkouts')}</strong>")

content = content.replace("⚠️ <strong>Внимание:</strong>", "⚠️ <strong>{t('profile.editModal.errors.attention')}</strong>")
content = content.replace("\n                  Понятно\n", "\n                  {t('profile.editModal.errors.gotIt')}\n")
content = content.replace("\n                    Да, сохранить\n", "\n                    {t('profile.editModal.errors.yesSave')}\n")
content = content.replace("\n                    Отмена\n", "\n                    {t('profile.editModal.errors.cancel')}\n")

content = content.replace("\n              СОХРАНИТЬ ИЗМЕНЕНИЯ\n", "\n              {t('profile.editModal.save')}\n")

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Updated EditProfileModal.jsx")
