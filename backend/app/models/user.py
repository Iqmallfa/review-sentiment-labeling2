from sqlalchemy import Column, Integer, String, Boolean
from app.database.session import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)

    # Kosong (NULL) = user ini tidak butuh password, langsung login
    # (mengikuti pola reference: requires_password bisa false)
    hashed_password = Column(String, nullable=True)

    # "admin" atau "validator"
    role = Column(String, nullable=False, default="validator")
    is_active = Column(Boolean, nullable=False, default=True)