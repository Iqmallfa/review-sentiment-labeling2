from sqlalchemy import Column, String, DateTime, Integer, ForeignKey
from app.database.session import Base


class Review(Base):
    __tablename__ = "reviews"

    temp_pk = Column(String, primary_key=True, index=True)
    sort_index = Column(Integer, nullable=False, index=True)
    assigned_to_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)

    tanggal_review = Column(String, nullable=True)
    isi_ulasan = Column(String, nullable=True)
    negatif = Column(String, nullable=True)
    sentimen_model63 = Column(String, nullable=True)
    konsistensi_sentimen = Column(String, nullable=True)

    sentimen_validasi = Column(String, nullable=True)
    validated_by = Column(String, nullable=True)
    validation_in = Column(DateTime, nullable=True)
    validation_out = Column(DateTime, nullable=True)
    time_to_validate = Column(String, nullable=True)
    edit_count = Column(Integer, nullable=False, default=0)  # BARU