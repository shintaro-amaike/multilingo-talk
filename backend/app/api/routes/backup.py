"""
Backup and Export Routes
Handles data backup, restore, and export functionality
"""

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel
from pathlib import Path
from typing import List
import logging
from app.database.session import get_db
from app.services.backup_service import backup_service

router = APIRouter(prefix="/backup", tags=["backup"])
logger = logging.getLogger(__name__)


# Request/Response models
class BackupInfo(BaseModel):
    filename: str
    path: str
    size_bytes: int
    created_at: str


class BackupResponse(BaseModel):
    success: bool
    data: dict


@router.post("/create")
async def create_backup(
    backup_name: str = None,
    db: Session = Depends(get_db),
):
    """
    Create a backup of the database

    Query params:
    - backup_name: Optional custom backup name

    Returns:
    {
        "success": true,
        "data": {
            "path": "backups/backup_20251129_120000.json",
            "timestamp": "2025-11-29T12:00:00"
        }
    }
    """
    try:
        backup_path = backup_service.create_backup(db, backup_name)

        logger.info(f"Backup created: {backup_path}")

        return {
            "success": True,
            "data": {
                "path": backup_path,
                "timestamp": datetime.now().isoformat(),
            },
        }

    except Exception as e:
        logger.error(f"Error creating backup: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create backup")


@router.get("/list")
async def list_backups():
    """
    List all available backups

    Returns:
    {
        "success": true,
        "data": {
            "backups": [
                {
                    "filename": "backup_20251129_120000.json",
                    "path": "...",
                    "size_bytes": 12345,
                    "created_at": "2025-11-29T12:00:00"
                }
            ]
        }
    }
    """
    try:
        backups = backup_service.list_backups()

        logger.info(f"Listed {len(backups)} backups")

        return {
            "success": True,
            "data": {
                "backups": backups,
                "total": len(backups),
            },
        }

    except Exception as e:
        logger.error(f"Error listing backups: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to list backups")


@router.post("/restore")
async def restore_backup(
    backup_filename: str,
    db: Session = Depends(get_db),
):
    """
    Restore database from backup

    Query params:
    - backup_filename: Filename of backup to restore

    Returns:
    {
        "success": true,
        "data": {
            "restored": {
                "users": 5,
                "conversations": 15,
                "messages": 240,
                "settings": 10
            }
        }
    }
    """
    try:
        backup_path = f"backups/{backup_filename}"

        if not Path(backup_path).exists():
            raise HTTPException(status_code=404, detail="Backup file not found")

        restored_counts = backup_service.restore_backup(db, backup_path)

        logger.info(f"Backup restored: {backup_path}")

        return {
            "success": True,
            "data": {
                "restored": restored_counts,
            },
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error restoring backup: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to restore backup")


@router.delete("/{backup_filename}")
async def delete_backup(backup_filename: str):
    """
    Delete a backup file

    Returns:
    {
        "success": true,
        "data": {"message": "Backup deleted"}
    }
    """
    try:
        success = backup_service.delete_backup(backup_filename)

        if not success:
            raise HTTPException(status_code=404, detail="Backup not found")

        logger.info(f"Backup deleted: {backup_filename}")

        return {
            "success": True,
            "data": {"message": "Backup deleted successfully"},
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting backup: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to delete backup")


@router.post("/cleanup")
async def cleanup_backups(keep_count: int = 10):
    """
    Delete old backups, keeping only the most recent ones

    Query params:
    - keep_count: Number of recent backups to keep (default: 10)

    Returns:
    {
        "success": true,
        "data": {"deleted": 5}
    }
    """
    try:
        deleted_count = backup_service.cleanup_old_backups(keep_count)

        logger.info(f"Backup cleanup: {deleted_count} deleted")

        return {
            "success": True,
            "data": {"deleted": deleted_count},
        }

    except Exception as e:
        logger.error(f"Error cleaning up backups: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to cleanup backups")


@router.get("/export/json")
async def export_json(
    user_id: int = 1,
    db: Session = Depends(get_db),
):
    """
    Export user data as JSON

    Query params:
    - user_id: User ID to export (default: 1)

    Returns:
    {
        "success": true,
        "data": {
            "file": "exports/export_user_1_20251129_120000.json",
            "format": "json"
        }
    }
    """
    try:
        filepath = backup_service.export_as_json(db, user_id)

        logger.info(f"JSON export created for user {user_id}")

        return {
            "success": True,
            "data": {
                "file": filepath,
                "format": "json",
            },
        }

    except Exception as e:
        logger.error(f"Error exporting JSON: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to export JSON")


@router.get("/export/csv")
async def export_csv(
    user_id: int = 1,
    db: Session = Depends(get_db),
):
    """
    Export user data as CSV

    Query params:
    - user_id: User ID to export (default: 1)

    Returns:
    {
        "success": true,
        "data": {
            "file": "exports/export_user_1_20251129_120000.csv",
            "format": "csv"
        }
    }
    """
    try:
        filepath = backup_service.export_as_csv(db, user_id)

        logger.info(f"CSV export created for user {user_id}")

        return {
            "success": True,
            "data": {
                "file": filepath,
                "format": "csv",
            },
        }

    except Exception as e:
        logger.error(f"Error exporting CSV: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to export CSV")


@router.get("/download/{filepath:path}")
async def download_file(filepath: str):
    """
    Download an exported file

    Args:
        filepath: Path to file to download

    Returns:
        File download response
    """
    try:
        file_path = Path(filepath)

        if not file_path.exists():
            raise HTTPException(status_code=404, detail="File not found")

        # Validate that path is within allowed directories
        allowed_dirs = [
            Path("backups").absolute(),
            Path("exports").absolute(),
        ]

        if not any(
            file_path.absolute().is_relative_to(allowed_dir)
            for allowed_dir in allowed_dirs
        ):
            raise HTTPException(status_code=403, detail="Access denied")

        return FileResponse(
            path=file_path,
            filename=file_path.name,
            media_type="application/octet-stream",
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error downloading file: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to download file")


# Add missing import
from datetime import datetime
