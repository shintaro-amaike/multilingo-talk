from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class MessageBase(BaseModel):
    role: str  # "user" or "assistant"
    content: str

class MessageCreate(MessageBase):
    translation: Optional[str] = None
    audio_url: Optional[str] = None

class MessageResponse(MessageBase):
    id: int
    conversation_id: int
    translation: Optional[str] = None
    audio_url: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class MessageSendRequest(BaseModel):
    text: str
    audio_url: Optional[str] = None

class MessageListResponse(BaseModel):
    messages: list[MessageResponse]
    total: int
