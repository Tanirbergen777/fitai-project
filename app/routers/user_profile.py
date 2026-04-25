from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ai_engine.scripts import ai_logic
from app import models, schemas
from app.database import get_db
from datetime import date

router = APIRouter(tags=["Profile & AI"])

def calculate_age(birth_date: date):
    """Функция для точного расчета возраста на текущую дату"""
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
    # 1. Ищем пользователя, чтобы достать его дату рождения
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")

    # 2. Если у пользователя нет даты рождения (старая запись), используем ту, что пришла (если есть)
    # Но в идеале берем из профиля юзера
    user_age = calculate_age(user.birth_date) if user.birth_date else profile_data.age

    # 3. Расчет ИМТ (BMI)
    height_m = profile_data.height / 100
    bmi_val = round(profile_data.weight / (height_m ** 2), 2)

    # 4. Работа с ИИ
    try:
        # Передаем автоматически вычисленный возраст в твой классификатор
        ai_verdict = ai_logic.predict_difficulty(
            user_age,
            profile_data.height,
            profile_data.weight,
            profile_data.activity_level
        )
    except Exception as e:
        print(f"AI Error: {e}")
        ai_verdict = "Определяется..."

    # 5. Создаем или обновляем профиль
    new_profile = models.UserProfile(
        user_id=user_id,
        age=user_age, # Сохраняем вычисленный возраст
        weight=profile_data.weight,
        height=profile_data.height,
        activity_level=profile_data.activity_level,
        goal=profile_data.goal,
        bmi=bmi_val
    )

    # Очищаем старый профиль, если он был
    db.query(models.UserProfile).filter(models.UserProfile.user_id == user_id).delete()
    db.add(new_profile)
    db.commit()

    return {
        "status": "success",
        "bmi": bmi_val,
        "age_calculated": user_age,
        "ai_recommendation": ai_verdict
    }