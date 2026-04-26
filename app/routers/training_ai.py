from typing import Any, Dict, List, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.ml.workout_plan_inference import predict_workout_plan


router = APIRouter(prefix="/training-ai", tags=["Training AI"])


class TrainingAIRecommendRequest(BaseModel):
    user_id: Optional[int] = None

    goal: str = "keep_fit"
    level: str = "beginner"
    duration: int = 15
    focus: str = "full"
    location: str = "home"
    equipment: str = "none"
    cardio: str = "some"
    limitation: str = "none"
    intensity: str = "normal"

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
    top_predictions: List[TrainingAITopPrediction] = []
    features: Dict[str, Any]
    model_accuracy: Optional[float] = None
    model_name: str
    label_source: str


@router.post("/recommend", response_model=TrainingAIRecommendResponse)
async def recommend_training_plan(payload: TrainingAIRecommendRequest):
    try:
        payload_data = (
            payload.model_dump()
            if hasattr(payload, "model_dump")
            else payload.dict()
        )

        result = predict_workout_plan(payload_data)
        return result

    except FileNotFoundError as e:
        raise HTTPException(status_code=500, detail=str(e))

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Training AI error: {e}")