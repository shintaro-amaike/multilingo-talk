"""
Language Configuration
Top 10 most spoken languages by number of speakers
"""

from typing import Dict, List

LANGUAGES: Dict[str, Dict[str, any]] = {
    "en": {
        "code": "en",
        "name": "English",
        "native_name": "English",
        "speech_recognition_code": "en-US",
        "text_to_speech_code": "en-US",
        "speakers": 1500,
    },
    "zh": {
        "code": "zh",
        "name": "Mandarin Chinese",
        "native_name": "中文 (普通话)",
        "speech_recognition_code": "zh-CN",
        "text_to_speech_code": "zh-CN",
        "speakers": 1120,
    },
    "hi": {
        "code": "hi",
        "name": "Hindi",
        "native_name": "हिन्दी",
        "speech_recognition_code": "hi-IN",
        "text_to_speech_code": "hi-IN",
        "speakers": 637,
    },
    "es": {
        "code": "es",
        "name": "Spanish",
        "native_name": "Español",
        "speech_recognition_code": "es-ES",
        "text_to_speech_code": "es-ES",
        "speakers": 559,
    },
    "fr": {
        "code": "fr",
        "name": "French",
        "native_name": "Français",
        "speech_recognition_code": "fr-FR",
        "text_to_speech_code": "fr-FR",
        "speakers": 280,
    },
    "ar": {
        "code": "ar",
        "name": "Arabic",
        "native_name": "العربية",
        "speech_recognition_code": "ar-SA",
        "text_to_speech_code": "ar-SA",
        "speakers": 375,
    },
    "pt": {
        "code": "pt",
        "name": "Portuguese",
        "native_name": "Português",
        "speech_recognition_code": "pt-BR",
        "text_to_speech_code": "pt-BR",
        "speakers": 264,
    },
    "ru": {
        "code": "ru",
        "name": "Russian",
        "native_name": "Русский",
        "speech_recognition_code": "ru-RU",
        "text_to_speech_code": "ru-RU",
        "speakers": 258,
    },
    "ja": {
        "code": "ja",
        "name": "Japanese",
        "native_name": "日本語",
        "speech_recognition_code": "ja-JP",
        "text_to_speech_code": "ja-JP",
        "speakers": 125,
    },
    "ko": {
        "code": "ko",
        "name": "Korean",
        "native_name": "한국어",
        "speech_recognition_code": "ko-KR",
        "text_to_speech_code": "ko-KR",
        "speakers": 82,
    },
}

LANGUAGE_CODES: List[str] = list(LANGUAGES.keys())

TOPICS = {
    "daily": "Daily Conversation",
    "business": "Business",
    "travel": "Travel",
    "technology": "Technology",
    "culture": "Culture",
    "sports": "Sports",
    "food": "Food & Cuisine",
    "health": "Health",
    "education": "Education",
    "entertainment": "Entertainment",
}

DIFFICULTIES = {
    "beginner": "Beginner (A1-A2)",
    "intermediate": "Intermediate (B1-B2)",
    "advanced": "Advanced (C1-C2)",
}


def get_language(language_code: str) -> Dict[str, any]:
    """Get language configuration by code"""
    return LANGUAGES.get(language_code, LANGUAGES["en"])


def validate_language(language_code: str) -> bool:
    """Validate language code"""
    return language_code in LANGUAGE_CODES


def validate_topic(topic: str) -> bool:
    """Validate topic"""
    return topic in TOPICS


def validate_difficulty(difficulty: str) -> bool:
    """Validate difficulty level"""
    return difficulty in DIFFICULTIES
