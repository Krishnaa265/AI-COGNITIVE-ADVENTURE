from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy import DateTime

from datetime import datetime

from app.database.db import Base


class RecallSession(Base):

    __tablename__ = "recall_sessions"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_email = Column(
        String
    )

    difficulty = Column(
        String
    )

    objects = Column(
        String
    )

    transcript = Column(
        String
    )

    correct_count = Column(
        Integer
    )

    score = Column(
        Integer
    )

    xp = Column(
        Integer
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )