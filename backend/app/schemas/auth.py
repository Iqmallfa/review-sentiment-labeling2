from pydantic import BaseModel
from typing import Optional


class CheckUsernameRequest(BaseModel):
    username: str


class CheckUsernameResponse(BaseModel):
    requires_password: bool


class LoginRequest(BaseModel):
    username: str
    password: Optional[str] = None


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str