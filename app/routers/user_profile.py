from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
try:
    from ai_engine.scripts import ai_logic
except Exception as e:
    ai_logic = None
    print(f"AI logic import disabled: {e}")
from app import models, schemas
from app.database import get_db
from datetime import date

router = APIRouter(tags=["Profile & AI"])

def calculate_age(birth_date: date):
    today = date.today()
    return today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))


@router.post("/update-profile/{user_id}")
def update_profile(user_id: int, data: schemas.ProfileUpdate, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if data.username != user.username:
        existing_user = db.query(models.User).filter(
            models.User.username == data.username,
            models.User.id != user_id
        ).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Это имя пользователя уже занято")

    user.username = data.username
    user.birth_date = data.birth_date

    profile = db.query(models.UserProfile).filter(models.UserProfile.user_id == user_id).first()
    if not profile:
        profile = models.UserProfile(user_id=user_id)
        db.add(profile)

    user_age = calculate_age(data.birth_date)
    height_m = data.height / 100
    bmi_val = round(data.weight / (height_m ** 2), 2) if height_m > 0 else 0

    current_activity_level = profile.activity_level if profile.activity_level is not None else 1

    profile.age = user_age
    profile.weight = data.weight
    profile.height = data.height
    profile.activity_level = data.activity_level if data.activity_level is not None else current_activity_level
    profile.bmi = bmi_val
    profile.goal = data.goal
    profile.target_weight = data.target_weight
    
    if profile.target_timeframe_weeks != data.target_timeframe_weeks:
        profile.goal_start_date = date.today()

    profile.target_timeframe_weeks = data.target_timeframe_weeks
    profile.target_workouts_per_week = data.target_workouts_per_week
    profile.target_calories_per_workout = data.target_calories_per_workout
    profile.target_duration_per_workout = data.target_duration_per_workout

    if hasattr(profile, 'custom_goal_text'):
        profile.custom_goal_text = data.goal

    try:
        db.commit()
        db.refresh(user)
        db.refresh(profile)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

    return {
        "status": "success",
        "bmi": bmi_val,
        "username": user.username,
        "age": profile.age,
        "activity_level": profile.activity_level
    }
@router.post("/onboarding/{user_id}")
def create_profile(user_id: int, profile_data: schemas.ProfileCreate, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")


    user_age = calculate_age(user.birth_date) if user.birth_date else profile_data.age


    height_m = profile_data.height / 100
    bmi_val = round(profile_data.weight / (height_m ** 2), 2)


    try:
        ai_verdict = ai_logic.predict_difficulty(
            user_age,
            profile_data.height,
            profile_data.weight,
            profile_data.activity_level
        )
    except Exception as e:
        print(f"AI Error: {e}")
        ai_verdict = "Определяется..."

    new_profile = models.UserProfile(
        user_id=user_id,
        age=user_age,
        weight=profile_data.weight,
        height=profile_data.height,
        activity_level=profile_data.activity_level,
        goal=profile_data.goal,
        bmi=bmi_val
    )

    db.query(models.UserProfile).filter(models.UserProfile.user_id == user_id).delete()
    db.add(new_profile)
    db.commit()

    return {
        "status": "success",
        "bmi": bmi_val,
        "age_calculated": user_age,
        "ai_recommendation": ai_verdict
    }

@router.post("/predict-goal-timeframe")
def api_predict_goal_timeframe(data: schemas.GoalTimeframePredictRequest):
    try:
        verdict = ai_logic.predict_goal_timeframe(
            age=data.age,
            height_cm=data.height,
            start_weight=data.weight,
            target_weight=data.target_weight,
            goal_str=data.goal,
            requested_days=data.requested_days
        )
        return verdict
    except Exception as e:
        print(f"ML Error predicting timeframe: {e}")
        return {"is_realistic": True, "recommended_days": data.requested_days}

from datetime import date, timedelta

@router.get("/user-progress-stats/{user_id}")
def get_user_progress_stats(user_id: int, db: Session = Depends(get_db)):
    profile = db.query(models.UserProfile).filter(models.UserProfile.user_id == user_id).first()
    
    target_weeks = profile.target_timeframe_weeks if profile and profile.target_timeframe_weeks else 12
    target_workouts = profile.target_workouts_per_week if profile and profile.target_workouts_per_week else 3
    target_cal = profile.target_calories_per_workout if profile and profile.target_calories_per_workout else 300
    target_duration = profile.target_duration_per_workout if profile and profile.target_duration_per_workout else 45

    today = date.today()
    start_of_week = today - timedelta(days=today.weekday())
    
    goal_start_date = profile.goal_start_date if profile and profile.goal_start_date else today
    weeks_elapsed = max(1, (today - goal_start_date).days // 7 + 1)
    
    # Workouts this week (Camera sessions with score >= 75)
    workouts_week = db.query(models.WorkoutCameraSession).filter(
        models.WorkoutCameraSession.user_id == user_id,
        models.WorkoutCameraSession.started_at >= start_of_week,
        models.WorkoutCameraSession.form_score >= 75.0
    ).count()

    workouts_today_sessions = db.query(models.WorkoutCameraSession).filter(
        models.WorkoutCameraSession.user_id == user_id,
        models.WorkoutCameraSession.started_at >= today
    ).all()

    total_duration_minutes = 0
    total_calories_burned = 0
    
    for session in workouts_today_sessions:
        if session.finished_at and session.started_at:
            duration_minutes = (session.finished_at - session.started_at).total_seconds() / 60
            if duration_minutes > 0:
                total_duration_minutes += duration_minutes
                # Примерный расчет: 7 ккал в минуту
                total_calories_burned += duration_minutes * 7

    return {
        "weeks": {"current": weeks_elapsed, "target": target_weeks},
        "workouts_week": {"current": workouts_week, "target": target_workouts},
        "calories_today": {"current": int(total_calories_burned), "target": target_cal},
        "duration_today": {"current": int(total_duration_minutes), "target": target_duration}
    }