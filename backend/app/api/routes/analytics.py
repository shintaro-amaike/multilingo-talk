"""
Analytics Routes
Handles learning progress and statistics
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from app.database.session import get_db
from app.models import Conversation, Message, User
import logging

router = APIRouter(prefix="/analytics", tags=["analytics"])
logger = logging.getLogger(__name__)


@router.get("/progress")
async def get_progress(
    user_id: int = 1,
    db: Session = Depends(get_db),
):
    """
    Get learning progress analytics

    Returns:
    {
        "success": true,
        "data": {
            "total_conversations": 15,
            "total_messages": 240,
            "languages_studied": ["en", "ja", "zh"],
            "by_difficulty": {
                "beginner": 5,
                "intermediate": 7,
                "advanced": 3
            },
            "by_language": {
                "en": 5,
                "ja": 7,
                "zh": 3
            },
            "study_streak_days": 7,
            "last_conversation": "2025-11-29T10:30:00"
        }
    }
    """
    try:
        # Get user
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            user_id = 1  # Default user for MVP

        # Total conversations
        total_conversations = db.query(Conversation).filter(
            Conversation.user_id == user_id
        ).count()

        # Total messages (excluding initial messages)
        total_messages = db.query(Message).join(
            Conversation, Message.conversation_id == Conversation.id
        ).filter(
            Conversation.user_id == user_id,
            Message.role == "user",
        ).count()

        # By difficulty
        difficulty_counts = db.query(
            Conversation.difficulty,
            func.count(Conversation.id).label('count')
        ).filter(
            Conversation.user_id == user_id
        ).group_by(Conversation.difficulty).all()

        by_difficulty = {
            diff: count for diff, count in difficulty_counts
        }

        # By language pair
        language_pair_counts = db.query(
            Conversation.language_pair,
            func.count(Conversation.id).label('count')
        ).filter(
            Conversation.user_id == user_id
        ).group_by(Conversation.language_pair).all()

        by_language = {}
        languages_set = set()
        for pair, count in language_pair_counts:
            learning_lang, native_lang = pair.split('-')
            languages_set.add(learning_lang)
            by_language[learning_lang] = by_language.get(learning_lang, 0) + count

        # Last conversation
        last_conversation = db.query(Conversation).filter(
            Conversation.user_id == user_id
        ).order_by(Conversation.created_at.desc()).first()

        last_conversation_date = (
            last_conversation.created_at.isoformat() if last_conversation else None
        )

        # Calculate study streak (simplified - just check if conversation in last N days)
        study_streak = 0
        if last_conversation:
            days_since_last = (datetime.now() - last_conversation.created_at).days
            study_streak = max(0, 7 - days_since_last)

        logger.info(f"Generated progress analytics for user {user_id}")

        return {
            "success": True,
            "data": {
                "total_conversations": total_conversations,
                "total_messages": total_messages,
                "languages_studied": list(languages_set),
                "by_difficulty": by_difficulty or {"beginner": 0, "intermediate": 0, "advanced": 0},
                "by_language": by_language,
                "study_streak_days": study_streak,
                "last_conversation": last_conversation_date,
            },
        }

    except Exception as e:
        logger.error(f"Error getting progress analytics: {str(e)}")
        raise HTTPException(status_code=500, detail="Error getting progress analytics")


@router.get("/statistics")
async def get_statistics(
    user_id: int = 1,
    db: Session = Depends(get_db),
):
    """
    Get detailed learning statistics

    Returns:
    {
        "success": true,
        "data": {
            "total_study_time_minutes": 450,
            "average_session_length_minutes": 30,
            "conversations_per_day": 2.1,
            "messages_per_conversation": 16,
            "preferred_language": "ja",
            "preferred_difficulty": "intermediate",
            "preferred_topic": "daily",
            "weekly_breakdown": {
                "Monday": {"conversations": 2, "messages": 32},
                ...
            }
        }
    }
    """
    try:
        # Total conversations count
        conversations = db.query(Conversation).filter(
            Conversation.user_id == user_id
        ).all()

        if not conversations:
            # Return empty statistics for new user
            return {
                "success": True,
                "data": {
                    "total_study_time_minutes": 0,
                    "average_session_length_minutes": 0,
                    "conversations_per_day": 0,
                    "messages_per_conversation": 0,
                    "preferred_language": None,
                    "preferred_difficulty": None,
                    "preferred_topic": None,
                    "weekly_breakdown": {},
                },
            }

        # Calculate statistics
        total_conversations = len(conversations)

        # Estimate study time (rough: 5 min per conversation message)
        total_messages = db.query(Message).join(
            Conversation, Message.conversation_id == Conversation.id
        ).filter(
            Conversation.user_id == user_id
        ).count()

        total_study_time_minutes = max(total_messages * 2, 0)  # Estimate 2 min per message

        # Average session length
        avg_session_length = (
            total_study_time_minutes / total_conversations if total_conversations > 0 else 0
        )

        # Messages per conversation
        messages_per_conversation = (
            total_messages / total_conversations if total_conversations > 0 else 0
        )

        # Days spanned
        first_conversation = min(conversations, key=lambda c: c.created_at)
        last_conversation = max(conversations, key=lambda c: c.created_at)
        days_spanned = max((last_conversation.created_at - first_conversation.created_at).days, 1)

        # Conversations per day
        conversations_per_day = total_conversations / max(days_spanned, 1)

        # Preferred language (most conversations)
        language_counts = {}
        for conv in conversations:
            lang_pair = conv.language_pair
            learning_lang = lang_pair.split('-')[0]
            language_counts[learning_lang] = language_counts.get(learning_lang, 0) + 1

        preferred_language = max(language_counts.items(), key=lambda x: x[1])[0] if language_counts else None

        # Preferred difficulty
        difficulty_counts = {}
        for conv in conversations:
            difficulty_counts[conv.difficulty] = difficulty_counts.get(conv.difficulty, 0) + 1

        preferred_difficulty = (
            max(difficulty_counts.items(), key=lambda x: x[1])[0] if difficulty_counts else None
        )

        # Preferred topic
        topic_counts = {}
        for conv in conversations:
            topic_counts[conv.topic] = topic_counts.get(conv.topic, 0) + 1

        preferred_topic = max(topic_counts.items(), key=lambda x: x[1])[0] if topic_counts else None

        logger.info(f"Generated detailed statistics for user {user_id}")

        return {
            "success": True,
            "data": {
                "total_study_time_minutes": int(total_study_time_minutes),
                "average_session_length_minutes": round(avg_session_length, 1),
                "conversations_per_day": round(conversations_per_day, 2),
                "messages_per_conversation": round(messages_per_conversation, 1),
                "preferred_language": preferred_language,
                "preferred_difficulty": preferred_difficulty,
                "preferred_topic": preferred_topic,
                "total_conversations": total_conversations,
                "total_messages": total_messages,
            },
        }

    except Exception as e:
        logger.error(f"Error getting statistics: {str(e)}")
        raise HTTPException(status_code=500, detail="Error getting statistics")


@router.get("/daily-progress")
async def get_daily_progress(
    user_id: int = 1,
    days: int = 7,
    db: Session = Depends(get_db),
):
    """
    Get daily progress for the last N days

    Returns time series data for graphing

    Returns:
    {
        "success": true,
        "data": {
            "dates": ["2025-11-23", "2025-11-24", ...],
            "conversations": [1, 2, 3, ...],
            "messages": [5, 10, 8, ...],
            "languages": ["en", "ja", "zh", ...]
        }
    }
    """
    try:
        # Get conversations from last N days
        start_date = datetime.now() - timedelta(days=days)

        conversations = db.query(Conversation).filter(
            Conversation.user_id == user_id,
            Conversation.created_at >= start_date,
        ).all()

        # Group by date
        daily_data = {}
        for conv in conversations:
            date_key = conv.created_at.date().isoformat()
            if date_key not in daily_data:
                daily_data[date_key] = {
                    "conversations": 0,
                    "messages": 0,
                    "languages": set(),
                }

            daily_data[date_key]["conversations"] += 1

            # Count messages for this conversation
            msg_count = db.query(Message).filter(
                Message.conversation_id == conv.id
            ).count()
            daily_data[date_key]["messages"] += msg_count

            # Add language
            learning_lang = conv.language_pair.split('-')[0]
            daily_data[date_key]["languages"].add(learning_lang)

        # Sort by date
        sorted_dates = sorted(daily_data.keys())

        dates = sorted_dates
        conversations_list = [daily_data[d]["conversations"] for d in sorted_dates]
        messages_list = [daily_data[d]["messages"] for d in sorted_dates]
        languages_list = list(set(
            lang for d in sorted_dates for lang in daily_data[d]["languages"]
        ))

        logger.info(f"Generated daily progress for user {user_id} ({days} days)")

        return {
            "success": True,
            "data": {
                "dates": dates,
                "conversations": conversations_list,
                "messages": messages_list,
                "languages": languages_list,
            },
        }

    except Exception as e:
        logger.error(f"Error getting daily progress: {str(e)}")
        raise HTTPException(status_code=500, detail="Error getting daily progress")


@router.get("/language-stats")
async def get_language_statistics(
    user_id: int = 1,
    db: Session = Depends(get_db),
):
    """
    Get detailed statistics by language

    Returns:
    {
        "success": true,
        "data": {
            "languages": {
                "en": {
                    "conversations": 5,
                    "messages": 80,
                    "study_time_minutes": 100,
                    "difficulties": {"beginner": 2, "intermediate": 3}
                },
                ...
            }
        }
    }
    """
    try:
        conversations = db.query(Conversation).filter(
            Conversation.user_id == user_id
        ).all()

        language_stats = {}

        for conv in conversations:
            learning_lang = conv.language_pair.split('-')[0]

            if learning_lang not in language_stats:
                language_stats[learning_lang] = {
                    "conversations": 0,
                    "messages": 0,
                    "study_time_minutes": 0,
                    "difficulties": {},
                }

            language_stats[learning_lang]["conversations"] += 1

            # Count messages
            msg_count = db.query(Message).filter(
                Message.conversation_id == conv.id
            ).count()
            language_stats[learning_lang]["messages"] += msg_count
            language_stats[learning_lang]["study_time_minutes"] += msg_count * 2

            # Count by difficulty
            diff = conv.difficulty
            if diff not in language_stats[learning_lang]["difficulties"]:
                language_stats[learning_lang]["difficulties"][diff] = 0
            language_stats[learning_lang]["difficulties"][diff] += 1

        logger.info(f"Generated language statistics for user {user_id}")

        return {
            "success": True,
            "data": {
                "languages": language_stats,
            },
        }

    except Exception as e:
        logger.error(f"Error getting language statistics: {str(e)}")
        raise HTTPException(status_code=500, detail="Error getting language statistics")
