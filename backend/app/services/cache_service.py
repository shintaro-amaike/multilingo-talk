"""
Cache Service
Handles caching of TTS and speech recognition results
"""

import hashlib
import json
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any
import logging

logger = logging.getLogger(__name__)


class CacheItem:
    """Cache item with TTL"""

    def __init__(self, data: Any, ttl_seconds: int = 604800):  # 7 days default
        self.data = data
        self.created_at = datetime.now(timezone.utc)
        self.ttl = ttl_seconds

    def is_expired(self) -> bool:
        """Check if cache item has expired"""
        expiry_time = self.created_at + timedelta(seconds=self.ttl)
        return datetime.now(timezone.utc) > expiry_time


class CacheService:
    """Simple in-memory cache service"""

    def __init__(self):
        self._cache: Dict[str, CacheItem] = {}

    def _generate_key(self, **kwargs) -> str:
        """Generate cache key from kwargs"""
        key_str = json.dumps(kwargs, sort_keys=True)
        return hashlib.md5(key_str.encode()).hexdigest()

    def get_tts_cache_key(self, text: str, language: str, voice_id: Optional[str] = None) -> str:
        """Generate cache key for TTS"""
        return self._generate_key(
            type="tts",
            text=text,
            language=language,
            voice_id=voice_id or "default"
        )

    def get_speech_cache_key(self, audio_hash: str, language: str) -> str:
        """Generate cache key for speech recognition"""
        return self._generate_key(
            type="speech",
            audio_hash=audio_hash,
            language=language
        )

    def get(self, key: str) -> Optional[Any]:
        """Get value from cache"""
        if key not in self._cache:
            return None

        item = self._cache[key]
        if item.is_expired():
            del self._cache[key]
            logger.info(f"Cache expired for key: {key}")
            return None

        logger.debug(f"Cache hit for key: {key}")
        return item.data

    def set(self, key: str, data: Any, ttl_seconds: int = 604800) -> None:
        """Set value in cache"""
        self._cache[key] = CacheItem(data, ttl_seconds)
        logger.debug(f"Cache set for key: {key} with TTL: {ttl_seconds}s")

    def delete(self, key: str) -> None:
        """Delete cache entry"""
        if key in self._cache:
            del self._cache[key]
            logger.debug(f"Cache deleted for key: {key}")

    def clear(self) -> None:
        """Clear all cache"""
        self._cache.clear()
        logger.info("Cache cleared")

    def get_stats(self) -> Dict[str, Any]:
        """Get cache statistics"""
        active_items = 0
        expired_items = 0

        for item in self._cache.values():
            if item.is_expired():
                expired_items += 1
            else:
                active_items += 1

        return {
            "total_items": len(self._cache),
            "active_items": active_items,
            "expired_items": expired_items,
        }


# Global cache instance
cache_service = CacheService()
