import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import MassGainNutrition from './nutrition/MassGainNutrition';
import LoseWeightNutrition from './nutrition/LoseWeightNutrition';
import HealthyNutrition from './nutrition/HealthyNutrition';
import AINutritionPage from './nutrition/AINutritionPage';
import NutritionFoodActionModal from './nutrition/NutritionFoodActionModal';

const NutritionPage = ({ userId }) => {
  const { t } = useTranslation();
  const [selectedSection, setSelectedSection] = useState(null);
  const [selectedFood, setSelectedFood] = useState(null);
  const [isFoodModalOpen, setIsFoodModalOpen] = useState(false);

  const handleFoodSelected = (foodData) => {
    setSelectedFood(foodData);
    setIsFoodModalOpen(true);
  };

  const closeFoodModal = () => {
    setIsFoodModalOpen(false);
    setSelectedFood(null);
  };

  const renderSection = () => {
    if (selectedSection === 'gain') {
      return (
        <MassGainNutrition
          userId={userId}
          onBack={() => setSelectedSection(null)}
          onFoodSelected={handleFoodSelected}
        />
      );
    }

    if (selectedSection === 'lose') {
      return (
        <LoseWeightNutrition
          userId={userId}
          onBack={() => setSelectedSection(null)}
          onFoodSelected={handleFoodSelected}
        />
      );
    }

    if (selectedSection === 'healthy') {
      return (
        <HealthyNutrition
          userId={userId}
          onBack={() => setSelectedSection(null)}
        />
      );
    }

    if (selectedSection === 'ai') {
      return (
        <AINutritionPage
          userId={userId}
          onBack={() => setSelectedSection(null)}
          onFoodSelected={handleFoodSelected}
        />
      );
    }

    return null;
  };

  const cards = [
    {
      key: 'gain',
      icon: '🍚',
      className: 'gain',
      title: t('nutritionPage.cards.gain.title'),
      text: t('nutritionPage.cards.gain.text'),
    },
    {
      key: 'lose',
      icon: '🥗',
      className: 'lose',
      title: t('nutritionPage.cards.lose.title'),
      text: t('nutritionPage.cards.lose.text'),
    },
    {
      key: 'healthy',
      icon: '⚖️',
      className: 'healthy',
      title: t('nutritionPage.cards.healthy.title'),
      text: t('nutritionPage.cards.healthy.text'),
    },
    {
      key: 'ai',
      icon: '🤖',
      className: 'ai',
      title: t('nutritionPage.cards.ai.title'),
      text: t('nutritionPage.cards.ai.text'),
    },
  ];

  return (
    <div className="nutrition-page-container">
      {!selectedSection ? (
        <>
          <div className="nutrition-header">
            <h1 className="nutrition-main-title">{t('nutritionPage.title')}</h1>
            <p className="nutrition-subtitle">{t('nutritionPage.subtitle')}</p>
          </div>

          <div className="nutrition-selection-grid">
            {cards.map((card) => (
              <div
                key={card.key}
                className={`nutrition-selection-card ${card.className}`}
                onClick={() => setSelectedSection(card.key)}
              >
                <div className="nutrition-selection-icon">{card.icon}</div>
                <h3>{card.title}</h3>
                <p>{card.text}</p>
              </div>
            ))}
          </div>
        </>
      ) : (
        renderSection()
      )}

      <NutritionFoodActionModal
        open={isFoodModalOpen}
        food={selectedFood}
        onClose={closeFoodModal}
      />

      <style>{`
        .nutrition-page-container {
          display: flex;
          flex-direction: column;
          min-width: 100%;
          min-height: 100%;
          color: white;
          background-color: #1c1f24;
          padding: 20px;
          box-sizing: border-box;
          align-items: center;
        }

        .nutrition-header {
          text-align: center;
          margin-bottom: 36px;
        }

        .nutrition-main-title {
          font-size: clamp(32px, 5vw, 48px);
          font-weight: 900;
          margin-bottom: 10px;
        }

        .nutrition-subtitle {
          color: #aab3c2;
          font-size: 16px;
          max-width: 760px;
          margin: 0 auto;
          line-height: 1.6;
        }

        .nutrition-selection-grid {
          display: flex;
          flex-wrap: nowrap;
          gap: 20px;
          width: 100%;
          max-width: 1400px;
          padding: 20px;
          justify-content: center;
        }

        .nutrition-selection-card {
          flex: 1;
          min-width: 220px;
          max-width: 320px;
          background: #21252b;
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 24px;
          padding: 30px 24px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        .nutrition-selection-card:hover {
          transform: translateY(-8px);
          background: #2c313a;
          border-color: rgba(97, 218, 251, 0.4);
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.4);
        }

        .nutrition-selection-card.ai {
          border: 1px dashed rgba(198, 120, 221, 0.4);
          background: rgba(198, 120, 221, 0.03);
        }

        .nutrition-selection-card.ai:hover {
          border-color: #c678dd;
          box-shadow: 0 15px 35px rgba(198, 120, 221, 0.2);
        }

        .nutrition-selection-icon {
          font-size: 40px;
          margin-bottom: 18px;
        }

        .nutrition-selection-card h3 {
          margin: 0 0 12px 0;
          font-size: 22px;
          font-weight: 800;
          line-height: 1.2;
        }

        .nutrition-selection-card p {
          margin: 0;
          color: #9da5b4;
          font-size: 14px;
          line-height: 1.5;
        }

        .nutrition-section {
          width: 100%;
        }

        .nutrition-topbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }

        .nutrition-back-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(97, 218, 251, 0.08);
          border: 1px solid rgba(97, 218, 251, 0.35);
          color: #61dafb;
          padding: 12px 18px;
          border-radius: 999px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 700;
          transition: all 0.25s ease;
        }

        .nutrition-back-btn:hover {
          transform: translateY(-2px);
          background: rgba(97, 218, 251, 0.16);
          box-shadow: 0 10px 30px rgba(97, 218, 251, 0.18);
        }

        .nutrition-section-title {
          font-size: clamp(28px, 4vw, 40px);
          font-weight: 900;
          margin: 0 0 8px 0;
        }

        .nutrition-section-subtitle {
          color: #aab3c2;
          font-size: 15px;
          line-height: 1.6;
          margin-bottom: 26px;
        }

        .nutrition-food-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 18px;
        }

        .nutrition-food-card {
          background: linear-gradient(180deg, #232833 0%, #1b2029 100%);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 22px;
          padding: 22px;
          box-shadow: 0 18px 40px rgba(0,0,0,0.25);
        }

        .nutrition-food-card h3 {
          margin: 0 0 12px 0;
          font-size: 20px;
          font-weight: 800;
        }

        .nutrition-food-time {
          display: inline-block;
          margin-bottom: 14px;
          padding: 6px 12px;
          border-radius: 999px;
          background: rgba(97, 218, 251, 0.12);
          border: 1px solid rgba(97, 218, 251, 0.2);
          color: #7ce3ff;
          font-size: 12px;
          font-weight: 700;
        }

        .nutrition-food-stats {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
          margin-bottom: 14px;
        }

        .nutrition-stat-box {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 14px;
          padding: 10px 12px;
        }

        .nutrition-stat-label {
          font-size: 12px;
          color: #8f99aa;
          margin-bottom: 4px;
        }

        .nutrition-stat-value {
          font-size: 15px;
          font-weight: 800;
          color: #fff;
        }

        .nutrition-recipe {
          color: #c8d1df;
          font-size: 14px;
          line-height: 1.6;
          margin-bottom: 18px;
        }

        .nutrition-select-btn {
          width: 100%;
          border: none;
          border-radius: 16px;
          padding: 14px 16px;
          font-size: 14px;
          font-weight: 800;
          cursor: pointer;
          background: linear-gradient(135deg, #63e0ff 0%, #4e8fff 100%);
          color: #0f1720;
          box-shadow: 0 14px 30px rgba(97,218,251,0.25);
          transition: all 0.25s ease;
        }

        .nutrition-select-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 18px 34px rgba(97,218,251,0.32);
        }

        .nutrition-message-box {
          margin-top: 22px;
          padding: 16px 18px;
          border-radius: 18px;
          background: rgba(97, 218, 251, 0.10);
          border: 1px solid rgba(97, 218, 251, 0.25);
          color: #bdefff;
          font-weight: 700;
        }

        .nutrition-rules-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 18px;
        }

        .nutrition-rule-card {
          background: linear-gradient(180deg, #232833 0%, #1b2029 100%);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 22px;
          padding: 22px;
          box-shadow: 0 18px 40px rgba(0,0,0,0.25);
        }

        .nutrition-rule-icon {
          font-size: 32px;
          margin-bottom: 14px;
        }

        .nutrition-rule-card h3 {
          margin: 0 0 10px 0;
          font-size: 20px;
          font-weight: 800;
        }

        .nutrition-rule-card p {
          margin: 0;
          color: #c8d1df;
          line-height: 1.6;
          font-size: 14px;
        }

        .nutrition-ai-shell {
          background: linear-gradient(180deg, #232833 0%, #1b2029 100%);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 28px;
          padding: 28px;
          box-shadow: 0 25px 60px rgba(0,0,0,0.35);
        }

        .nutrition-ai-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 8px 14px;
          border-radius: 999px;
          background: rgba(198, 120, 221, 0.10);
          border: 1px solid rgba(198, 120, 221, 0.25);
          color: #d8a8ea;
          font-size: 12px;
          font-weight: 800;
          margin-bottom: 16px;
        }

        .nutrition-ai-title {
          font-size: clamp(28px, 4vw, 40px);
          font-weight: 900;
          margin: 0 0 10px 0;
        }

        .nutrition-ai-text {
          color: #aab3c2;
          line-height: 1.7;
          font-size: 15px;
          margin-bottom: 24px;
          max-width: 820px;
        }

        .nutrition-ai-actions {
          display: flex;
          gap: 14px;
          flex-wrap: wrap;
          margin-top: 20px;
        }

        .nutrition-primary-btn,
        .nutrition-secondary-btn {
          min-width: 190px;
          border-radius: 18px;
          padding: 14px 18px;
          font-size: 14px;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.25s ease;
        }

        .nutrition-primary-btn {
          border: none;
          background: linear-gradient(135deg, #63e0ff 0%, #4e8fff 100%);
          color: #0f1720;
          box-shadow: 0 14px 30px rgba(97,218,251,0.25);
        }

        .nutrition-secondary-btn {
          border: 1px solid rgba(255,255,255,0.12);
          background: transparent;
          color: #fff;
        }

        .nutrition-primary-btn:hover,
        .nutrition-secondary-btn:hover {
          transform: translateY(-2px);
        }

        .nutrition-summary-row {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin: 18px 0 24px;
        }

        .nutrition-summary-chip {
          padding: 8px 14px;
          border-radius: 999px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          color: #dce4f2;
          font-size: 13px;
          font-weight: 700;
        }

        .nutrition-empty-box {
          margin-top: 22px;
          padding: 18px;
          border-radius: 18px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.06);
          color: #c8d1df;
        }

        @media (max-width: 1100px) {
          .nutrition-selection-grid {
            flex-wrap: wrap;
          }
        }

        @media (max-width: 980px) {
          .nutrition-food-grid,
          .nutrition-rules-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 768px) {
          .nutrition-selection-grid {
            flex-direction: column;
            align-items: center;
          }

          .nutrition-selection-card {
            width: 100%;
            max-width: 400px;
          }

          .nutrition-food-grid,
          .nutrition-rules-grid {
            grid-template-columns: 1fr;
          }

          .nutrition-ai-shell {
            padding: 22px;
          }
        }
      `}</style>
    </div>
  );
};

export default NutritionPage;