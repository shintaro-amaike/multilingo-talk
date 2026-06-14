from fastapi import APIRouter
from app.api.routes import speech, conversations, messages, feedback, analytics, backup, auth, flashcards

router = APIRouter()

# Include all sub-routers
# Note: Main app.py already adds /api prefix, so no need to repeat here
router.include_router(speech.router, prefix="/speech", tags=["speech"])
router.include_router(conversations.router, prefix="/conversations", tags=["conversations"])
router.include_router(messages.router, prefix="/messages", tags=["messages"])
router.include_router(feedback.router, prefix="/feedback", tags=["feedback"])
router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
router.include_router(backup.router, prefix="/backup", tags=["backup"])
router.include_router(auth.router, prefix="/auth", tags=["auth"])
router.include_router(flashcards.router, prefix="/flashcards", tags=["flashcards"])

# Health check endpoint
@router.get("/health")
async def health_check():
    return {"status": "ok"}
