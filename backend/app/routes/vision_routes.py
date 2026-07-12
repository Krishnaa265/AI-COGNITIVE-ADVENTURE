import os
import random

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.database.db import SessionLocal
from app.models.user import User
from app.models.vision_session import VisionSession
from app.services.vision_ai_service import evaluate_vision_challenge

router = APIRouter(prefix="/vision", tags=["Vision"])

IMAGES_DIR = os.path.join(
    os.path.dirname(__file__), "..", "static", "vision_images"
)
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}

XP_START = 10
XP_FLOOR = 2
XP_DROP  = 1


def get_xp_per_word(session_count: int) -> int:
    return max(XP_FLOOR, XP_START - (session_count * XP_DROP))


def calculate_rank(xp: int) -> str:
    if xp >= 1400: return "Archmage"
    if xp >= 900:  return "Sage"
    if xp >= 500:  return "Arcanist"
    if xp >= 250:  return "Scholar"
    if xp >= 100:  return "Acolyte"
    return "Apprentice"


class VisionScoreRequest(BaseModel):
    image_name: str
    transcript: str
    email: str
    language: str = "en"        # ← NEW: "en" or "hi"


@router.get("/image")
def get_random_image():
    if not os.path.isdir(IMAGES_DIR):
        raise HTTPException(status_code=500, detail="vision_images folder not found.")
    files = [f for f in os.listdir(IMAGES_DIR)
             if os.path.splitext(f)[1].lower() in ALLOWED_EXTENSIONS]
    if not files:
        raise HTTPException(status_code=404, detail="No images found.")
    chosen = random.choice(files)
    return {"image_name": chosen, "image_url": f"/static/vision_images/{chosen}"}


@router.get("/xp-rate/{email}")
def get_xp_rate(email: str):
    db = SessionLocal()
    session_count = db.query(VisionSession).filter(VisionSession.user_email == email).count()
    db.close()
    rate = get_xp_per_word(session_count)
    return {
        "sessions_completed": session_count,
        "xp_per_word": rate,
        "next_rate": max(XP_FLOOR, rate - XP_DROP) if rate > XP_FLOOR else XP_FLOOR
    }


@router.post("/score")
def score_vision(data: VisionScoreRequest):
    image_path = os.path.join(IMAGES_DIR, data.image_name)
    if not os.path.isfile(image_path):
        raise HTTPException(status_code=404, detail=f"Image '{data.image_name}' not found.")

    db = SessionLocal()
    session_count = db.query(VisionSession).filter(VisionSession.user_email == data.email).count()
    xp_per_word   = get_xp_per_word(session_count)

    # Pass language to Gemini evaluator
    lang = "hi" if data.language == "hi-IN" else "en"
    try:
        result = evaluate_vision_challenge(image_path, data.transcript, language=lang)
    except Exception as e:
        db.close()
        import traceback; traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Gemini evaluation failed: {str(e)}")

    score         = max(0, min(100, result.get("score", 0)))
    correct_words = result.get("correct_words", [])
    wrong_words   = result.get("wrong_words",   [])
    all_objects   = result.get("all_objects",   [])
    feedback      = result.get("feedback",      "")
    correct_count = len(correct_words)
    wrong_count   = len(wrong_words)
    xp            = correct_count * xp_per_word

    user = db.query(User).filter(User.email == data.email).first()
    updated_xp, updated_rank = 0, "Apprentice"
    if user:
        user.xp             += xp
        user.total_sessions += 1
        user.rank            = calculate_rank(user.xp)
        updated_xp           = user.xp
        updated_rank         = user.rank

    session = VisionSession(
        user_email      = data.email,
        image_name      = data.image_name,
        transcript      = data.transcript,
        correct_words   = ",".join(correct_words),
        wrong_words     = ",".join(wrong_words),
        correct_count   = correct_count,
        wrong_count     = wrong_count,
        score           = score,
        xp              = xp,
        xp_per_word     = xp_per_word,
        session_number  = session_count + 1,
        gemini_feedback = feedback,
    )
    db.add(session)
    db.commit()
    db.close()

    return {
        "score": score, "xp": xp, "xp_per_word": xp_per_word,
        "correct_words": correct_words, "wrong_words": wrong_words,
        "all_objects": all_objects, "correct_count": correct_count,
        "wrong_count": wrong_count, "feedback": feedback,
        "user_xp": updated_xp, "user_rank": updated_rank,
        "session_number": session_count + 1,
    }
