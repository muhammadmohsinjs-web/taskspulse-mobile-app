from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from database import get_db
from modules.tasks.schemas import TaskCreate, TaskUpdate, TaskOut
from modules.tasks import service

router = APIRouter()


@router.get("", response_model=list[TaskOut], summary="List tasks")
def list_tasks(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    date: str | None = Query(None, description="Filter by due_date (YYYY-MM-DD)"),
    status: str | None = Query(None, description="Filter by status (todo|in_progress|done)"),
    category_id: str | None = Query(None, description="Filter by category ID"),
    goal_id: str | None = Query(None, description="Filter by goal ID"),
    db: Session = Depends(get_db),
):
    return service.get_tasks(db, skip=skip, limit=limit, date=date, status=status, category_id=category_id, goal_id=goal_id)


@router.post("", response_model=TaskOut, status_code=status.HTTP_201_CREATED, summary="Create task")
def create_new_task(task: TaskCreate, db: Session = Depends(get_db)):
    return service.create_task(db, task)


@router.get("/{task_id}", response_model=TaskOut, summary="Get task by ID")
def read_task(task_id: str, db: Session = Depends(get_db)):
    task = service.get_task(db, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@router.put("/{task_id}", response_model=TaskOut, summary="Update task")
def update_existing_task(task_id: str, task: TaskUpdate, db: Session = Depends(get_db)):
    updated = service.update_task(db, task_id, task)
    if not updated:
        raise HTTPException(status_code=404, detail="Task not found")
    return updated


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete task (soft delete)")
def delete_existing_task(task_id: str, db: Session = Depends(get_db)):
    if not service.delete_task(db, task_id):
        raise HTTPException(status_code=404, detail="Task not found")
