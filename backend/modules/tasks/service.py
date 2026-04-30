from datetime import datetime, timezone
from sqlalchemy.orm import Session
from modules.tasks.models import Task
from modules.tasks.schemas import TaskCreate, TaskUpdate


def get_tasks(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    date: str | None = None,
    status: str | None = None,
    category_id: str | None = None,
):
    query = db.query(Task).filter(Task.deleted_at.is_(None))
    if date:
        query = query.filter(Task.due_date == date)
    if status:
        query = query.filter(Task.status == status)
    if category_id:
        query = query.filter(Task.category_id == category_id)
    return query.order_by(Task.created_at.desc()).offset(skip).limit(limit).all()


def get_task(db: Session, task_id: str):
    return db.query(Task).filter(Task.id == task_id, Task.deleted_at.is_(None)).first()


def create_task(db: Session, task: TaskCreate):
    db_task = Task(**task.model_dump())
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task


def update_task(db: Session, task_id: str, task: TaskUpdate):
    db_task = db.query(Task).filter(Task.id == task_id, Task.deleted_at.is_(None)).first()
    if not db_task:
        return None
    update_data = task.model_dump(exclude_unset=True)
    if "status" in update_data:
        if update_data["status"] == "done" and db_task.status != "done":
            update_data["completed_at"] = datetime.now(timezone.utc).isoformat()
        elif update_data["status"] != "done":
            update_data["completed_at"] = None
    for key, value in update_data.items():
        setattr(db_task, key, value)
    db.commit()
    db.refresh(db_task)
    return db_task


def delete_task(db: Session, task_id: str):
    db_task = db.query(Task).filter(Task.id == task_id, Task.deleted_at.is_(None)).first()
    if not db_task:
        return None
    db_task.deleted_at = datetime.now(timezone.utc).isoformat()
    db.commit()
    return db_task
