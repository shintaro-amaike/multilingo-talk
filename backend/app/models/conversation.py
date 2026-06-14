from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from datetime import datetime, timezone
from app.database.base import Base

class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    topic = Column(String)  # e.g., "daily", "business", "travel"
    difficulty = Column(String)  # "beginner", "intermediate", "advanced"
    language_pair = Column(String)  # e.g., "en-ja", "en-es"
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    def __repr__(self):
        return f"<Conversation {self.id} - {self.topic}>"
