from typing import Any, Dict, List, Optional
from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.ml.workout_plan_inference import predict_workout_plan
from app import models
from app.database import get_db


router = APIRouter(prefix="/training-ai", tags=["Training AI"])


def _calculate_age(birth_date: date) -> int:
    today = date.today()
    return today.year - birth_date.year - (
        (today.month, today.day) < (birth_date.month, birth_date.day)
    )


class TrainingAIRecommendRequest(BaseModel):
    user_id: Optional[int] = None

    focus: str = "full"
    limitation: str = "none"
    intensity: str = "normal" # Can be 'low', 'normal', 'high', 'ai_auto'
    duration: int = 15


    age: Optional[float] = None
    gender: Optional[str] = None
    height: Optional[float] = None
    weight: Optional[float] = None
    bmi: Optional[float] = None
    waist: Optional[float] = None
    hip: Optional[float] = None
    arm: Optional[float] = None


class TrainingAITopPrediction(BaseModel):
    plan_template_id: str
    probability: float


class TrainingAIRecommendResponse(BaseModel):
    plan_template_id: str
    confidence: Optional[float] = None
    generated_exercises: List[Dict[str, Any]] = []
    top_predictions: List[TrainingAITopPrediction] = []
    features: Dict[str, Any]
    model_accuracy: Optional[float] = None
    model_name: str
    label_source: str
    ai_safety_warning: Optional[str] = None


@router.post("/recommend", response_model=TrainingAIRecommendResponse)
async def recommend_training_plan(
    payload: TrainingAIRecommendRequest,
    db: Session = Depends(get_db),
):
    try:
        payload_data = (
            payload.model_dump()
            if hasattr(payload, "model_dump")
            else payload.dict()
        )

        ai_safety_warning = None

        if payload.user_id:
            user = (
                db.query(models.User)
                .filter(models.User.id == payload.user_id)
                .first()
            )
            profile = (
                db.query(models.UserProfile)
                .filter(models.UserProfile.user_id == payload.user_id)
                .first()
            )


            if user and user.birth_date and payload.age is None:
                payload_data["age"] = float(_calculate_age(user.birth_date))

            if user and user.gender and payload.gender is None:
                payload_data["gender"] = user.gender

            if profile:
                if profile.age and payload.age is None:
                    payload_data["age"] = float(profile.age)
                if profile.goal:
                    payload_data["goal"] = profile.goal
                if payload.height is None and profile.height:
                    payload_data["height"] = float(profile.height)
                if payload.weight is None and profile.weight:
                    payload_data["weight"] = float(profile.weight)
                if payload.bmi is None and profile.bmi:
                    payload_data["bmi"] = float(profile.bmi)

            # =====================================================
            # HYBRID AI: RULE-BASED SAFETY LAYER (Қарқынды бақылау)
            # =====================================================
            from datetime import datetime
            
            past_workouts = db.query(models.CameraSession).filter(
                models.CameraSession.user_id == payload.user_id,
                models.CameraSession.status == "finished"
            ).count()

            requested_intensity = payload_data.get("intensity", "normal")

            if requested_intensity == "ai_auto":
                if past_workouts == 0:
                    payload_data["intensity"] = "low"
                    ai_safety_warning = "Сіз бұрын біздің платформада жаттығу жасамағандықтан, қауіпсіздік үшін бүгін 'Төмен' қарқын ұсынылады."
                elif past_workouts <= 5:
                    payload_data["intensity"] = "normal"
                    ai_safety_warning = "Жүйе сіздің тәжірибеңізді талдап, 'Орташа' қарқынды таңдады."
                else:
                    payload_data["intensity"] = "high"
                    ai_safety_warning = "Жүйе сіздің жоғары тәжірибеңізді талдап, 'Жоғары' қарқынды таңдады."
            else:
                payload_data["intensity"] = requested_intensity

        result = predict_workout_plan(payload_data)
        if ai_safety_warning:
            result["ai_safety_warning"] = ai_safety_warning
            
        return result

    except FileNotFoundError as e:
        raise HTTPException(status_code=500, detail=str(e))

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Training AI error: {e}")
