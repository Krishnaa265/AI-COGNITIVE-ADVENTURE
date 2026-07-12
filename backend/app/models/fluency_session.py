from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy import DateTime

from datetime import datetime

from app.database.db import Base

class FluencySession(Base):

    __tablename__ = "fluency_sessions"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_email = Column(
        String
    )

    category = Column(
        String
    )

    language = Column(
        String
    )

    transcript = Column(
        String
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