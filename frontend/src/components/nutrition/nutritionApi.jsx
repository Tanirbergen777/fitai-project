import { API_BASE_URL } from '../../config/api';

const API_BASE = API_BASE_URL;
export const csvToArray = (value) => {
  if (!value) return [];
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
};

export const arrayToCsv = (value) => {
  if (!value || !Array.isArray(value)) return '';
  return value.join(',');
};

export const normalizeProfileFromApi = (data) => {
  return {
    ...data,
    food_preferences: csvToArray(data.food_preferences),
    allergies: csvToArray(data.allergies),
  };
};

export const normalizeHistoryItem = (item) => {
  return {
    id: item.id,
    userId: item.user_id,
    foodId: item.food_id,
    name: item.food_name,
    calories: item.calories,
    protein: item.protein,
    fat: item.fat,
    carbs: item.carbs,
    mealTime: item.meal_time,
    source: item.source,
    date: item.selected_date,
    selectedAt: item.selected_at,
  };
};

const parseError = async (res, fallbackText) => {
  try {
    const data = await res.json();
    return data.detail || fallbackText;
  } catch {
    return fallbackText;
  }
};

export const getNutritionProfile = async (userId) => {
  const res = await fetch(`${API_BASE}/nutrition/profile/${userId}`);
  if (!res.ok) {
    throw new Error(await parseError(res, 'Не удалось загрузить профиль питания'));
  }

  const data = await res.json();
  return normalizeProfileFromApi(data);
};

export const saveNutritionProfile = async (userId, payload, hasProfile = false) => {
  const body = {
    goal: payload.goal,
    meals_per_day: payload.meals_per_day,
    budget: payload.budget,
    food_preferences: arrayToCsv(payload.food_preferences),
    allergies: arrayToCsv(payload.allergies),
    breakfast_time: payload.breakfast_time,
    lunch_time: payload.lunch_time,
    dinner_time: payload.dinner_time,
    late_meals: payload.late_meals,
    cooking_mode: payload.cooking_mode,
    disliked_foods: payload.disliked_foods,
  };

  let res;

  if (hasProfile) {
    res = await fetch(`${API_BASE}/nutrition/profile/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } else {
    res = await fetch(`${API_BASE}/nutrition/profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: userId,
        ...body,
      }),
    });
  }

  if (!res.ok) {
    throw new Error(await parseError(res, 'Не удалось сохранить профиль питания'));
  }

  const data = await res.json();
  return normalizeProfileFromApi(data);
};

export const getNutritionHistory = async (userId, onlyToday = true) => {
  const res = await fetch(
    `${API_BASE}/nutrition/history/${userId}?only_today=${onlyToday}`
  );

  if (!res.ok) {
    throw new Error(await parseError(res, 'Не удалось загрузить историю питания'));
  }

  const data = await res.json();
  return data.map(normalizeHistoryItem);
};

export const addNutritionHistory = async (payload) => {
  const res = await fetch(`${API_BASE}/nutrition/history`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(await parseError(res, 'Не удалось сохранить историю питания'));
  }

  const data = await res.json();
  return normalizeHistoryItem(data);
};

export const clearNutritionHistoryApi = async (userId, onlyToday = true) => {
  const res = await fetch(
    `${API_BASE}/nutrition/history/${userId}?only_today=${onlyToday}`,
    { method: 'DELETE' }
  );

  if (!res.ok) {
    throw new Error(await parseError(res, 'Не удалось очистить историю питания'));
  }

  return res.json();
};
export const getNutritionRecommendations = async (userId) => {
  const res = await fetch(`${API_BASE}/nutrition/recommend/${userId}`);

  if (!res.ok) {
    throw new Error(await parseError(res, 'Не удалось получить рекомендации'));
  }

  return res.json();
};
