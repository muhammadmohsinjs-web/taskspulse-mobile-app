from sqlalchemy import Column, String, DateTime, ForeignKey, CheckConstraint, UniqueConstraint, Index, func
from database import Base
from modules.utils import generate_uuid


class Category(Base):
    __tablename__ = "categories"
    __table_args__ = (
        UniqueConstraint("user_id", "name", name="uq_categories_user_name"),
        CheckConstraint("applies_to IN ('task', 'habit', 'both')", name="ck_categories_applies_to"),
        Index("idx_categories_user_id", "user_id"),
    )

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    name = Column(String, nullable=False)
    color = Column(String, nullable=False, default="#4A90D9")
    icon = Column(String, default="folder")
    applies_to = Column(String, nullable=False, default="both")
    deleted_at = Column(String, nullable=True, default=None)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
