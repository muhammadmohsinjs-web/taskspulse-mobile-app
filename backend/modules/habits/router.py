from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from database import get_db
from modules.habits.schemas import HabitCreate, HabitUpdate, HabitOut, HabitLogOut, HabitStreakOut, HabitWithStreak
from modules.habits import service as habit_service

router = APIRouter()


@router.get("", response_model=list[HabitWithStreak], summary="List habits")
def list_habits(db: Session = Depends(get_db)):
    habits = habit_service.get_habits(db)
    return [habit_service.build_habit_with_streak(db, h) for h in habits]


@router.post("", response_model=HabitWithStreak, status_code=status.HTTP_201_CREATED, summary="Create habit")
def create_new_habit(habit: HabitCreate, db: Session = Depends(get_db)):
    created = habit_service.create_habit(db, habit)
    return habit_service.build_habit_with_streak(db, created)


@router.get("/{habit_id}", response_model=HabitWithStreak, summary="Get habit by ID")
def read_habit(habit_id: str, db: Session = Depends(get_db)):
    habit = habit_service.get_habit(db, habit_id)
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    return habit_service.build_habit_with_streak(db, habit)


@router.put("/{habit_id}", response_model=HabitWithStreak, summary="Update habit")
def update_existing_habit(habit_id: str, habit: HabitUpdate, db: Session = Depends(get_db)):
    updated = habit_service.update_habit(db, habit_id, habit)
    if not updated:
        raise HTTPException(status_code=404, detail="Habit not found")
    return habit_service.build_habit_with_streak(db, updated)


@router.delete("/{habit_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete habit (soft delete)")
def delete_existing_habit(habit_id: str, db: Session = Depends(get_db)):
    if not habit_service.delete_habit(db, habit_id):
        raise HTTPException(status_code=404, detail="Habit not found")


@router.post("/{habit_id}/complete", response_model=HabitLogOut, summary="Mark habit complete for today")
def complete_habit(habit_id: str, db: Session = Depends(get_db)):
    try:
        log = habit_service.complete_habit(db, habit_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    if not log:
        raise HTTPException(status_code=404, detail="Habit not found")
    return log


@router.delete("/{habit_id}/complete", status_code=status.HTTP_204_NO_CONTENT, summary="Undo today's habit completion")
def undo_habit_completion(
    habit_id: str,
    on_date: str | None = Query(None, alias="date", description="Date to undo (YYYY-MM-DD), defaults to today"),
    db: Session = Depends(get_db),
):
    result = habit_service.undo_completion(db, habit_id, on_date)
    if not result:
        raise HTTPException(status_code=404, detail="No completion found for this date")


@router.get("/{habit_id}/streak", response_model=HabitStreakOut, summary="Get streak info for a habit")
def get_habit_streak(habit_id: str, db: Session = Depends(get_db)):
    habit = habit_service.get_habit(db, habit_id)
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    return habit_service.get_streak(db, habit_id)
