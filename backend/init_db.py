"""Initialize database with tables"""

from app.database.base import Base
from app.database.session import engine
from app.models import User, Conversation, Message, Setting, Flashcard

def init_db():
    """Create all tables"""
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully!")

if __name__ == "__main__":
    init_db()
