from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Text,Date,Boolean
from app.database import Base
from sqlalchemy.orm import relationship
from datetime import datetime, date
class ChatSession(Base):
    __tablename__ = "chat_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), default="Новый чат")
    created_at = Column(DateTime, default=datetime.utcnow)

    messages = relationship("ChatMessage", back_populates="session", cascade="all, delete")
    user = relationship("User")

class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("chat_sessions.id", ondelete="CASCADE"), nullable=False)
    role = Column(String(50), nullable=False)
    content = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)

    # Обратная связь с сессией
    session = relationship("ChatSession", back_populates="messages")

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    streak_count = Column(Integer, default=0)
    last_visit = Column(Date, nullable=True)
    is_verified = Column(Boolean, default=False)
    verification_code = Column(String, nullable=True)
    last_name = Column(String, nullable=True)
    birth_date = Column(Date, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    gender = Column(String, nullable=True)
    rating = Column(Integer, default=0)
    last_login_date = Column(Date, nullable=True)
    avatar_url = Column(String, nullable=True)
    reset_code = Column(String, nullable=True)
    reset_code_expires_at = Column(DateTime, nullable=True)
class UserProfile(Base):
    __tablename__ = "user_profiles"
    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    age = Column(Integer)
    weight = Column(Float)
    height = Column(Float)
    activity_level = Column(Integer)
    goal = Column(String)
    bmi = Column(Float)
    waist = Column(Float, nullable=True)
    hip = Column(Float, nullable=True)
    arm = Column(Float)
    custom_goal_text = Column(String, nullable=True)

class NutritionProfile(Base):
    __tablename__ = "nutrition_profiles"

    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)

    goal = Column(String(30), nullable=False)
    meals_per_day = Column(Integer, nullable=True)
    budget = Column(String(20), nullable=True)

    food_preferences = Column(Text, nullable=True)   # CSV
    allergies = Column(Text, nullable=True)          # CSV

    breakfast_time = Column(String(5), nullable=True)  # "08:00"
    lunch_time = Column(String(5), nullable=True)
    dinner_time = Column(String(5), nullable=True)

    late_meals = Column(String(30), nullable=True)
    cooking_mode = Column(String(30), nullable=True)
    disliked_foods = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", backref="nutrition_profile", uselist=False)


class NutritionHistory(Base):
    __tablename__ = "nutrition_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    food_id = Column(Integer, nullable=True)
    food_name = Column(String(255), nullable=False)

    calories = Column(Float, nullable=True)
    protein = Column(Float, nullable=True)
    fat = Column(Float, nullable=True)
    carbs = Column(Float, nullable=True)

    meal_time = Column(String(50), nullable=True)
    source = Column(String(50), nullable=True)

    selected_date = Column(Date, default=date.today, index=True)
    selected_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", backref="nutrition_history")


class WorkoutCameraSession(Base):
    __tablename__ = "workout_camera_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    exercise_name = Column(String(255), nullable=False)
    exercise_order_index = Column(Integer, nullable=True)
    exercise_mode = Column(String(50), nullable=True)   # squat / pushup / generic

    status = Column(String(30), default="active")       # active / finished
    total_reps = Column(Integer, default=0)
    correct_reps = Column(Integer, default=0)
    incorrect_reps = Column(Integer, default=0)

    form_score = Column(Float, nullable=True)
    feedback_summary = Column(Text, nullable=True)

    started_at = Column(DateTime, default=datetime.utcnow)
    finished_at = Column(DateTime, nullable=True)

    user = relationship("User", backref="workout_camera_sessions")
    rep_events = relationship(
        "WorkoutCameraRepEvent",
        back_populates="session",
        cascade="all, delete-orphan"
    )
    live_samples = relationship(
        "WorkoutCameraLiveSample",
        back_populates="session",
        cascade="all, delete-orphan"
    )


class WorkoutCameraRepEvent(Base):
    __tablename__ = "workout_camera_rep_events"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("workout_camera_sessions.id", ondelete="CASCADE"), nullable=False, index=True)

    rep_index = Column(Integer, nullable=False)
    is_correct = Column(Boolean, default=True)
    score = Column(Float, nullable=True)
    feedback = Column(Text, nullable=True)

    exercise_mode = Column(String(50), nullable=True)
    stage = Column(String(50), nullable=True)
    metric_label = Column(String(100), nullable=True)
    metric_value = Column(Float, nullable=True)

    features_json = Column(Text, nullable=True)   # JSON строка с признаками
    error_type = Column(String(100), nullable=True)
    label_source = Column(String(50), nullable=True, default="rule")

    created_at = Column(DateTime, default=datetime.utcnow)

    session = relationship("WorkoutCameraSession", back_populates="rep_events")

class WorkoutCameraLiveSample(Base):
    __tablename__ = "workout_camera_live_samples"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(
        Integer,
        ForeignKey("workout_camera_sessions.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    exercise_mode = Column(String(50), nullable=True)
    stage = Column(String(50), nullable=True)
    metric_label = Column(String(100), nullable=True)
    metric_value = Column(Float, nullable=True)

    features_json = Column(Text, nullable=True)
    error_type = Column(String(100), nullable=True)
    label_source = Column(String(50), nullable=True, default="rule_live")

    elapsed_seconds = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    session = relationship("WorkoutCameraSession", back_populates="live_samples")

from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Text, Date, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime, date


class HabitReminder(Base):
    __tablename__ = "habit_reminders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    reminder_type = Column(String(20), nullable=False)   # habit / challenge
    item_key = Column(String(100), nullable=False)       # drink_water / walk_15_daily
    send_time = Column(String(5), nullable=False)        # "09:00"
    language = Column(String(10), nullable=False, default="ru")  # ru / en / kaz

    is_enabled = Column(Boolean, default=True)
    timezone = Column(String(50), nullable=True, default="Asia/Almaty")
    last_sent_date = Column(Date, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    user = relationship("User", backref="habit_reminders")

