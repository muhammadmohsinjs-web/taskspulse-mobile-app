from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from database import get_db
from modules.planning.schemas import (
    WeekViewOut,
    FocusQueueOut,
    AutoBalanceRequest,
    AutoBalanceResponse,
    CarryForwardRequest,
    CarryForwardResponse,
)
from modules.planning import service
from modules.auth.dependencies import get_current_user
from modules.auth.models import User

router = APIRouter()


@router.get("/week", response_model=WeekViewOut, summary="Get weekly planning view")
def get_week_view(
    date: str | None = Query(None, description="ISO date within the week (defaults to today)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return service.get_week_view(db, user_id=current_user.id, date_str=date)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/focus-queue", response_model=FocusQueueOut, summary="Get prioritized focus queue")
def get_focus_queue(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return service.get_focus_queue(db, user_id=current_user.id)


@router.post("/auto-balance", response_model=AutoBalanceResponse, summary="Auto-balance overloaded days")
def auto_balance(body: AutoBalanceRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    try:
        return service.auto_balance(db, current_user.id, body.week_start_date, body.max_tasks_per_day)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/carry-forward", response_model=CarryForwardResponse, summary="Move overdue tasks to this week")
def carry_forward(body: CarryForwardRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    try:
        return service.carry_forward(db, current_user.id, body.target_week_start)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
