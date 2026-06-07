from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional, List, Dict, Any
from typing import List

class UserRegister(BaseModel):
    username: str
    last_name: str
    email: str
    password: str
    birth_date: date
    gender: str

class UserLogin(BaseModel):
    email: str
    password: str

class ProfileCreate(BaseModel):
    age: Optional[int] = None
    weight: float
    height: float
    activity_level: int
    goal: str

class ProfileUpdate(BaseModel):
    username: str
    birth_date: date
    weight: float
    height: float
    activity_level: Optional[int] = None
    goal: str

class VerifyEmail(BaseModel):
    email: str
    code: str

class NutritionProfileBase(BaseModel):
    goal: str
    meals_per_day: Optional[int] = None
    budget: Optional[str] = None
    food_preferences: Optional[str] = None
    allergies: Optional[str] = None
    breakfast_time: Optional[str] = None
    lunch_time: Optional[str] = None
    dinner_time: Optional[str] = None
    late_meals: Optional[str] = None
    cooking_mode: Optional[str] = None
    disliked_foods: Optional[str] = None


class NutritionProfileCreate(NutritionProfileBase):
    user_id: int


class NutritionProfileUpdate(BaseModel):
    goal: Optional[str] = None
    meals_per_day: Optional[int] = None
    budget: Optional[str] = None
    food_preferences: Optional[str] = None
    allergies: Optional[str] = None
    breakfast_time: Optional[str] = None
    lunch_time: Optional[str] = None
    dinner_time: Optional[str] = None
    late_meals: Optional[str] = None
    cooking_mode: Optional[str] = None
    disliked_foods: Optional[str] = None


class NutritionProfileResponse(NutritionProfileBase):
    user_id: int


class NutritionHistoryCreate(BaseModel):
    user_id: int
    food_id: Optional[int] = None
    food_name: str
    calories: Optional[float] = None
    protein: Optional[float] = None
    fat: Optional[float] = None
    carbs: Optional[float] = None
    meal_time: Optional[str] = None
    source: Optional[str] = None


class NutritionHistoryResponse(BaseModel):
    id: int
    user_id: int
    food_id: Optional[int] = None
    food_name: str
    calories: Optional[float] = None
    protein: Optional[float] = None
    fat: Optional[float] = None
    carbs: Optional[float] = None
    meal_time: Optional[str] = None
    source: Optional[str] = None
    selected_date: date
    selected_at: datetime

class NutritionRecommendationItem(BaseModel):
    id: int
    name: str
    calories: Optional[float] = None
    protein: Optional[float] = None
    fat: Optional[float] = None
    carbs: Optional[float] = None
    meal_slots: List[str] = []
    recipe: Optional[str] = None
    score: int
    reason: Optional[str] = None


class NutritionRecommendationResponse(BaseModel):
    current_slot: str
    recommendations: List[NutritionRecommendationItem]

class ForgotPasswordRequest(BaseModel):
    email: str


class ResetPasswordRequest(BaseModel):
    email: str
    code: str
    new_password: str

class CameraSessionStartRequest(BaseModel):
    user_id: int
    exercise_name: str
    exercise_order_index: Optional[int] = None
    exercise_mode: Optional[str] = None


class CameraSessionLiveUpdateRequest(BaseModel):
    total_reps: Optional[int] = None
    correct_reps: Optional[int] = None
    incorrect_reps: Optional[int] = None
    form_score: Optional[float] = None
    feedback_summary: Optional[str] = None
    status: Optional[str] = None


class CameraRepEventCreate(BaseModel):
    rep_index: int
    is_correct: bool
    score: Optional[float] = None
    feedback: Optional[str] = None

    exercise_mode: Optional[str] = None
    stage: Optional[str] = None
    metric_label: Optional[str] = None
    metric_value: Optional[float] = None

    features_json: Optional[Dict[str, Any]] = None
    error_type: Optional[str] = None
    label_source: Optional[str] = None


class CameraRepEventResponse(BaseModel):
    id: int
    session_id: int
    rep_index: int
    is_correct: bool
    score: Optional[float] = None
    feedback: Optional[str] = None

    exercise_mode: Optional[str] = None
    stage: Optional[str] = None
    metric_label: Optional[str] = None
    metric_value: Optional[float] = None

    features_json: Optional[Dict[str, Any]] = None
    error_type: Optional[str] = None
    label_source: Optional[str] = None

    created_at: datetime

class CameraSessionFinishRequest(BaseModel):
    total_reps: Optional[int] = None
    correct_reps: Optional[int] = None
    incorrect_reps: Optional[int] = None
    form_score: Optional[float] = None
    feedback_summary: Optional[str] = None


class CameraSessionResponse(BaseModel):
    id: int
    user_id: int
    exercise_name: str
    exercise_order_index: Optional[int] = None
    exercise_mode: Optional[str] = None
    status: str
    total_reps: int
    correct_reps: int
    incorrect_reps: int
    form_score: Optional[float] = None
    feedback_summary: Optional[str] = None
    started_at: datetime
    finished_at: Optional[datetime] = None
    rep_events: List[CameraRepEventResponse] = []

class CameraSessionListResponse(BaseModel):
    sessions: List[CameraSessionResponse]

class CameraLiveSampleCreate(BaseModel):
    exercise_mode: Optional[str] = None
    stage: Optional[str] = None
    metric_label: Optional[str] = None
    metric_value: Optional[float] = None

    features_json: Optional[Dict[str, Any]] = None
    error_type: Optional[str] = None
    label_source: Optional[str] = None
    elapsed_seconds: Optional[float] = None

class CameraLiveSampleResponse(BaseModel):
    id: int
    session_id: int

    exercise_mode: Optional[str] = None
    stage: Optional[str] = None
    metric_label: Optional[str] = None
    metric_value: Optional[float] = None

    features_json: Optional[Dict[str, Any]] = None
    error_type: Optional[str] = None
    label_source: Optional[str] = None
    elapsed_seconds: Optional[float] = None

    created_at: datetime

class CameraMlSquatEvaluateRequest(BaseModel):
    features_json: Dict[str, Any]
    phase: Optional[str] = None
    exercise_mode: Optional[str] = "squat"


class CameraMlSquatEvaluateResponse(BaseModel):
    is_correct: bool
    score: Optional[float] = None
    error_type: Optional[str] = None
    feedback: str
    label_source: str

class HabitReminderCreate(BaseModel):
    reminder_type: str          # habit / challenge
    item_key: str               # drink_water / walk_15_daily
    send_time: str              # "09:00"
    language: str = "ru"        # ru / en / kaz
    is_enabled: bool = True
    timezone: Optional[str] = "Asia/Almaty"


class HabitReminderUpdate(BaseModel):
    send_time: Optional[str] = None
    language: Optional[str] = None
    is_enabled: Optional[bool] = None
    timezone: Optional[str] = None
    last_sent_date: Optional[date] = None


class HabitReminderResponse(BaseModel):
    id: int
    user_id: int
    reminder_type: str
    item_key: str
    send_time: str
    language: str
    is_enabled: bool
    timezone: Optional[str] = None
    last_sent_date: Optional[date] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None