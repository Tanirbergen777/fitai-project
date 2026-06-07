from pathlib import Path
import json

import joblib
import pandas as pd

from sklearn.ensemble import RandomForestClassifier, ExtraTreesClassifier, GradientBoostingClassifier
from sklearn.impute import SimpleImputer
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from sklearn.model_selection import GroupShuffleSplit
from sklearn.pipeline import Pipeline

DATA_PATH = Path("ai_engine/datasets/pushup_pose_frame_dataset.csv")
MODEL_DIR = Path("ai_engine/models_bin")
MODEL_PATH = MODEL_DIR / "pushup_pose_rf.pkl"
FEATURES_PATH = MODEL_DIR / "pushup_pose_feature_columns.json"
METRICS_PATH = MODEL_DIR / "pushup_pose_metrics.json"

TARGET = "is_correct"
GROUP_COL = "video_name"

DROP_COLS = {
    "video_path",
    "video_name",
    "video_folder",
    "video_index",
    "frame_index",
    "timestamp_sec",
    "fps",
    "frame_count",
    "exercise_mode",
    TARGET,
}


def clean_numeric_features(df: pd.DataFrame):
    feature_cols = [col for col in df.columns if col not in DROP_COLS]
    X = df[feature_cols].apply(pd.to_numeric, errors="coerce")
    empty_cols = [col for col in X.columns if X[col].isna().all()]
    if empty_cols:
        X = X.drop(columns=empty_cols)
    return X, list(X.columns)


def evaluate_model(name, model, X_train, y_train, X_test, y_test):
    model.fit(X_train, y_train)
    pred = model.predict(X_test)

    acc = accuracy_score(y_test, pred)
    cm = confusion_matrix(y_test, pred, labels=[0, 1])
    report = classification_report(
        y_test,
        pred,
        labels=[0, 1],
        target_names=["wrong", "correct"],
        output_dict=True,
        zero_division=0,
    )

    print("\n" + "=" * 72)
    print(name)
    print("=" * 72)
    print(f"Accuracy: {acc:.4f}")
    print("Confusion matrix [wrong, correct]:")
    print(cm)
    print(
        classification_report(
            y_test,
            pred,
            labels=[0, 1],
            target_names=["wrong", "correct"],
            zero_division=0,
        )
    )

    return {
        "name": name,
        "model": model,
        "accuracy": float(acc),
        "confusion_matrix": cm.tolist(),
        "classification_report": report,
    }


def main():
    if not DATA_PATH.exists():
        raise SystemExit(
            f"Dataset not found: {DATA_PATH}\n"
            "Run first:\n"
            "  python ai_engine/scripts/extract_pushup_pose_features.py"
        )

    df = pd.read_csv(DATA_PATH)
    df = df.dropna(subset=[TARGET, GROUP_COL])
    if df.empty:
        raise SystemExit("Dataset is empty after filtering.")

    X, feature_columns = clean_numeric_features(df)
    y = df[TARGET].astype(int)
    groups = df[GROUP_COL].astype(str)

    print("=" * 72)
    print("PUSH-UP MODEL TRAINING")
    print("=" * 72)
    print(f"Rows: {len(df)}")
    print(f"Videos: {groups.nunique()}")
    print(f"Features: {len(feature_columns)}")
    print("\nFrame class distribution:")
    print(y.value_counts().sort_index().to_string())

    splitter = GroupShuffleSplit(n_splits=1, test_size=0.2, random_state=42)
    train_idx, test_idx = next(splitter.split(X, y, groups=groups))

    X_train, X_test = X.iloc[train_idx], X.iloc[test_idx]
    y_train, y_test = y.iloc[train_idx], y.iloc[test_idx]
    train_groups = groups.iloc[train_idx]
    test_groups = groups.iloc[test_idx]

    print("\nTrain videos:", train_groups.nunique())
    print("Test videos:", test_groups.nunique())
    print("Test video names:")
    for name in sorted(test_groups.unique())[:30]:
        print(" ", name)

    candidates = [
        (
            "RandomForest",
            Pipeline(
                steps=[
                    ("imputer", SimpleImputer(strategy="median")),
                    (
                        "model",
                        RandomForestClassifier(
                            n_estimators=350,
                            min_samples_leaf=2,
                            class_weight="balanced",
                            random_state=42,
                            n_jobs=-1,
                        ),
                    ),
                ]
            ),
        ),
        (
            "ExtraTrees",
            Pipeline(
                steps=[
                    ("imputer", SimpleImputer(strategy="median")),
                    (
                        "model",
                        ExtraTreesClassifier(
                            n_estimators=350,
                            min_samples_leaf=2,
                            class_weight="balanced",
                            random_state=42,
                            n_jobs=-1,
                        ),
                    ),
                ]
            ),
        ),
        (
            "GradientBoosting",
            Pipeline(
                steps=[
                    ("imputer", SimpleImputer(strategy="median")),
                    ("model", GradientBoostingClassifier(random_state=42)),
                ]
            ),
        ),
    ]

    results = []
    for name, model in candidates:
        results.append(evaluate_model(name, model, X_train, y_train, X_test, y_test))

    best = max(results, key=lambda item: item["accuracy"])

    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    bundle = {
        "model": best["model"],
        "feature_columns": feature_columns,
        "target": TARGET,
        "task": "pushup_correctness_frame_classifier",
        "label_meaning": {"0": "wrong", "1": "correct"},
        "dataset_path": str(DATA_PATH),
        "split": "GroupShuffleSplit by video_name, test_size=0.2, random_state=42",
    }
    joblib.dump(bundle, MODEL_PATH)

    with open(FEATURES_PATH, "w", encoding="utf-8") as f:
        json.dump(feature_columns, f, ensure_ascii=False, indent=2)

    metrics = {
        "best_model": best["name"],
        "best_accuracy": best["accuracy"],
        "results": [
            {
                "name": item["name"],
                "accuracy": item["accuracy"],
                "confusion_matrix": item["confusion_matrix"],
                "classification_report": item["classification_report"],
            }
            for item in results
        ],
        "rows": int(len(df)),
        "videos": int(groups.nunique()),
        "features": int(len(feature_columns)),
        "train_videos": int(train_groups.nunique()),
        "test_videos": int(test_groups.nunique()),
        "test_video_names": sorted(test_groups.unique().tolist()),
    }
    with open(METRICS_PATH, "w", encoding="utf-8") as f:
        json.dump(metrics, f, ensure_ascii=False, indent=2)

    print("\n" + "=" * 72)
    print("SAVED")
    print("=" * 72)
    print(f"Best model: {best['name']}")
    print(f"Best accuracy: {best['accuracy']:.4f}")
    print(f"Model: {MODEL_PATH.resolve()}")
    print(f"Features: {FEATURES_PATH.resolve()}")
    print(f"Metrics: {METRICS_PATH.resolve()}")


if __name__ == "__main__":
    main()
