from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from modules.categories.schemas import CategoryCreate, CategoryUpdate, CategoryOut
from modules.categories import service

router = APIRouter()


@router.get("", response_model=list[CategoryOut], summary="List categories")
def list_categories(db: Session = Depends(get_db)):
    return service.get_categories(db)


@router.post("", response_model=CategoryOut, status_code=status.HTTP_201_CREATED, summary="Create category")
def create_new_category(category: CategoryCreate, db: Session = Depends(get_db)):
    try:
        return service.create_category(db, category)
    except ValueError as e:
        raise HTTPException(status_code=409, detail=str(e))


@router.put("/{category_id}", response_model=CategoryOut, summary="Update category")
def update_existing_category(category_id: str, category: CategoryUpdate, db: Session = Depends(get_db)):
    try:
        updated = service.update_category(db, category_id, category)
    except ValueError as e:
        raise HTTPException(status_code=409, detail=str(e))
    if not updated:
        raise HTTPException(status_code=404, detail="Category not found")
    return updated


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete category")
def delete_existing_category(category_id: str, db: Session = Depends(get_db)):
    if not service.delete_category(db, category_id):
        raise HTTPException(status_code=404, detail="Category not found")
