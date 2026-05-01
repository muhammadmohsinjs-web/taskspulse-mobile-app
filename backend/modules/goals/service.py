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
    task_ids = [link.task_id for link in links]
    tasks = db.query(Task).filter(Task.id.in_(task_ids), Task.deleted_at.is_(None)).all()
    task_status_map = {t.id: t.status for t in tasks}
    completed = sum(1 for link in links if task_status_map.get(link.task_id) == "done")
    progress = completed / total if total > 0 else 0.0
    return progress, total, completed


def _batch_compute_progress(db: Session, goal_ids: list[str]) -> dict[str, tuple[float, int, int]]:
    if not goal_ids:
        return {}
    links = db.query(GoalTaskLink).filter(GoalTaskLink.goal_id.in_(goal_ids)).all()
    goal_link_map: dict[str, list[GoalTaskLink]] = {gid: [] for gid in goal_ids}
    for link in links:
        goal_link_map[link.goal_id].append(link)
    all_task_ids = list({link.task_id for link in links})
    task_status_map: dict[str, str] = {}
    if all_task_ids:
        tasks = db.query(Task).filter(Task.id.in_(all_task_ids), Task.deleted_at.is_(None)).all()
        task_status_map = {t.id: t.status for t in tasks}
    result: dict[str, tuple[float, int, int]] = {}
    for gid in goal_ids:
        g_links = goal_link_map.get(gid, [])
        total = len(g_links)
        if total == 0:
            result[gid] = (0.0, 0, 0)
        else:
            completed = sum(1 for link in g_links if task_status_map.get(link.task_id) == "done")
            result[gid] = (completed / total, total, completed)
    return result


def _goal_to_out(db: Session, goal: Goal) -> GoalOut:
    progress, total, completed = _compute_progress(db, goal.id)
    return GoalOut(
        id=goal.id,
        title=goal.title,
        description=goal.description,
        target_date=goal.target_date,
        color=goal.color,
        deleted_at=goal.deleted_at,
        created_at=goal.created_at,
        updated_at=goal.updated_at,
        progress=progress,
        total_tasks=total,
        completed_tasks=completed,
    )


def get_goals(db: Session) -> list[GoalOut]:
    goals = db.query(Goal).filter(Goal.deleted_at.is_(None)).order_by(Goal.created_at.desc()).all()
    goal_ids = [g.id for g in goals]
    progress_map = _batch_compute_progress(db, goal_ids)
    results = []
    for g in goals:
        p, total, completed = progress_map.get(g.id, (0.0, 0, 0))
        results.append(GoalOut(
            id=g.id,
            title=g.title,
            description=g.description,
            target_date=g.target_date,
            color=g.color,
            deleted_at=g.deleted_at,
            created_at=g.created_at,
            updated_at=g.updated_at,
            progress=p,
            total_tasks=total,
            completed_tasks=completed,
        ))
    return results


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
    # Clean up orphaned links before soft-deleting
    db.query(GoalTaskLink).filter(GoalTaskLink.goal_id == goal_id).delete()
    goal.deleted_at = datetime.now(timezone.utc).isoformat()
    db.commit()
    return True


def link_task_to_goal(db: Session, goal_id: str, task_id: str) -> tuple[GoalTaskLink | None, bool]:
    goal = db.query(Goal).filter(Goal.id == goal_id, Goal.deleted_at.is_(None)).first()
    if not goal:
        return None, False
    task = db.query(Task).filter(Task.id == task_id, Task.deleted_at.is_(None)).first()
    if not task:
        return None, False
    existing = db.query(GoalTaskLink).filter(
        GoalTaskLink.goal_id == goal_id, GoalTaskLink.task_id == task_id
    ).first()
    if existing:
        return existing, True
    link = GoalTaskLink(goal_id=goal_id, task_id=task_id)
    db.add(link)
    db.commit()
    db.refresh(link)
    return link, False


def unlink_task_from_goal(db: Session, goal_id: str, task_id: str) -> bool:
    link = db.query(GoalTaskLink).filter(
        GoalTaskLink.goal_id == goal_id, GoalTaskLink.task_id == task_id
    ).first()
    if not link:
        return False
    db.delete(link)
    db.commit()
    return True


def get_goal_task_links(db: Session, goal_id: str) -> list[GoalTaskLink]:
    return db.query(GoalTaskLink).filter(GoalTaskLink.goal_id == goal_id).all()
