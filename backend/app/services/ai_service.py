"""
AI Service
Handles integration with OpenAI API for conversation generation
"""

from typing import List, Dict, Optional
import logging
from app.core.config import settings
from app.services.prompt_service import PromptService

logger = logging.getLogger(__name__)

# Check if OpenAI is available
try:
    from openai import OpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False
    logger.warning("OpenAI library not installed. Install with: pip install openai")


class AIService:
    """Service for AI-powered conversation responses"""

    def __init__(self):
        """Initialize AI service with OpenAI client"""
        self.api_key = settings.OPENAI_API_KEY
        self.available = OPENAI_AVAILABLE and bool(self.api_key)

        if self.available:
            try:
                self.client = OpenAI(api_key=self.api_key)
                logger.info("OpenAI client initialized successfully")
            except Exception as e:
                logger.error(f"Failed to initialize OpenAI client: {str(e)}")
                self.available = False
        else:
            if not OPENAI_AVAILABLE:
                logger.warning("OpenAI library not available")
            if not self.api_key:
                logger.warning("OPENAI_API_KEY not configured")

    def generate_response(
        self,
        conversation_history: List[Dict[str, str]],
        language: str,
        difficulty: str,
        topic: str = "daily",
        max_tokens: int = 150,
    ) -> Optional[str]:
        """
        Generate an AI response based on conversation context

        Args:
            conversation_history: List of messages with 'role' and 'content'
            language: Language code (e.g., 'en', 'ja', 'zh')
            difficulty: Difficulty level ('beginner', 'intermediate', 'advanced')
            topic: Conversation topic
            max_tokens: Maximum tokens in response

        Returns:
            Generated response text, or None if API call fails
        """
        if not self.available:
            logger.warning("OpenAI API not available, returning placeholder response")
            return self._get_placeholder_response(language, difficulty)

        try:
            # Get system prompt for this language and difficulty
            system_prompt = PromptService.get_system_prompt(language, difficulty, topic)

            # Make API call to OpenAI
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",  # or "gpt-4" for better quality
                messages=[
                    {"role": "system", "content": system_prompt},
                    *conversation_history,  # Include conversation history
                ],
                temperature=0.7,  # Balanced creativity and consistency
                max_tokens=max_tokens,
                top_p=0.9,
            )

            # Extract response text
            ai_response = response.choices[0].message.content.strip()
            logger.info(f"Generated response for {language} ({difficulty}): {len(ai_response)} chars")
            return ai_response

        except Exception as e:
            logger.error(f"Error generating response: {str(e)}")
            return self._get_placeholder_response(language, difficulty)

    def generate_translation(
        self,
        text: str,
        source_language: str,
        target_language: str,
    ) -> Optional[str]:
        """
        Translate text to another language

        Args:
            text: Text to translate
            source_language: Source language code
            target_language: Target language code

        Returns:
            Translated text, or None if translation fails
        """
        if not self.available:
            logger.warning("Translation API not available")
            return None

        try:
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {
                        "role": "system",
                        "content": f"Translate the following text from {source_language} to {target_language}. "
                        "Provide only the translation, no explanations.",
                    },
                    {"role": "user", "content": text},
                ],
                temperature=0.3,  # Lower temperature for more consistent translations
                max_tokens=100,
            )

            translation = response.choices[0].message.content.strip()
            logger.info(f"Translated: {source_language} → {target_language}")
            return translation

        except Exception as e:
            logger.error(f"Error translating text: {str(e)}")
            return None

    def provide_grammar_feedback(
        self,
        user_text: str,
        language: str,
        difficulty: str,
    ) -> Optional[Dict[str, any]]:
        """
        Provide grammar feedback and corrections

        Args:
            user_text: User's text to analyze
            language: Language code
            difficulty: Difficulty level

        Returns:
            Dictionary with corrections and explanations, or None if API call fails
        """
        if not self.available:
            logger.warning("Grammar feedback API not available")
            return None

        try:
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {
                        "role": "system",
                        "content": f"You are a {language} grammar teacher for {difficulty} level students. "
                        "Analyze the following text and provide grammar feedback. "
                        "Respond in JSON format: {\"is_correct\": bool, \"corrections\": [], \"explanations\": []}",
                    },
                    {"role": "user", "content": user_text},
                ],
                temperature=0.3,
                max_tokens=200,
            )

            feedback_text = response.choices[0].message.content.strip()

            # Try to parse JSON response
            try:
                import json
                feedback = json.loads(feedback_text)
                logger.info(f"Grammar feedback provided for {language}")
                return feedback
            except json.JSONDecodeError:
                logger.warning("Could not parse grammar feedback as JSON")
                return None

        except Exception as e:
            logger.error(f"Error providing grammar feedback: {str(e)}")
            return None

    def analyze_pronunciation(
        self,
        transcribed_text: str,
        reference_text: str,
        language: str,
    ) -> Optional[Dict[str, any]]:
        """
        Analyze pronunciation by comparing transcribed text with reference

        Args:
            transcribed_text: What speech recognition captured
            reference_text: What the user should have said
            language: Language code

        Returns:
            Dictionary with pronunciation score and feedback
        """
        if not self.available:
            logger.warning("Pronunciation analysis API not available")
            return None

        try:
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {
                        "role": "system",
                        "content": f"You are a {language} pronunciation teacher. "
                        "Compare the transcribed text with the reference text. "
                        "Provide pronunciation feedback in JSON format: "
                        "{\"score\": 0-100, \"issues\": [], \"suggestions\": []}",
                    },
                    {
                        "role": "user",
                        "content": f"Reference: '{reference_text}'\nTranscribed: '{transcribed_text}'",
                    },
                ],
                temperature=0.3,
                max_tokens=200,
            )

            feedback_text = response.choices[0].message.content.strip()

            # Try to parse JSON response
            try:
                import json
                feedback = json.loads(feedback_text)
                logger.info(f"Pronunciation analysis provided for {language}")
                return feedback
            except json.JSONDecodeError:
                logger.warning("Could not parse pronunciation feedback as JSON")
                return None

        except Exception as e:
            logger.error(f"Error analyzing pronunciation: {str(e)}")
            return None

    @staticmethod
    def _get_placeholder_response(language: str, difficulty: str) -> str:
        """
        Get a placeholder response when API is not available

        Args:
            language: Language code
            difficulty: Difficulty level

        Returns:
            Placeholder response text
        """
        placeholders = {
            "en": {
                "beginner": "That's great! Can you tell me more about that?",
                "intermediate": "That's an interesting point. Could you elaborate on that?",
                "advanced": "That's a fascinating perspective. How do you reconcile that with...?",
            },
            "ja": {
                "beginner": "いいですね！もっと教えてください。",
                "intermediate": "興味深いですね。詳しく説明していただけますか？",
                "advanced": "素晴らしい視点ですね。しかし、それは...と矛盾しませんか？",
            },
            "zh": {
                "beginner": "很好！请告诉我更多。",
                "intermediate": "有趣的观点。能详细说明吗？",
                "advanced": "很有见地。但这与...不矛盾吗？",
            },
            "es": {
                "beginner": "¡Qué bien! Cuéntame más al respecto.",
                "intermediate": "Eso es interesante. ¿Podrías elaborar?",
                "advanced": "Excelente perspectiva. ¿Pero no contradice...?",
            },
            "fr": {
                "beginner": "C'est très bien! Dis-moi plus.",
                "intermediate": "C'est intéressant. Peux-tu élaborer?",
                "advanced": "Excellente perspective. Mais cela ne contredit-il pas...?",
            },
        }

        lang_placeholders = placeholders.get(language, placeholders["en"])
        return lang_placeholders.get(difficulty, lang_placeholders["beginner"])


# Global instance
ai_service = AIService()
