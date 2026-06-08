import os
import joblib
import pandas as pd

from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.metrics import accuracy_score, classification_report
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.neighbors import KNeighborsClassifier


BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "..", "datasets", "nhanes_workout_training_dataset.csv")
MODELS_DIR = os.path.join(BASE_DIR, "..", "models_bin")

os.makedirs(MODELS_DIR, exist_ok=True)


def load_data():
    return pd.read_csv(DATA_PATH)


def build_preprocessor(numeric_features, categorical_features):
    numeric_transformer = Pipeline(steps=[
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler", StandardScaler()),
    ])

    categorical_transformer = Pipeline(steps=[
        ("imputer", SimpleImputer(strategy="most_frequent")),
        ("onehot", OneHotEncoder(handle_unknown="ignore")),
    ])

    return ColumnTransformer(
        transformers=[
            ("num", numeric_transformer, numeric_features),
            ("cat", categorical_transformer, categorical_features),
        ]
    )


def train_and_evaluate():
    df = load_data()

    target_col = "plan_template_id"

    feature_cols = [
        "age",
        "gender",
        "height",
        "weight",
        "bmi",
        "waist",
        "hip",
        "arm",
        "activity_level",
        "limitations",
        "primary_goal",
        "training_level",
        "training_location",
        "equipment",
        "workouts_per_week",
        "workout_duration_minutes",
        "training_focus",
        "cardio_preference",
        "impact_level",
    ]

    X = df[feature_cols]
    y = df[target_col]

    numeric_features = [
        "age",
        "height",
        "weight",
        "bmi",
        "waist",
        "hip",
        "arm",
        "activity_level",
        "workouts_per_week",
        "workout_duration_minutes",
    ]

    categorical_features = [
        "gender",
        "limitations",
        "primary_goal",
        "training_level",
        "training_location",
        "equipment",
        "training_focus",
        "cardio_preference",
        "impact_level",
    ]

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=42,
        stratify=y
    )

    preprocessor = build_preprocessor(numeric_features, categorical_features)

    models = {
        "decision_tree": DecisionTreeClassifier(
            max_depth=10,
            random_state=42
        ),
        "random_forest": RandomForestClassifier(
            n_estimators=250,
            max_depth=14,
            random_state=42
        ),
        "knn": KNeighborsClassifier(
            n_neighbors=9
        ),
    }

    best_model_name = None
    best_accuracy = -1
    best_pipeline = None

    for model_name, model in models.items():
        pipeline = Pipeline(steps=[
            ("preprocessor", preprocessor),
            ("model", model),
        ])

        pipeline.fit(X_train, y_train)
        y_pred = pipeline.predict(X_test)

        acc = accuracy_score(y_test, y_pred)

        print("=" * 60)
        print(f"Модель: {model_name}")
        print(f"Accuracy: {acc:.4f}")
        print("Classification report:")
        print(classification_report(y_test, y_pred))

        if acc > best_accuracy:
            best_accuracy = acc
            best_model_name = model_name
            best_pipeline = pipeline

    model_path = os.path.join(MODELS_DIR, "nhanes_workout_recommender_model.pkl")
    joblib.dump(best_pipeline, model_path)

    print("=" * 60)
    print(f"Лучшая модель: {best_model_name}")
    print(f"Лучшая accuracy: {best_accuracy:.4f}")
    print(f"Модель сохранена в: {model_path}")


if __name__ == "__main__":
    train_and_evaluate()