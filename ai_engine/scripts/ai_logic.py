import os
import joblib
import pandas as pd

from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.impute import SimpleImputer
from sklearn.metrics import accuracy_score, classification_report
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import LabelEncoder, OneHotEncoder, StandardScaler

# Пути
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "..", "models_bin", "status_classifier_v2.pkl")
ENCODER_PATH = os.path.join(BASE_DIR, "..", "models_bin", "status_encoder_v2.pkl")
DATA_PATH = os.path.join(BASE_DIR, "..", "datasets", "data.csv")

def build_training_frame(df: pd.DataFrame) -> pd.DataFrame:
    required = ["Age", "Gender", "Height", "Weight", "FAF", "NObeyesdad"]
    missing = [col for col in required if col not in df.columns]
    if missing:
        raise ValueError(f"В датасете не хватает колонок: {missing}")

    work_df = df[required].copy()
    work_df = work_df.dropna()


    work_df["BMI"] = work_df["Weight"] / (work_df["Height"] ** 2)

    return work_df


def train_status_model():
    if not os.path.exists(DATA_PATH):
        print(f"❌ Датасет {DATA_PATH} не найден!")
        return None, None

    df = pd.read_csv(DATA_PATH)
    print("DATA PATH:", DATA_PATH)
    print("COLUMNS:", df.columns.tolist())
    df = build_training_frame(df)

    feature_cols = ["Age", "Gender", "Height", "Weight", "FAF", "BMI"]
    target_col = "NObeyesdad"

    X = df[feature_cols]
    y_raw = df[target_col]

    label_encoder = LabelEncoder()
    y = label_encoder.fit_transform(y_raw)

    numeric_features = ["Age", "Height", "Weight", "FAF", "BMI"]
    categorical_features = ["Gender"]

    numeric_transformer = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="median")),
            ("scaler", StandardScaler())
        ]
    )

    categorical_transformer = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="most_frequent")),
            ("onehot", OneHotEncoder(handle_unknown="ignore"))
        ]
    )

    preprocessor = ColumnTransformer(
        transformers=[
            ("num", numeric_transformer, numeric_features),
            ("cat", categorical_transformer, categorical_features),
        ]
    )

    model = RandomForestClassifier(
        n_estimators=300,
        max_depth=12,
        min_samples_leaf=2,
        random_state=42,
        class_weight="balanced_subsample"
    )

    pipeline = Pipeline(
        steps=[
            ("preprocessor", preprocessor),
            ("model", model)
        ]
    )

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=42,
        stratify=y
    )

    pipeline.fit(X_train, y_train)

    y_pred = pipeline.predict(X_test)
    acc = accuracy_score(y_test, y_pred)

    print(f"✅ Accuracy: {acc:.4f}")
    print("📊 Classification report:")
    print(classification_report(y_test, y_pred, target_names=label_encoder.classes_))

    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
    joblib.dump(pipeline, MODEL_PATH)
    joblib.dump(label_encoder, ENCODER_PATH)

    return pipeline, label_encoder


def predict_status(age, gender, height, weight, activity_level):
    if not os.path.exists(MODEL_PATH):
        model, label_encoder = train_status_model()
        if model is None:
            return "Unknown"
    else:
        model = joblib.load(MODEL_PATH)
        label_encoder = joblib.load(ENCODER_PATH)

    # Если рост пришёл в см — переводим в метры
    height_m = height / 100 if height > 3 else height

    bmi = weight / (height_m ** 2) if height_m > 0 else 0

    input_df = pd.DataFrame([
        {
            "Age": float(age),
            "Gender": gender if gender else "Male",
            "Height": float(height_m),
            "Weight": float(weight),
            "FAF": float(activity_level),
            "BMI": float(bmi),
        }
    ])

    prediction_numeric = model.predict(input_df)
    return label_encoder.inverse_transform(prediction_numeric)[0]

def predict_goal_timeframe(age, height_cm, start_weight, target_weight, goal_str, requested_days):
    clf_path = os.path.join(BASE_DIR, "..", "models_bin", "goal_time_classifier.pkl")
    reg_path = os.path.join(BASE_DIR, "..", "models_bin", "goal_time_regressor.pkl")
    
    if not os.path.exists(clf_path) or not os.path.exists(reg_path):
        return {"is_realistic": True, "recommended_days": requested_days}
        
    clf_model = joblib.load(clf_path)
    reg_model = joblib.load(reg_path)
    
    goal_num = 0 if goal_str == 'Похудение' else 1
    
    input_df = pd.DataFrame([{
        'age': float(age),
        'height_cm': float(height_cm),
        'start_weight': float(start_weight),
        'target_weight': float(target_weight),
        'goal': goal_num,
        'requested_days': float(requested_days)
    }])
    
    reg_input_df = input_df.drop(columns=['requested_days'])
    
    is_realistic = bool(clf_model.predict(input_df)[0])
    recommended_days = int(reg_model.predict(reg_input_df)[0])
    
    # If they are giving themselves more time than the ML recommends, it's realistic
    if requested_days >= recommended_days:
        is_realistic = True
        
    weight_diff = abs(start_weight - target_weight)
    weeks = requested_days / 7.0 if requested_days > 0 else 1.0
    kg_per_week = weight_diff / weeks
    
    if goal_str == 'Набор массы':
        workouts_per_week = 4 if kg_per_week > 0.3 else 3
        calories_per_workout = 300
        duration_per_workout = 60
    else:
        if kg_per_week > 0.7:
            workouts_per_week = 5
        elif kg_per_week > 0.4:
            workouts_per_week = 4
        elif kg_per_week > 0.2:
            workouts_per_week = 3
        else:
            workouts_per_week = 2
            
        weekly_deficit = (weight_diff * 7700) / weeks
        target_weekly_burn = weekly_deficit * 0.4
        target_weekly_burn = max(target_weekly_burn, workouts_per_week * 250)
        
        calories_per_workout = int(target_weekly_burn / workouts_per_week)
        calories_per_workout = max(200, min(800, calories_per_workout))
        duration_per_workout = max(30, int(calories_per_workout / 6.5))
            
    return {
        "is_realistic": is_realistic,
        "recommended_days": recommended_days,
        "workouts_per_week": workouts_per_week,
        "calories_per_workout": calories_per_workout,
        "duration_per_workout": duration_per_workout
    }


if __name__ == "__main__":
    train_status_model()