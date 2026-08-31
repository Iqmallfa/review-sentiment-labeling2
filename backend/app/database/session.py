from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

# check_same_thread hanya diperlukan untuk SQLite, tidak untuk Oracle.
connect_args = (
    {"check_same_thread": False}
    if settings.database_url.startswith("sqlite")
    else {}
)

engine = create_engine(settings.database_url, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base = "induk" untuk semua model tabel. Setiap model (Review, dll)
# akan mewarisi Base ini.
Base = declarative_base()


def get_db():
    """
    Dipakai nanti oleh endpoint FastAPI (lewat Depends()) untuk
    mendapatkan satu koneksi database per request, dan otomatis
    ditutup setelah selesai.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()