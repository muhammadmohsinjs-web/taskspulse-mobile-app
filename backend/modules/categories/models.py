from sqlalchemy import Column, String, DateTime, func
from database import Base
from modules.utils import generate_uuid


class Category(Base):
    __tablename__ = "categories"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False, unique=True)
    color = Column(String, nullable=False, default="#4A90D9")
    icon = Column(String, default="folder")
    applies_to = Column(String, nullable=False, default="both")
    deleted_at = Column(String, nullable=True, default=None)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
