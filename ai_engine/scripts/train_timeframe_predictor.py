import pandas as pd
import numpy as np
import os
import joblib
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.model_selection import train_test_split

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "..", "datasets", "health_fitness_dataset.csv")
MODELS_DIR = os.path.join(BASE_DIR, "..", "models_bin")

print("Loading dataset...")
df = pd.read_csv(DATA_PATH)
df['date'] = pd.to_datetime(df['date'])

print("Aggregating participant data...")
participants = []
np.random.seed(42)

for pid, group in df.groupby('participant_id'):
    group = group.sort_values('date').reset_index(drop=True)
    if len(group) < 10:
        continue
        
    first_row = group.iloc[0]
    start_weight = first_row['weight_kg']
    
    # We will sample multiple "journeys" for this participant
    # by picking random end dates in their history
    for _ in range(5):
        random_idx = np.random.randint(5, len(group))
        end_row = group.iloc[random_idx]
        
        end_weight = end_row['weight_kg']
        days_taken = (end_row['date'] - first_row['date']).days
        
        weight_diff = abs(end_weight - start_weight)
        if weight_diff < 1.0 or days_taken < 7:
            continue
            
        # Original (Gain)
        participants.append({
            'age': first_row['age'],
            'height_cm': first_row['height_cm'],
            'start_weight': start_weight,
            'target_weight': end_weight,
            'goal': 1,
            'actual_days': days_taken
        })
        
        # Mirrored (Loss)
        # We assume losing X kg takes about the same time as gaining X kg
        participants.append({
            'age': first_row['age'],
            'height_cm': first_row['height_cm'],
            'start_weight': end_weight,
            'target_weight': start_weight,
            'goal': 0,
            'actual_days': days_taken
        })

pdf = pd.DataFrame(participants)

X_reg = pdf[['age', 'height_cm', 'start_weight', 'target_weight', 'goal']]
y_reg = pdf['actual_days']

print("Training Regressor...")
reg_model = RandomForestRegressor(n_estimators=50, max_depth=10, random_state=42)
reg_model.fit(X_reg, y_reg)

pdf_pos = pdf.copy()
pdf_pos['requested_days'] = pdf_pos['actual_days'] + np.random.randint(-7, 21, size=len(pdf_pos))
pdf_pos['requested_days'] = np.maximum(7, pdf_pos['requested_days'])
pdf_pos['is_realistic'] = 1

pdf_neg = pdf.copy()
pdf_neg['requested_days'] = (pdf_neg['actual_days'] * np.random.uniform(0.1, 0.4, size=len(pdf_neg))).astype(int)
pdf_neg['requested_days'] = np.maximum(1, pdf_neg['requested_days'])
pdf_neg['is_realistic'] = 0

clf_df = pd.concat([pdf_pos, pdf_neg]).sample(frac=1).reset_index(drop=True)
X_clf = clf_df[['age', 'height_cm', 'start_weight', 'target_weight', 'goal', 'requested_days']]
y_clf = clf_df['is_realistic']

print("Training Classifier...")
clf_model = RandomForestClassifier(n_estimators=50, max_depth=10, random_state=42)
clf_model.fit(X_clf, y_clf)

os.makedirs(MODELS_DIR, exist_ok=True)
joblib.dump(reg_model, os.path.join(MODELS_DIR, 'goal_time_regressor.pkl'))
joblib.dump(clf_model, os.path.join(MODELS_DIR, 'goal_time_classifier.pkl'))
print("Done!")
