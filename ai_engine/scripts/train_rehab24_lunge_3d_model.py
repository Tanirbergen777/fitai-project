from pathlib import Path
import json

import joblib
import pandas as pd

from sklearn.ensemble import RandomForestClassifier, ExtraTreesClassifier, GradientBoostingClassifier
from sklearn.impute import SimpleImputer
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from sklearn.model_selection import GroupShuffleSplit, StratifiedKFold, cross_val_score
from sklearn.pipeline import Pipeline


DATA_PATH = Path("ai_engine/datasets/rehab24_lunge_3d_features.csv")
MODEL_DIR = Path("ai_engine/models_bin")
MODEL_PATH = MODEL_DIR / "lunge_rehab24_3d_rf.pkl"
FEATURES_PATH = MODEL_DIR / "lunge_rehab24_3d_feature_columns.json"
METRICS_PATH = MODEL_DIR / "lunge_rehab24_3d_metrics.json"

TARGET = "is_correct"
GROUP_COL = "video_id"

DROP_COLS = {
    "source",
    "video_id",
    "rep_id",
    "repetition_number",
    "exercise_mode",
    "exercise_id",
    "person_id",
    "first_frame",
    "last_frame",
    "front_leg",
    "exercise_subtype",
    "cam17_orientation",
    "mocap_erroneous",
    "correctness",
    TARGET,
}


def build_xy(df: pd.DataFrame):
    feature_cols = [c for c in df.columns if c.startswith("feature_") and c not in DROP_COLS]
    X = df[feature_cols].apply(pd.to_numeric, errors="coerce")

    empty_cols = [col for col in X.columns if X[col].isna().all()]
    if empty_cols:
        X = X.drop(columns=empty_cols)

    return X, list(X.columns)


def make_models():
    return [
        (
            "RandomForest",
            Pipeline(
                steps=[
                    ("imputer", SimpleImputer(strategy="median")),
                    (
                        "model",
                        RandomForestClassifier(
                            n_estimators=450,
                            max_depth=None,
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
                            n_estimators=450,
                            max_depth=None,
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


def evaluate(name, model, X_train, y_train, X_test, y_test):
    model.fit(X_train, y_train)
    pred = model.predict(X_test)

    acc = accuracy_score(y_test, pred)
    cm = confusion_matrix(y_test, pred, labels=[0, 1])
    report = classification_report(
        y_test,
        pred,
        labels=[0, 1],
        target_names=["wrong", "correct"],
        zero_division=0,
        output_dict=True,
    )

    print("\n" + "=" * 80)
    print(name)
    print("=" * 80)
    print(f"Accuracy: {acc:.4f}")
    print("Confusion matrix [wrong, correct]:")
    print(cm)
    print(classification_report(
        y_test,
        pred,
        labels=[0, 1],
        target_names=["wrong", "correct"],
        zero_division=0,
    ))

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
            "  python ai_engine/scripts/build_rehab24_lunge_3d_features.py"
        )

    df = pd.read_csv(DATA_PATH)
    df = df.dropna(subset=[TARGET, GROUP_COL])

    X, feature_columns = build_xy(df)
    y = df[TARGET].astype(int)
    groups = df[GROUP_COL].astype(str)

    print("=" * 80)
    print("REHAB24 LUNGE 3D MODEL TRAINING")
    print("=" * 80)
    print(f"Rows: {len(df)}")
    print(f"Videos/groups: {groups.nunique()}")
    print(f"Features: {len(feature_columns)}")
    print("\nClass distribution:")
    print(y.value_counts().sort_index().to_string())
    print("\nRows by video:")
    print(groups.value_counts().sort_index().to_string())

    splitter = GroupShuffleSplit(n_splits=1, test_size=0.25, random_state=42)
    train_idx, test_idx = next(splitter.split(X, y, groups=groups))

    X_train, X_test = X.iloc[train_idx], X.iloc[test_idx]
    y_train, y_test = y.iloc[train_idx], y.iloc[test_idx]
    train_groups = groups.iloc[train_idx]
    test_groups = groups.iloc[test_idx]

    print("\nTrain videos:")
    print(sorted(train_groups.unique().tolist()))
    print("\nTest videos:")
    print(sorted(test_groups.unique().tolist()))
    print("\nTest class distribution:")
    print(y_test.value_counts().sort_index().to_string())

    results = []
    for name, model in make_models():
        results.append(evaluate(name, model, X_train, y_train, X_test, y_test))

    best = max(results, key=lambda item: item["accuracy"])

    # Also fit best model on all data for final saved artifact.
    final_model = best["model"]
    final_model.fit(X, y)

    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    bundle = {
        "model": final_model,
        "feature_columns": feature_columns,
        "target": TARGET,
        "task": "lunge_correctness_rehab24_3d_aggregate_classifier",
        "label_meaning": {"0": "wrong", "1": "correct"},
        "dataset_path": str(DATA_PATH),
        "note": (
            "Trained on REHAB24-6 Ex5 Leg Lunge 3D skeleton aggregate features. "
            "Frontend integration requires CameraCoachPanel to send same aggregate feature schema."
        ),
    }
    joblib.dump(bundle, MODEL_PATH)

    with open(FEATURES_PATH, "w", encoding="utf-8") as f:
        json.dump(feature_columns, f, ensure_ascii=False, indent=2)

    metrics = {
        "best_model": best["name"],
        "best_accuracy_group_holdout": best["accuracy"],
        "rows": int(len(df)),
        "videos": int(groups.nunique()),
        "features": int(len(feature_columns)),
        "train_videos": sorted(train_groups.unique().tolist()),
        "test_videos": sorted(test_groups.unique().tolist()),
        "results": [
            {
                "name": item["name"],
                "accuracy": item["accuracy"],
                "confusion_matrix": item["confusion_matrix"],
                "classification_report": item["classification_report"],
            }
            for item in results
        ],
    }

    with open(METRICS_PATH, "w", encoding="utf-8") as f:
        json.dump(metrics, f, ensure_ascii=False, indent=2)

    print("\n" + "=" * 80)
    print("SAVED")
    print("=" * 80)
    print(f"Best model: {best['name']}")
    print(f"Best group-holdout accuracy: {best['accuracy']:.4f}")
    print(f"Model: {MODEL_PATH.resolve()}")
    print(f"Features: {FEATURES_PATH.resolve()}")
    print(f"Metrics: {METRICS_PATH.resolve()}")


if __name__ == "__main__":
    main()