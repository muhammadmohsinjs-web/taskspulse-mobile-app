from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from modules.categories.schemas import CategoryCreate, CategoryUpdate, CategoryOut
from modules.categories import service
from modules.auth.dependencies import get_current_user
from modules.auth.models import User

router = APIRouter()


@router.get("", response_model=list[CategoryOut], summary="List categories")
def list_categories(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return service.get_categories(db, user_id=current_user.id)


@router.get("/{category_id}", response_model=CategoryOut, summary="Get category by ID")
def read_category(category_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    cat = service.get_category(db, category_id, user_id=current_user.id)
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    return cat


@router.post("", response_model=CategoryOut, status_code=status.HTTP_201_CREATED, summary="Create category")
def create_new_category(category: CategoryCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    try:
        return service.create_category(db, category, user_id=current_user.id)
    except ValueError as e:
        raise HTTPException(status_code=409, detail=str(e))


@router.put("/{category_id}", response_model=CategoryOut, summary="Update category")
def update_existing_category(category_id: str, category: CategoryUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    try:
        updated = service.update_category(db, category_id, category, user_id=current_user.id)
    except ValueError as e:
        raise HTTPException(status_code=409, detail=str(e))
    if not updated:
        raise HTTPException(status_code=404, detail="Category not found")
    return updated


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete category")
def delete_existing_category(category_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not service.delete_category(db, category_id, user_id=current_user.id):
        raise HTTPException(status_code=404, detail="Category not found")
