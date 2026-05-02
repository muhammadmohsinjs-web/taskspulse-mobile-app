from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from database import get_db
from modules.tasks.schemas import TaskCreate, TaskUpdate, TaskOut
from modules.tasks import service
from modules.goals.models import GoalTaskLink
from modules.goals.schemas import GoalOut
from modules.goals import service as goal_service
from modules.auth.dependencies import get_current_user
from modules.auth.models import User

router = APIRouter()


def _validate_task_filters(task_ids: list[str] | None, month: str | None, is_backlog: bool, date: str | None):
    active = sum(1 for f in [task_ids, month, date] if f is not None)
    if is_backlog:
        active += 1
    if active > 1:
        raise HTTPException(status_code=400, detail="Filter parameters (task_ids, month, is_backlog, date) are mutually exclusive")


@router.get("", response_model=list[TaskOut], summary="List tasks")
def list_tasks(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    date: str | None = Query(None, description="Filter by due_date (YYYY-MM-DD)"),
    month: str | None = Query(None, description="Filter by month (YYYY-MM)"),
    status: str | None = Query(None, description="Filter by status (todo|in_progress|done)"),
    category_id: str | None = Query(None, description="Filter by category ID"),
    is_backlog: bool = Query(False, description="Filter tasks with no due_date (backlog)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _validate_task_filters(None, month, is_backlog, date)
    return service.get_tasks(db, user_id=current_user.id, skip=skip, limit=limit, date=date, month=month, status=status, category_id=category_id, is_backlog=is_backlog)


@router.post("", response_model=TaskOut, status_code=status.HTTP_201_CREATED, summary="Create task")
def create_new_task(task: TaskCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    try:
        return service.create_task(db, task, user_id=current_user.id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{task_id}", response_model=TaskOut, summary="Get task by ID")
def read_task(task_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    task = service.get_task(db, task_id, user_id=current_user.id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@router.put("/{task_id}", response_model=TaskOut, summary="Update task")
def update_existing_task(task_id: str, task: TaskUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    try:
        updated = service.update_task(db, task_id, task, user_id=current_user.id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    if not updated:
        raise HTTPException(status_code=404, detail="Task not found")
    return updated


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete task (soft delete)")
def delete_existing_task(task_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not service.delete_task(db, task_id, user_id=current_user.id):
        raise HTTPException(status_code=404, detail="Task not found")


@router.get("/{task_id}/goals", response_model=list[GoalOut], summary="List goals linked to a task")
def list_task_goals(task_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    task = service.get_task(db, task_id, user_id=current_user.id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    links = db.query(GoalTaskLink).filter(GoalTaskLink.task_id == task_id).all()
    goal_ids = [link.goal_id for link in links]
    if not goal_ids:
        return []
    from modules.goals.models import Goal
    goals = db.query(Goal).filter(Goal.id.in_(goal_ids), Goal.deleted_at.is_(None)).all()
    return [goal_service._goal_to_out(db, g, current_user.id) for g in goals]
