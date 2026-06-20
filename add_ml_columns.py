import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("DATABASE_URL not found")
    exit(1)

engine = create_engine(DATABASE_URL)

with engine.begin() as conn:
    try:
        conn.execute(text("ALTER TABLE user_profiles ADD COLUMN target_workouts_per_week INTEGER"))
        conn.execute(text("ALTER TABLE user_profiles ADD COLUMN target_calories_per_workout INTEGER"))
        conn.execute(text("ALTER TABLE user_profiles ADD COLUMN target_duration_per_workout INTEGER"))
        print("Added ML target columns to user_profiles")
    except Exception as e:
        print(f"Error adding ML target columns: {e}")

print("Done")
