from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from datetime import datetime, timezone
from typing import Optional
from app.models.review import Review
from app.models.review_history import ReviewValidationHistory
from app.models.user import User
from app.schemas.review import ValidateReviewRequest

MAX_EDITS = 3


def _apply_filters(query, search, sentimen_operasional, sentimen_model63, date_from, date_to):
    if search:
        query = query.filter(Review.temp_pk.ilike(search.strip()))
    if sentimen_operasional:
        values = [v.strip() for v in sentimen_operasional.split(",") if v.strip()]
        if values:
            query = query.filter(Review.negatif.in_(values))
    if sentimen_model63:
        values = [v.strip() for v in sentimen_model63.split(",") if v.strip()]
        if values:
            query = query.filter(Review.sentimen_model63.in_(values))
    if date_from:
        query = query.filter(Review.tanggal_review >= date_from)
    if date_to:
        query = query.filter(Review.tanggal_review <= date_to)
    return query


def _restrict_to_own_assignment(query, current_user: User):
    if current_user.role != "admin":
        query = query.filter(Review.assigned_to_id == current_user.id)
    return query


def get_reviews(
    db: Session,
    status_filter: str,
    page: int,
    page_size: int,
    current_user: User,
    search: Optional[str] = None,
    sentimen_operasional: Optional[str] = None,
    sentimen_model63: Optional[str] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
):
    query = db.query(Review)
    query = _restrict_to_own_assignment(query, current_user)

    if status_filter == "pending":
        query = query.filter(Review.sentimen_validasi.is_(None))
    elif status_filter == "validated":
        query = query.filter(Review.sentimen_validasi.isnot(None))

    query = _apply_filters(query, search, sentimen_operasional, sentimen_model63, date_from, date_to)

    total = query.count()

    if status_filter == "all":
        # Belum divalidasi (False/0) tampil duluan, sudah divalidasi (True/1) "mundur" ke halaman akhir.
        query = query.order_by(Review.sentimen_validasi.isnot(None), Review.sort_index)
    else:
        query = query.order_by(Review.sort_index)

    items = query.offset((page - 1) * page_size).limit(page_size).all()
    return items, total


def get_review_stats(
    db: Session,
    current_user: User,
    search: Optional[str] = None,
    sentimen_operasional: Optional[str] = None,
    sentimen_model63: Optional[str] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
) -> dict:
    base_query = db.query(Review)
    base_query = _restrict_to_own_assignment(base_query, current_user)
    base_query = _apply_filters(base_query, search, sentimen_operasional, sentimen_model63, date_from, date_to)

    total = base_query.count()
    validated = base_query.filter(Review.sentimen_validasi.isnot(None)).count()
    return {"total": total, "validated": validated, "pending": total - validated}


def validate_review(db: Session, temp_pk: str, payload: ValidateReviewRequest, current_user: User) -> Review:
    review = db.query(Review).filter(Review.temp_pk == temp_pk).first()
    if not review:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review tidak ditemukan.")

    if current_user.role != "admin" and review.assigned_to_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Review ini bukan tugas Anda.")

    is_edit = review.sentimen_validasi is not None

    if is_edit and review.edit_count >= MAX_EDITS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Batas edit ({MAX_EDITS}x) untuk review ini sudah tercapai.",
        )

    validation_in = payload.validation_in
    if validation_in.tzinfo is not None:
        validation_in = validation_in.astimezone(timezone.utc).replace(tzinfo=None)

    validation_out = datetime.utcnow()
    duration_seconds = (validation_out - validation_in).total_seconds()

    # Catat ke riwayat SEBELUM baris utama ditimpa
    history_entry = ReviewValidationHistory(
        temp_pk=review.temp_pk,
        sentimen_validasi=payload.sentimen_validasi,
        validated_by=current_user.username,
        validation_in=validation_in,
        validation_out=validation_out,
        time_to_validate=f"{duration_seconds:.2f}",
        edit_sequence=review.edit_count if is_edit else 0,
    )
    db.add(history_entry)

    review.sentimen_validasi = payload.sentimen_validasi
    review.validated_by = current_user.username
    review.validation_in = validation_in
    review.validation_out = validation_out
    review.time_to_validate = f"{duration_seconds:.2f}"
    if is_edit:
        review.edit_count += 1

    db.commit()
    db.refresh(review)
    return review