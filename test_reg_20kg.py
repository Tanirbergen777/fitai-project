import joblib
import pandas as pd
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
reg_path = os.path.join(BASE_DIR, "ai_engine", "models_bin", "goal_time_regressor.pkl")

reg_model = joblib.load(reg_path)
input_df = pd.DataFrame([{
    'age': 28.0,
    'height_cm': 180.0,
    'start_weight': 100.0,
    'target_weight': 80.0,
    'goal': 0.0
}])

print("Predicted days:", reg_model.predict(input_df)[0])
