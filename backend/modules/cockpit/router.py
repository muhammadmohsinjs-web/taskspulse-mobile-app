from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from modules.cockpit.schemas import DailyCockpitOut
from modules.cockpit import service
from modules.auth.dependencies import get_current_user
from modules.auth.models import User

router = APIRouter()


@router.get("", response_model=DailyCockpitOut, summary="Get daily cockpit")
def get_cockpit(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return service.get_daily_cockpit(db, user_id=current_user.id)
