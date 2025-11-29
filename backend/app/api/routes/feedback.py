"""
Feedback Routes
Handles pronunciation, grammar, and vocabulary feedback
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from app.database.session import get_db
from app.models import Conversation, Message
from app.services.ai_service import ai_service
import logging

router = APIRouter(prefix="/feedback", tags=["feedback"])
logger = logging.getLogger(__name__)


# Request/Response models
class GrammarCheckRequest(BaseModel):
    text: str
    language: str
    difficulty: str


class PronunciationRequest(BaseModel):
    user_transcript: str
    reference_text: str
    language: str


class VocabularyRequest(BaseModel):
    word: str
    language: str
    context: Optional[str] = None


@router.post("/grammar")
async def check_grammar(
    request: GrammarCheckRequest,
    db: Session = Depends(get_db),
):
    """
    Check grammar and provide corrections

    Request:
    {
        "text": "I is going to school",
        "language": "en",
        "difficulty": "beginner"
    }

    Returns:
    {
        "success": true,
        "data": {
            "is_correct": false,
            "corrections": ["I am going to school"],
            "explanations": ["Use 'am' instead of 'is' with first person singular"],
            "score": 40
        }
    }
    """
    try:
        # Validate inputs
        if not request.text or not request.language:
            raise HTTPException(status_code=400, detail="text and language are required")

        # Get grammar feedback from AI service
        feedback = ai_service.provide_grammar_feedback(
            user_text=request.text,
            language=request.language,
            difficulty=request.difficulty,
        )

        if not feedback:
            # Provide basic fallback
            feedback = {
                "is_correct": False,
                "corrections": [request.text],
                "explanations": ["Unable to analyze at this time"],
                "score": 0,
            }

        logger.info(f"Grammar check for {request.language}")

        return {
            "success": True,
            "data": feedback,
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error checking grammar: {str(e)}")
        raise HTTPException(status_code=500, detail="Error checking grammar")


@router.post("/pronunciation")
async def analyze_pronunciation(
    request: PronunciationRequest,
    db: Session = Depends(get_db),
):
    """
    Analyze pronunciation by comparing speech recognition result with reference

    Request:
    {
        "user_transcript": "Helo world",
        "reference_text": "Hello world",
        "language": "en"
    }

    Returns:
    {
        "success": true,
        "data": {
            "score": 85,
            "issues": ["Mispronounced 'Hello' as 'Helo'"],
            "suggestions": ["Practice the 'llo' sound", "Listen to native speaker"],
            "confidence": 0.85
        }
    }
    """
    try:
        # Validate inputs
        if not request.user_transcript or not request.language:
            raise HTTPException(
                status_code=400,
                detail="user_transcript and language are required",
            )

        # Get pronunciation feedback from AI service
        feedback = ai_service.analyze_pronunciation(
            transcribed_text=request.user_transcript,
            reference_text=request.reference_text,
            language=request.language,
        )

        if not feedback:
            # Provide basic fallback
            feedback = {
                "score": 70,
                "issues": [],
                "suggestions": ["Keep practicing"],
                "confidence": 0.7,
            }

        logger.info(f"Pronunciation analysis for {request.language}")

        return {
            "success": True,
            "data": feedback,
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error analyzing pronunciation: {str(e)}")
        raise HTTPException(status_code=500, detail="Error analyzing pronunciation")


@router.post("/vocabulary")
async def explain_vocabulary(
    request: VocabularyRequest,
    db: Session = Depends(get_db),
):
    """
    Provide vocabulary explanation and related words

    Request:
    {
        "word": "benevolent",
        "language": "en",
        "context": "The benevolent king helped the poor"
    }

    Returns:
    {
        "success": true,
        "data": {
            "word": "benevolent",
            "definition": "showing or characterized by concern for others",
            "example": "The benevolent king helped the poor",
            "similar_words": ["kind", "generous", "compassionate"],
            "difficulty_level": "intermediate"
        }
    }
    """
    try:
        # Validate inputs
        if not request.word or not request.language:
            raise HTTPException(status_code=400, detail="word and language are required")

        # For now, return structured vocabulary information
        # This could be expanded to use AI for dynamic explanations
        vocabulary_data = {
            "word": request.word,
            "definition": f"Vocabulary definition for '{request.word}' in {request.language}",
            "example": request.context or f"Example sentence using {request.word}",
            "similar_words": [],
            "difficulty_level": "intermediate",
            "pronunciation": None,
            "part_of_speech": "noun/verb/adjective",
        }

        logger.info(f"Vocabulary lookup for '{request.word}' in {request.language}")

        return {
            "success": True,
            "data": vocabulary_data,
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error explaining vocabulary: {str(e)}")
        raise HTTPException(status_code=500, detail="Error explaining vocabulary")


@router.get("/pronunciation/{conversation_id}")
async def get_pronunciation_history(
    conversation_id: int,
    db: Session = Depends(get_db),
):
    """
    Get pronunciation analysis history for a conversation

    Returns list of pronunciation analyses for this conversation
    """
    try:
        conversation = db.query(Conversation).filter(
            Conversation.id == conversation_id
        ).first()

        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")

        # For now, return empty history
        # In future, could store and retrieve actual feedback history
        return {
            "success": True,
            "data": {
                "conversation_id": conversation_id,
                "analyses": [],
                "average_score": 0,
                "total_feedback": 0,
            },
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching pronunciation history: {str(e)}")
        raise HTTPException(status_code=500, detail="Error fetching pronunciation history")


@router.get("/grammar/{conversation_id}")
async def get_grammar_history(
    conversation_id: int,
    db: Session = Depends(get_db),
):
    """
    Get grammar check history for a conversation

    Returns list of grammar analyses for this conversation
    """
    try:
        conversation = db.query(Conversation).filter(
            Conversation.id == conversation_id
        ).first()

        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")

        # For now, return empty history
        # In future, could store and retrieve actual feedback history
        return {
            "success": True,
            "data": {
                "conversation_id": conversation_id,
                "analyses": [],
                "average_score": 0,
                "total_feedback": 0,
            },
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching grammar history: {str(e)}")
        raise HTTPException(status_code=500, detail="Error fetching grammar history")
