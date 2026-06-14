from datetime import datetime, timedelta, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.api import deps
from app.api.deps import get_current_user
from app.models import Flashcard, User
from app.services.ai_service import ai_service

router = APIRouter(tags=["flashcards"])

# Schemas
class FlashcardCreate(BaseModel):
    front: str
    back: Optional[str] = None
    context: Optional[str] = None
    language: str

class FlashcardResponse(BaseModel):
    id: int
    front: str
    back: str
    context: Optional[str]
    language: str
    next_review: datetime
    
class ReviewSubmit(BaseModel):
    quality: int # 0-5

@router.post("/", response_model=FlashcardResponse)
async def create_flashcard(
    card_in: FlashcardCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new flashcard. If 'back' is missing, use AI to generate translation/definition.
    """
    back_content = card_in.back
    if not back_content:
        # Generate translation using AI
        # Assuming native_language is 'en' or from user profile. For now default to English if learning lang is not English
        target_lang = "en" if card_in.language != "en" else "ja" # Simplification
        
        # Use AI service to translate
        translation = ai_service.generate_translation(card_in.front, card_in.language, target_lang)
        back_content = translation or "Translation unavailable"

    flashcard = Flashcard(
        user_id=current_user.id,
        front=card_in.front,
        back=back_content,
        context=card_in.context,
        language=card_in.language
    )
    db.add(flashcard)
    db.commit()
    db.refresh(flashcard)
    return flashcard

@router.get("/due", response_model=List[FlashcardResponse])
async def get_due_flashcards(
    limit: int = 20,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(get_current_user)
):
    """Get flashcards due for review"""
    now = datetime.now(timezone.utc)
    cards = db.query(Flashcard).filter(
        Flashcard.user_id == current_user.id,
        Flashcard.next_review <= now
    ).limit(limit).all()
    return cards

@router.post("/{card_id}/review")
async def review_flashcard(
    card_id: int,
    review: ReviewSubmit,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Submit review for a flashcard (SM-2 Algorithm)
    Quality: 0 (blackout) to 5 (perfect)
    """
    card = db.query(Flashcard).filter(
        Flashcard.id == card_id,
        Flashcard.user_id == current_user.id
    ).first()
    
    if not card:
        raise HTTPException(status_code=404, detail="Flashcard not found")
        
    # SM-2 Algorithm Implementation
    q = review.quality
    
    if q < 3:
        # If user failed, reset interval
        card.interval = 1
        card.review_count = 0
    else:
        # Success
        if card.review_count == 0:
            card.interval = 1
        elif card.review_count == 1:
            card.interval = 6
        else:
            card.interval = int(card.interval * card.ease_factor)
        
        card.review_count += 1
        
        # Update Ease Factor
        # EF' = EF + (0.1 - (5-q) * (0.08 + (5-q) * 0.02))
        card.ease_factor = max(1.3, card.ease_factor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)))

    # Set next review date
    card.next_review = datetime.now(timezone.utc) + timedelta(days=card.interval)
    
    db.commit()
    return {"status": "reviewed", "next_review": card.next_review}
