import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL)

with engine.begin() as conn:
    result = conn.execute(text("SELECT user_id, target_workouts_per_week, target_calories_per_workout, target_duration_per_workout FROM user_profiles")).fetchall()
    print("DB targets:")
    for row in result:
        print(row)
