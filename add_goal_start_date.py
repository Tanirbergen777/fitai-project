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
        conn.execute(text("ALTER TABLE user_profiles ADD COLUMN goal_start_date DATE"))
        conn.execute(text("UPDATE user_profiles SET goal_start_date = CURRENT_DATE WHERE goal_start_date IS NULL"))
        print("Added goal_start_date to user_profiles")
    except Exception as e:
        print(f"Error: {e}")

print("Done")
