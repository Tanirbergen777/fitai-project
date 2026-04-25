from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from zoneinfo import ZoneInfo

from fastapi_mail import FastMail, MessageSchema

from app import models, schemas
from app.database import get_db, SessionLocal
from app.routers.auth import conf

router = APIRouter(tags=["Habit reminders"])


def normalize_lang(language: str) -> str:
    if language in {"ru", "en", "kaz"}:
        return language
    return "ru"


def build_reminder_subject(reminder_type: str, language: str) -> str:
    lang = normalize_lang(language)

    subjects = {
        "ru": {
            "habit": "FitAI — напоминание о привычке",
            "challenge": "FitAI — напоминание о челлендже",
        },
        "en": {
            "habit": "FitAI — habit reminder",
            "challenge": "FitAI — challenge reminder",
        },
        "kaz": {
            "habit": "FitAI — әдет туралы еске салу",
            "challenge": "FitAI — челлендж туралы еске салу",
        },
    }

    return subjects[lang].get(reminder_type, subjects[lang]["habit"])


def build_reminder_text(reminder_type: str, item_key: str, language: str) -> str:
    lang = normalize_lang(language)

    texts = {
        "ru": {
            "habit": {
                "drink_water": "Привет! Ты не забыл выпить воду сегодня?",
                "sleep_early": "Привет! Напоминаем про привычку: постарайся лечь спать пораньше сегодня.",
                "no_phone_morning": "Привет! Не забудь: спокойное утро без телефона помогает фокусу.",
                "walk_daily": "Привет! Небольшая прогулка сегодня поможет телу и голове.",
            },
            "challenge": {
                "walk_15_daily": "Привет! Напоминаем про твой челлендж: 15 минут прогулки сегодня помогут освежить голову и уменьшить усталость.",
                "water_7_days": "Привет! Не забудь про челлендж: выпей воду сегодня и сохрани ритм.",
                "sleep_before_2330": "Привет! Напоминаем про челлендж: постарайся лечь спать вовремя сегодня.",
                "morning_without_phone": "Привет! Напоминаем про челлендж: постарайся начать утро без телефона.",
            },
            "fallback": "У тебя есть запланированное напоминание от FitAI.",
        },
        "en": {
            "habit": {
                "drink_water": "Hi! Did you remember to drink water today?",
                "sleep_early": "Hi! Reminder for your habit: try to sleep a bit earlier today.",
                "no_phone_morning": "Hi! A calm phone-free morning helps your focus.",
                "walk_daily": "Hi! A short walk today will help both your body and mind.",
            },
            "challenge": {
                "walk_15_daily": "Hi! Reminder about your challenge: a 15-minute walk today can refresh your mind and reduce fatigue.",
                "water_7_days": "Hi! Don’t forget your challenge: drink water today and keep the rhythm.",
                "sleep_before_2330": "Hi! Reminder about your challenge: try to go to bed on time today.",
                "morning_without_phone": "Hi! Reminder about your challenge: try to start the morning without your phone.",
            },
            "fallback": "You have a scheduled reminder from FitAI.",
        },
        "kaz": {
            "habit": {
                "drink_water": "Сәлем! Бүгін су ішуді ұмытпадың ба?",
                "sleep_early": "Сәлем! Әдет туралы еске салу: бүгін ертерек ұйықтауға тырыс.",
                "no_phone_morning": "Сәлем! Телефонсыз тыныш таң фокусты жақсартады.",
                "walk_daily": "Сәлем! Бүгінгі қысқа серуен дене мен ойға пайдалы болады.",
            },
            "challenge": {
                "walk_15_daily": "Сәлем! Челлендж туралы еске салу: бүгін 15 минут серуендеу ойды сергітіп, шаршауды азайтады.",
                "water_7_days": "Сәлем! Челленджді ұмытпа: бүгін су ішіп, ырғақты сақта.",
                "sleep_before_2330": "Сәлем! Челлендж туралы еске салу: бүгін уақытында ұйықтауға тырыс.",
                "morning_without_phone": "Сәлем! Челлендж туралы еске салу: таңды телефонсыз бастауға тырыс.",
            },
            "fallback": "FitAI жүйесінде саған жоспарланған еске салу бар.",
        },
    }

    lang_pack = texts[lang]
    group = lang_pack.get(reminder_type, {})
    return group.get(item_key, lang_pack["fallback"])


def build_reminder_html(text: str, language: str) -> str:
    lang = normalize_lang(language)

    titles = {
        "ru": "Напоминание от FitAI",
        "en": "Reminder from FitAI",
        "kaz": "FitAI еске салғышы",
    }

    return f"""
    <div style="font-family: Arial, sans-serif; background:#f4f7fb; padding:24px;">
        <div style="max-width:600px; margin:0 auto; background:white; border-radius:14px; padding:28px; border:1px solid #e7eef8;">
            <h2 style="margin-top:0; color:#2b7cff;">{titles[lang]}</h2>
            <p style="font-size:16px; line-height:1.7; color:#1f2937;">{text}</p>
            <div style="margin-top:24px; font-size:13px; color:#6b7280;">
                FitAI Health Assistant
            </div>
        </div>
    </div>
    """


async def send_reminder_email(reminder: models.HabitReminder, recipient_email: str):
    subject = build_reminder_subject(reminder.reminder_type, reminder.language)
    text = build_reminder_text(reminder.reminder_type, reminder.item_key, reminder.language)
    html = build_reminder_html(text, reminder.language)

    message = MessageSchema(
        subject=subject,
        recipients=[recipient_email],
        body=html,
        subtype="html"
    )

    fm = FastMail(conf)
    await fm.send_message(message)


async def send_due_habit_reminders_once():
    db = SessionLocal()

    try:
        reminders = (
            db.query(models.HabitReminder)
            .filter(models.HabitReminder.is_enabled == True)
            .order_by(
                models.HabitReminder.user_id.asc(),
                models.HabitReminder.reminder_type.asc(),
                models.HabitReminder.id.desc(),
            )
            .all()
        )

        seen_pairs = set()

        for reminder in reminders:
            pair_key = (reminder.user_id, reminder.reminder_type)

            # Берем только самую свежую активную запись habit/challenge на пользователя
            if pair_key in seen_pairs:
                continue
            seen_pairs.add(pair_key)

            user = db.query(models.User).filter(models.User.id == reminder.user_id).first()
            if not user or not user.email:
                continue

            tz_name = reminder.timezone or "Asia/Almaty"
            try:
                now_local = datetime.now(ZoneInfo(tz_name))
            except Exception:
                now_local = datetime.now()

            current_time = now_local.strftime("%H:%M")
            today_local = now_local.date()

            if reminder.send_time != current_time:
                continue

            if reminder.last_sent_date == today_local:
                continue

            try:
                await send_reminder_email(reminder, user.email)
                reminder.last_sent_date = today_local
                reminder.updated_at = datetime.utcnow()
                db.commit()
            except Exception as e:
                db.rollback()
                print(f"HABIT REMINDER EMAIL ERROR: {e}")

    finally:
        db.close()


@router.get("/habit-reminders/{user_id}")
def get_habit_reminders(user_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    reminders = (
        db.query(models.HabitReminder)
        .filter(models.HabitReminder.user_id == user_id)
        .order_by(models.HabitReminder.id.desc())
        .all()
    )

    return reminders


@router.post("/habit-reminders/{user_id}")
def save_habit_reminder(
    user_id: int,
    data: schemas.HabitReminderCreate,
    db: Session = Depends(get_db)
):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Храним только одну запись на тип: habit или challenge
    existing = (
        db.query(models.HabitReminder)
        .filter(
            models.HabitReminder.user_id == user_id,
            models.HabitReminder.reminder_type == data.reminder_type,
        )
        .order_by(models.HabitReminder.id.desc())
        .first()
    )

    if existing:
        existing.item_key = data.item_key
        existing.send_time = data.send_time
        existing.language = data.language
        existing.is_enabled = data.is_enabled
        existing.timezone = data.timezone
        existing.updated_at = datetime.utcnow()

        duplicates = (
            db.query(models.HabitReminder)
            .filter(
                models.HabitReminder.user_id == user_id,
                models.HabitReminder.reminder_type == data.reminder_type,
                models.HabitReminder.id != existing.id,
            )
            .all()
        )
        for row in duplicates:
            db.delete(row)

        db.commit()
        db.refresh(existing)

        return {
            "status": "updated",
            "message": "Reminder updated",
            "reminder": existing
        }

    reminder = models.HabitReminder(
        user_id=user_id,
        reminder_type=data.reminder_type,
        item_key=data.item_key,
        send_time=data.send_time,
        language=data.language,
        is_enabled=data.is_enabled,
        timezone=data.timezone,
    )

    db.add(reminder)
    db.commit()
    db.refresh(reminder)

    return {
        "status": "created",
        "message": "Reminder created",
        "reminder": reminder
    }


@router.patch("/habit-reminders/{reminder_id}")
def update_habit_reminder(
    reminder_id: int,
    data: schemas.HabitReminderUpdate,
    db: Session = Depends(get_db)
):
    reminder = (
        db.query(models.HabitReminder)
        .filter(models.HabitReminder.id == reminder_id)
        .first()
    )

    if not reminder:
        raise HTTPException(status_code=404, detail="Reminder not found")

    payload = data.dict(exclude_unset=True)

    for key, value in payload.items():
        setattr(reminder, key, value)

    reminder.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(reminder)

    return {
        "status": "updated",
        "message": "Reminder updated",
        "reminder": reminder
    }


@router.delete("/habit-reminders/{reminder_id}")
def delete_habit_reminder(reminder_id: int, db: Session = Depends(get_db)):
    reminder = (
        db.query(models.HabitReminder)
        .filter(models.HabitReminder.id == reminder_id)
        .first()
    )

    if not reminder:
        raise HTTPException(status_code=404, detail="Reminder not found")

    db.delete(reminder)
    db.commit()

    return {
        "status": "deleted",
        "message": "Reminder deleted"
    }


@router.post("/habit-reminders/run-check")
async def run_habit_reminders_check():
    await send_due_habit_reminders_once()
    return {
        "status": "success",
        "message": "Reminder check completed"
    }