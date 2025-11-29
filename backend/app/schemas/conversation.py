from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ConversationBase(BaseModel):
    topic: str
    difficulty: str  # "beginner", "intermediate", "advanced"
    language_pair: str

class ConversationCreate(ConversationBase):
    user_id: Optional[int] = None

class ConversationUpdate(BaseModel):
    topic: Optional[str] = None
    difficulty: Optional[str] = None

class ConversationResponse(ConversationBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
