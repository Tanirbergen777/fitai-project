from pathlib import Path
import joblib
import pandas as pd

from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.impute import SimpleImputer
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler


DATA_PATH = Path(__file__).resolve().parent.parent / "datasets" / "nutrition_recommendation_sampled.csv"
MODEL_PATH = Path(__file__).resolve().parent.parent / "models_bin" / "nutrition_recommender.pkl"


def main():
    print(f"Загружаю датасет: {DATA_PATH}")
    df = pd.read_csv(DATA_PATH)

    print("Размер датасета:", df.shape)

    target_col = "label"

    drop_cols = [
        "label",
        "food_name",   # для первой версии убираем имя блюда
        "rule_score",  # это служебная колонка от rule-based генерации
    ]

    X = df.drop(columns=drop_cols, errors="ignore")
    y = df[target_col]

    categorical_features = [
        "goal",
        "meal_slot",
        "budget",
        "late_meals",
        "cooking_mode",
        "preference",
        "allergy",
    ]

    numeric_features = [
        "food_id",
        "meals_per_day",
        "already_selected_today",
        "calories",
        "protein",
        "fat",
        "carbs",
        "is_breakfast_food",
        "is_lunch_food",
        "is_snack_food",
        "is_dinner_food",
        "is_late_food",
        "matches_preference",
        "has_allergy_conflict",
    ]

    categorical_transformer = Pipeline(steps=[
        ("imputer", SimpleImputer(strategy="most_frequent")),
        ("onehot", OneHotEncoder(handle_unknown="ignore")),
    ])

    numeric_transformer = Pipeline(steps=[
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler", StandardScaler()),
    ])

    preprocessor = ColumnTransformer(
        transformers=[
            ("cat", categorical_transformer, categorical_features),
            ("num", numeric_transformer, numeric_features),
        ]
    )

    model = RandomForestClassifier(
        n_estimators=200,
        max_depth=16,
        min_samples_split=10,
        min_samples_leaf=4,
        random_state=42,
        n_jobs=-1,
    )

    pipeline = Pipeline(steps=[
        ("preprocessor", preprocessor),
        ("model", model),
    ])

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=42,
        stratify=y,
    )

    print("Обучаю модель...")
    pipeline.fit(X_train, y_train)

    print("Проверяю качество...")
    y_pred = pipeline.predict(X_test)

    acc = accuracy_score(y_test, y_pred)
    print("\nAccuracy:", acc)

    print("\nClassification report:")
    print(classification_report(y_test, y_pred))

    print("\nConfusion matrix:")
    print(confusion_matrix(y_test, y_pred))

    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(pipeline, MODEL_PATH)

    print(f"\nГотово. Модель сохранена: {MODEL_PATH}")


if __name__ == "__main__":
    main()