from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from datetime import datetime
from app.database.session import Base


class ReviewValidationHistory(Base):
    """
    Riwayat setiap kali review divalidasi atau diedit.
    Baris di tabel 'reviews' tetap di-UPDATE di tempat (1 baris = 1 review),
    tabel ini cuma untuk jejak audit / investigasi kalau dibutuhkan nanti.
    """
    __tablename__ = "review_validation_history"

    id = Column(Integer, primary_key=True, index=True)
    temp_pk = Column(String, ForeignKey("reviews.temp_pk"), nullable=False, index=True)

    sentimen_validasi = Column(String, nullable=False)
    validated_by = Column(String, nullable=False)
    validation_in = Column(DateTime, nullable=False)
    validation_out = Column(DateTime, nullable=False)
    time_to_validate = Column(String, nullable=True)

    edit_sequence = Column(Integer, nullable=False)  # 0 = validasi pertama, 1 = edit ke-1, 2 = edit ke-2, dst
    recorded_at = Column(DateTime, nullable=False, default=datetime.utcnow)