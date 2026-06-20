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
        conn.execute(text("ALTER TABLE users ADD COLUMN last_workout_time TIMESTAMP WITHOUT TIME ZONE"))
        print("Added last_workout_time")
    except Exception as e:
        print(f"Error adding last_workout_time: {e}")

    try:
        conn.execute(text("ALTER TABLE users ADD COLUMN last_penalty_time TIMESTAMP WITHOUT TIME ZONE"))
        print("Added last_penalty_time")
    except Exception as e:
        print(f"Error adding last_penalty_time: {e}")

print("Done")
