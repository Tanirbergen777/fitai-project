export const NUTRITION_HISTORY_KEY = 'nutrition_history_v1';

export const getTodayKey = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const readNutritionHistory = () => {
  try {
    const raw = localStorage.getItem(NUTRITION_HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveNutritionHistory = (history) => {
  localStorage.setItem(NUTRITION_HISTORY_KEY, JSON.stringify(history));
};

export const addFoodToHistory = (food, source = 'manual') => {
  const history = readNutritionHistory();
  const today = getTodayKey();

  const newItem = {
    id: Date.now(),
    foodId: food.id,
    name: food.name,
    calories: food.calories,
    protein: food.protein,
    fat: food.fat,
    carbs: food.carbs,
    mealTime: food.mealTime || null,
    source,
    date: today,
    selectedAt: new Date().toISOString(),
  };

  const nextHistory = [...history, newItem];
  saveNutritionHistory(nextHistory);

  return newItem;
};

export const wasFoodSelectedToday = (foodName) => {
  const history = readNutritionHistory();
  const today = getTodayKey();

  return history.some(
    (item) => item.date === today && item.name === foodName
  );
};
export const clearNutritionHistory = () => {
  localStorage.removeItem(NUTRITION_HISTORY_KEY);
};

export const getTodayFoodHistory = () => {
  const history = readNutritionHistory();
  const today = getTodayKey();

  return history.filter((item) => item.date === today);
};