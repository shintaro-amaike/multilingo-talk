"""
Message Routes
Handles message sending and retrieval in conversations
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models import Conversation, Message
from app.schemas.message import MessageSendRequest, MessageResponse
from app.services.prompt_service import PromptService
from app.services.ai_service import ai_service
import logging
from datetime import datetime

router = APIRouter(prefix="/conversations", tags=["messages"])
logger = logging.getLogger(__name__)


@router.get("/{conversation_id}/messages")
async def get_conversation_messages(
    conversation_id: int,
    limit: int = 50,
    offset: int = 0,
    db: Session = Depends(get_db),
):
    """
    Get all messages in a conversation

    Query params:
    - limit: Number of messages to retrieve (default: 50)
    - offset: Offset for pagination (default: 0)
    """
    try:
        conversation = db.query(Conversation).filter(
            Conversation.id == conversation_id
        ).first()

        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")

        messages = db.query(Message).filter(
            Message.conversation_id == conversation_id
        ).order_by(
            Message.created_at.asc()
        ).offset(offset).limit(limit).all()

        total = db.query(Message).filter(
            Message.conversation_id == conversation_id
        ).count()

        return {
            "success": True,
            "data": {
                "messages": [
                    {
                        "id": msg.id,
                        "role": msg.role,
                        "content": msg.content,
                        "translation": msg.translation,
                        "audio_url": msg.audio_url,
                        "created_at": msg.created_at.isoformat(),
                    }
                    for msg in messages
                ],
                "total": total,
                "limit": limit,
                "offset": offset,
            },
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching messages: {str(e)}")
        raise HTTPException(status_code=500, detail="Error fetching messages")


@router.post("/{conversation_id}/messages")
async def send_message(
    conversation_id: int,
    message_data: MessageSendRequest,
    db: Session = Depends(get_db),
):
    """
    Send a message in a conversation

    Request body:
    {
        "text": "Hello, how are you?",
        "audio_url": "https://example.com/audio.mp3" (optional)
    }

    Note: In Phase 3, this would integrate with OpenAI/Claude API
    For now, returns a placeholder response
    """
    try:
        # Validate conversation exists
        conversation = db.query(Conversation).filter(
            Conversation.id == conversation_id
        ).first()

        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")

        # Store user message
        user_message = Message(
            conversation_id=conversation_id,
            role="user",
            content=message_data.text,
            audio_url=message_data.audio_url,
        )
        db.add(user_message)
        db.commit()
        db.refresh(user_message)

        logger.info(f"User message {user_message.id} in conversation {conversation_id}")

        # Generate AI response using language-aware prompts
        learning_language, native_language = conversation.language_pair.split('-')

        # Get conversation history for context
        conversation_messages = db.query(Message).filter(
            Message.conversation_id == conversation_id
        ).order_by(Message.created_at.asc()).all()

        # Build message history for AI context (limit to last 10 messages for token efficiency)
        message_history = [
            {
                "role": msg.role,
                "content": msg.content
            }
            for msg in conversation_messages[-10:]
        ]

        # Generate AI response
        ai_response = ai_service.generate_response(
            conversation_history=message_history,
            language=learning_language,
            difficulty=conversation.difficulty,
            topic=conversation.topic,
            max_tokens=150,
        )

        # Fallback if AI service fails
        if not ai_response:
            ai_response = f"Thank you for saying: '{message_data.text}'. I appreciate your input!"

        # Store AI message
        ai_message = Message(
            conversation_id=conversation_id,
            role="assistant",
            content=ai_response,
        )
        db.add(ai_message)
        db.commit()
        db.refresh(ai_message)

        return {
            "success": True,
            "data": {
                "user_message": {
                    "id": user_message.id,
                    "role": user_message.role,
                    "content": user_message.content,
                    "created_at": user_message.created_at.isoformat(),
                },
                "ai_message": {
                    "id": ai_message.id,
                    "role": ai_message.role,
                    "content": ai_message.content,
                    "created_at": ai_message.created_at.isoformat(),
                },
            },
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error sending message: {str(e)}")
        raise HTTPException(status_code=500, detail="Error sending message")


@router.delete("/{conversation_id}/messages/{message_id}")
async def delete_message(
    conversation_id: int,
    message_id: int,
    db: Session = Depends(get_db),
):
    """Delete a specific message"""
    try:
        message = db.query(Message).filter(
            Message.id == message_id,
            Message.conversation_id == conversation_id,
        ).first()

        if not message:
            raise HTTPException(status_code=404, detail="Message not found")

        db.delete(message)
        db.commit()

        logger.info(f"Deleted message {message_id}")

        return {
            "success": True,
            "data": {"message": "Message deleted successfully"},
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting message: {str(e)}")
        raise HTTPException(status_code=500, detail="Error deleting message")
