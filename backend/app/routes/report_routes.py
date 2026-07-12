from fastapi import APIRouter
from app.database.db import SessionLocal
from app.models.fluency_session   import FluencySession
from app.models.recall_session    import RecallSession
from app.models.detective_session import DetectiveSession
from app.models.vision_session    import VisionSession
from app.services.gemini_service  import generate_cognitive_report

router = APIRouter(prefix="/report", tags=["Report"])


def _avg(lst):
    return round(sum(lst) / len(lst), 2) if lst else 0


def generate_algorithm_report(memory, language, reasoning, chi):
    """Pure-Python fallback — no AI needed."""
    def grade(s):
        if s >= 80: return "excellent"
        if s >= 60: return "good"
        if s >= 40: return "moderate"
        return "needs improvement"

    scores   = {"Memory": memory, "Language": language, "Reasoning": reasoning}
    strength = max(scores, key=scores.get)
    weakness = min(scores, key=scores.get)

    suggestions = []
    if memory    < 70: suggestions.append("Daily object recall exercises")
    if language  < 70: suggestions.append("Category-based verbal fluency practice")
    if reasoning < 70: suggestions.append("Story comprehension and logic puzzles")
    if not suggestions: suggestions.append("Maintain current cognitive training routine")

    return {
        "memory_analysis":     f"Short-term memory performance is {grade(memory)}.",
        "language_analysis":   f"Verbal fluency and vocabulary retrieval is {grade(language)}.",
        "reasoning_analysis":  f"Logical reasoning and comprehension is {grade(reasoning)}.",
        "strengths":           f"Best performance in {strength}.",
        "weaknesses":          f"Lowest performance in {weakness} — focus recommended here.",
        "suggested_exercises": ", ".join(suggestions),
    }


@router.get("/{email}")
def report(email: str):
    db = SessionLocal()
    try:
        fl = db.query(FluencySession).filter(FluencySession.user_email    == email).all()
        rc = db.query(RecallSession).filter(RecallSession.user_email       == email).all()
        dt = db.query(DetectiveSession).filter(DetectiveSession.user_email == email).all()
        vi = db.query(VisionSession).filter(VisionSession.user_email       == email).all()

        memory    = _avg([s.score   for s in rc])
        language  = _avg([s.score   for s in fl])
        reasoning = _avg([s.overall for s in dt])
        vision    = _avg([s.score   for s in vi])

        domain_avgs = [x for x in [memory, language, reasoning, vision] if x > 0]
        chi = round(sum(domain_avgs) / len(domain_avgs), 2) if domain_avgs else 0

        try:
            data = generate_cognitive_report(memory, language, reasoning, chi)
        except Exception as e:
            print("AI report fallback:", e)
            data = generate_algorithm_report(memory, language, reasoning, chi)

        return {"memory": memory, "language": language,
                "reasoning": reasoning, "vision": vision,
                "chi": chi, **data}
    finally:
        db.close()
