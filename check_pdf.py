import pandas as pd
import numpy as np
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "datasets", "health_fitness_dataset.csv")

df = pd.read_csv(DATA_PATH)
df['date'] = pd.to_datetime(df['date'])

participants = []
for pid, group in df.groupby('participant_id'):
    group = group.sort_values('date')
    first_row = group.iloc[0]
    last_row = group.iloc[-1]
    
    start_weight = first_row['weight_kg']
    end_weight = last_row['weight_kg']
    weight_diff = abs(end_weight - start_weight)
    
    if weight_diff < 1.0:
        continue
        
    goal = 0 if end_weight < start_weight else 1 # 0 = Lose weight, 1 = Gain weight
    
    if goal == 0:
        weeks_taken = weight_diff / np.random.uniform(0.4, 0.8)
    else:
        weeks_taken = weight_diff / np.random.uniform(0.2, 0.5)
        
    actual_days = int(weeks_taken * 7) + np.random.randint(-7, 7)
    actual_days = max(14, actual_days)
    
    participants.append({
        'age': first_row['age'],
        'height_cm': first_row['height_cm'],
        'start_weight': start_weight,
        'target_weight': end_weight,
        'goal': goal,
        'actual_days': actual_days
    })

pdf = pd.DataFrame(participants)
print("PDF HEAD:")
print(pdf.head())
print("\nPDF DESCRIPTION:")
print(pdf.describe())
