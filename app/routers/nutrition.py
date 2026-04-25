from datetime import date, datetime
try:
    from ai_engine.scripts.nutrition_ml import predict_food_probability, build_feature_row
except Exception as e:
    print(f"Nutrition ML import disabled: {e}")

    def build_feature_row(
        food,
        goal,
        meal_slot,
        budget,
        late_meals,
        cooking_mode,
        meals_per_day,
        preference,
        allergy,
        already_selected_today,
    ):
        return {
            "food_id": food.get("id"),
            "goal": goal,
            "meal_slot": meal_slot,
            "budget": budget,
            "late_meals": late_meals,
            "cooking_mode": cooking_mode,
            "meals_per_day": meals_per_day,
            "preference": preference,
            "allergy": allergy,
            "already_selected_today": already_selected_today,
            "calories": food.get("calories", 0),
            "protein": food.get("protein", 0),
            "fat": food.get("fat", 0),
            "carbs": food.get("carbs", 0),
        }

    def predict_food_probability(feature_row):
        return 0.5
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db
try:
    from ai_engine.scripts.nutrition_catalog import (
        NUTRITION_CATALOG,
        get_current_meal_slot,
        parse_csv,
    )
except Exception as e:
    print(f"Nutrition catalog import disabled: {e}")

    NUTRITION_CATALOG = [
        {
            "id": 1,
            "name": "Овсянка с бананом",
            "calories": 350,
            "protein": 10,
            "fat": 7,
            "carbs": 60,
            "meal_slots": ["breakfast", "snack"],
            "goal_tags": ["lose_weight", "gain_mass", "healthy", "maintain", "general", "lose", "mass"],
            "preference_tags": ["healthy", "budget"],
            "allergens": [],
            "recipe": "Овсянканы сүтпен немесе сумен пісіріп, үстіне банан қос.",
            "reason": "Жеңіл әрі пайдалы таңғы ас.",
        },
        {
            "id": 2,
            "name": "Курица с рисом",
            "calories": 520,
            "protein": 38,
            "fat": 12,
            "carbs": 65,
            "meal_slots": ["lunch", "dinner"],
            "goal_tags": ["lose_weight", "gain_mass", "healthy", "maintain", "general", "lose", "mass"],
            "preference_tags": ["protein", "fitness"],
            "allergens": [],
            "recipe": "Күрішті пісіріп, тауық етін қайнатып немесе қуырып дайында.",
            "reason": "Ақуызға бай, жаттығудан кейін жақсы келеді.",
        },
        {
            "id": 3,
            "name": "Творог с ягодами",
            "calories": 280,
            "protein": 24,
            "fat": 6,
            "carbs": 30,
            "meal_slots": ["snack", "late"],
            "goal_tags": ["lose_weight", "gain_mass", "healthy", "maintain", "general", "lose", "mass"],
            "preference_tags": ["protein", "light"],
            "allergens": ["milk"],
            "recipe": "Творогқа жидек қосып, жеңіл snack ретінде жеуге болады.",
            "reason": "Жеңіл snack және ақуыз көзі.",
        },
    ]

    def parse_csv(value):
        if not value:
            return []
        return [item.strip() for item in value.split(",") if item.strip()]

    def get_current_meal_slot(profile):
        return "snack"
router = APIRouter(prefix="/nutrition", tags=["Nutrition"])


def serialize_profile(profile: models.NutritionProfile):
    return {
        "user_id": profile.user_id,
        "goal": profile.goal,
        "meals_per_day": profile.meals_per_day,
        "budget": profile.budget,
        "food_preferences": profile.food_preferences,
        "allergies": profile.allergies,
        "breakfast_time": profile.breakfast_time,
        "lunch_time": profile.lunch_time,
        "dinner_time": profile.dinner_time,
        "late_meals": profile.late_meals,
        "cooking_mode": profile.cooking_mode,
        "disliked_foods": profile.disliked_foods,
    }


def serialize_history_item(item: models.NutritionHistory):
    return {
        "id": item.id,
        "user_id": item.user_id,
        "food_id": item.food_id,
        "food_name": item.food_name,
        "calories": item.calories,
        "protein": item.protein,
        "fat": item.fat,
        "carbs": item.carbs,
        "meal_time": item.meal_time,
        "source": item.source,
        "selected_date": item.selected_date,
        "selected_at": item.selected_at,
    }


@router.get("/profile/{user_id}", response_model=schemas.NutritionProfileResponse)
def get_nutrition_profile(user_id: int, db: Session = Depends(get_db)):
    profile = db.query(models.NutritionProfile).filter(
        models.NutritionProfile.user_id == user_id
    ).first()

    if not profile:
        raise HTTPException(status_code=404, detail="Профиль питания не найден")

    return serialize_profile(profile)


@router.post("/profile", response_model=schemas.NutritionProfileResponse)
def create_nutrition_profile(
    payload: schemas.NutritionProfileCreate,
    db: Session = Depends(get_db)
):
    user = db.query(models.User).filter(models.User.id == payload.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")

    existing_profile = db.query(models.NutritionProfile).filter(
        models.NutritionProfile.user_id == payload.user_id
    ).first()

    if existing_profile:
        raise HTTPException(status_code=400, detail="Профиль питания уже существует")

    profile = models.NutritionProfile(
        user_id=payload.user_id,
        goal=payload.goal,
        meals_per_day=payload.meals_per_day,
        budget=payload.budget,
        food_preferences=payload.food_preferences,
        allergies=payload.allergies,
        breakfast_time=payload.breakfast_time,
        lunch_time=payload.lunch_time,
        dinner_time=payload.dinner_time,
        late_meals=payload.late_meals,
        cooking_mode=payload.cooking_mode,
        disliked_foods=payload.disliked_foods,
    )

    db.add(profile)
    db.commit()
    db.refresh(profile)

    return serialize_profile(profile)


@router.patch("/profile/{user_id}", response_model=schemas.NutritionProfileResponse)
def update_nutrition_profile(
    user_id: int,
    payload: schemas.NutritionProfileUpdate,
    db: Session = Depends(get_db)
):
    profile = db.query(models.NutritionProfile).filter(
        models.NutritionProfile.user_id == user_id
    ).first()

    if not profile:
        raise HTTPException(status_code=404, detail="Профиль питания не найден")

    update_data = payload.dict(exclude_unset=True)

    for field, value in update_data.items():
        setattr(profile, field, value)

    profile.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(profile)

    return serialize_profile(profile)


@router.get("/history/{user_id}", response_model=list[schemas.NutritionHistoryResponse])
def get_nutrition_history(
    user_id: int,
    only_today: bool = Query(False),
    db: Session = Depends(get_db)
):
    query = db.query(models.NutritionHistory).filter(
        models.NutritionHistory.user_id == user_id
    )

    if only_today:
        query = query.filter(models.NutritionHistory.selected_date == date.today())

    items = query.order_by(models.NutritionHistory.selected_at.desc()).all()
    return [serialize_history_item(item) for item in items]


@router.post("/history", response_model=schemas.NutritionHistoryResponse)
def add_nutrition_history(
    payload: schemas.NutritionHistoryCreate,
    db: Session = Depends(get_db)
):
    user = db.query(models.User).filter(models.User.id == payload.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")

    item = models.NutritionHistory(
        user_id=payload.user_id,
        food_id=payload.food_id,
        food_name=payload.food_name,
        calories=payload.calories,
        protein=payload.protein,
        fat=payload.fat,
        carbs=payload.carbs,
        meal_time=payload.meal_time,
        source=payload.source,
        selected_date=date.today(),
    )

    db.add(item)
    db.commit()
    db.refresh(item)

    return serialize_history_item(item)


@router.delete("/history/{user_id}")
def clear_nutrition_history(
    user_id: int,
    only_today: bool = Query(True),
    db: Session = Depends(get_db)
):
    query = db.query(models.NutritionHistory).filter(
        models.NutritionHistory.user_id == user_id
    )

    if only_today:
        query = query.filter(models.NutritionHistory.selected_date == date.today())

    deleted_count = query.delete(synchronize_session=False)
    db.commit()

    return {
        "status": "success",
        "deleted": deleted_count,
        "only_today": only_today
    }
@router.get("/recommend/{user_id}", response_model=schemas.NutritionRecommendationResponse)
def get_nutrition_recommendations(user_id: int, db: Session = Depends(get_db)):
    profile = db.query(models.NutritionProfile).filter(
        models.NutritionProfile.user_id == user_id
    ).first()

    if not profile:
        raise HTTPException(status_code=404, detail="Профиль питания не найден")

    today_history = db.query(models.NutritionHistory).filter(
        models.NutritionHistory.user_id == user_id,
        models.NutritionHistory.selected_date == date.today()
    ).all()

    current_slot = get_current_meal_slot(datetime.now().hour)

    preferences = parse_csv(profile.food_preferences)
    allergies = parse_csv(profile.allergies)
    disliked_foods = parse_csv(profile.disliked_foods)

    budget = profile.budget or "medium"
    late_meals = profile.late_meals or "sometimes"
    cooking_mode = profile.cooking_mode or "both"
    meals_per_day = profile.meals_per_day or 4

    recommendations = []

    for food in NUTRITION_CATALOG:
        # Жесткие фильтры оставляем
        slot_ok = (
            any(slot in ["dinner", "snack", "late"] for slot in food["meal_slots"])
            if current_slot == "late"
            else current_slot in food["meal_slots"]
        )

        goal_ok = profile.goal in food["goal_tags"]
        allergy_conflict = any(allergy in allergies for allergy in food["allergens"])
        disliked_conflict = any(
            disliked.strip().lower() in food["name"].lower()
            for disliked in disliked_foods
            if disliked.strip()
        )

        if not slot_ok or not goal_ok or allergy_conflict or disliked_conflict:
            continue

        already_today = any(item.food_name == food["name"] for item in today_history)

        # Для модели берем только один preference и одну allergy
        # Если их несколько, пробуем лучший вариант
        preference_candidates = preferences if preferences else ["none"]
        allergy_candidates = allergies if allergies else ["none"]

        best_probability = 0.0

        for pref in preference_candidates:
            allergy_value = allergy_candidates[0] if allergy_candidates else "none"

            features = build_feature_row(
                food=food,
                goal=profile.goal,
                meal_slot=current_slot,
                budget=budget,
                late_meals=late_meals,
                cooking_mode=cooking_mode,
                meals_per_day=meals_per_day,
                preference=pref,
                allergy=allergy_value,
                already_selected_today=int(already_today),
            )

            probability = predict_food_probability(features)
            if probability > best_probability:
                best_probability = probability

        reason_parts = []
        if profile.goal in food["goal_tags"]:
            reason_parts.append("подходит под цель")
        if current_slot in food["meal_slots"]:
            reason_parts.append("подходит по времени")
        if preferences and any(pref in food["preference_tags"] for pref in preferences):
            reason_parts.append("учтены предпочтения")
        if already_today:
            reason_parts.append("уже выбиралось сегодня")

        recommendations.append({
            "id": food["id"],
            "name": food["name"],
            "calories": food["calories"],
            "protein": food["protein"],
            "fat": food["fat"],
            "carbs": food["carbs"],
            "meal_slots": food["meal_slots"],
            "recipe": food["recipe"],
            "score": int(best_probability * 100),
            "reason": ", ".join(reason_parts[:3]) if reason_parts else "ml-рекомендация",
        })

    recommendations.sort(key=lambda item: item["score"], reverse=True)

    return {
        "current_slot": current_slot,
        "recommendations": recommendations[:3]
    }