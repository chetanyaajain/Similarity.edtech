from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.rate_limit import limiter
from app.core.security import create_access_token, hash_password, verify_password
from app.db.session import get_db
from app.models.models import User
from app.schemas.auth import LoginRequest, SignUpRequest, TokenResponse

router = APIRouter()


@router.post("/signup", response_model=TokenResponse)
@limiter.limit("10/minute")
def signup(request: Request, payload: SignUpRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")

    user = User(
        full_name=payload.full_name,
        email=payload.email,
        password_hash=hash_password(payload.password),
        preferred_language=payload.preferred_language,
    )
    db.add(user)
    db.commit()
    return TokenResponse(access_token=create_access_token(user.email))


@router.post("/login", response_model=TokenResponse)
@limiter.limit("20/minute")
def login(request: Request, payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return TokenResponse(access_token=create_access_token(user.email))


@router.get("/me")
def me(user: User = Depends(get_current_user)):
    return {
        "id": user.id,
        "fullName": user.full_name,
        "email": user.email,
        "role": user.role,
        "preferredLanguage": user.preferred_language,
    }
