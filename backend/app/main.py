import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.database.db import Base, engine
from app.models.fluency_session  import FluencySession   # noqa — needed for create_all
from app.models.recall_session   import RecallSession
from app.models.detective_session import DetectiveSession
from app.models.vision_session   import VisionSession

from app.routes.auth_routes      import router as auth_router
from app.routes.fluency_routes   import router as fluency_router
from app.routes.history_routes   import router as history_router
from app.routes.recall_routes    import router as recall_router
from app.routes.detective_routes import router as detective_router
from app.routes.report_routes    import router as report_router
from app.routes.pdf_report_routes import router as pdf_report_router
from app.routes.vision_routes    import router as vision_router
from app.routes.test_routes      import router as test_router

app = FastAPI(
    title="AI Cognitive Adventure",
    description="Gamified cognitive assessment platform for rehabilitation centres",
    version="1.0.0",
)

# ── Create tables ──────────────────────────────────────────────
Base.metadata.create_all(bind=engine)

# ── CORS — tighten in production by replacing "*" with your domain
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Static files (vision images) ──────────────────────────────
STATIC_DIR = os.path.join(os.path.dirname(__file__), "static")
os.makedirs(os.path.join(STATIC_DIR, "vision_images"), exist_ok=True)
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

# ── Routers ───────────────────────────────────────────────────
app.include_router(test_router)
app.include_router(auth_router)
app.include_router(recall_router)
app.include_router(fluency_router)
app.include_router(detective_router)
app.include_router(vision_router)
app.include_router(history_router)   # history AFTER challenge routers
app.include_router(report_router)
app.include_router(pdf_report_router)


@app.get("/")
def home():
    return {"message": "The realm awaits. Begin your cognitive adventure."}


@app.get("/health")
def health():
    return {"status": "ok"}
