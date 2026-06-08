import os
import joblib
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.metrics import accuracy_score, classification_report
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.multioutput import MultiOutputClassifier


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
    print("Running training Model 1: Constraints Generator (Multi-Output Classification)")
    df = load_data()

    # X features (Входные данные человека)
    feature_cols = [
        "age",
        "gender",
        "height",
        "weight",
        "bmi",
        "activity_level",
        "limitations",
        "primary_goal"
    ]

    # Y targets (Выходной вектор ограничений)
    target_cols = [
        "impact_level",
        "training_level"
    ]

    # We only have categorical targets now
    X = df[feature_cols]
    Y = df[target_cols]

    numeric_features = [
        "age",
        "height",
        "weight",
        "bmi",
        "activity_level"
    ]

    categorical_features = [
        "gender",
        "limitations",
        "primary_goal"
    ]

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        Y,
        test_size=0.2,
        random_state=42
    )

    preprocessor = build_preprocessor(numeric_features, categorical_features)

    # RandomForest natively supports multi-output classification, but using MultiOutputClassifier 
    # ensures explicit handling for classification metrics per target.
    model = RandomForestClassifier(n_estimators=150, max_depth=15, random_state=42)

    pipeline = Pipeline(steps=[
        ("preprocessor", preprocessor),
        ("model", model),
    ])

    print("Training model...")
    pipeline.fit(X_train, y_train)

    print("Training complete. Accuracy evaluation:")
    y_pred = pipeline.predict(X_test)
    
    # y_pred is a 2D array: shape (n_samples, n_targets)
    # y_test is a DataFrame
    
    for i, target_name in enumerate(target_cols):
        y_test_col = y_test.iloc[:, i]
        y_pred_col = y_pred[:, i]
        
        acc = accuracy_score(y_test_col, y_pred_col)
        print(f"\n==========================================")
        print(f"Target: {target_name}")
        print(f"Accuracy: {acc:.4f}")
        print(classification_report(y_test_col, y_pred_col, zero_division=0))

    # Save model
    model_path = os.path.join(MODELS_DIR, "model_1_constraints.pkl")
    joblib.dump(pipeline, model_path)
    
    print("=" * 60)
    print(f"Model saved successfully to: {model_path}")


if __name__ == "__main__":
    train_and_evaluate()
