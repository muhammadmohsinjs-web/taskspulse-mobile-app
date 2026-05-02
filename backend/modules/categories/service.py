from datetime import datetime, timezone
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from modules.categories.models import Category
from modules.categories.schemas import CategoryCreate, CategoryUpdate


def get_categories(db: Session, user_id: str):
    return db.query(Category).filter(Category.user_id == user_id, Category.deleted_at.is_(None)).order_by(Category.name).all()


def get_category(db: Session, category_id: str, user_id: str | None = None):
    filters = [Category.id == category_id, Category.deleted_at.is_(None)]
    if user_id:
        filters.append(Category.user_id == user_id)
    return db.query(Category).filter(*filters).first()


def create_category(db: Session, category: CategoryCreate, user_id: str):
    db_cat = Category(**category.model_dump(), user_id=user_id)
    db.add(db_cat)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise ValueError("A category with this name already exists")
    db.refresh(db_cat)
    return db_cat


def update_category(db: Session, category_id: str, category: CategoryUpdate, user_id: str):
    db_cat = db.query(Category).filter(Category.id == category_id, Category.user_id == user_id, Category.deleted_at.is_(None)).first()
    if not db_cat:
        return None
    update_data = category.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_cat, key, value)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise ValueError("A category with this name already exists")
    db.refresh(db_cat)
    return db_cat


def delete_category(db: Session, category_id: str, user_id: str):
    db_cat = db.query(Category).filter(Category.id == category_id, Category.user_id == user_id, Category.deleted_at.is_(None)).first()
    if not db_cat:
        return None
    db_cat.deleted_at = datetime.now(timezone.utc).isoformat()
    db.commit()
    return db_cat
