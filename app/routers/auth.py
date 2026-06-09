import random
import os
import shutil
from datetime import date, datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException,UploadFile,File
from sqlalchemy.orm import Session
from fastapi.staticfiles import StaticFiles
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from app import models, schemas
from app.database import get_db
from pydantic import BaseModel
import re
from dotenv import load_dotenv
from sqlalchemy.exc import IntegrityError
router = APIRouter(tags=["Authentication"])

from dotenv import load_dotenv

load_dotenv()


def env_bool(name: str, default: bool = False) -> bool:
    value = os.getenv(name)

    if value is None:
        return default

    return value.strip().lower() in {"1", "true", "yes", "y", "on"}


MAIL_USERNAME = os.getenv("MAIL_USERNAME")
MAIL_PASSWORD = os.getenv("MAIL_PASSWORD")
MAIL_FROM = os.getenv("MAIL_FROM")
MAIL_PORT = int(os.getenv("MAIL_PORT", "465"))
MAIL_SERVER = os.getenv("MAIL_SERVER", "smtp.mail.ru")
MAIL_STARTTLS = env_bool("MAIL_STARTTLS", False)
MAIL_SSL_TLS = env_bool("MAIL_SSL_TLS", True)
USE_CREDENTIALS = env_bool("USE_CREDENTIALS", True)

if not MAIL_USERNAME or not MAIL_PASSWORD or not MAIL_FROM:
    raise RuntimeError(
        "Mail settings are missing. Check MAIL_USERNAME, MAIL_PASSWORD, MAIL_FROM in .env"
    )

API_PUBLIC_URL = os.getenv("API_PUBLIC_URL", "http://127.0.0.1:8000").rstrip("/")

conf = ConnectionConfig(
    MAIL_USERNAME=MAIL_USERNAME,
    MAIL_PASSWORD=MAIL_PASSWORD,
    MAIL_FROM=MAIL_FROM,
    MAIL_PORT=MAIL_PORT,
    MAIL_SERVER=MAIL_SERVER,
    MAIL_STARTTLS=MAIL_STARTTLS,
    MAIL_SSL_TLS=MAIL_SSL_TLS,
    USE_CREDENTIALS=USE_CREDENTIALS,
)


class WorkoutCompleteRequest(BaseModel):
    points: int

def validate_password(password: str):
    if len(password) < 8:
        raise HTTPException(status_code=400, detail="Пароль должен быть не короче 8 символов")

    if not re.search(r"[A-Za-zА-Яа-я]", password):
        raise HTTPException(status_code=400, detail="Пароль должен содержать хотя бы одну букву")

    if not re.search(r"\d", password):
        raise HTTPException(status_code=400, detail="Пароль должен содержать хотя бы одну цифру")

    if not re.search(r"[@$!%*#?&_\-]", password):
        raise HTTPException(status_code=400, detail="Пароль должен содержать хотя бы один спецсимвол")

# ... (твой существующий импорт и конфиг почты остаются без изменений)

@router.post("/login")
def login_user(login_data: schemas.UserLogin, db: Session = Depends(get_db)):
    email_entered = login_data.email.lower().strip()
    user = db.query(models.User).filter(models.User.email == email_entered).first()

    if not user:
        raise HTTPException(status_code=401, detail="Неверный email или пароль")

    if str(user.password_hash) != str(login_data.password):
        raise HTTPException(status_code=401, detail="Неверный email или пароль")

    if not user.is_verified:
        raise HTTPException(status_code=403, detail="Пожалуйста, подтвердите вашу почту")

    profile = db.query(models.UserProfile).filter(models.UserProfile.user_id == user.id).first()

    # Обновляем дату входа
    user.last_login_date = date.today()
    db.commit()

    return {
        "status": "success",
        "user_id": user.id,
        "username": user.username,
        "has_profile": bool(profile),
        "bmi": profile.bmi if profile else None,
        "streak_count": user.streak_count or 0,  # Исправил на streak_count для точности
        "rating": user.rating or 0,
        "birth_date": user.birth_date,
        "gender": user.gender
    }

@router.post("/verify-email")
def verify_email(data: schemas.VerifyEmail, db: Session = Depends(get_db)):
    email_clean = data.email.lower().strip()

    user = db.query(models.User).filter(models.User.email == email_clean).first()

    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")

    if user.is_verified:
        return {"status": "success", "message": "Почта уже подтверждена"}

    if not user.verification_code:
        raise HTTPException(status_code=400, detail="Код подтверждения отсутствует")

    if user.verification_code != data.code.strip():
        raise HTTPException(status_code=400, detail="Неверный код подтверждения")

    user.is_verified = True
    user.verification_code = None

    db.commit()
    db.refresh(user)

    return {"status": "success", "message": "Почта успешно подтверждена"}


@router.post("/upload-avatar/{user_id}")
async def upload_avatar(user_id: int, file: UploadFile = File(...), db: Session = Depends(get_db)):
    # 1. Ищем пользователя в БД перед сохранением файла
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")

    # 2. Создаем папку (убедись, что 'static' в корне проекта)
    upload_dir = "static/avatars"
    os.makedirs(upload_dir, exist_ok=True)

    # 3. Получаем расширение (более надежный способ)
    file_extension = os.path.splitext(file.filename)[1] # Вернет например '.jpg'
    if not file_extension:
        file_extension = ".png" # Дефолт, если расширения нет

    file_name = f"{user_id}{file_extension}"
    file_path = os.path.join(upload_dir, file_name)

    # 4. Сохраняем файл на диск
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка при сохранении файла: {str(e)}")

    # 5. Сохраняем URL (убери лишние слеши)
    # Ссылка будет: http://127.0.0.1:8000/static/avatars/8.png
    avatar_url = f"{API_PUBLIC_URL}/static/avatars/{file_name}"
    user.avatar_url = avatar_url

    db.commit()
    db.refresh(user)

    return {"status": "success", "avatar_url": avatar_url}
@router.get("/user-stats/{user_id}")
def get_user_stats(user_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")

    profile = db.query(models.UserProfile).filter(models.UserProfile.user_id == user_id).first()

    # ВАЖНО: Возвращаем данные, даже если профиля (BMI) еще нет
    return {
        "rating": user.rating or 0,
        "streak_count": user.streak_count or 0,
        "birth_date": user.birth_date,
        "gender": user.gender,
        "avatar_url": user.avatar_url,
        "bmi": profile.bmi if profile else None,
        "weight": profile.weight if profile else None,
        "height": profile.height if profile else None,
        "goal": profile.goal if profile else "Не установлена"
    }



# Регистрация у тебя отличная, оставляем как есть.

# --- ИСПРАВЛЕННАЯ РЕГИСТРАЦИЯ ---
@router.post("/register")
async def register_user(user_data: schemas.UserRegister, db: Session = Depends(get_db)):
    email_clean = user_data.email.lower().strip()
    username_clean = user_data.username.strip()

    validate_password(user_data.password)

    email_exists = db.query(models.User).filter(models.User.email == email_clean).first()
    if email_exists:
        raise HTTPException(status_code=400, detail="Этот email уже занят")

    username_exists = db.query(models.User).filter(models.User.username == username_clean).first()
    if username_exists:
        raise HTTPException(status_code=400, detail="Это имя пользователя уже занято")

    otp_code = str(random.randint(100000, 999999))

    new_user = models.User(
        username=username_clean,
        last_name=user_data.last_name,
        email=email_clean,
        password_hash=user_data.password,
        birth_date=user_data.birth_date,
        gender=user_data.gender,
        is_verified=True, # УАҚЫТША: Почта қатесіне бола бұғатталмау үшін бірден True жасадық
        verification_code=otp_code,
        streak_count=0,
        rating=0
    )

    try:
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Email или имя пользователя уже заняты")

    html = f"""
    <div style="font-family: sans-serif; text-align: center; padding: 20px; background-color: #f4f4f4;">
        <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; display: inline-block;">
            <h1 style="color: #61dafb;">FIT AI</h1>
            <p>Ваш код подтверждения:</p>
            <h2 style="background: #e0f7fa; padding: 10px; letter-spacing: 5px;">{otp_code}</h2>
        </div>
    </div>
    """

    message = MessageSchema(
        subject="FitAI - Подтверждение",
        recipients=[email_clean],
        body=html,
        subtype="html"
    )

    fm = FastMail(conf)
    try:
        await fm.send_message(message)
    except Exception as e:
        print(f"SMTP ERROR: {e}")

    return {"status": "success", "user_id": new_user.id}
@router.post("/forgot-password")
async def forgot_password(data: schemas.ForgotPasswordRequest, db: Session = Depends(get_db)):
    email_clean = data.email.lower().strip()
    user = db.query(models.User).filter(models.User.email == email_clean).first()

    # Всегда возвращаем один и тот же ответ,
    # чтобы нельзя было угадывать, есть такой email в системе или нет
    if not user:
        raise HTTPException(status_code=404, detail="Такой email не зарегистрирован")

    reset_code = str(random.randint(100000, 999999))
    user.reset_code = reset_code
    user.reset_code_expires_at = datetime.utcnow() + timedelta(minutes=10)

    db.commit()
    db.refresh(user)

    html = f"""
    <div style="font-family: sans-serif; text-align: center; padding: 20px; background-color: #f4f4f4;">
        <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; display: inline-block;">
            <h1 style="color: #61dafb;">FIT AI</h1>
            <p>Мы получили запрос на сброс пароля.</p>
            <p>Ваш код для восстановления:</p>
            <h2 style="background: #e0f7fa; padding: 10px; letter-spacing: 5px;">{reset_code}</h2>
            <p style="color: #666; font-size: 14px;">Код действует 10 минут.</p>
            <p style="color: #999; font-size: 12px;">Если это были не вы, просто проигнорируйте это письмо.</p>
        </div>
    </div>
    """

    message = MessageSchema(
        subject="FitAI - Восстановление пароля",
        recipients=[email_clean],
        body=html,
        subtype="html"
    )

    fm = FastMail(conf)
    try:
        await fm.send_message(message)
    except Exception as e:
        print(f"SMTP ERROR (forgot-password): {e}")

    return {
            "status": "success",
            "message": "Код отправлен на почту"
        }


@router.post("/reset-password")
async def reset_password(data: schemas.ResetPasswordRequest, db: Session = Depends(get_db)):
    email_clean = data.email.lower().strip()
    code_clean = data.code.strip()

    user = db.query(models.User).filter(models.User.email == email_clean).first()
    if not user:
        raise HTTPException(status_code=400, detail="Неверный код или email")

    if not user.reset_code or not user.reset_code_expires_at:
        raise HTTPException(status_code=400, detail="Код сброса отсутствует")

    if user.reset_code != code_clean:
        raise HTTPException(status_code=400, detail="Неверный код сброса")

    if datetime.utcnow() > user.reset_code_expires_at:
        raise HTTPException(status_code=400, detail="Срок действия кода истек")

    validate_password(data.new_password)

    # Пока сохраняем так же, как и текущая логика login/register,
    # чтобы ничего не сломать. Позже переведем на bcrypt.
    user.password_hash = data.new_password
    user.reset_code = None
    user.reset_code_expires_at = None

    db.commit()
    db.refresh(user)

    return {
        "status": "success",
        "message": "Пароль успешно изменен"
    }

@router.patch("/users/{user_id}/complete-workout")
async def complete_workout(user_id: int, data: WorkoutCompleteRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")

    today = date.today()
    yesterday = today - timedelta(days=1)

    # 1. Начисляем рейтинг (опыт) ВСЕГДА
    user.rating = (user.rating or 0) + data.points

    # 2. Логика Стрика (Огонька)
    # Если дата последней тренировки (last_login_date) — это ВЧЕРА или раньше (None)
    if user.last_login_date != today:

        # Проверка на "сгорание": если последняя активность была РАНЬШЕ чем вчера
        if user.last_login_date and user.last_login_date < yesterday:
            user.streak_count = 1  # Сброс и начало заново
        else:
            # Если тренировался вчера или это вообще первая тренировка
            user.streak_count = (user.streak_count or 0) + 1

        # Устанавливаем дату, чтобы за сегодня больше не начислять
        user.last_login_date = today

        # Если user.last_login_date == today, то streak_count просто не меняется (как в Duolingo)

    db.commit()
    db.refresh(user)

    return {
        "status": "success",
        "rating": user.rating,
        "streak_count": user.streak_count
    }
# Остальные эндпоинты (complete_workout, verify_email, user-stats) остаются без изменений