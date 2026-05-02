from datetime import datetime, timezone
from sqlalchemy.orm import Session
from modules.tasks.models import Task
from modules.tasks.schemas import TaskCreate, TaskUpdate, TaskOut
from modules.categories.models import Category
from modules.goals.models import GoalTaskLink


def _get_task_goal_ids(db: Session, task_id: str) -> list[str]:
    links = db.query(GoalTaskLink).filter(GoalTaskLink.task_id == task_id).all()
    return [link.goal_id for link in links]


def _task_to_out(db: Session, task: Task) -> TaskOut:
    return TaskOut(
        id=task.id,
        title=task.title,
        description=task.description,
        status=task.status,
        priority=task.priority,
        due_date=task.due_date,
        category_id=task.category_id,
        recurrence_rule=task.recurrence_rule,
        completed_at=task.completed_at,
        deleted_at=task.deleted_at,
        created_at=task.created_at,
        updated_at=task.updated_at,
        goal_ids=_get_task_goal_ids(db, task.id),
    )


def get_tasks(
    db: Session,
    user_id: str,
    skip: int = 0,
    limit: int = 100,
    date: str | None = None,
    month: str | None = None,
    status: str | None = None,
    category_id: str | None = None,
    task_ids: list[str] | None = None,
    is_backlog: bool = False,
) -> list[TaskOut]:
    query = db.query(Task).filter(Task.deleted_at.is_(None), Task.user_id == user_id)
    if task_ids:
        query = query.filter(Task.id.in_(task_ids))
    elif month:
        query = query.filter(Task.due_date.like(f"{month}%"))
    elif is_backlog:
        query = query.filter(Task.due_date.is_(None))
    elif date:
        query = query.filter(Task.due_date == date)
    if status:
        query = query.filter(Task.status == status)
    if category_id:
        query = query.filter(Task.category_id == category_id)
    tasks = query.order_by(Task.created_at.desc()).offset(skip).limit(limit).all()
    return [_task_to_out(db, t) for t in tasks]


def get_task(db: Session, task_id: str, user_id: str | None = None) -> TaskOut | None:
    filters = [Task.id == task_id, Task.deleted_at.is_(None)]
    if user_id:
        filters.append(Task.user_id == user_id)
    task = db.query(Task).filter(*filters).first()
    if not task:
        return None
    return _task_to_out(db, task)


def create_task(db: Session, task: TaskCreate, user_id: str) -> TaskOut:
    data = task.model_dump()
    if data.get("category_id"):
        cat = db.query(Category).filter(Category.id == data["category_id"], Category.user_id == user_id).first()
        if not cat:
            raise ValueError("Category not found")
    db_task = Task(**data, user_id=user_id)
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return _task_to_out(db, db_task)


def update_task(db: Session, task_id: str, task: TaskUpdate, user_id: str) -> TaskOut | None:
    db_task = db.query(Task).filter(Task.id == task_id, Task.user_id == user_id, Task.deleted_at.is_(None)).first()
    if not db_task:
        return None
    update_data = task.model_dump(exclude_unset=True)
    if "category_id" in update_data and update_data["category_id"]:
        cat = db.query(Category).filter(Category.id == update_data["category_id"], Category.user_id == user_id).first()
        if not cat:
            raise ValueError("Category not found")
    if "status" in update_data and "completed_at" not in update_data:
        if update_data["status"] == "done" and db_task.status != "done":
            update_data["completed_at"] = datetime.now(timezone.utc).isoformat()
        elif update_data["status"] != "done":
            update_data["completed_at"] = None
    for key, value in update_data.items():
        setattr(db_task, key, value)
    db.commit()
    db.refresh(db_task)
    return _task_to_out(db, db_task)


def delete_task(db: Session, task_id: str, user_id: str):
    db_task = db.query(Task).filter(Task.id == task_id, Task.user_id == user_id, Task.deleted_at.is_(None)).first()
    if not db_task:
        return None
    db_task.deleted_at = datetime.now(timezone.utc).isoformat()
    db.commit()
    return db_task
