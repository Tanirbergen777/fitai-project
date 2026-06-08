import pandas as pd
import json
import seaborn as sns
import matplotlib.pyplot as plt
from pathlib import Path
from sklearn.ensemble import RandomForestClassifier
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.metrics import accuracy_score, confusion_matrix
from sklearn.model_selection import train_test_split

BASE_DIR = Path(r"C:\Users\alizh\PycharmProjects\FastAPIProject\ai_engine\scripts")
PROJECT_ROOT = BASE_DIR.parent.parent

DATA_PATH = PROJECT_ROOT / "ai_engine" / "datasets" / "squat_pose_frame_dataset.csv"
FEATURES_PATH = PROJECT_ROOT / "ai_engine" / "models_bin" / "squat_pose_feature_columns.json"
OUTPUT_DIR = PROJECT_ROOT / "ai_engine" / "inference_outputs"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

def main():
    print("1. Reading Dataset...")
    df = pd.read_csv(DATA_PATH, low_memory=False)

    print("2. Loading Features...")
    with open(FEATURES_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)
        if isinstance(data, dict):
            feature_columns = data.get("feature_columns") or data.get("columns") or data.get("features")
        else:
            feature_columns = data

    # Train/Test Split by Video
    video_labels = df.groupby("video_name", as_index=False)["target_is_correct"].first()
    train_videos, test_videos = train_test_split(
        video_labels["video_name"],
        test_size=0.33,
        random_state=42,
        stratify=video_labels["target_is_correct"],
    )

    train_df = df[df["video_name"].isin(train_videos)].copy()
    test_df = df[df["video_name"].isin(test_videos)].copy()

    X_train = train_df[feature_columns]
    y_train = train_df["target_is_correct"]

    X_test = test_df[feature_columns]
    y_test = test_df["target_is_correct"]

    print("3. Training Optimized Random Forest (Fine-Tuned)...")
    rf_pipeline = Pipeline([
        ('imputer', SimpleImputer(strategy='mean')),
        ('classifier', RandomForestClassifier(
            n_estimators=200,      
            max_depth=15,          
            class_weight='balanced', 
            random_state=42
        ))
    ])

    rf_pipeline.fit(X_train, y_train)

    print("4. Applying Custom Threshold...")
    CUSTOM_THRESHOLD = 0.35
    
    y_probs = rf_pipeline.predict_proba(X_test)[:, 1]
    y_pred_optimized = (y_probs >= CUSTOM_THRESHOLD).astype(int)

    acc = accuracy_score(y_test, y_pred_optimized)
    cm = confusion_matrix(y_test, y_pred_optimized)

    print(f"--- OPTIMIZED RF RESULTS ---")
    print(f"Old Accuracy: 85.80%")
    print(f"New Accuracy: {acc * 100:.2f}%")

    print("5. Saving Optimized Graph...")
    plt.figure(figsize=(8, 6), facecolor='white')
    ax = plt.gca()
    ax.set_facecolor('white')

    labels = ['Қате отыру (Wrong)', 'Дұрыс отыру (Correct)']
    sns.heatmap(cm, annot=True, fmt="d", cmap="Greens",
                xticklabels=labels, yticklabels=labels,
                annot_kws={"size": 16, "weight": "bold"})

    plt.title(f"Optimized Random Forest (Fine-Tuned)\nДәлдік (Accuracy): {acc*100:.1f}%", fontsize=16, fontweight='bold', pad=15)
    plt.xlabel(f"Модельдің Жорамалы (Predicted Label)\nThreshold = {CUSTOM_THRESHOLD}", fontsize=12, fontweight='bold')
    plt.ylabel("Нақты Дерек (True Label)", fontsize=12, fontweight='bold')

    plt.tight_layout()

    output_path = OUTPUT_DIR / "squat_optimized_rf_confusion_matrix_kz.png"
    plt.savefig(output_path, dpi=300, facecolor='white')
    plt.close()

    print("Done! Optimized graph saved:", output_path)

if __name__ == "__main__":
    main()
