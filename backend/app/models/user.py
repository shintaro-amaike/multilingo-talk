from sqlalchemy import Column, Integer, String, DateTime, Boolean
from datetime import datetime, timezone
from app.database.base import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True, nullable=True)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    native_language = Column(String, default="ja")  # e.g., "ja", "en", "zh"
    learning_language = Column(String, default="en")  # e.g., "en", "es", "fr"
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    def __repr__(self):
        return f"<User {self.username}>"
