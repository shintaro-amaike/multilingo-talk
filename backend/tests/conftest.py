"""
Pytest configuration and fixtures for backend tests
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

import sys
from pathlib import Path

# Add app to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.main import app
from app.database.base import Base
from app.database.session import get_db


# Use in-memory SQLite for testing
SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///:memory:"


@pytest.fixture(scope="function")
def test_db():
    """Create a fresh database for each test"""
    engine = create_engine(
        SQLALCHEMY_TEST_DATABASE_URL,
        connect_args={"check_same_thread": False},
    )

    # Create all tables
    Base.metadata.create_all(bind=engine)

    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db

    yield TestingSessionLocal()

    # Cleanup
    Base.metadata.drop_all(bind=engine)
    app.dependency_overrides.clear()


@pytest.fixture
def client(test_db):
    """Create a test client"""
    return TestClient(app)


@pytest.fixture
def test_user_data():
    """Sample user data for testing"""
    return {
        "username": "testuser",
        "native_language": "ja",
    }


@pytest.fixture
def test_conversation_data():
    """Sample conversation data for testing"""
    return {
        "topic": "日常会話",
        "difficulty": "intermediate",
        "language_pair": "en-ja",
    }


@pytest.fixture
def test_message_data():
    """Sample message data for testing"""
    return {
        "role": "user",
        "content": "Hello, how are you?",
        "language": "en",
    }


@pytest.fixture
def test_settings_data():
    """Sample settings data for testing"""
    return {
        "darkMode": True,
        "soundEnabled": True,
        "autoTranslate": False,
        "volume": 80,
        "playbackSpeed": 1.0,
    }
