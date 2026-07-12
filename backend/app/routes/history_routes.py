from fastapi import APIRouter
from app.database.db import SessionLocal
from app.models.fluency_session  import FluencySession
from app.models.recall_session   import RecallSession
from app.models.detective_session import DetectiveSession
from app.models.vision_session   import VisionSession

router = APIRouter(prefix="/history", tags=["History"])


def _safe_avg(values):
    return round(sum(values) / len(values), 2) if values else 0


# ── IMPORTANT: specific routes MUST come before /{email} ──────
@router.get("/stats/{email}")
def get_stats(email: str):
    db = SessionLocal()
    try:
        fl = db.query(FluencySession).filter(FluencySession.user_email   == email).all()
        rc = db.query(RecallSession).filter(RecallSession.user_email      == email).all()
        dt = db.query(DetectiveSession).filter(DetectiveSession.user_email == email).all()
        vi = db.query(VisionSession).filter(VisionSession.user_email       == email).all()

        fluency_avg   = _safe_avg([s.score   for s in fl])
        recall_avg    = _safe_avg([s.score   for s in rc])
        detective_avg = _safe_avg([s.overall for s in dt])
        vision_avg    = _safe_avg([s.score   for s in vi])

        all_scores = (
            [s.score   for s in fl] + [s.score   for s in rc] +
            [s.overall for s in dt] + [s.score   for s in vi]
        )

        # CHI = weighted average across all 4 domains
        domain_avgs = [x for x in [fluency_avg, recall_avg, detective_avg, vision_avg] if x > 0]
        chi = _safe_avg(domain_avgs)

        return {
            "total_sessions": len(all_scores),
            "average_score":  _safe_avg(all_scores),
            "best_score":     max(all_scores) if all_scores else 0,
            "fluency_avg":    fluency_avg,
            "recall_avg":     recall_avg,
            "detective_avg":  detective_avg,
            "vision_avg":     vision_avg,
            "chi":            chi,
        }
    finally:
        db.close()


@router.get("/analytics/{email}")
def analytics(email: str):
    db = SessionLocal()
    try:
        fl = db.query(FluencySession).filter(FluencySession.user_email    == email).all()
        rc = db.query(RecallSession).filter(RecallSession.user_email       == email).all()
        dt = db.query(DetectiveSession).filter(DetectiveSession.user_email == email).all()
        vi = db.query(VisionSession).filter(VisionSession.user_email       == email).all()
        return {
            "fluency":   _safe_avg([s.score   for s in fl]),
            "memory":    _safe_avg([s.score   for s in rc]),
            "reasoning": _safe_avg([s.overall for s in dt]),
            "vision":    _safe_avg([s.score   for s in vi]),
        }
    finally:
        db.close()


@router.get("/{email}")
def get_history(email: str):
    db = SessionLocal()
    try:
        fl = db.query(FluencySession).filter(FluencySession.user_email    == email).order_by(FluencySession.created_at.desc()).all()
        rc = db.query(RecallSession).filter(RecallSession.user_email       == email).order_by(RecallSession.created_at.desc()).all()
        dt = db.query(DetectiveSession).filter(DetectiveSession.user_email == email).order_by(DetectiveSession.created_at.desc()).all()
        vi = db.query(VisionSession).filter(VisionSession.user_email       == email).order_by(VisionSession.created_at.desc()).all()

        result = []
        for s in fl: result.append({"id":f"F-{s.id}","type":"Fluency",   "score":s.score,   "xp":s.xp, "created_at":s.created_at})
        for s in rc: result.append({"id":f"R-{s.id}","type":"Recall",    "score":s.score,   "xp":s.xp, "created_at":s.created_at})
        for s in dt: result.append({"id":f"D-{s.id}","type":"Detective", "score":s.overall, "xp":s.xp, "created_at":s.created_at})
        for s in vi: result.append({"id":f"V-{s.id}","type":"Vision",    "score":s.score,   "xp":s.xp, "created_at":s.created_at})

        result.sort(key=lambda x: x["created_at"], reverse=True)
        return result
    finally:
        db.close()
