import asyncio

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app import models
from app.database import engine
from app.routers import auth, user_profile, ai, nutrition, camera_workout
from app.routers import habit_reminders

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Health Assistant")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="static"), name="static")

app.include_router(auth.router)
app.include_router(user_profile.router)
app.include_router(ai.router)
app.include_router(nutrition.router)
app.include_router(camera_workout.router)
app.include_router(habit_reminders.router)


async def reminder_scheduler():
    while True:
        try:
            await habit_reminders.send_due_habit_reminders_once()
        except Exception as e:
            print(f"REMINDER SCHEDULER ERROR: {e}")

        await asyncio.sleep(30)


@app.on_event("startup")
async def start_reminder_scheduler():
    app.state.reminder_scheduler_task = asyncio.create_task(reminder_scheduler())


@app.on_event("shutdown")
async def stop_reminder_scheduler():
    task = getattr(app.state, "reminder_scheduler_task", None)
    if task:
        task.cancel()
        try:
            await task
        except asyncio.CancelledError:
            pass


@app.get("/")
def home():
    return {"message": "Server is up and modular!"}