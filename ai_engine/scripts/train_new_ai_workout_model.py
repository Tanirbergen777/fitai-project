import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score
import joblib
import os

def train_model():
    base_dir = os.path.dirname(os.path.dirname(__file__))
    dataset_path = os.path.join(base_dir, "datasets", "new_ai_workout_dataset.csv")
    model_path = os.path.join(base_dir, "models_bin", "new_workout_plan_selector.pkl")
    
    df = pd.read_csv(dataset_path)
    
    # Preprocessing
    categorical_features = ['gender', 'goal', 'focus', 'limitations', 'intensity']
    numeric_features = ['age', 'height', 'weight', 'duration']
    
    label_encoders = {}
    for col in categorical_features:
        le = LabelEncoder()
        df[col] = le.fit_transform(df[col].astype(str))
        label_encoders[col] = le
        
    X = df[numeric_features + categorical_features]
    y = df['plan_template_id']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    model = RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42)
    model.fit(X_train, y_train)
    
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    
    print(f"Model Accuracy on Test Set: {accuracy * 100:.2f}%")
    
    # Save model and metadata
    bundle = {
        "model": model,
        "numeric_features": numeric_features,
        "categorical_features": categorical_features,
        "label_encoders": label_encoders,
        "accuracy": accuracy
    }
    
    joblib.dump(bundle, model_path)
    print(f"Model saved successfully to {model_path}")

if __name__ == "__main__":
    train_model()
