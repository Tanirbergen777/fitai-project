import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

const NutritionProfileSurvey = ({
  initialData = null,
  loading = false,
  onSubmit,
  onBack,
}) => {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');

  const normalizedInitial = useMemo(() => {
    return {
      goal: initialData?.goal || '',
      meals_per_day: initialData?.meals_per_day || 4,
      budget: initialData?.budget || 'medium',
      food_preferences: Array.isArray(initialData?.food_preferences)
        ? initialData.food_preferences
        : [],
      allergies: Array.isArray(initialData?.allergies)
        ? initialData.allergies
        : [],
      breakfast_time: initialData?.breakfast_time || '08:00',
      lunch_time: initialData?.lunch_time || '13:00',
      dinner_time: initialData?.dinner_time || '19:00',
      late_meals: initialData?.late_meals || 'sometimes',
      cooking_mode: initialData?.cooking_mode || 'both',
      disliked_foods: initialData?.disliked_foods || '',
    };
  }, [initialData]);

  const [form, setForm] = useState(normalizedInitial);

  useEffect(() => {
    setForm(normalizedInitial);
  }, [normalizedInitial]);

  const updateField = (field, value) => {
    setError('');
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const toggleArrayField = (field, value) => {
    setError('');

    setForm((prev) => {
      const current = prev[field] || [];
      const exists = current.includes(value);

      return {
        ...prev,
        [field]: exists
          ? current.filter((item) => item !== value)
          : [...current, value],
      };
    });
  };

  const validateStep = () => {
    if (step === 1 && !form.goal) {
      setError(t('nutrition.survey.errors.goalRequired', 'Выберите цель питания.'));
      return false;
    }

    setError('');
    return true;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    setStep((prev) => Math.min(prev + 1, 3));
  };

  const handlePrev = () => {
    setError('');
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = () => {
    if (!form.goal) {
      setError(t('nutrition.survey.errors.goalRequired', 'Выберите цель питания.'));
      return;
    }

    setError('');

    onSubmit?.({
      goal: form.goal,
      meals_per_day: Number(form.meals_per_day),
      budget: form.budget,
      food_preferences: form.food_preferences,
      allergies: form.allergies,
      breakfast_time: form.breakfast_time,
      lunch_time: form.lunch_time,
      dinner_time: form.dinner_time,
      late_meals: form.late_meals,
      cooking_mode: form.cooking_mode,
      disliked_foods: String(form.disliked_foods || '').trim(),
    });
  };

  const goalOptions = [
    {
      value: 'gain_mass',
      icon: '🍚',
      title: t('nutrition.survey.goals.gainMass.title', 'Набор массы'),
      text: t('nutrition.survey.goals.gainMass.text', 'Больше калорий и белка для роста мышц.'),
    },
    {
      value: 'lose_weight',
      icon: '🥗',
      title: t('nutrition.survey.goals.loseWeight.title', 'Похудение'),
      text: t('nutrition.survey.goals.loseWeight.text', 'Лёгкие блюда с контролем калорий.'),
    },
    {
      value: 'keep_fit',
      icon: '⚖️',
      title: t('nutrition.survey.goals.keepFit.title', 'Поддержание формы'),
      text: t('nutrition.survey.goals.keepFit.text', 'Сбалансированное питание на каждый день.'),
    },
  ];

  const preferenceOptions = [
    { value: 'high_protein', label: t('nutrition.survey.preferences.highProtein', 'Белковая еда') },
    { value: 'low_calorie', label: t('nutrition.survey.preferences.lowCalorie', 'Низкокалорийное') },
    { value: 'quick', label: t('nutrition.survey.preferences.quick', 'Быстро готовить') },
    { value: 'budget', label: t('nutrition.survey.preferences.budget', 'Бюджетно') },
    { value: 'healthy', label: t('nutrition.survey.preferences.healthy', 'Здоровое питание') },
    { value: 'fitness', label: t('nutrition.survey.preferences.fitness', 'Fitness рацион') },
  ];

  const allergyOptions = [
    { value: 'milk', label: t('nutrition.survey.allergies.milk', 'Молочные продукты') },
    { value: 'eggs', label: t('nutrition.survey.allergies.eggs', 'Яйца') },
    { value: 'nuts', label: t('nutrition.survey.allergies.nuts', 'Орехи') },
    { value: 'gluten', label: t('nutrition.survey.allergies.gluten', 'Глютен') },
    { value: 'fish', label: t('nutrition.survey.allergies.fish', 'Рыба') },
  ];

  const Chip = ({ active, onClick, children }) => (
    <button
      type="button"
      className={`nutrition-survey-chip ${active ? 'active' : ''}`}
      onClick={onClick}
    >
      {children}
    </button>
  );

  return (
    <div className="nutrition-section nutrition-survey-section">
      <div className="nutrition-survey-topbar">
        <button className="nutrition-back-btn" onClick={onBack}>
          ← {t('common.back', 'Назад')}
        </button>

        <div className="nutrition-survey-step-indicator">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className={`nutrition-survey-dot ${step >= item ? 'active' : ''}`}
            />
          ))}
        </div>
      </div>

      <div className="nutrition-survey-card">
        <div className="nutrition-ai-badge">
          {t('nutrition.survey.badge', 'AI Nutrition Survey')}
        </div>

        <h2 className="nutrition-ai-title">
          {t('nutrition.survey.title', 'Анкета питания')}
        </h2>

        <p className="nutrition-ai-text">
          {t(
            'nutrition.survey.subtitle',
            'Ответьте на несколько вопросов, чтобы AI мог подобрать еду под вашу цель, режим и предпочтения.'
          )}
        </p>

        {error && <div className="nutrition-survey-error">{error}</div>}

        {step === 1 && (
          <div className="nutrition-survey-step">
            <h3 className="nutrition-survey-question">
              {t('nutrition.survey.step1Title', 'Какая у вас цель?')}
            </h3>

            <div className="nutrition-survey-options-grid nutrition-survey-options-grid--three">
              {goalOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`nutrition-survey-option ${
                    form.goal === option.value ? 'active' : ''
                  }`}
                  onClick={() => updateField('goal', option.value)}
                >
                  <div className="nutrition-survey-option-icon">{option.icon}</div>
                  <h4>{option.title}</h4>
                  <p>{option.text}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="nutrition-survey-step">
            <h3 className="nutrition-survey-question">
              {t('nutrition.survey.step2Title', 'Предпочтения и ограничения')}
            </h3>

            <div className="nutrition-survey-block">
              <label className="nutrition-survey-label">
                {t('nutrition.survey.preferencesTitle', 'Что вам больше подходит?')}
              </label>

              <div className="nutrition-survey-chip-row">
                {preferenceOptions.map((option) => (
                  <Chip
                    key={option.value}
                    active={form.food_preferences.includes(option.value)}
                    onClick={() => toggleArrayField('food_preferences', option.value)}
                  >
                    {option.label}
                  </Chip>
                ))}
              </div>
            </div>

            <div className="nutrition-survey-block">
              <label className="nutrition-survey-label">
                {t('nutrition.survey.allergiesTitle', 'Есть аллергии?')}
              </label>

              <div className="nutrition-survey-chip-row">
                {allergyOptions.map((option) => (
                  <Chip
                    key={option.value}
                    active={form.allergies.includes(option.value)}
                    onClick={() => toggleArrayField('allergies', option.value)}
                  >
                    {option.label}
                  </Chip>
                ))}
              </div>
            </div>

            <div className="nutrition-survey-block">
              <label className="nutrition-survey-label">
                {t('nutrition.survey.dislikedFoods', 'Какие продукты не любите?')}
              </label>

              <input
                className="nutrition-survey-input"
                value={form.disliked_foods}
                onChange={(e) => updateField('disliked_foods', e.target.value)}
                placeholder={t('nutrition.survey.dislikedPlaceholder', 'Например: рыба, лук, творог')}
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="nutrition-survey-step">
            <h3 className="nutrition-survey-question">
              {t('nutrition.survey.step3Title', 'Режим питания')}
            </h3>

            <div className="nutrition-survey-form-grid">
              <div className="nutrition-survey-field">
                <label>{t('nutrition.survey.mealsPerDay', 'Приёмов пищи в день')}</label>
                <select
                  value={form.meals_per_day}
                  onChange={(e) => updateField('meals_per_day', e.target.value)}
                  className="nutrition-survey-input"
                >
                  <option value={3}>3</option>
                  <option value={4}>4</option>
                  <option value={5}>5</option>
                </select>
              </div>

              <div className="nutrition-survey-field">
                <label>{t('nutrition.survey.budget', 'Бюджет')}</label>
                <select
                  value={form.budget}
                  onChange={(e) => updateField('budget', e.target.value)}
                  className="nutrition-survey-input"
                >
                  <option value="low">{t('nutrition.ai.budgetLabels.low', 'Низкий')}</option>
                  <option value="medium">{t('nutrition.ai.budgetLabels.medium', 'Средний')}</option>
                  <option value="high">{t('nutrition.ai.budgetLabels.high', 'Высокий')}</option>
                </select>
              </div>

              <div className="nutrition-survey-field">
                <label>{t('nutrition.survey.breakfastTime', 'Завтрак')}</label>
                <input
                  type="time"
                  value={form.breakfast_time}
                  onChange={(e) => updateField('breakfast_time', e.target.value)}
                  className="nutrition-survey-input"
                />
              </div>

              <div className="nutrition-survey-field">
                <label>{t('nutrition.survey.lunchTime', 'Обед')}</label>
                <input
                  type="time"
                  value={form.lunch_time}
                  onChange={(e) => updateField('lunch_time', e.target.value)}
                  className="nutrition-survey-input"
                />
              </div>

              <div className="nutrition-survey-field">
                <label>{t('nutrition.survey.dinnerTime', 'Ужин')}</label>
                <input
                  type="time"
                  value={form.dinner_time}
                  onChange={(e) => updateField('dinner_time', e.target.value)}
                  className="nutrition-survey-input"
                />
              </div>

              <div className="nutrition-survey-field">
                <label>{t('nutrition.survey.lateMeals', 'Поздние приёмы пищи')}</label>
                <select
                  value={form.late_meals}
                  onChange={(e) => updateField('late_meals', e.target.value)}
                  className="nutrition-survey-input"
                >
                  <option value="avoid">{t('nutrition.survey.lateAvoid', 'Избегаю')}</option>
                  <option value="sometimes">{t('nutrition.survey.lateSometimes', 'Иногда')}</option>
                  <option value="often">{t('nutrition.survey.lateOften', 'Часто')}</option>
                </select>
              </div>

              <div className="nutrition-survey-field nutrition-survey-field--wide">
                <label>{t('nutrition.survey.cookingMode', 'Как предпочитаете питаться?')}</label>
                <select
                  value={form.cooking_mode}
                  onChange={(e) => updateField('cooking_mode', e.target.value)}
                  className="nutrition-survey-input"
                >
                  <option value="cook">{t('nutrition.survey.cookModeCook', 'Готовить самому')}</option>
                  <option value="buy">{t('nutrition.survey.cookModeBuy', 'Покупать готовое')}</option>
                  <option value="both">{t('nutrition.survey.cookModeBoth', 'Оба варианта')}</option>
                </select>
              </div>
            </div>
          </div>
        )}

        <div className="nutrition-survey-actions">
          {step > 1 ? (
            <button
              type="button"
              className="nutrition-survey-secondary-btn"
              onClick={handlePrev}
              disabled={loading}
            >
              {t('common.back', 'Назад')}
            </button>
          ) : (
            <button
              type="button"
              className="nutrition-survey-secondary-btn"
              onClick={onBack}
              disabled={loading}
            >
              {t('common.cancel', 'Отмена')}
            </button>
          )}

          {step < 3 ? (
            <button
              type="button"
              className="nutrition-survey-primary-btn"
              onClick={handleNext}
              disabled={loading}
            >
              {t('common.next', 'Далее')}
            </button>
          ) : (
            <button
              type="button"
              className="nutrition-survey-primary-btn"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading
                ? t('common.loading', 'Сохранение...')
                : t('nutrition.survey.saveButton', 'Сохранить анкету')}
            </button>
          )}
        </div>
      </div>

<style>{`
.nutrition-survey-section {
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
  box-sizing: border-box;
}

.nutrition-survey-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
}

.nutrition-survey-step-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
}

.nutrition-survey-dot {
  width: 30px;
  height: 8px;
  border-radius: 999px;
  background: rgba(255,255,255,0.12);
}

.nutrition-survey-dot.active {
  background: #61dafb;
  box-shadow: 0 0 18px rgba(97,218,251,0.35);
}

.nutrition-survey-card {
  background: linear-gradient(180deg, #232833 0%, #1b2029 100%);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 28px;
  padding: 28px;
  color: #fff;
  box-shadow: 0 25px 60px rgba(0,0,0,0.35);
  box-sizing: border-box;
}

.nutrition-survey-question {
  margin: 0 0 18px;
  font-size: 24px;
  font-weight: 900;
  color: #ffffff;
}

.nutrition-survey-options-grid {
  display: grid;
  gap: 16px;
}

.nutrition-survey-options-grid--three {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.nutrition-survey-option {
  border: 1px solid rgba(255,255,255,0.08);
  background: rgba(255,255,255,0.035);
  color: #fff;
  border-radius: 22px;
  padding: 22px;
  text-align: left;
  cursor: pointer;
  transition: all 0.25s ease;
  min-height: 190px;
  box-sizing: border-box;
  touch-action: manipulation;
}

.nutrition-survey-option:hover {
  transform: translateY(-3px);
  border-color: rgba(97,218,251,0.32);
  background: rgba(255,255,255,0.055);
}

.nutrition-survey-option:active {
  transform: scale(0.985);
}

.nutrition-survey-option.active {
  border-color: rgba(97,218,251,0.72);
  background: rgba(97,218,251,0.10);
  box-shadow: 0 18px 42px rgba(97,218,251,0.12);
}

.nutrition-survey-option-icon {
  font-size: 34px;
  margin-bottom: 14px;
}

.nutrition-survey-option h4 {
  margin: 0 0 8px;
  font-size: 20px;
  font-weight: 900;
}

.nutrition-survey-option p {
  margin: 0;
  color: #aab3c2;
  font-size: 14px;
  line-height: 1.55;
}

.nutrition-survey-block {
  margin-bottom: 22px;
}

.nutrition-survey-label,
.nutrition-survey-field label {
  display: block;
  color: #aab3c2;
  font-size: 13px;
  font-weight: 800;
  margin-bottom: 10px;
}

.nutrition-survey-chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.nutrition-survey-chip {
  border: 1px solid rgba(255,255,255,0.10);
  background: rgba(255,255,255,0.04);
  color: #dce4f2;
  border-radius: 999px;
  padding: 10px 14px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 800;
  transition: all 0.22s ease;
  touch-action: manipulation;
}

.nutrition-survey-chip.active {
  background: rgba(97,218,251,0.14);
  border-color: rgba(97,218,251,0.58);
  color: #7ce3ff;
}

.nutrition-survey-form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.nutrition-survey-field--wide {
  grid-column: 1 / -1;
}

.nutrition-survey-input {
  width: 100%;
  min-height: 50px;
  border-radius: 16px;
  border: 1px solid rgba(255,255,255,0.10);
  background: #1c1f24;
  color: #ffffff;
  padding: 0 14px;
  font-size: 15px;
  outline: none;
  box-sizing: border-box;
}

.nutrition-survey-input:focus {
  border-color: rgba(97,218,251,0.65);
  box-shadow: 0 0 0 4px rgba(97,218,251,0.10);
}

.nutrition-survey-error {
  margin: 0 0 18px;
  padding: 12px 14px;
  border-radius: 16px;
  background: rgba(255, 123, 123, 0.10);
  border: 1px solid rgba(255, 123, 123, 0.25);
  color: #ff9b9b;
  font-weight: 800;
  font-size: 14px;
}

.nutrition-survey-actions {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  margin-top: 28px;
}

.nutrition-survey-primary-btn,
.nutrition-survey-secondary-btn {
  min-width: 170px;
  border-radius: 18px;
  padding: 15px 20px;
  font-size: 15px;
  font-weight: 900;
  cursor: pointer;
  transition: all 0.25s ease;
  min-height: 52px;
  touch-action: manipulation;
}

.nutrition-survey-primary-btn {
  border: none;
  background: linear-gradient(135deg, #63e0ff 0%, #4e8fff 100%);
  color: #0f1720;
  box-shadow: 0 14px 30px rgba(97,218,251,0.25);
}

.nutrition-survey-secondary-btn {
  border: 1px solid rgba(255,255,255,0.12);
  background: transparent;
  color: #fff;
}

.nutrition-survey-primary-btn:disabled,
.nutrition-survey-secondary-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 900px) {
  .nutrition-survey-options-grid--three,
  .nutrition-survey-form-grid {
    grid-template-columns: 1fr;
  }
}

/* PHONE UI */
@media (max-width: 768px) {
  .nutrition-survey-section {
    width: 100%;
    max-width: 100%;
    min-height: auto;
    padding: 0 0 112px;
    margin: 0;
    box-sizing: border-box;
    overflow: visible;
  }

  .nutrition-survey-topbar {
    position: sticky;
    top: 0;
    z-index: 30;
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
    margin: -4px -2px 14px;
    padding: 8px 2px 12px;
    background: linear-gradient(
      180deg,
      rgba(28,31,36,0.98) 0%,
      rgba(28,31,36,0.90) 72%,
      rgba(28,31,36,0.00) 100%
    );
    backdrop-filter: blur(12px);
  }

  .nutrition-survey-topbar .nutrition-back-btn {
    width: fit-content;
    min-height: 42px;
    padding: 10px 14px;
    font-size: 13px;
  }

  .nutrition-survey-step-indicator {
    width: 100%;
    justify-content: center;
    gap: 7px;
  }

  .nutrition-survey-dot {
    width: 42px;
    height: 7px;
  }

  .nutrition-survey-card {
    width: 100%;
    padding: 18px;
    border-radius: 22px;
    box-shadow: 0 16px 38px rgba(0,0,0,0.28);
  }

  .nutrition-ai-badge {
    font-size: 11px;
    padding: 7px 12px;
    margin-bottom: 12px;
  }

  .nutrition-ai-title {
    font-size: clamp(28px, 9vw, 38px);
    line-height: 1.08;
    margin-bottom: 10px;
  }

  .nutrition-ai-text {
    font-size: 13px;
    line-height: 1.55;
    margin-bottom: 18px;
  }

  .nutrition-survey-question {
    font-size: 21px;
    line-height: 1.18;
    margin-bottom: 14px;
  }

  .nutrition-survey-options-grid {
    gap: 12px;
  }

  .nutrition-survey-option {
    min-height: auto;
    padding: 16px;
    border-radius: 20px;
    display: grid;
    grid-template-columns: 44px minmax(0, 1fr);
    column-gap: 12px;
    row-gap: 4px;
    align-items: start;
  }

  .nutrition-survey-option-icon {
    grid-row: span 2;
    width: 44px;
    height: 44px;
    border-radius: 15px;
    background: rgba(97,218,251,0.09);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 25px;
    margin: 0;
  }

  .nutrition-survey-option h4 {
    font-size: 18px;
    line-height: 1.18;
    margin: 0;
  }

  .nutrition-survey-option p {
    font-size: 12.5px;
    line-height: 1.45;
  }

  .nutrition-survey-block {
    margin-bottom: 18px;
  }

  .nutrition-survey-label,
  .nutrition-survey-field label {
    font-size: 12px;
    margin-bottom: 8px;
  }

  .nutrition-survey-chip-row {
    gap: 8px;
  }

  .nutrition-survey-chip {
    width: 100%;
    min-height: 46px;
    border-radius: 16px;
    text-align: left;
    padding: 12px 14px;
    font-size: 13px;
    display: flex;
    align-items: center;
  }

  .nutrition-survey-form-grid {
    grid-template-columns: 1fr;
    gap: 13px;
  }

  .nutrition-survey-input {
    min-height: 52px;
    border-radius: 16px;
    font-size: 16px;
    padding: 0 14px;
  }

  .nutrition-survey-error {
    font-size: 13px;
    border-radius: 14px;
    padding: 11px 12px;
  }

  .nutrition-survey-actions {
    position: sticky;
    bottom: calc(78px + env(safe-area-inset-bottom));
    z-index: 25;
    flex-direction: column-reverse;
    gap: 10px;
    margin: 22px -6px 0;
    padding: 12px 6px 4px;
    background: linear-gradient(
      0deg,
      rgba(28,31,36,0.98) 0%,
      rgba(28,31,36,0.92) 78%,
      rgba(28,31,36,0.00) 100%
    );
    backdrop-filter: blur(12px);
  }

  .nutrition-survey-primary-btn,
  .nutrition-survey-secondary-btn {
    width: 100%;
    min-width: 0;
    min-height: 54px;
    border-radius: 17px;
    font-size: 15px;
  }
}

/* SMALL PHONE */
@media (max-width: 430px) {
  .nutrition-survey-section {
    padding-bottom: 116px;
  }

  .nutrition-survey-card {
    padding: 16px;
    border-radius: 20px;
  }

  .nutrition-survey-dot {
    width: 34px;
  }

  .nutrition-survey-option {
    padding: 14px;
    border-radius: 18px;
    grid-template-columns: 40px minmax(0, 1fr);
  }

  .nutrition-survey-option-icon {
    width: 40px;
    height: 40px;
    font-size: 23px;
    border-radius: 14px;
  }

  .nutrition-survey-option h4 {
    font-size: 17px;
  }

  .nutrition-survey-option p {
    font-size: 12px;
  }

  .nutrition-survey-actions {
    bottom: calc(74px + env(safe-area-inset-bottom));
  }
}
`}</style>
    </div>
  );
};

export default NutritionProfileSurvey;