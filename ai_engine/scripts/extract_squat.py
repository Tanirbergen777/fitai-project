import pandas as pd
import os

in_path = r'C:\Users\alizh\PycharmProjects\FastAPIProject\ai_engine\datasets\video_pose_frames.csv'
out_path = r'C:\Users\alizh\PycharmProjects\FastAPIProject\ai_engine\datasets\squat_pose_frame_dataset.csv'

print("Starting to read CSV...")
df = pd.read_csv(in_path, low_memory=False)

print("Filtering for squat...")
squat_df = df[df['exercise_name'] == 'squat']

print("Saving to new CSV...")
squat_df.to_csv(out_path, index=False)

print(f"Done! {len(squat_df)} rows for squat saved to: {out_path}")
