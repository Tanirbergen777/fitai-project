import pandas as pd
from pathlib import Path
from sklearn.ensemble import RandomForestClassifier, ExtraTreesClassifier, GradientBoostingClassifier
from sklearn.impute import SimpleImputer
from sklearn.metrics import accuracy_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline

BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parent.parent
DATA_PATH = PROJECT_ROOT / "ai_engine" / "datasets" / "video_pose_frames.csv"

def main():
    df = pd.read_csv(DATA_PATH)
    df = df[df["exercise_name"] == "squat"].copy()

    video_labels = df.groupby("video_name", as_index=False)["target_is_correct"].first().copy()
    train_videos, test_videos = train_test_split(
        video_labels["video_name"], test_size=0.33, random_state=42, stratify=video_labels["target_is_correct"]
    )

    train_df = df[df["video_name"].isin(train_videos)].copy()
    test_df = df[df["video_name"].isin(test_videos)].copy()

    feature_columns = [col for col in df.columns if col.startswith("feature_") or col.startswith("lm_") or col.startswith("wlm_")]
    X_train = train_df[feature_columns].copy()
    X_test = test_df[feature_columns].copy()
    y_train = train_df["target_is_correct"].astype(int)
    y_test = test_df["target_is_correct"].astype(int)

    models = {
        "Random Forest": Pipeline([
            ("imputer", SimpleImputer(strategy="median")),
            ("model", RandomForestClassifier(n_estimators=300, random_state=42, n_jobs=-1, class_weight="balanced"))
        ]),
        "Extra Trees": Pipeline([
            ("imputer", SimpleImputer(strategy="median")),
            ("model", ExtraTreesClassifier(n_estimators=300, random_state=42, n_jobs=-1, class_weight="balanced"))
        ]),
        "Gradient Boosting": Pipeline([
            ("imputer", SimpleImputer(strategy="median")),
            ("model", GradientBoostingClassifier(random_state=42))
        ])
    }

    print("Squat Model Evaluation:")
    for name, pipeline in models.items():
        pipeline.fit(X_train, y_train)
        preds = pipeline.predict(X_test)
        acc = accuracy_score(y_test, preds)
        print(f"{name}: {acc*100:.1f}%")

if __name__ == "__main__":
    main()
