from pathlib import Path
import json

import joblib
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.impute import SimpleImputer
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from sklearn.model_selection import train_test_split


BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parent.parent

DATA_PATH = PROJECT_ROOT / "ai_engine" / "datasets" / "video_pose_frames.csv"
MODELS_DIR = PROJECT_ROOT / "ai_engine" / "models_bin"

MODEL_PATH = MODELS_DIR / "squat_pose_rf.pkl"
FEATURES_PATH = MODELS_DIR / "squat_pose_feature_columns.json"
REPORT_PATH = MODELS_DIR / "squat_pose_report.json"


def main():
    if not DATA_PATH.exists():
        raise FileNotFoundError(f"Не найден датасет: {DATA_PATH}")

    df = pd.read_csv(DATA_PATH)

    # Оставляем только squat
    df = df[df["exercise_name"] == "squat"].copy()

    if df.empty:
        raise ValueError("В датасете нет строк для exercise_name='squat'")
    if "target_is_correct" not in df.columns:
        raise ValueError("В датасете нет target_is_correct")
    if "video_name" not in df.columns:
        raise ValueError("В датасете нет video_name")


    video_labels = (
        df.groupby("video_name", as_index=False)["target_is_correct"]
        .first()
        .copy()
    )

    print("Уникальных squat-видео:", len(video_labels))
    print(video_labels[["video_name", "target_is_correct"]])

    if video_labels["target_is_correct"].nunique() < 2:
        raise ValueError("Для обучения нужны и correct, и wrong squat-видео.")


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


    feature_columns = [
        col
        for col in df.columns
        if col.startswith("feature_") or col.startswith("lm_") or col.startswith("wlm_")
    ]

    if not feature_columns:
        raise ValueError("Не найдены feature_/lm_/wlm_ колонки.")

    X_train = train_df[feature_columns].copy()
    X_test = test_df[feature_columns].copy()

    y_train = train_df["target_is_correct"].astype(int)
    y_test = test_df["target_is_correct"].astype(int)

    print("\nTrain rows:", len(X_train))
    print("Test rows:", len(X_test))
    print("Features:", len(feature_columns))


    imputer = SimpleImputer(strategy="median")
    X_train = imputer.fit_transform(X_train)
    X_test = imputer.transform(X_test)

    # Модель
    model = RandomForestClassifier(
        n_estimators=300,
        random_state=42,
        n_jobs=-1,
        class_weight="balanced",
        max_depth=None,
    )

    print("\n Обучаю")
    model.fit(X_train, y_train)

    preds = model.predict(X_test)
    probs = model.predict_proba(X_test)[:, 1] if hasattr(model, "predict_proba") else None

    acc = accuracy_score(y_test, preds)
    report = classification_report(y_test, preds, digits=4, output_dict=True)
    cm = confusion_matrix(y_test, preds)

    print("\nAccuracy:", round(acc, 4))
    print("\nClassification report:")
    print(classification_report(y_test, preds, digits=4))
    print("\nConfusion matrix:")
    print(cm)

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

    top_features = []
    if hasattr(model, "feature_importances_"):
        importances = model.feature_importances_
        pairs = sorted(
            zip(feature_columns, importances),
            key=lambda x: x[1],
            reverse=True,
        )
        top_features = [
            {"feature": name, "importance": float(score)}
            for name, score in pairs[:30]
        ]

        print("\nTop-15 features:")
        for item in top_features[:15]:
            print(f"{item['feature']}: {item['importance']:.6f}")

    report_payload = {
        "exercise_name": "squat",
        "accuracy": float(acc),
        "train_videos": sorted(train_videos.tolist()),
        "test_videos": sorted(test_videos.tolist()),
        "train_rows": int(len(train_df)),
        "test_rows": int(len(test_df)),
        "feature_count": int(len(feature_columns)),
        "confusion_matrix": cm.tolist(),
        "classification_report": report,
        "top_features": top_features,
    }

    with open(REPORT_PATH, "w", encoding="utf-8") as f:
        json.dump(report_payload, f, ensure_ascii=False, indent=2)

    print("\nСохранено:")
    print("Model:", MODEL_PATH)
    print("Features:", FEATURES_PATH)
    print("Report:", REPORT_PATH)


if __name__ == "__main__":
    main()