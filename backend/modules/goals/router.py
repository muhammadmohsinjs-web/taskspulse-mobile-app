from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from modules.tasks.schemas import TaskOut
from modules.goals.schemas import GoalCreate, GoalUpdate, GoalOut, GoalTaskLinkCreate, GoalTaskLinkOut
from modules.goals import service
from modules.tasks import service as task_service

router = APIRouter()


@router.get("", response_model=list[GoalOut], summary="List goals")
def list_goals(db: Session = Depends(get_db)):
    return service.get_goals(db)


@router.post("", response_model=GoalOut, status_code=status.HTTP_201_CREATED, summary="Create goal")
def create_new_goal(goal: GoalCreate, db: Session = Depends(get_db)):
    return service.create_goal(db, goal)


@router.get("/{goal_id}", response_model=GoalOut, summary="Get goal by ID")
def read_goal(goal_id: str, db: Session = Depends(get_db)):
    goal = service.get_goal(db, goal_id)
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    return goal


@router.put("/{goal_id}", response_model=GoalOut, summary="Update goal")
def update_existing_goal(goal_id: str, goal: GoalUpdate, db: Session = Depends(get_db)):
    updated = service.update_goal(db, goal_id, goal)
    if not updated:
        raise HTTPException(status_code=404, detail="Goal not found")
    return updated


@router.delete("/{goal_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete goal (soft delete)")
def delete_existing_goal(goal_id: str, db: Session = Depends(get_db)):
    if not service.delete_goal(db, goal_id):
        raise HTTPException(status_code=404, detail="Goal not found")


@router.post("/{goal_id}/tasks", response_model=GoalTaskLinkOut, summary="Link task to goal")
def link_task(goal_id: str, link: GoalTaskLinkCreate, db: Session = Depends(get_db)):
    result, already_exists = service.link_task_to_goal(db, goal_id, link.task_id)
    if result is None:
        raise HTTPException(status_code=404, detail="Goal or task not found")
    if already_exists:
        raise HTTPException(status_code=409, detail="Task is already linked to this goal")
    return result


@router.get("/{goal_id}/tasks", response_model=list[TaskOut], summary="List tasks linked to goal")
def list_goal_tasks(goal_id: str, db: Session = Depends(get_db)):
    goal = service.get_goal(db, goal_id)
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    links = service.get_goal_task_links(db, goal_id)
    task_ids = [link.task_id for link in links]
    if not task_ids:
        return []
    return task_service.get_tasks(db, task_ids=task_ids, limit=500)


@router.delete("/{goal_id}/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Unlink task from goal")
def unlink_task(goal_id: str, task_id: str, db: Session = Depends(get_db)):
    if not service.unlink_task_from_goal(db, goal_id, task_id):
        raise HTTPException(status_code=404, detail="Link not found")
