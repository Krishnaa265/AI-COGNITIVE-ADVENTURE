from fastapi import APIRouter

router = APIRouter()


@router.get("/health")
def health_check():
    return {
        "status": "healthy",
        "message": "Backend is running successfully"
    }


@router.get("/welcome")
def welcome():
    return {
        "message": "Welcome to AI Cognitive Adventure"
    }