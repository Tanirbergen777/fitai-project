import pandas as pd
import numpy as np
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "ai_engine", "datasets", "health_fitness_dataset.csv")

df = pd.read_csv(DATA_PATH)
df['date'] = pd.to_datetime(df['date'])

participants = []
for pid, group in df.groupby('participant_id'):
    group = group.sort_values('date')
    first_row = group.iloc[0]
    
    start_weight = first_row['weight_kg']
    max_weight = group['weight_kg'].max()
    min_weight = group['weight_kg'].min()
    
    # We don't know their explicit goal, so we assume their goal was whatever their extreme weight was
    # If they lost more than they gained, assume goal was losing weight
    if (start_weight - min_weight) > (max_weight - start_weight):
        goal = 0  # Lose weight
        target_weight = min_weight
        # Find when they first hit this target
        target_date = group[group['weight_kg'] <= target_weight + 0.5]['date'].iloc[0]
    else:
        goal = 1  # Gain weight
        target_weight = max_weight
        target_date = group[group['weight_kg'] >= target_weight - 0.5]['date'].iloc[0]
        
    actual_days = (target_date - first_row['date']).days
    weight_diff = abs(target_weight - start_weight)
    
    if weight_diff >= 1.0 and actual_days > 0:
        participants.append({
            'start_weight': start_weight,
            'target_weight': target_weight,
            'weight_diff': weight_diff,
            'actual_days': actual_days,
            'goal': goal
        })

pdf = pd.DataFrame(participants)
print(f"Valid journeys: {len(pdf)}")
print(pdf.describe())
