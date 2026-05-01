from fastapi import APIRouter, Depends, Query
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

router = APIRouter()


@router.get("/week", response_model=WeekViewOut, summary="Get weekly planning view")
def get_week_view(
    date: str | None = Query(None, description="ISO date within the week (defaults to today)"),
    db: Session = Depends(get_db),
):
    return service.get_week_view(db, date_str=date)


@router.get("/focus-queue", response_model=FocusQueueOut, summary="Get prioritized focus queue")
def get_focus_queue(db: Session = Depends(get_db)):
    return service.get_focus_queue(db)


@router.post("/auto-balance", response_model=AutoBalanceResponse, summary="Auto-balance overloaded days")
def auto_balance(body: AutoBalanceRequest, db: Session = Depends(get_db)):
    return service.auto_balance(db, body.week_start_date, body.max_tasks_per_day)


@router.post("/carry-forward", response_model=CarryForwardResponse, summary="Move overdue tasks to this week")
def carry_forward(body: CarryForwardRequest, db: Session = Depends(get_db)):
    return service.carry_forward(db, body.target_week_start)
