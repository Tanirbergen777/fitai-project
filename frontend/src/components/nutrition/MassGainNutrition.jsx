import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  addNutritionHistory,
  getNutritionHistory,
} from './nutritionApi';

const MASS_FOODS = [
  {
    id: 1,
    key: 'oatmeal_banana_nuts',
    calories: 520,
    protein: 18,
    fat: 16,
    carbs: 74,
    mealTimeKey: 'breakfast',
  },
  {
    id: 2,
    key: 'rice_chicken',
    calories: 680,
    protein: 42,
    fat: 14,
    carbs: 88,
    mealTimeKey: 'lunch',
  },
  {
    id: 3,
    key: 'pasta_beef',
    calories: 710,
    protein: 36,
    fat: 18,
    carbs: 90,
    mealTimeKey: 'lunch',
  },
  {
    id: 4,
    key: 'buckwheat_eggs',
    calories: 470,
    protein: 24,
    fat: 18,
    carbs: 48,
    mealTimeKey: 'dinner',
  },
  {
    id: 5,
    key: 'cottage_cheese_banana',
    calories: 390,
    protein: 28,
    fat: 10,
    carbs: 34,
    mealTimeKey: 'snack',
  },
  {
    id: 6,
    key: 'potato_turkey',
    calories: 620,
    protein: 38,
    fat: 16,
    carbs: 72,
    mealTimeKey: 'dinner',
  },
];

const MassGainNutrition = ({ onBack, userId, onFoodSelected }) => {
  const { t } = useTranslation();
  const [selectedFoodMessage, setSelectedFoodMessage] = useState('');
  const [todayHistory, setTodayHistory] = useState([]);

  const loadTodayHistory = useCallback(async () => {
    if (!userId) return;
    try {
      const items = await getNutritionHistory(userId, true);
      setTodayHistory(items);
    } catch (error) {
      console.error('Nutrition history load error:', error);
    }
  }, [userId]);

  useEffect(() => {
    loadTodayHistory();
  }, [loadTodayHistory]);

  const getFoodName = (foodKey) => t(`nutrition.massGain.foods.${foodKey}.name`);
  const getFoodRecipe = (foodKey) => t(`nutrition.massGain.foods.${foodKey}.recipe`);
  const getMealTime = (mealTimeKey) => t(`nutrition.massGain.mealTimes.${mealTimeKey}`);

  const handleSelectFood = async (food) => {
    if (!userId) {
      setSelectedFoodMessage(t('nutrition.massGain.messages.userNotFound'));
      return;
    }

    const translatedName = getFoodName(food.key);
    const translatedMealTime = getMealTime(food.mealTimeKey);
    const alreadySelectedToday = todayHistory.some((item) => item.name === translatedName);

    try {
      await addNutritionHistory({
        user_id: userId,
        food_id: food.id,
        food_name: translatedName,
        calories: food.calories,
        protein: food.protein,
        fat: food.fat,
        carbs: food.carbs,
        meal_time: translatedMealTime,
        source: 'mass_gain',
      });

      await loadTodayHistory();

      onFoodSelected?.({
        foodKey: food.key,
        id: food.id,
        name: translatedName,
        recipe: getFoodRecipe(food.key),
        calories: food.calories,
        protein: food.protein,
        fat: food.fat,
        carbs: food.carbs,
        mealTime: translatedMealTime,
        source: 'mass_gain',
      });

      if (alreadySelectedToday) {
        setSelectedFoodMessage(
          t('nutrition.massGain.messages.alreadySelected', {
            name: translatedName,
          })
        );
      } else {
        setSelectedFoodMessage(
          t('nutrition.massGain.messages.selected', {
            name: translatedName,
          })
        );
      }
    } catch (error) {
      console.error(error);
      setSelectedFoodMessage(t('nutrition.massGain.messages.saveError'));
    }
  };

  return (
    <div className="nutrition-section">
      <div className="nutrition-topbar">
        <button className="nutrition-back-btn" onClick={onBack}>
          ← {t('common.back')}
        </button>
      </div>

      <h2 className="nutrition-section-title">{t('nutrition.massGain.title')}</h2>
      <p className="nutrition-section-subtitle">{t('nutrition.massGain.subtitle')}</p>

      <div className="nutrition-food-grid">
        {MASS_FOODS.map((food) => (
          <div className="nutrition-food-card" key={food.id}>
            <div className="nutrition-food-time">{getMealTime(food.mealTimeKey)}</div>
            <h3>{getFoodName(food.key)}</h3>

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

            <p className="nutrition-recipe">{getFoodRecipe(food.key)}</p>

            <button
              className="nutrition-select-btn"
              onClick={() => handleSelectFood(food)}
            >
              {t('nutrition.massGain.selectButton')}
            </button>
          </div>
        ))}
      </div>

      {selectedFoodMessage && (
        <div className="nutrition-message-box">{selectedFoodMessage}</div>
      )}
    </div>
  );
};

export default MassGainNutrition;