from fastapi import APIRouter
from pydantic import BaseModel
import re

from app.models.user import User
from app.models.fluency_session import FluencySession
from app.database.db import SessionLocal
from app.data.fluency_categories import categories

router = APIRouter(prefix="/fluency", tags=["Fluency"])


def calculate_rank(xp):
    if xp >= 1400: return "Archmage"
    if xp >= 900:  return "Sage"
    if xp >= 500:  return "Arcanist"
    if xp >= 250:  return "Scholar"
    if xp >= 100:  return "Acolyte"
    return "Apprentice"


class FluencyRequest(BaseModel):
    transcript: str
    email: str
    language: str
    category: str


@router.post("/score")
def score_fluency(data: FluencyRequest):
    db = SessionLocal()
    try:
        # ── Tokenise ────────────────────────────────────────────
        # For Hindi use unicode word chars; for English standard \w+
        is_hindi = data.language in ("hi-IN", "hi", "hindi")

        if is_hindi:
            # split on spaces/punctuation, keep Devanagari + latin
            raw_words = [w.strip() for w in re.split(r'[\s,।\.!?]+', data.transcript) if w.strip()]
        else:
            raw_words = re.findall(r"[a-zA-Z']+", data.transcript.lower())

        word_count   = len(raw_words)
        unique_set   = set(w.lower() if not is_hindi else w for w in raw_words)
        unique_count = len(unique_set)
        repetitions  = word_count - unique_count

        # ── Category lookup (O(1) set membership) ───────────────
        lang_key     = "hindi" if is_hindi else "english"
        cat_data     = categories.get(data.category, {})
        valid_set    = cat_data.get(lang_key, set())

        valid_words   = []
        invalid_words = []

        for word in unique_set:
            lookup = word if is_hindi else word.lower()
            if lookup in valid_set:
                valid_words.append(word)
            else:
                invalid_words.append(word)

        category_matches = len(valid_words)

        # ── Score ────────────────────────────────────────────────
        # unique correct × 8 + small bonus for volume, cap 100
        fluency_score = min(100, category_matches * 8 + min(unique_count, 10) * 2)

        # ── XP ───────────────────────────────────────────────────
        xp_earned = max(1, fluency_score // 2)

        # ── Update user ──────────────────────────────────────────
        user = db.query(User).filter(User.email == data.email).first()
        updated_xp, updated_rank = 0, "Apprentice"
        if user:
            user.xp             = (user.xp or 0) + xp_earned
            user.total_sessions = (user.total_sessions or 0) + 1
            user.rank           = calculate_rank(user.xp)
            updated_xp          = user.xp
            updated_rank        = user.rank
            db.add(user)

        # ── Save session ─────────────────────────────────────────
        session = FluencySession(
            user_email = data.email,
            category   = data.category,
            language   = data.language,
            transcript = data.transcript,
            score      = fluency_score,
            xp         = xp_earned,
        )
        db.add(session)
        db.commit()

        return {
            "word_count":       word_count,
            "unique_words":     unique_count,
            "repetitions":      repetitions,
            "category_matches": category_matches,
            "valid_words":      valid_words,
            "invalid_words":    invalid_words,
            "fluency_score":    fluency_score,
            "xp_earned":        xp_earned,
            "xp":               xp_earned,        # alias so frontend xp banner works
            "user_xp":          updated_xp,
            "user_rank":        updated_rank,
            "ai_used":          False,
        }

    except Exception as e:
        db.rollback()
        print("Fluency score error:", e)
        import traceback; traceback.print_exc()
        return {"error": str(e)}
    finally:
        db.close()
