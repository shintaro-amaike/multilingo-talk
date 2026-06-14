from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float
from datetime import datetime, timezone
from app.database.base import Base

class Flashcard(Base):
    __tablename__ = "flashcards"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    front = Column(String, nullable=False)  # The word or phrase
    back = Column(String, nullable=False)   # Translation or definition
    context = Column(String, nullable=True) # Example sentence
    language = Column(String, nullable=False) # Target language
    
    # Spaced Repetition fields (SM-2 Algorithm)
    next_review = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    interval = Column(Integer, default=1)   # Days until next review
    ease_factor = Column(Float, default=2.5)
    review_count = Column(Integer, default=0)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    def __repr__(self):
        return f"<Flashcard {self.front}>"
