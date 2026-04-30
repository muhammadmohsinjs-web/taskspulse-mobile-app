from datetime import datetime, timezone
from sqlalchemy.orm import Session
from modules.goals.models import Goal, GoalTaskLink
from modules.tasks.models import Task
from modules.goals.schemas import GoalCreate, GoalUpdate, GoalTaskLinkCreate, GoalOut


def _compute_progress(db: Session, goal_id: str):
    links = db.query(GoalTaskLink).filter(GoalTaskLink.goal_id == goal_id).all()
    total = len(links)
    if total == 0:
        return 0.0, 0, 0
    completed = 0
    for link in links:
        task = db.query(Task).filter(Task.id == link.task_id, Task.deleted_at.is_(None)).first()
        if task and task.status == "done":
            completed += 1
    progress = completed / total if total > 0 else 0.0
    return progress, total, completed


def _goal_to_out(db: Session, goal: Goal) -> GoalOut:
    progress, total, completed = _compute_progress(db, goal.id)
    return GoalOut(
        id=goal.id,
        title=goal.title,
        description=goal.description,
        target_date=goal.target_date,
        color=goal.color,
        deleted_at=goal.deleted_at,
        created_at=str(goal.created_at) if goal.created_at else "",
        updated_at=str(goal.updated_at) if goal.updated_at else "",
        progress=progress,
        total_tasks=total,
        completed_tasks=completed,
    )


def get_goals(db: Session) -> list[GoalOut]:
    goals = db.query(Goal).filter(Goal.deleted_at.is_(None)).order_by(Goal.created_at.desc()).all()
    return [_goal_to_out(db, g) for g in goals]


def get_goal(db: Session, goal_id: str) -> GoalOut | None:
    goal = db.query(Goal).filter(Goal.id == goal_id, Goal.deleted_at.is_(None)).first()
    if not goal:
        return None
    return _goal_to_out(db, goal)


def create_goal(db: Session, data: GoalCreate) -> GoalOut:
    goal = Goal(**data.model_dump())
    db.add(goal)
    db.commit()
    db.refresh(goal)
    return _goal_to_out(db, goal)


def update_goal(db: Session, goal_id: str, data: GoalUpdate) -> GoalOut | None:
    goal = db.query(Goal).filter(Goal.id == goal_id, Goal.deleted_at.is_(None)).first()
    if not goal:
        return None
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(goal, key, value)
    db.commit()
    db.refresh(goal)
    return _goal_to_out(db, goal)


def delete_goal(db: Session, goal_id: str) -> bool:
    goal = db.query(Goal).filter(Goal.id == goal_id, Goal.deleted_at.is_(None)).first()
    if not goal:
        return False
    goal.deleted_at = datetime.now(timezone.utc).isoformat()
    db.commit()
    return True


def link_task_to_goal(db: Session, goal_id: str, task_id: str) -> GoalTaskLink | None:
    goal = db.query(Goal).filter(Goal.id == goal_id, Goal.deleted_at.is_(None)).first()
    if not goal:
        return None
    task = db.query(Task).filter(Task.id == task_id, Task.deleted_at.is_(None)).first()
    if not task:
        return None
    existing = db.query(GoalTaskLink).filter(
        GoalTaskLink.goal_id == goal_id, GoalTaskLink.task_id == task_id
    ).first()
    if existing:
        return existing
    link = GoalTaskLink(goal_id=goal_id, task_id=task_id)
    db.add(link)
    db.commit()
    db.refresh(link)
    return link


def unlink_task_from_goal(db: Session, goal_id: str, task_id: str) -> bool:
    link = db.query(GoalTaskLink).filter(
        GoalTaskLink.goal_id == goal_id, GoalTaskLink.task_id == task_id
    ).first()
    if not link:
        return False
    db.delete(link)
    db.commit()
    return True


def get_goal_links(db: Session, goal_id: str) -> list[GoalTaskLink]:
    return db.query(GoalTaskLink).filter(GoalTaskLink.goal_id == goal_id).all()
