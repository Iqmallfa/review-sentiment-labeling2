from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.auth import (
    CheckUsernameRequest,
    CheckUsernameResponse,
    LoginRequest,
    LoginResponse,
)
from app.services import auth_service

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/check-username", response_model=CheckUsernameResponse)
def check_username(payload: CheckUsernameRequest, db: Session = Depends(get_db)):
    requires_password = auth_service.check_username_exists(db, payload.username)
    return CheckUsernameResponse(requires_password=requires_password)


@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    return auth_service.login_and_create_token(db, payload.username, payload.password)