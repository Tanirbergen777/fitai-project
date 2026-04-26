import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import NutritionProfileSurvey from './NutritionProfileSurvey';
import {
  getNutritionProfile,
  saveNutritionProfile,
  getNutritionHistory,
  addNutritionHistory,
  clearNutritionHistoryApi,
  getNutritionRecommendations,
} from './nutritionApi';

const AINutritionPage = ({ onBack, userId, onFoodSelected }) => {
  const { t } = useTranslation();

  const [profile, setProfile] = useState(null);
  const [history, setHistory] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [currentSlot, setCurrentSlot] = useState('breakfast');
  const [showSurvey, setShowSurvey] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState('');
  const [pageLoading, setPageLoading] = useState(true);
  const [surveySaving, setSurveySaving] = useState(false);

  const goalLabelMap = {
    gain_mass: t('nutrition.ai.goalLabels.gain_mass'),
    lose_weight: t('nutrition.ai.goalLabels.lose_weight'),
    keep_fit: t('nutrition.ai.goalLabels.keep_fit'),
  };

  const slotLabelMap = {
    breakfast: t('nutrition.ai.slotLabels.breakfast'),
    lunch: t('nutrition.ai.slotLabels.lunch'),
    snack: t('nutrition.ai.slotLabels.snack'),
    dinner: t('nutrition.ai.slotLabels.dinner'),
    late: t('nutrition.ai.slotLabels.late'),
  };

  const budgetLabelMap = {
    low: t('nutrition.ai.budgetLabels.low'),
    medium: t('nutrition.ai.budgetLabels.medium'),
    high: t('nutrition.ai.budgetLabels.high'),
  };

  const loadHistory = useCallback(async () => {
    if (!userId) return [];
    const items = await getNutritionHistory(userId, true);
    setHistory(items);
    return items;
  }, [userId]);

  const loadRecommendations = useCallback(async () => {
    if (!userId) return;
    const data = await getNutritionRecommendations(userId);
    setCurrentSlot(data.current_slot);
    setRecommendations(data.recommendations || []);
  }, [userId]);

useEffect(() => {
  const loadPageData = async () => {
    setPageLoading(true);
    setSelectedMessage('');

    if (!userId) {
      setProfile(null);
      setHistory([]);
      setRecommendations([]);
      setShowSurvey(true);
      setPageLoading(false);
      return;
    }

    try {
      try {
        await loadHistory();
      } catch (historyError) {
        console.error('Nutrition history load error:', historyError);
        setHistory([]);
      }

      const profileData = await getNutritionProfile(userId);

      if (!profileData) {
        setProfile(null);
        setRecommendations([]);
        setShowSurvey(true);
        return;
      }

      setProfile(profileData);
      setShowSurvey(false);

      try {
        await loadRecommendations();
      } catch (recommendError) {
        console.error('Nutrition recommendations load error:', recommendError);
        setRecommendations([]);
        setSelectedMessage(t('nutrition.ai.messages.recommendationLoadError', 'Не удалось загрузить рекомендации'));
      }
    } catch (error) {
      console.error('Nutrition page load error:', error);
      setProfile(null);
      setRecommendations([]);
      setShowSurvey(true);
    } finally {
      setPageLoading(false);
    }
  };

  loadPageData();
}, [userId, loadHistory, loadRecommendations, t]);

  const todayFoods = history;

  const handleSaveProfile = async (payload) => {
    if (!userId) {
      setSelectedMessage(t('nutrition.ai.messages.userNotFound'));
      return;
    }

    setSurveySaving(true);

    try {
      const savedProfile = await saveNutritionProfile(userId, payload, !!profile);
      setProfile(savedProfile);
      setShowSurvey(false);
      await loadRecommendations();
      setSelectedMessage(t('nutrition.ai.messages.profileSaved'));
    } catch (error) {
      console.error(error);
      setSelectedMessage(
        error.message || t('nutrition.ai.messages.profileSaveError')
      );
    } finally {
      setSurveySaving(false);
    }
  };

  const handleSelectFood = async (food) => {
    if (!userId) {
      setSelectedMessage(t('nutrition.ai.messages.userNotFound'));
      return;
    }

    const alreadyToday = todayFoods.some((item) => item.name === food.name);

    try {
      await addNutritionHistory({
        user_id: userId,
        food_id: food.id,
        food_name: food.name,
        calories: food.calories,
        protein: food.protein,
        fat: food.fat,
        carbs: food.carbs,
        meal_time: slotLabelMap[currentSlot],
        source: 'ai',
      });

      await loadHistory();
      await loadRecommendations();

      onFoodSelected?.({
        foodKey: food.key || null,
        id: food.id,
        name: food.name,
        recipe: food.recipe,
        calories: food.calories,
        protein: food.protein,
        fat: food.fat,
        carbs: food.carbs,
        mealTime: slotLabelMap[currentSlot],
        source: 'ai',
      });

      if (alreadyToday) {
        setSelectedMessage(
          t('nutrition.ai.messages.alreadySelected', { name: food.name })
        );
      } else {
        setSelectedMessage(
          t('nutrition.ai.messages.selected', { name: food.name })
        );
      }
    } catch (error) {
      console.error(error);
      setSelectedMessage(t('nutrition.ai.messages.foodSaveError'));
    }
  };

  const handleClearHistory = async () => {
    if (!userId) {
      setSelectedMessage(t('nutrition.ai.messages.userNotFound'));
      return;
    }

    try {
      await clearNutritionHistoryApi(userId, true);
      setHistory([]);
      await loadRecommendations();
      setSelectedMessage(t('nutrition.ai.messages.historyCleared'));
    } catch (error) {
      console.error(error);
      setSelectedMessage(t('nutrition.ai.messages.historyClearError'));
    }
  };

  if (pageLoading) {
    return (
      <div className="nutrition-section">
        <div className="nutrition-ai-shell">
          <h2 className="nutrition-ai-title">{t('nutrition.ai.loadingTitle')}</h2>
        </div>
      </div>
    );
  }

  if (showSurvey) {
    return (
      <NutritionProfileSurvey
        initialData={profile}
        loading={surveySaving}
        onSubmit={handleSaveProfile}
        onBack={profile ? () => setShowSurvey(false) : onBack}
      />
    );
  }

  return (
    <div className="nutrition-section">
      <div className="nutrition-topbar">
        <button className="nutrition-back-btn" onClick={onBack}>
          ← {t('common.back')}
        </button>
      </div>

      <div className="nutrition-ai-shell">
        <div className="nutrition-ai-badge">{t('nutrition.ai.badge')}</div>
        <h2 className="nutrition-ai-title">{t('nutrition.ai.title')}</h2>
        <p className="nutrition-ai-text">{t('nutrition.ai.subtitle')}</p>

        <div className="nutrition-summary-row">
          <div className="nutrition-summary-chip">
            {t('nutrition.ai.summary.goal')}{' '}
            {goalLabelMap[profile?.goal] || t('nutrition.ai.summary.notSpecified')}
          </div>

          <div className="nutrition-summary-chip">
            {t('nutrition.ai.summary.currentSlot')}{' '}
            {slotLabelMap[currentSlot] || t('nutrition.ai.summary.notSpecified')}
          </div>

          <div className="nutrition-summary-chip">
            {t('nutrition.ai.summary.mealsPerDay')}: {profile?.meals_per_day ?? '—'}
          </div>

          <div className="nutrition-summary-chip">
            {t('nutrition.ai.summary.budget')}{' '}
            {budgetLabelMap[profile?.budget] || t('nutrition.ai.summary.notSpecified')}
          </div>
        </div>

        {todayFoods.length > 0 && (
          <div className="nutrition-empty-box" style={{ marginBottom: '20px' }}>
            <strong>{t('nutrition.ai.todaySelectedTitle')}</strong>
            <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {todayFoods.map((item) => (
                <div
                  key={item.id || `${item.name}-${item.selectedAt}`}
                  className="nutrition-summary-chip"
                >
                  {item.name}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="nutrition-ai-actions">
          <button
            className="nutrition-secondary-btn"
            onClick={() => setShowSurvey(true)}
          >
            {t('nutrition.ai.actions.editSurvey')}
          </button>

          {todayFoods.length > 0 && (
            <button
              className="nutrition-secondary-btn"
              onClick={handleClearHistory}
            >
              {t('nutrition.ai.actions.clearTodayHistory')}
            </button>
          )}
        </div>

        <h3 className="nutrition-section-title" style={{ marginTop: '26px' }}>
          {t('nutrition.ai.recommendationsTitle')}
        </h3>

        <p className="nutrition-section-subtitle">
          {t('nutrition.ai.recommendationsSubtitle', {
            slot: slotLabelMap[currentSlot] || t('nutrition.ai.fitsNow'),
          })}
        </p>

        {recommendations.length > 0 ? (
          <div className="nutrition-food-grid">
            {recommendations.map((food) => (
              <div className="nutrition-food-card" key={food.id}>
                <div className="nutrition-food-time">
                  {slotLabelMap[currentSlot] || t('nutrition.ai.fitsNow')}
                </div>

                <h3>{food.name}</h3>

                <div className="nutrition-food-stats">
                  <div className="nutrition-stat-box">
                    <div className="nutrition-stat-label">{t('nutrition.labels.calories')}</div>
                    <div className="nutrition-stat-value">
                      {food.calories} {t('nutrition.labels.kcal')}
                    </div>
                  </div>

                  <div className="nutrition-stat-box">
                    <div className="nutrition-stat-label">{t('nutrition.labels.protein')}</div>
                    <div className="nutrition-stat-value">
                      {food.protein} {t('nutrition.labels.grams')}
                    </div>
                  </div>

                  <div className="nutrition-stat-box">
                    <div className="nutrition-stat-label">{t('nutrition.labels.fat')}</div>
                    <div className="nutrition-stat-value">
                      {food.fat} {t('nutrition.labels.grams')}
                    </div>
                  </div>

                  <div className="nutrition-stat-box">
                    <div className="nutrition-stat-label">{t('nutrition.labels.carbs')}</div>
                    <div className="nutrition-stat-value">
                      {food.carbs} {t('nutrition.labels.grams')}
                    </div>
                  </div>
                </div>

                <p className="nutrition-recipe">{food.recipe}</p>

                {food.reason && (
                  <p className="nutrition-section-subtitle" style={{ marginBottom: '14px' }}>
                    {t('nutrition.ai.reasonLabel')}: {food.reason}
                  </p>
                )}

                <button
                  className="nutrition-select-btn"
                  onClick={() => handleSelectFood(food)}
                >
                  {t('nutrition.ai.selectDishButton')}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="nutrition-empty-box">
            {t('nutrition.ai.emptyRecommendations')}
          </div>
        )}

        {selectedMessage && (
          <div className="nutrition-message-box">{selectedMessage}</div>
        )}
      </div>
    </div>
  );
};

export default AINutritionPage;