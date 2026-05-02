from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from database import get_db
from modules.analytics.schemas import AnalyticsSummaryOut, HeatmapOut
from modules.analytics import service
from modules.auth.dependencies import get_current_user
from modules.auth.models import User

router = APIRouter()


@router.get("/summary", response_model=AnalyticsSummaryOut, summary="Get analytics summary")
def get_analytics_summary(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return service.get_analytics_summary(db, user_id=current_user.id)


@router.get("/heatmap", response_model=HeatmapOut, summary="Get activity heatmap")
def get_activity_heatmap(
    months: int = Query(3, ge=1, le=12, description="Number of months to include"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return service.get_heatmap(db, user_id=current_user.id, months=months)
