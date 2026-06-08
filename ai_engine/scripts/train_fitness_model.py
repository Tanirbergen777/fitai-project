import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error
import joblib

# 1. Загружаем твой УЛЬТРА-датасет (который мы склеили из NHANES)
# Убедись, что файл называется именно так или замени на свое имя
df = pd.read_csv("../datasets/ultra_fitness_data.csv")

# 2. Подготовка УЛУЧШЕННЫХ признаков
# Теперь мы учим модель на 7 параметрах вместо 5
X = df[['RIDAGEYR', 'RIAGENDR', 'BMXWT', 'BMXHT', 'BMXWAIST', 'BMXHIP', 'BMXARMC']]
y = df['DR1TKCAL'] # Цель - реальные калории из датасета

# Разделяем выборки
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

print("🚀 Обучаю УЛЬТРА-модель на данных NHANES (Талия + Бедра)...")

# 3. Обучаем модель (увеличим количество деревьев для точности)
model = RandomForestRegressor(n_estimators=200, random_state=42, n_jobs=-1)
model.fit(X_train, y_train)

# 4. Проверяем точность
predictions = model.predict(X_test)
error = mean_absolute_error(y_test, predictions)

print(f"📊 Средняя ошибка обновленной модели: {round(error, 2)} ккал.")

# 5. Сохраняем модель
joblib.dump(model, "../models_bin/fitness_brain_model.pkl")
print("✅ Ультра-модель сохранена в 'fitness_brain_model.pkl'!")