from pydantic_settings import BaseSettings
import os

class Settings(BaseSettings):
    """Application settings"""

    # API
    API_TITLE: str = "MultiLingo Talk API"
    API_VERSION: str = "0.1.0"
    API_DESCRIPTION: str = "A multilingual voice conversation practice application"

    # Database
    DATABASE_URL: str = "sqlite:///./multilingo_talk.db"

    # CORS
    CORS_ORIGINS: list = ["*"]

    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # External APIs
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    GOOGLE_CLOUD_KEY: str = os.getenv("GOOGLE_CLOUD_KEY", "")

    # Logging
    LOG_LEVEL: str = "INFO"

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
