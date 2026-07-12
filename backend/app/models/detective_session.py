from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy import DateTime

from datetime import datetime

from app.database.db import Base


class DetectiveSession(Base):

    __tablename__ = "detective_sessions"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_email = Column(
        String
    )

    memory = Column(
        Integer
    )

    attention = Column(
        Integer
    )

    reasoning = Column(
        Integer
    )

    language = Column(
        Integer
    )

    overall = Column(
        Integer
    )

    xp = Column(
        Integer
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )