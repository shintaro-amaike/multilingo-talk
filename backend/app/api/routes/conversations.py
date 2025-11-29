"""
Conversation Routes
Handles conversation creation, retrieval, and management
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models import Conversation, Message
from app.schemas.conversation import ConversationCreate, ConversationResponse
from app.services.prompt_service import PromptService
from app.core.languages import validate_language, validate_topic, validate_difficulty
import logging

router = APIRouter(prefix="/conversations", tags=["conversations"])
logger = logging.getLogger(__name__)


@router.post("/create")
async def create_conversation(
    conversation_data: ConversationCreate,
    db: Session = Depends(get_db),
):
    """
    Create a new conversation

    Request:
    {
        "topic": "daily",
        "difficulty": "beginner",
        "language_pair": "en-ja",
        "user_id": 1 (optional)
    }
    """
    try:
        # Validate input
        if not validate_topic(conversation_data.topic):
            raise HTTPException(status_code=400, detail="Invalid topic")

        if not validate_difficulty(conversation_data.difficulty):
            raise HTTPException(status_code=400, detail="Invalid difficulty level")

        # Extract languages from pair (e.g., "en-ja" -> "en", "ja")
        language_pair = conversation_data.language_pair
        languages = language_pair.split("-")
        if len(languages) != 2:
            raise HTTPException(status_code=400, detail="Invalid language pair format (use 'en-ja')")

        learning_language, native_language = languages
        if not validate_language(learning_language) or not validate_language(native_language):
            raise HTTPException(status_code=400, detail="Invalid language code")

        # Create conversation
        conversation = Conversation(
            user_id=conversation_data.user_id or 1,  # Default user_id for demo
            topic=conversation_data.topic,
            difficulty=conversation_data.difficulty,
            language_pair=language_pair,
        )
        db.add(conversation)
        db.commit()
        db.refresh(conversation)

        # Generate initial AI message
        initial_message = PromptService.get_initial_message(
            language=learning_language,
            difficulty=conversation_data.difficulty,
            topic=conversation_data.topic,
        )

        # Create initial AI message in database
        ai_message = Message(
            conversation_id=conversation.id,
            role="assistant",
            content=initial_message,
        )
        db.add(ai_message)
        db.commit()

        logger.info(f"Created conversation {conversation.id}")

        return {
            "success": True,
            "data": {
                "id": conversation.id,
                "topic": conversation.topic,
                "difficulty": conversation.difficulty,
                "language_pair": conversation.language_pair,
                "created_at": conversation.created_at.isoformat(),
                "initial_message": initial_message,
            },
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating conversation: {str(e)}")
        raise HTTPException(status_code=500, detail="Error creating conversation")


@router.get("/{conversation_id}")
async def get_conversation(
    conversation_id: int,
    db: Session = Depends(get_db),
):
    """Get conversation details"""
    try:
        conversation = db.query(Conversation).filter(
            Conversation.id == conversation_id
        ).first()

        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")

        return {
            "success": True,
            "data": {
                "id": conversation.id,
                "topic": conversation.topic,
                "difficulty": conversation.difficulty,
                "language_pair": conversation.language_pair,
                "created_at": conversation.created_at.isoformat(),
                "updated_at": conversation.updated_at.isoformat(),
            },
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching conversation: {str(e)}")
        raise HTTPException(status_code=500, detail="Error fetching conversation")


@router.get("")
async def list_conversations(
    user_id: int = 1,
    limit: int = 20,
    offset: int = 0,
    db: Session = Depends(get_db),
):
    """List user's conversations with pagination"""
    try:
        conversations = db.query(Conversation).filter(
            Conversation.user_id == user_id
        ).order_by(
            Conversation.created_at.desc()
        ).offset(offset).limit(limit).all()

        total = db.query(Conversation).filter(
            Conversation.user_id == user_id
        ).count()

        return {
            "success": True,
            "data": {
                "conversations": [
                    {
                        "id": conv.id,
                        "topic": conv.topic,
                        "difficulty": conv.difficulty,
                        "language_pair": conv.language_pair,
                        "created_at": conv.created_at.isoformat(),
                    }
                    for conv in conversations
                ],
                "total": total,
                "limit": limit,
                "offset": offset,
            },
        }
    except Exception as e:
        logger.error(f"Error listing conversations: {str(e)}")
        raise HTTPException(status_code=500, detail="Error listing conversations")


@router.delete("/{conversation_id}")
async def delete_conversation(
    conversation_id: int,
    db: Session = Depends(get_db),
):
    """Delete a conversation"""
    try:
        conversation = db.query(Conversation).filter(
            Conversation.id == conversation_id
        ).first()

        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")

        # Delete all messages in conversation
        db.query(Message).filter(
            Message.conversation_id == conversation_id
        ).delete()

        # Delete conversation
        db.delete(conversation)
        db.commit()

        logger.info(f"Deleted conversation {conversation_id}")

        return {
            "success": True,
            "data": {"message": "Conversation deleted successfully"},
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting conversation: {str(e)}")
        raise HTTPException(status_code=500, detail="Error deleting conversation")
