from pydantic import BaseModel
from typing import Optional, Literal, List
from datetime import datetime


class ReviewOut(BaseModel):
    temp_pk: str
    tanggal_review: Optional[str] = None
    isi_ulasan: Optional[str] = None
    negatif: Optional[str] = None
    sentimen_model63: Optional[str] = None
    sentimen_validasi: Optional[str] = None
    validated_by: Optional[str] = None
    validation_in: Optional[datetime] = None
    validation_out: Optional[datetime] = None
    time_to_validate: Optional[str] = None
    edit_count: int = 0

    class Config:
        from_attributes = True


class PaginatedReviewResponse(BaseModel):
    items: List[ReviewOut]
    total: int
    page: int
    page_size: int


class ValidateReviewRequest(BaseModel):
    sentimen_validasi: Literal["Positif", "Negatif", "Netral"]
    validation_in: datetime


class ReviewStatsOut(BaseModel):
    total: int
    validated: int
    pending: int