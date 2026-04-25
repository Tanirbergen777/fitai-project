import React from 'react';
import { useTranslation } from 'react-i18next';

const HEALTHY_RULE_KEYS = [
  { key: 'balanced_breakfast', icon: '🥣' },
  { key: 'lunch_energy', icon: '🍛' },
  { key: 'light_dinner', icon: '🥗' },
  { key: 'healthy_snack', icon: '🍎' },
  { key: 'maintain_shape', icon: '⚖️' },
  { key: 'daily_routine', icon: '📅' },
];

const HealthyNutrition = ({ onBack }) => {
  const { t } = useTranslation();

  return (
    <div className="nutrition-section">
      <div className="nutrition-topbar">
        <button className="nutrition-back-btn" onClick={onBack}>
          ← {t('common.back')}
        </button>
      </div>

      <h2 className="nutrition-section-title">{t('nutrition.healthy.title')}</h2>
      <p className="nutrition-section-subtitle">{t('nutrition.healthy.subtitle')}</p>

      <div className="nutrition-rules-grid">
        {HEALTHY_RULE_KEYS.map((rule) => (
          <div className="nutrition-rule-card" key={rule.key}>
            <div className="nutrition-rule-icon">{rule.icon}</div>
            <h3>{t(`nutrition.healthy.rules.${rule.key}.title`)}</h3>
            <p>{t(`nutrition.healthy.rules.${rule.key}.text`)}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HealthyNutrition;