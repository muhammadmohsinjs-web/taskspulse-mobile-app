from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base

from modules.tasks.router import router as tasks_router
from modules.categories.router import router as categories_router
from modules.habits.router import router as habits_router
from modules.cockpit.router import router as cockpit_router

Base.metadata.create_all(bind=engine)

app = FastAPI(title="TasksPulse API", version="0.2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(tasks_router, prefix="/tasks", tags=["tasks"])
app.include_router(categories_router, prefix="/categories", tags=["categories"])
app.include_router(habits_router, prefix="/habits", tags=["habits"])
app.include_router(cockpit_router, prefix="/cockpit", tags=["cockpit"])


@app.get("/health")
def health_check():
    return {"status": "ok"}
