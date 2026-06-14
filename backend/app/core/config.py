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

    # CORS - Configure for production
    CORS_ORIGINS: list = os.getenv("CORS_ORIGINS", "*").split(",") if os.getenv("CORS_ORIGINS") else ["http://localhost:5173", "http://localhost:3000"]

    # Security
    # WARNING: Must set SECRET_KEY environment variable in production
    SECRET_KEY: str = os.getenv("SECRET_KEY", "dev-secret-key-DO-NOT-USE-IN-PRODUCTION-CHANGE-THIS")
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
