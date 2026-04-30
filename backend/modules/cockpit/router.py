from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from modules.cockpit.schemas import DailyCockpitOut
from modules.cockpit import service

router = APIRouter()


@router.get("", response_model=DailyCockpitOut, summary="Get daily cockpit")
def get_cockpit(db: Session = Depends(get_db)):
    return service.get_daily_cockpit(db)
