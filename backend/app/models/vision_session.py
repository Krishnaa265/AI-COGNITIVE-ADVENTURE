from sqlalchemy import Column, Integer, String, DateTime, Text
from datetime import datetime
from app.database.db import Base


class VisionSession(Base):

    __tablename__ = "vision_sessions"

    id = Column(Integer, primary_key=True, index=True)

    user_email = Column(String)

    image_name = Column(String)

    transcript = Column(Text)

    correct_words = Column(Text)       # comma-joined

    wrong_words = Column(Text)         # comma-joined

    correct_count = Column(Integer)

    wrong_count = Column(Integer)

    score = Column(Integer)            # 0-100

    xp = Column(Integer)

    xp_per_word = Column(Integer, default=10)   # tracks adaptive rate used

    session_number = Column(Integer, default=1) # which session this was for the user

    gemini_feedback = Column(Text)

    created_at = Column(DateTime, default=datetime.utcnow)
