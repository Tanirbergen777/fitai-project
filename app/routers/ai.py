import os
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from groq import Groq
from pydantic import BaseModel
from dotenv import load_dotenv

from ..database import get_db
from .. import models

load_dotenv()

router = APIRouter(prefix="/ai", tags=["AI Chat"])

GROQ_KEY = os.getenv("GROQ_API_KEY")
client = Groq(api_key=GROQ_KEY)


class ChatRequest(BaseModel):
    message: str
    user_id: int
    session_id: Optional[int] = None


@router.post("/sessions")
async def create_session(user_id: int, db: Session = Depends(get_db)):
    new_session = models.ChatSession(user_id=user_id)
    db.add(new_session)
    db.commit()
    db.refresh(new_session)
    return {"session_id": new_session.id}


@router.get("/sessions/{user_id}")
async def get_user_sessions(user_id: int, db: Session = Depends(get_db)):
    sessions = (
        db.query(models.ChatSession)
        .filter(models.ChatSession.user_id == user_id)
        .all()
    )
    return sessions if sessions else []


@router.get("/history/{session_id}")
async def get_chat_history(session_id: int, db: Session = Depends(get_db)):
    session = (
        db.query(models.ChatSession)
        .filter(models.ChatSession.id == session_id)
        .first()
    )
    if not session:
        raise HTTPException(status_code=404, detail="Сессия не найдена")

    history = (
        db.query(models.ChatMessage)
        .filter(models.ChatMessage.session_id == session_id)
        .order_by(models.ChatMessage.timestamp.asc())
        .all()
    )

    return {
        "title": session.title,
        "messages": history,
    }


@router.delete("/sessions/{session_id}")
async def delete_session(session_id: int, db: Session = Depends(get_db)):
    session = (
        db.query(models.ChatSession)
        .filter(models.ChatSession.id == session_id)
        .first()
    )
    if not session:
        raise HTTPException(status_code=404, detail="Сессия не найдена")

    db.query(models.ChatMessage).filter(
        models.ChatMessage.session_id == session_id
    ).delete()
    db.delete(session)
    db.commit()

    return {"message": f"Сессия {session_id} удалена"}


@router.post("/chat")
async def fitness_chat(request: ChatRequest, db: Session = Depends(get_db)):
    try:
        if not request.session_id:
            new_session = models.ChatSession(user_id=request.user_id)
            db.add(new_session)
            db.commit()
            db.refresh(new_session)
            session_id = new_session.id
        else:
            session_id = request.session_id

        session = (
            db.query(models.ChatSession)
            .filter(models.ChatSession.id == session_id)
            .first()
        )
        if not session:
            raise HTTPException(status_code=404, detail="Сессия не найдена")

        user_profile = (
            db.query(models.UserProfile)
            .filter(models.UserProfile.user_id == session.user_id)
            .first()
        )
        msg_count = (
            db.query(models.ChatMessage)
            .filter(models.ChatMessage.session_id == session_id)
            .count()
        )

        user_msg = models.ChatMessage(
            session_id=session_id,
            role="user",
            content=request.message,
        )
        db.add(user_msg)
        db.commit()

        if msg_count == 0:
            try:
                title_response = client.chat.completions.create(
                    model="llama-3.3-70b-versatile",
                    messages=[
                        {
                            "role": "system",
                            "content": (
                                "Ты — помощник, который дает очень короткие названия чатам. "
                                "Напиши только название (макс 3 слова) на русском языке без кавычек."
                            ),
                        },
                        {
                            "role": "user",
                            "content": f"Придумай название для чата: {request.message}",
                        },
                    ],
                    max_tokens=20,
                )
                session.title = title_response.choices[0].message.content.strip()
                db.commit()
            except Exception as e:
                print(f"Ошибка заголовка: {e}")

        bmi_val = user_profile.bmi if user_profile else "не указан"
        user_goal = (
            getattr(user_profile, "custom_goal_text", user_profile.goal)
            if user_profile
            else "не задана"
        )

        system_prompt = (
            "Ты — профессиональный фитнес-тренер FitAI. "
            "Твоя задача: давать полезные, научно обоснованные советы по тренировкам и питанию. "
            "Отвечай СТРОГО на русском языке. Будь кратким, мотивирующим и профессиональным."
        )

        user_prompt = (
            f"Контекст пользователя: ИМТ={bmi_val}, Основная цель={user_goal}. "
            f"Вопрос пользователя: {request.message}"
        )

        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.7,
        )
        reply = completion.choices[0].message.content

        ai_msg = models.ChatMessage(
            session_id=session_id,
            role="assistant",
            content=reply,
        )
        db.add(ai_msg)
        db.commit()

        return {"reply": reply, "session_id": session_id}

    except Exception as e:
        db.rollback()
        print(f"!!! КРИТИЧЕСКАЯ ОШИБКА В ЧАТЕ !!! Детали: {str(e)}")
        return {
            "reply": "Извини, произошла техническая заминка. Я скоро буду в строю!",
            "session_id": request.session_id,
        }