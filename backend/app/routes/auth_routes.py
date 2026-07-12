from fastapi import APIRouter
from fastapi import HTTPException
from fastapi import Depends

from sqlalchemy.orm import Session

from passlib.context import CryptContext

from app.schemas.user import UserCreate
from app.schemas.user import UserLogin

from app.models.user import User

from app.database.db import SessionLocal

router = APIRouter(prefix="/auth")

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)

# ADD THIS HERE
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# REGISTER ROUTE BELOW
@router.post("/register")

def register(user: UserCreate, db: Session = Depends(get_db)):

    existing_user = db.query(User).filter(
        User.email == user.email
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    hashed_password = pwd_context.hash(user.password)

    new_user = User(
        username=user.username,
        email=user.email,
        password=hashed_password
    )

    db.add(new_user)
    db.commit()

    return {
        "message": "User registered successfully"
    }
@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):

    existing_user = db.query(User).filter(
        User.email == user.email
    ).first()

    if not existing_user:
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials"
        )

    valid = pwd_context.verify(
        user.password,
        existing_user.password
    )

    if not valid:
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials"
        )

    return {
        "message": "Login successful",
        "username": existing_user.username,
        "xp": existing_user.xp,
        "rank": existing_user.rank
    }
@router.get("/profile/{email}")
def profile(email: str, db: Session = Depends(get_db)):

    user = db.query(User).filter(
        User.email == email
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return {
        "username": user.username,
        "email": user.email,
        "xp": user.xp,
        "rank": user.rank,
        "language": user.preferred_language,
        "chi": user.cognitive_health_index,
        "sessions": user.total_sessions
    }