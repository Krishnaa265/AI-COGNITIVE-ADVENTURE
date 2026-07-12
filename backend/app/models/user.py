from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import String

from app.database.db import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    username = Column(String, unique=True)

    email = Column(String, unique=True)

    password = Column(String)

    xp = Column(Integer, default=0)

    rank = Column(String, default="Explorer")

    preferred_language = Column(
        String,
        default="English"
    )

    cognitive_health_index = Column(
        Integer,
        default=50
    )

    total_sessions = Column(
        Integer,
        default=0
    )