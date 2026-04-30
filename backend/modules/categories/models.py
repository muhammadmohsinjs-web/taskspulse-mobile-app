import uuid
from sqlalchemy import Column, String, DateTime, func
from database import Base


def generate_uuid():
    return str(uuid.uuid4())


class Category(Base):
    __tablename__ = "categories"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False, unique=True)
    color = Column(String, nullable=False, default="#4A90D9")
    icon = Column(String, default="folder")
    applies_to = Column(String, nullable=False, default="both")
    created_at = Column(DateTime, server_default=func.now())
