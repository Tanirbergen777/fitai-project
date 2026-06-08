"""
Lunge моделін қайта оқыту:
 - Ескі REHAB24 деректерін (174 жол) + жаңа синтетикалық деректерді (3000 жол) біріктіреміз.
 - RandomForest, ExtraTrees, GradientBoosting салыстырамыз.
 - Ең жақсы модельді сақтаймыз.
"""

from pathlib import Path
import json
import joblib
import pandas as pd
import numpy as np

from sklearn.ensemble import RandomForestClassifier, ExtraTreesClassifier, GradientBoostingClassifier
from sklearn.impute import SimpleImputer
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from sklearn.model_selection import GroupShuffleSplit
from sklearn.pipeline import Pipeline

REHAB_PATH = Path("ai_engine/datasets/rehab24_lunge_3d_features.csv")
SYNTH_PATH = Path("ai_engine/datasets/lunge_synthetic_features.csv")

MODEL_DIR = Path("ai_engine/models_bin")
MODEL_PATH = MODEL_DIR / "lunge_rehab24_3d_rf.pkl"
FEATURES_PATH = MODEL_DIR / "lunge_rehab24_3d_feature_columns.json"
METRICS_PATH = MODEL_DIR / "lunge_rehab24_3d_metrics.json"

TARGET = "is_correct"
GROUP_COL = "video_id"


def make_models():
    return [
        (
            "RandomForest",
            Pipeline(steps=[
                ("imputer", SimpleImputer(strategy="median")),
                ("model", RandomForestClassifier(
                    n_estimators=500,
                    max_depth=None,
                    min_samples_leaf=2,
                    class_weight="balanced",
                    random_state=42,
                    n_jobs=-1,
                )),
            ]),
        ),
        (
            "ExtraTrees",
            Pipeline(steps=[
                ("imputer", SimpleImputer(strategy="median")),
                ("model", ExtraTreesClassifier(
                    n_estimators=500,
                    max_depth=None,
                    min_samples_leaf=2,
                    class_weight="balanced",
                    random_state=42,
                    n_jobs=-1,
                )),
            ]),
        ),
        (
            "GradientBoosting",
            Pipeline(steps=[
                ("imputer", SimpleImputer(strategy="median")),
                ("model", GradientBoostingClassifier(
                    n_estimators=200,
                    max_depth=5,
                    random_state=42,
                )),
            ]),
        ),
    ]


def evaluate(name, model, X_train, y_train, X_test, y_test):
    model.fit(X_train, y_train)
    pred = model.predict(X_test)

    acc = accuracy_score(y_test, pred)
    cm = confusion_matrix(y_test, pred, labels=[0, 1])
    report = classification_report(
        y_test, pred, labels=[0, 1],
        target_names=["wrong", "correct"],
        zero_division=0, output_dict=True,
    )

    print(f"\n{'='*80}")
    print(f"{name}")
    print(f"{'='*80}")
    print(f"Accuracy: {acc:.4f}")
    print(f"Confusion matrix [wrong, correct]:")
    print(cm)
    print(classification_report(
        y_test, pred, labels=[0, 1],
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
    print("=" * 80)
    print("LUNGE МОДЕЛІН ҚАЙТА ОҚЫТУ (REHAB24 + SYNTHETIC)")
    print("=" * 80)

    dfs = []
    
    # 1. Ескі REHAB24 деректері
    if REHAB_PATH.exists():
        df_rehab = pd.read_csv(REHAB_PATH)
        df_rehab = df_rehab.dropna(subset=[TARGET, GROUP_COL])
        print(f"\nREHAB24 деректері: {len(df_rehab)} жол")
        dfs.append(df_rehab)
    else:
        print(f"\n⚠️ REHAB24 деректері табылмады: {REHAB_PATH}")

    # 2. Жаңа синтетикалық деректер
    if SYNTH_PATH.exists():
        df_synth = pd.read_csv(SYNTH_PATH)
        df_synth = df_synth.dropna(subset=[TARGET, GROUP_COL])
        print(f"Синтетикалық деректер: {len(df_synth)} жол")
        dfs.append(df_synth)
    else:
        raise SystemExit(f"Синтетикалық деректер табылмады: {SYNTH_PATH}")

    # Біріктіру
    df = pd.concat(dfs, ignore_index=True)
    print(f"\nБіріккен деректер: {len(df)} жол")

    # Feature columns
    feature_cols = [c for c in df.columns if c.startswith("feature_")]
    # Барлық деректерде бар feature-лерді ғана аламыз
    feature_cols = [c for c in feature_cols if df[c].notna().sum() > len(df) * 0.3]
    
    X = df[feature_cols].apply(pd.to_numeric, errors="coerce")
    y = df[TARGET].astype(int)
    groups = df[GROUP_COL].astype(str)

    print(f"Feature бағандар: {len(feature_cols)}")
    print(f"\nКласс бөлінуі:")
    print(y.value_counts().sort_index().to_string())

    # Video бойынша бөлу (group holdout)
    splitter = GroupShuffleSplit(n_splits=1, test_size=0.25, random_state=42)
    train_idx, test_idx = next(splitter.split(X, y, groups=groups))

    X_train, X_test = X.iloc[train_idx], X.iloc[test_idx]
    y_train, y_test = y.iloc[train_idx], y.iloc[test_idx]
    train_groups = groups.iloc[train_idx]
    test_groups = groups.iloc[test_idx]

    print(f"\nTrain: {len(X_train)} жол ({train_groups.nunique()} видео)")
    print(f"Test:  {len(X_test)} жол ({test_groups.nunique()} видео)")
    print(f"\nTest class distribution:")
    print(y_test.value_counts().sort_index().to_string())

    # Модельдерді бағалау
    results = []
    for name, model in make_models():
        results.append(evaluate(name, model, X_train, y_train, X_test, y_test))

    best = max(results, key=lambda item: item["accuracy"])

    # Ең жақсы модельді барлық деректерде қайта үйрету
    final_model = best["model"]
    final_model.fit(X, y)

    # Сақтау
    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    bundle = {
        "model": final_model,
        "feature_columns": feature_cols,
        "target": TARGET,
        "task": "lunge_correctness_rehab24_3d_aggregate_classifier",
        "label_meaning": {"0": "wrong", "1": "correct"},
        "dataset_path": f"{REHAB_PATH} + {SYNTH_PATH}",
        "note": (
            "Retrained on REHAB24 + synthetic data. "
            "Frontend integration requires CameraCoachPanel to send same aggregate feature schema."
        ),
    }
    joblib.dump(bundle, MODEL_PATH)

    with open(FEATURES_PATH, "w", encoding="utf-8") as f:
        json.dump(feature_cols, f, ensure_ascii=False, indent=2)

    metrics = {
        "best_model": best["name"],
        "best_accuracy_group_holdout": best["accuracy"],
        "rows": int(len(df)),
        "videos": int(groups.nunique()),
        "features": int(len(feature_cols)),
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

    print(f"\n{'='*80}")
    print(f"НӘТИЖЕ")
    print(f"{'='*80}")
    print(f"Ең жақсы модель: {best['name']}")
    print(f"Дәлдік (Accuracy): {best['accuracy']:.4f}")
    print(f"Бұрынғы дәлдік:     0.6000 (60.0%)")
    print(f"Жақсарту:           +{(best['accuracy'] - 0.6)*100:.1f}%")
    print(f"\nModel:    {MODEL_PATH.resolve()}")
    print(f"Features: {FEATURES_PATH.resolve()}")
    print(f"Metrics:  {METRICS_PATH.resolve()}")


if __name__ == "__main__":
    main()
