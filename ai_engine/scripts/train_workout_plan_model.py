from pathlib import Path
import json
import joblib
import pandas as pd

from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.impute import SimpleImputer
from sklearn.metrics import accuracy_score, classification_report
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder


BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parent.parent

DATA_PATH = PROJECT_ROOT / "ai_engine" / "datasets" / "nhanes_workout_training_dataset.csv"
MODEL_DIR = PROJECT_ROOT / "ai_engine" / "models_bin"
MODEL_PATH = MODEL_DIR / "workout_plan_selector.pkl"
METRICS_PATH = MODEL_DIR / "workout_plan_selector_metrics.json"


NUMERIC_FEATURES = [
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

CATEGORICAL_FEATURES = [
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

TARGET = "plan_template_id"


def main():
    if not DATA_PATH.exists():
        raise FileNotFoundError(f"Dataset not found: {DATA_PATH}")

    df = pd.read_csv(DATA_PATH)

    needed_columns = NUMERIC_FEATURES + CATEGORICAL_FEATURES + [TARGET]
    missing = [col for col in needed_columns if col not in df.columns]

    if missing:
        raise ValueError(f"Missing columns in dataset: {missing}")

    df = df.dropna(subset=[TARGET]).copy()

    X = df[NUMERIC_FEATURES + CATEGORICAL_FEATURES]
    y = df[TARGET].astype(str)

    stratify = y if y.value_counts().min() >= 2 else None

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=42,
        stratify=stratify,
    )

    numeric_pipeline = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="median")),
        ]
    )

    categorical_pipeline = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="most_frequent")),
            ("onehot", OneHotEncoder(handle_unknown="ignore")),
        ]
    )

    preprocessor = ColumnTransformer(
        transformers=[
            ("num", numeric_pipeline, NUMERIC_FEATURES),
            ("cat", categorical_pipeline, CATEGORICAL_FEATURES),
        ]
    )

    model = RandomForestClassifier(
        n_estimators=350,
        random_state=42,
        class_weight="balanced",
        n_jobs=-1,
        max_depth=None,
    )

    pipeline = Pipeline(
        steps=[
            ("preprocessor", preprocessor),
            ("model", model),
        ]
    )

    print("🚀 Training workout plan selector model...")
    pipeline.fit(X_train, y_train)

    preds = pipeline.predict(X_test)
    acc = accuracy_score(y_test, preds)

    print(f"✅ Accuracy: {acc:.4f}")
    print(classification_report(y_test, preds))

    MODEL_DIR.mkdir(parents=True, exist_ok=True)

    bundle = {
        "model": pipeline,
        "numeric_features": NUMERIC_FEATURES,
        "categorical_features": CATEGORICAL_FEATURES,
        "target": TARGET,
        "accuracy": float(acc),
        "classes": sorted(y.unique().tolist()),
    }

    joblib.dump(bundle, MODEL_PATH)

    metrics = {
        "accuracy": float(acc),
        "rows": int(len(df)),
        "train_rows": int(len(X_train)),
        "test_rows": int(len(X_test)),
        "classes": sorted(y.unique().tolist()),
        "numeric_features": NUMERIC_FEATURES,
        "categorical_features": CATEGORICAL_FEATURES,
        "model_path": str(MODEL_PATH),
    }

    with open(METRICS_PATH, "w", encoding="utf-8") as f:
        json.dump(metrics, f, ensure_ascii=False, indent=2)

    print(f"✅ Saved model: {MODEL_PATH}")
    print(f"✅ Saved metrics: {METRICS_PATH}")


if __name__ == "__main__":
    main()