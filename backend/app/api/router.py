from fastapi import APIRouter
from app.api.routes import speech, conversations, messages, feedback, analytics, backup

router = APIRouter()

# Include all sub-routers
router.include_router(speech.router, prefix="/api/speech", tags=["speech"])
router.include_router(conversations.router, prefix="/api", tags=["conversations"])
router.include_router(messages.router, prefix="/api", tags=["messages"])
router.include_router(feedback.router, prefix="/api", tags=["feedback"])
router.include_router(analytics.router, prefix="/api", tags=["analytics"])
router.include_router(backup.router, prefix="/api", tags=["backup"])

# Health check endpoint
@router.get("/health")
async def health_check():
    return {"status": "ok"}
