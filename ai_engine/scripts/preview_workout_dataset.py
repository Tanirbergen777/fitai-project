import os
import pandas as pd

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "..", "datasets", "nhanes_workout_training_dataset.csv")

df = pd.read_csv(DATA_PATH)

print("Колонки:")
print(list(df.columns))
print("\nРазмер:")
print(df.shape)
print("\nПервые 10 строк:")
print(df.head(10).to_string(index=False))
print("\nТипы plan_template_id:")
print(df["plan_template_id"].value_counts())