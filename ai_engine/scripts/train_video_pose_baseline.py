import json
from pathlib import Path

import joblib
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.impute import SimpleImputer
from sklearn.metrics import accuracy_score, classification_report
from sklearn.model_selection import train_test_split


BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parent.parent

DATA_PATH = PROJECT_ROOT / "ai_engine" / "datasets" / "video_pose_frames.csv"
MODELS_DIR = PROJECT_ROOT / "ai_engine" / "models_bin"

MODEL_PATH = MODELS_DIR / "lunge_pose_rf.pkl"
FEATURES_PATH = MODELS_DIR / "lunge_pose_feature_columns.json"

def main():
    if not DATA_PATH.exists():
        raise FileNotFoundError(f"Не найден датасет: {DATA_PATH}")

    df = pd.read_csv(DATA_PATH)

    # Оставляем только squat
    df = df[df["exercise_name"] == "lunge"].copy()

    if df.empty:
        raise ValueError("В датасете нет строк для exercise_name='lunge'")
    if "target_is_correct" not in df.columns:
        raise ValueError("В датасете нет target_is_correct")

    # Проверяем уникальные видео
    video_labels = (
        df.groupby("video_name", as_index=False)["target_is_correct"]
        .first()
        .copy()
    )

    print("Уникальных lunge-видео:", len(video_labels))
    print(video_labels[["video_name", "target_is_correct"]])

    if video_labels["target_is_correct"].nunique() < 2:
        raise ValueError("Для обучения нужны и correct, и wrong видео.")

    # Делим по видео, а не по кадрам
    train_videos, test_videos = train_test_split(
        video_labels["video_name"],
        test_size=0.33,
        random_state=42,
        stratify=video_labels["target_is_correct"],
    )

    train_df = df[df["video_name"].isin(train_videos)].copy()
    test_df = df[df["video_name"].isin(test_videos)].copy()

    print("\nTrain videos:")
    print(sorted(train_videos.tolist()))
    print("\nTest videos:")
    print(sorted(test_videos.tolist()))

    # Берём признаки
    feature_columns = [
        col
        for col in df.columns
        if col.startswith("feature_") or col.startswith("lm_") or col.startswith("wlm_")
    ]

    if not feature_columns:
        raise ValueError("Не найдены feature/lm/wlm колонки.")

    X_train = train_df[feature_columns].copy()
    X_test = test_df[feature_columns].copy()

    y_train = train_df["target_is_correct"].astype(int)
    y_test = test_df["target_is_correct"].astype(int)

    # Заполняем пропуски
    imputer = SimpleImputer(strategy="median")
    X_train = imputer.fit_transform(X_train)
    X_test = imputer.transform(X_test)

    model = RandomForestClassifier(
        n_estimators=300,
        random_state=42,
        n_jobs=-1,
        class_weight="balanced",
        max_depth=None,
    )

    model.fit(X_train, y_train)

    preds = model.predict(X_test)

    acc = accuracy_score(y_test, preds)
    print("\nAccuracy:", round(acc, 4))
    print("\nClassification report:")
    print(classification_report(y_test, preds, digits=4))

    MODELS_DIR.mkdir(parents=True, exist_ok=True)

    joblib.dump(
        {
            "model": model,
            "imputer": imputer,
        },
        MODEL_PATH,
    )

    with open(FEATURES_PATH, "w", encoding="utf-8") as f:
        json.dump(feature_columns, f, ensure_ascii=False, indent=2)

    print("\nСохранено:")
    print("Model:", MODEL_PATH)
    print("Features:", FEATURES_PATH)


if __name__ == "__main__":
    main()