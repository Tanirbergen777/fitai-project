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
DATA_PATH = os.path.join(BASE_DIR, "..", "datasets", "old_synthetic_workout_dataset.csv")
MODELS_DIR = os.path.join(BASE_DIR, "..", "models_bin")
MODEL_PATH = os.path.join(MODELS_DIR, "old_synthetic_workout_recommender_model.pkl")

os.makedirs(MODELS_DIR, exist_ok=True)

def load_data():
    df = pd.read_csv(DATA_PATH)
    return df


def build_preprocessor(numeric_features, categorical_features):
    numeric_transformer = Pipeline(steps=[
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler", StandardScaler()),
    ])

    categorical_transformer = Pipeline(steps=[
        ("imputer", SimpleImputer(strategy="most_frequent")),
        ("onehot", OneHotEncoder(handle_unknown="ignore")),
    ])

    preprocessor = ColumnTransformer(
        transformers=[
            ("num", numeric_transformer, numeric_features),
            ("cat", categorical_transformer, categorical_features),
        ]
    )

    return preprocessor


def train_and_evaluate():
    df = load_data()

    target_col = "plan_template_id"

    feature_cols = [
        "age",
        "gender",
        "height",
        "weight",
        "bmi",
        "primary_goal",
        "training_level",
        "training_location",
        "equipment",
        "workouts_per_week",
        "workout_duration_minutes",
        "limitations",
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
        "workouts_per_week",
        "workout_duration_minutes",
    ]

    categorical_features = [
        "gender",
        "primary_goal",
        "training_level",
        "training_location",
        "equipment",
        "limitations",
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
            max_depth=8,
            random_state=42
        ),
        "random_forest": RandomForestClassifier(
            n_estimators=200,
            max_depth=12,
            random_state=42
        ),
        "knn": KNeighborsClassifier(
            n_neighbors=7
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

    joblib.dump(best_pipeline, MODEL_PATH)
    print("=" * 60)
    print(f"Лучшая модель: {best_model_name}")
    print(f"Лучшая accuracy: {best_accuracy:.4f}")
    joblib.dump(best_pipeline, MODEL_PATH)

if __name__ == "__main__":
    train_and_evaluate()