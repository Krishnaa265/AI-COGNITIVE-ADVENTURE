from fastapi import APIRouter
from pydantic import BaseModel
import re

from app.models.user import User
from app.models.recall_session import RecallSession
from app.database.db import SessionLocal

router = APIRouter(prefix="/recall", tags=["Recall"])

RANK_TABLE = [
    (1400, "Archmage"), (900, "Sage"), (500, "Arcanist"),
    (250, "Scholar"),   (100, "Acolyte"), (0, "Apprentice"),
]

def calculate_rank(xp: int) -> str:
    for threshold, rank in RANK_TABLE:
        if xp >= threshold:
            return rank
    return "Apprentice"


class RecallRequest(BaseModel):
    objects:    list[str]
    transcript: str
    email:      str
    difficulty: str


@router.post("/score")
def score_recall(data: RecallRequest):
    db = SessionLocal()
    try:
        # Extract unique spoken words
        spoken_words = set(re.findall(r"[a-zA-Z]+", data.transcript.lower()))
        original_words = {w.lower() for w in data.objects}

        correct_words = sorted([w for w in original_words if w in spoken_words])
        missed_words  = sorted([w for w in original_words if w not in spoken_words])
        correct_count = len(correct_words)
        total_objects = len(original_words)

        # Score: base accuracy + difficulty bonus
        base_score = int((correct_count / total_objects) * 100) if total_objects else 0
        bonus = {"Easy": 0, "Medium": 10, "Hard": 20}.get(data.difficulty, 0)
        score = min(100, base_score + bonus)
        xp    = max(1, score // 2)

        # Update user
        user = db.query(User).filter(User.email == data.email).first()
        updated_xp, updated_rank = 0, "Apprentice"
        if user:
            user.xp             = (user.xp or 0) + xp
            user.total_sessions = (user.total_sessions or 0) + 1
            user.rank           = calculate_rank(user.xp)
            updated_xp          = user.xp
            updated_rank        = user.rank

        session = RecallSession(
            user_email    = data.email,
            difficulty    = data.difficulty,
            objects       = ",".join(data.objects),
            transcript    = data.transcript,
            correct_count = correct_count,
            score         = score,
            xp            = xp,
        )
        db.add(session)
        db.commit()

        return {
            "correct_count": correct_count,
            "correct_words": correct_words,
            "missed_words":  missed_words,
            "score":         score,
            "xp":            xp,
            "user_xp":       updated_xp,
            "user_rank":     updated_rank,
        }
    except Exception as e:
        db.rollback()
        import traceback; traceback.print_exc()
        raise
    finally:
        db.close()
