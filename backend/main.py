import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text
from database import engine, Base, get_db

from modules.tasks.router import router as tasks_router
from modules.categories.router import router as categories_router
from modules.habits.router import router as habits_router
from modules.cockpit.router import router as cockpit_router
from modules.goals.router import router as goals_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(title="TasksPulse API", version="0.3.0", lifespan=lifespan)

ALLOWED_ORIGINS = os.getenv("CORS_ORIGINS", "*").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(tasks_router, prefix="/tasks", tags=["tasks"])
app.include_router(categories_router, prefix="/categories", tags=["categories"])
app.include_router(habits_router, prefix="/habits", tags=["habits"])
app.include_router(cockpit_router, prefix="/cockpit", tags=["cockpit"])
app.include_router(goals_router, prefix="/goals", tags=["goals"])


@app.get("/health", tags=["system"], summary="Health check")
def health_check(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
        return {"status": "ok", "database": "connected"}
    except Exception:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database unavailable")
