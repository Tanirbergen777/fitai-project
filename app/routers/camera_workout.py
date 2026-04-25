from datetime import datetime
import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import csv
import io
from fastapi.responses import StreamingResponse
from app.ml.squat_inference import evaluate_squat_features
from app.schemas import (
    CameraSessionStartRequest,
    CameraSessionLiveUpdateRequest,
    CameraRepEventCreate,
    CameraRepEventResponse,
    CameraSessionFinishRequest,
    CameraSessionResponse,
    CameraSessionListResponse,
    CameraLiveSampleCreate,
    CameraLiveSampleResponse,
    CameraMlSquatEvaluateRequest,
    CameraMlSquatEvaluateResponse,
)

from ..database import get_db
from .. import models

router = APIRouter(prefix="/camera-workout", tags=["Camera Workout"])


def build_session_response(session: models.WorkoutCameraSession) -> dict:
    return {
        "id": session.id,
        "user_id": session.user_id,
        "exercise_name": session.exercise_name,
        "exercise_order_index": session.exercise_order_index,
        "exercise_mode": session.exercise_mode,
        "status": session.status,
        "total_reps": session.total_reps,
        "correct_reps": session.correct_reps,
        "incorrect_reps": session.incorrect_reps,
        "form_score": session.form_score,
        "feedback_summary": session.feedback_summary,
        "started_at": session.started_at,
        "finished_at": session.finished_at,
        "rep_events": [
            {
                "id": ev.id,
                "session_id": ev.session_id,
                "rep_index": ev.rep_index,
                "is_correct": ev.is_correct,
                "score": ev.score,
                "feedback": ev.feedback,
                "exercise_mode": ev.exercise_mode,
                "stage": ev.stage,
                "metric_label": ev.metric_label,
                "metric_value": ev.metric_value,
                "features_json": json.loads(ev.features_json) if ev.features_json else None,
                "error_type": ev.error_type,
                "label_source": ev.label_source,
                "created_at": ev.created_at,
            }
            for ev in sorted(session.rep_events, key=lambda x: x.rep_index)
        ],
    }


@router.post("/session/start", response_model=CameraSessionResponse)
async def start_camera_session(
    payload: CameraSessionStartRequest,
    db: Session = Depends(get_db),
):
    user = db.query(models.User).filter(models.User.id == payload.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")

    session = models.WorkoutCameraSession(
        user_id=payload.user_id,
        exercise_name=payload.exercise_name,
        exercise_order_index=payload.exercise_order_index,
        exercise_mode=payload.exercise_mode or "generic",
        status="active",
    )

    db.add(session)
    db.commit()
    db.refresh(session)

    return build_session_response(session)


@router.patch("/session/{session_id}/live", response_model=CameraSessionResponse)
async def update_camera_session_live(
    session_id: int,
    payload: CameraSessionLiveUpdateRequest,
    db: Session = Depends(get_db),
):
    session = db.query(models.WorkoutCameraSession).filter(
        models.WorkoutCameraSession.id == session_id
    ).first()

    if not session:
        raise HTTPException(status_code=404, detail="Camera session не найдена")

    update_data = payload.dict(exclude_unset=True)

    for field, value in update_data.items():
        setattr(session, field, value)

    db.commit()
    db.refresh(session)

    return build_session_response(session)

@router.post("/session/{session_id}/rep-event", response_model=CameraRepEventResponse)
async def create_camera_rep_event(
    session_id: int,
    payload: CameraRepEventCreate,
    db: Session = Depends(get_db),
):
    session = db.query(models.WorkoutCameraSession).filter(
        models.WorkoutCameraSession.id == session_id
    ).first()

    if not session:
        raise HTTPException(status_code=404, detail="Camera session не найдена")

    rep_event = models.WorkoutCameraRepEvent(
        session_id=session_id,
        rep_index=payload.rep_index,
        is_correct=payload.is_correct,
        score=payload.score,
        feedback=payload.feedback,
        exercise_mode=payload.exercise_mode,
        stage=payload.stage,
        metric_label=payload.metric_label,
        metric_value=payload.metric_value,
        features_json=json.dumps(payload.features_json, ensure_ascii=False) if payload.features_json else None,
        error_type=payload.error_type,
        label_source=payload.label_source or "rule",
    )

    db.add(rep_event)

    session.total_reps = max(session.total_reps or 0, payload.rep_index)
    if payload.is_correct:
        session.correct_reps = (session.correct_reps or 0) + 1
    else:
        session.incorrect_reps = (session.incorrect_reps or 0) + 1

    db.commit()
    db.refresh(rep_event)

    return {
        "id": rep_event.id,
        "session_id": rep_event.session_id,
        "rep_index": rep_event.rep_index,
        "is_correct": rep_event.is_correct,
        "score": rep_event.score,
        "feedback": rep_event.feedback,
        "exercise_mode": rep_event.exercise_mode,
        "stage": rep_event.stage,
        "metric_label": rep_event.metric_label,
        "metric_value": rep_event.metric_value,
        "features_json": json.loads(rep_event.features_json) if rep_event.features_json else None,
        "error_type": rep_event.error_type,
        "label_source": rep_event.label_source,
        "created_at": rep_event.created_at,
    }


@router.post("/session/{session_id}/finish", response_model=CameraSessionResponse)
async def finish_camera_session(
    session_id: int,
    payload: CameraSessionFinishRequest,
    db: Session = Depends(get_db),
):
    session = db.query(models.WorkoutCameraSession).filter(
        models.WorkoutCameraSession.id == session_id
    ).first()

    if not session:
        raise HTTPException(status_code=404, detail="Camera session не найдена")

    if payload.total_reps is not None:
        session.total_reps = max(session.total_reps or 0, payload.total_reps)

    if payload.correct_reps is not None:
        session.correct_reps = max(session.correct_reps or 0, payload.correct_reps)

    if payload.incorrect_reps is not None:
        session.incorrect_reps = max(session.incorrect_reps or 0, payload.incorrect_reps)

    if payload.form_score is not None:
        session.form_score = payload.form_score

    if payload.feedback_summary is not None:
        session.feedback_summary = payload.feedback_summary

    session.status = "finished"
    session.finished_at = datetime.utcnow()

    db.commit()
    db.refresh(session)

    return build_session_response(session)


@router.get("/session/{session_id}", response_model=CameraSessionResponse)
async def get_camera_session(session_id: int, db: Session = Depends(get_db)):
    session = db.query(models.WorkoutCameraSession).filter(
        models.WorkoutCameraSession.id == session_id
    ).first()

    if not session:
        raise HTTPException(status_code=404, detail="Camera session не найдена")

    return build_session_response(session)

@router.post("/session/{session_id}/live-sample", response_model=CameraLiveSampleResponse)
async def create_camera_live_sample(
    session_id: int,
    payload: CameraLiveSampleCreate,
    db: Session = Depends(get_db),
):
    session = db.query(models.WorkoutCameraSession).filter(
        models.WorkoutCameraSession.id == session_id
    ).first()

    if not session:
        raise HTTPException(status_code=404, detail="Camera session не найдена")

    live_sample = models.WorkoutCameraLiveSample(
        session_id=session_id,
        exercise_mode=payload.exercise_mode,
        stage=payload.stage,
        metric_label=payload.metric_label,
        metric_value=payload.metric_value,
        features_json=json.dumps(payload.features_json, ensure_ascii=False) if payload.features_json else None,
        error_type=payload.error_type,
        label_source=payload.label_source or "rule_live",
        elapsed_seconds=payload.elapsed_seconds,
    )

    db.add(live_sample)
    db.commit()
    db.refresh(live_sample)

    return {
        "id": live_sample.id,
        "session_id": live_sample.session_id,
        "exercise_mode": live_sample.exercise_mode,
        "stage": live_sample.stage,
        "metric_label": live_sample.metric_label,
        "metric_value": live_sample.metric_value,
        "features_json": json.loads(live_sample.features_json) if live_sample.features_json else None,
        "error_type": live_sample.error_type,
        "label_source": live_sample.label_source,
        "elapsed_seconds": live_sample.elapsed_seconds,
        "created_at": live_sample.created_at,
    }

@router.get("/sessions/{user_id}", response_model=CameraSessionListResponse)
async def get_camera_sessions_by_user(user_id: int, db: Session = Depends(get_db)):
    sessions = (
        db.query(models.WorkoutCameraSession)
        .filter(models.WorkoutCameraSession.user_id == user_id)
        .order_by(models.WorkoutCameraSession.started_at.desc())
        .all()
    )

    return {
        "sessions": [build_session_response(session) for session in sessions]
    }
@router.get("/export/live-samples/{user_id}")
async def export_camera_live_samples_csv(user_id: int, db: Session = Depends(get_db)):
    sessions = (
        db.query(models.WorkoutCameraSession)
        .filter(models.WorkoutCameraSession.user_id == user_id)
        .order_by(models.WorkoutCameraSession.started_at.asc())
        .all()
    )

    output = io.StringIO()
    writer = csv.writer(output)

    writer.writerow([
        "session_id",
        "exercise_name",
        "exercise_order_index",
        "exercise_mode",
        "session_status",
        "sample_id",
        "stage",
        "metric_label",
        "metric_value",
        "error_type",
        "label_source",
        "elapsed_seconds",
        "features_json",
        "created_at",
    ])

    for session in sessions:
        for sample in session.live_samples:
            writer.writerow([
                session.id,
                session.exercise_name,
                session.exercise_order_index,
                sample.exercise_mode or session.exercise_mode,
                session.status,
                sample.id,
                sample.stage,
                sample.metric_label,
                sample.metric_value,
                sample.error_type,
                sample.label_source,
                sample.elapsed_seconds,
                sample.features_json,
                sample.created_at.isoformat() if sample.created_at else None,
            ])

    output.seek(0)

    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename=camera_live_samples_user_{user_id}.csv"
        },
    )

@router.get("/export/rep-events/{user_id}")
async def export_camera_rep_events_csv(user_id: int, db: Session = Depends(get_db)):
    sessions = (
        db.query(models.WorkoutCameraSession)
        .filter(models.WorkoutCameraSession.user_id == user_id)
        .order_by(models.WorkoutCameraSession.started_at.asc())
        .all()
    )

    output = io.StringIO()
    writer = csv.writer(output)

    writer.writerow([
        "session_id",
        "exercise_name",
        "exercise_order_index",
        "exercise_mode",
        "session_status",
        "rep_event_id",
        "rep_index",
        "is_correct",
        "score",
        "feedback",
        "stage",
        "metric_label",
        "metric_value",
        "error_type",
        "label_source",
        "features_json",
        "created_at",
    ])

    for session in sessions:
        for ev in session.rep_events:
            writer.writerow([
                session.id,
                session.exercise_name,
                session.exercise_order_index,
                ev.exercise_mode or session.exercise_mode,
                session.status,
                ev.id,
                ev.rep_index,
                ev.is_correct,
                ev.score,
                ev.feedback,
                ev.stage,
                ev.metric_label,
                ev.metric_value,
                ev.error_type,
                ev.label_source,
                ev.features_json,
                ev.created_at.isoformat() if ev.created_at else None,
            ])

    output.seek(0)

    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename=camera_rep_events_user_{user_id}.csv"
        },
    )

@router.post("/ml/squat-evaluate", response_model=CameraMlSquatEvaluateResponse)
async def ml_squat_evaluate(payload: CameraMlSquatEvaluateRequest):
    if not payload.features_json:
        raise HTTPException(status_code=400, detail="features_json обязателен")

    try:
        result = evaluate_squat_features(payload.features_json)
        return result
    except FileNotFoundError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"ML squat evaluate error: {e}")