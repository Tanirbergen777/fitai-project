from pathlib import Path
import json

import joblib
import pandas as pd
import numpy as np

from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.impute import SimpleImputer
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from sklearn.model_selection import GroupShuffleSplit
from sklearn.pipeline import Pipeline
import sys

# Ensure utf-8 output
sys.stdout.reconfigure(encoding='utf-8')

DATA_PATH = Path("ai_engine/datasets/pushup_pose_frame_dataset.csv")

TARGET = "is_correct"
GROUP_COL = "video_name"

DROP_COLS = {
    "video_path", "video_name", "video_folder", "video_index",
    "frame_index", "timestamp_sec", "fps", "frame_count", "exercise_mode", TARGET,
}

def clean_numeric_features(df: pd.DataFrame):
    feature_cols = [col for col in df.columns if col not in DROP_COLS]
    X = df[feature_cols].apply(pd.to_numeric, errors="coerce")
    empty_cols = [col for col in X.columns if X[col].isna().all()]
    if empty_cols:
        X = X.drop(columns=empty_cols)
    return X, list(X.columns)

def check_overfitting(name, model, X_train, y_train, X_test, y_test):
    model.fit(X_train, y_train)
    
    train_pred = model.predict(X_train)
    train_acc = accuracy_score(y_train, train_pred)
    
    test_pred = model.predict(X_test)
    test_acc = accuracy_score(y_test, test_pred)
    
    gap = train_acc - test_acc

    print("\n" + "=" * 72)
    print(f"Model: {name}")
    print("=" * 72)
    print(f"Train Accuracy: {train_acc:.4f} (100% means it memorized training data)")
    print(f"Test Accuracy:  {test_acc:.4f} (Performance on unseen videos)")
    print(f"Generalization Gap: {gap:.4f}")
    
    if gap > 0.05:
        print("-> Conclusion: Model is slightly OVERFITTING (gap > 5%).")
    else:
        print("-> Conclusion: Model generalizes extremely well! No severe overfitting.")

def main():
    df = pd.read_csv(DATA_PATH).dropna(subset=[TARGET, GROUP_COL])
    X, feature_columns = clean_numeric_features(df)
    y = df[TARGET].astype(int)
    groups = df[GROUP_COL].astype(str)

    print("================ OVERFITTING CHECK ================")
    print(f"Total Videos: {groups.nunique()}")

    splitter = GroupShuffleSplit(n_splits=1, test_size=0.25, random_state=42)
    train_idx, test_idx = next(splitter.split(X, y, groups=groups))

    X_train, X_test = X.iloc[train_idx], X.iloc[test_idx]
    y_train, y_test = y.iloc[train_idx], y.iloc[test_idx]
    train_groups, test_groups = groups.iloc[train_idx], groups.iloc[test_idx]

    print(f"Train videos: {train_groups.nunique()} | Test videos: {test_groups.nunique()}")

    candidates = [
        ("RandomForest", Pipeline([("imputer", SimpleImputer(strategy="median")), ("model", RandomForestClassifier(n_estimators=300, random_state=42))])),
        ("GradientBoosting", Pipeline([("imputer", SimpleImputer(strategy="median")), ("model", GradientBoostingClassifier(random_state=42))])),
    ]

    for name, model in candidates:
        check_overfitting(name, model, X_train, y_train, X_test, y_test)

if __name__ == "__main__":
    main()
