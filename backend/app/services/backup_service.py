"""
Backup Service
Handles database backups and data export functionality
"""

import os
import json
import csv
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional
import shutil
import logging
from sqlalchemy.orm import Session
from app.models import User, Conversation, Message, Setting
from app.core.config import settings as app_settings

logger = logging.getLogger(__name__)


class BackupService:
    """Service for managing database backups and exports"""

    # Define backup directory
    BACKUP_DIR = Path("backups")
    EXPORT_DIR = Path("exports")

    def __init__(self):
        """Initialize backup service"""
        self.BACKUP_DIR.mkdir(exist_ok=True)
        self.EXPORT_DIR.mkdir(exist_ok=True)
        logger.info(f"Backup directory: {self.BACKUP_DIR.absolute()}")
        logger.info(f"Export directory: {self.EXPORT_DIR.absolute()}")

    def create_backup(self, db: Session, backup_name: Optional[str] = None) -> str:
        """
        Create a backup of the database

        Args:
            db: Database session
            backup_name: Optional custom backup name

        Returns:
            Path to created backup file
        """
        try:
            # Generate backup name with timestamp
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            backup_name = backup_name or f"backup_{timestamp}.json"
            backup_path = self.BACKUP_DIR / backup_name

            # Collect all data
            backup_data = {
                "timestamp": datetime.now().isoformat(),
                "version": "1.0",
                "data": {
                    "users": [],
                    "conversations": [],
                    "messages": [],
                    "settings": [],
                },
            }

            # Export users
            users = db.query(User).all()
            for user in users:
                backup_data["data"]["users"].append({
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "native_language": user.native_language,
                    "created_at": user.created_at.isoformat() if user.created_at else None,
                })

            # Export conversations
            conversations = db.query(Conversation).all()
            for conv in conversations:
                backup_data["data"]["conversations"].append({
                    "id": conv.id,
                    "user_id": conv.user_id,
                    "topic": conv.topic,
                    "difficulty": conv.difficulty,
                    "language_pair": conv.language_pair,
                    "created_at": conv.created_at.isoformat() if conv.created_at else None,
                    "updated_at": conv.updated_at.isoformat() if conv.updated_at else None,
                })

            # Export messages
            messages = db.query(Message).all()
            for msg in messages:
                backup_data["data"]["messages"].append({
                    "id": msg.id,
                    "conversation_id": msg.conversation_id,
                    "role": msg.role,
                    "content": msg.content,
                    "translation": msg.translation,
                    "audio_url": msg.audio_url,
                    "created_at": msg.created_at.isoformat() if msg.created_at else None,
                })

            # Export settings
            settings = db.query(Setting).all()
            for setting in settings:
                backup_data["data"]["settings"].append({
                    "id": setting.id,
                    "user_id": setting.user_id,
                    "key": setting.key,
                    "value": setting.value,
                    "updated_at": setting.updated_at.isoformat() if setting.updated_at else None,
                })

            # Write backup file
            with open(backup_path, "w", encoding="utf-8") as f:
                json.dump(backup_data, f, indent=2, ensure_ascii=False)

            logger.info(f"Backup created successfully: {backup_path}")
            return str(backup_path)

        except Exception as e:
            logger.error(f"Error creating backup: {str(e)}")
            raise

    def restore_backup(self, db: Session, backup_path: str) -> Dict[str, int]:
        """
        Restore database from backup file

        Args:
            db: Database session
            backup_path: Path to backup file

        Returns:
            Dictionary with counts of restored items
        """
        try:
            # Read backup file
            with open(backup_path, "r", encoding="utf-8") as f:
                backup_data = json.load(f)

            restored_counts = {
                "users": 0,
                "conversations": 0,
                "messages": 0,
                "settings": 0,
            }

            # Restore users
            for user_data in backup_data["data"]["users"]:
                existing = db.query(User).filter(User.id == user_data["id"]).first()
                if not existing:
                    user = User(
                        id=user_data["id"],
                        username=user_data["username"],
                        email=user_data["email"],
                        native_language=user_data.get("native_language"),
                    )
                    db.add(user)
                    restored_counts["users"] += 1

            db.commit()

            # Restore conversations
            for conv_data in backup_data["data"]["conversations"]:
                existing = db.query(Conversation).filter(
                    Conversation.id == conv_data["id"]
                ).first()
                if not existing:
                    conv = Conversation(
                        id=conv_data["id"],
                        user_id=conv_data["user_id"],
                        topic=conv_data["topic"],
                        difficulty=conv_data["difficulty"],
                        language_pair=conv_data["language_pair"],
                    )
                    db.add(conv)
                    restored_counts["conversations"] += 1

            db.commit()

            # Restore messages
            for msg_data in backup_data["data"]["messages"]:
                existing = db.query(Message).filter(Message.id == msg_data["id"]).first()
                if not existing:
                    msg = Message(
                        id=msg_data["id"],
                        conversation_id=msg_data["conversation_id"],
                        role=msg_data["role"],
                        content=msg_data["content"],
                        translation=msg_data.get("translation"),
                        audio_url=msg_data.get("audio_url"),
                    )
                    db.add(msg)
                    restored_counts["messages"] += 1

            db.commit()

            # Restore settings
            for setting_data in backup_data["data"]["settings"]:
                existing = db.query(Setting).filter(Setting.id == setting_data["id"]).first()
                if not existing:
                    setting = Setting(
                        id=setting_data["id"],
                        user_id=setting_data["user_id"],
                        key=setting_data["key"],
                        value=setting_data["value"],
                    )
                    db.add(setting)
                    restored_counts["settings"] += 1

            db.commit()

            logger.info(f"Backup restored successfully: {restored_counts}")
            return restored_counts

        except Exception as e:
            logger.error(f"Error restoring backup: {str(e)}")
            raise

    def export_as_json(self, db: Session, user_id: int) -> str:
        """
        Export user data as JSON

        Args:
            db: Database session
            user_id: User ID to export

        Returns:
            Path to exported file
        """
        try:
            export_data = {
                "exported_at": datetime.now().isoformat(),
                "user_id": user_id,
                "conversations": [],
            }

            # Get user conversations
            conversations = db.query(Conversation).filter(
                Conversation.user_id == user_id
            ).all()

            for conv in conversations:
                conv_data = {
                    "id": conv.id,
                    "topic": conv.topic,
                    "difficulty": conv.difficulty,
                    "language_pair": conv.language_pair,
                    "created_at": conv.created_at.isoformat(),
                    "messages": [],
                }

                # Get messages for this conversation
                messages = db.query(Message).filter(
                    Message.conversation_id == conv.id
                ).all()

                for msg in messages:
                    conv_data["messages"].append({
                        "role": msg.role,
                        "content": msg.content,
                        "translation": msg.translation,
                        "created_at": msg.created_at.isoformat() if msg.created_at else None,
                    })

                export_data["conversations"].append(conv_data)

            # Write JSON file
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"export_user_{user_id}_{timestamp}.json"
            filepath = self.EXPORT_DIR / filename

            with open(filepath, "w", encoding="utf-8") as f:
                json.dump(export_data, f, indent=2, ensure_ascii=False)

            logger.info(f"JSON export created: {filepath}")
            return str(filepath)

        except Exception as e:
            logger.error(f"Error exporting JSON: {str(e)}")
            raise

    def export_as_csv(self, db: Session, user_id: int) -> str:
        """
        Export user data as CSV

        Args:
            db: Database session
            user_id: User ID to export

        Returns:
            Path to exported CSV file
        """
        try:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"export_user_{user_id}_{timestamp}.csv"
            filepath = self.EXPORT_DIR / filename

            # Get all messages for this user
            messages = db.query(Message).join(
                Conversation, Message.conversation_id == Conversation.id
            ).filter(
                Conversation.user_id == user_id
            ).all()

            # Write CSV file
            with open(filepath, "w", newline="", encoding="utf-8") as f:
                writer = csv.writer(f)

                # Write header
                writer.writerow([
                    "Conversation ID",
                    "Topic",
                    "Difficulty",
                    "Language Pair",
                    "Role",
                    "Message",
                    "Translation",
                    "Created At",
                ])

                # Write messages
                for msg in messages:
                    conv = db.query(Conversation).filter(
                        Conversation.id == msg.conversation_id
                    ).first()

                    writer.writerow([
                        msg.conversation_id,
                        conv.topic if conv else "",
                        conv.difficulty if conv else "",
                        conv.language_pair if conv else "",
                        msg.role,
                        msg.content,
                        msg.translation or "",
                        msg.created_at.isoformat() if msg.created_at else "",
                    ])

            logger.info(f"CSV export created: {filepath}")
            return str(filepath)

        except Exception as e:
            logger.error(f"Error exporting CSV: {str(e)}")
            raise

    def list_backups(self) -> List[Dict[str, any]]:
        """
        List all available backups

        Returns:
            List of backup file information
        """
        try:
            backups = []

            for backup_file in sorted(self.BACKUP_DIR.glob("*.json")):
                backups.append({
                    "filename": backup_file.name,
                    "path": str(backup_file),
                    "size_bytes": backup_file.stat().st_size,
                    "created_at": datetime.fromtimestamp(
                        backup_file.stat().st_mtime
                    ).isoformat(),
                })

            return backups

        except Exception as e:
            logger.error(f"Error listing backups: {str(e)}")
            return []

    def delete_backup(self, backup_name: str) -> bool:
        """
        Delete a backup file

        Args:
            backup_name: Name of backup file to delete

        Returns:
            True if deletion successful
        """
        try:
            backup_path = self.BACKUP_DIR / backup_name

            if backup_path.exists():
                backup_path.unlink()
                logger.info(f"Backup deleted: {backup_name}")
                return True
            else:
                logger.warning(f"Backup not found: {backup_name}")
                return False

        except Exception as e:
            logger.error(f"Error deleting backup: {str(e)}")
            return False

    def cleanup_old_backups(self, keep_count: int = 10) -> int:
        """
        Delete old backups, keeping only the most recent ones

        Args:
            keep_count: Number of recent backups to keep

        Returns:
            Number of backups deleted
        """
        try:
            backups = sorted(
                self.BACKUP_DIR.glob("*.json"),
                key=lambda x: x.stat().st_mtime,
                reverse=True,
            )

            deleted_count = 0

            for backup_file in backups[keep_count:]:
                backup_file.unlink()
                deleted_count += 1
                logger.info(f"Deleted old backup: {backup_file.name}")

            logger.info(f"Cleanup complete: {deleted_count} backups deleted")
            return deleted_count

        except Exception as e:
            logger.error(f"Error cleaning up backups: {str(e)}")
            return 0


# Global instance
backup_service = BackupService()
