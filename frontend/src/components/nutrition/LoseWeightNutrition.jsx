import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  addNutritionHistory,
  getNutritionHistory,
} from './nutritionApi';

const LOSE_FOODS = [
  {
    id: 1,
    key: 'omelet_vegetables',
    calories: 290,
    protein: 24,
    fat: 16,
    carbs: 10,
    mealTimeKey: 'breakfast',
  },
  {
    id: 2,
    key: 'chicken_salad',
    calories: 360,
    protein: 35,
    fat: 12,
    carbs: 14,
    mealTimeKey: 'lunch',
  },
  {
    id: 3,
    key: 'cottage_cheese_berries',
    calories: 220,
    protein: 22,
    fat: 7,
    carbs: 14,
    mealTimeKey: 'dinner',
  },
  {
    id: 4,
    key: 'buckwheat_turkey',
    calories: 340,
    protein: 30,
    fat: 9,
    carbs: 28,
    mealTimeKey: 'lunch',
  },
  {
    id: 5,
    key: 'fish_vegetables',
    calories: 310,
    protein: 29,
    fat: 11,
    carbs: 15,
    mealTimeKey: 'dinner',
  },
  {
    id: 6,
    key: 'yogurt_apple',
    calories: 180,
    protein: 10,
    fat: 5,
    carbs: 22,
    mealTimeKey: 'snack',
  },
];

const LoseWeightNutrition = ({ onBack, userId, onFoodSelected }) => {
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

  const getFoodName = (foodKey) => t(`nutrition.loseWeight.foods.${foodKey}.name`);
  const getFoodRecipe = (foodKey) => t(`nutrition.loseWeight.foods.${foodKey}.recipe`);
  const getMealTime = (mealTimeKey) => t(`nutrition.loseWeight.mealTimes.${mealTimeKey}`);

  const handleSelectFood = async (food) => {
    if (!userId) {
      setSelectedFoodMessage(t('nutrition.loseWeight.messages.userNotFound'));
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
        source: 'lose_weight',
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
        source: 'lose_weight',
      });

      if (alreadySelectedToday) {
        setSelectedFoodMessage(
          t('nutrition.loseWeight.messages.alreadySelected', {
            name: translatedName,
          })
        );
      } else {
        setSelectedFoodMessage(
          t('nutrition.loseWeight.messages.selected', {
            name: translatedName,
          })
        );
      }
    } catch (error) {
      console.error(error);
      setSelectedFoodMessage(t('nutrition.loseWeight.messages.saveError'));
    }
  };

  return (
    <div className="nutrition-section">
      <div className="nutrition-topbar">
        <button className="nutrition-back-btn" onClick={onBack}>
          ← {t('common.back')}
        </button>
      </div>

      <h2 className="nutrition-section-title">{t('nutrition.loseWeight.title')}</h2>
      <p className="nutrition-section-subtitle">{t('nutrition.loseWeight.subtitle')}</p>

      <div className="nutrition-food-grid">
        {LOSE_FOODS.map((food) => (
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
              {t('nutrition.loseWeight.selectButton')}
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

export default LoseWeightNutrition;