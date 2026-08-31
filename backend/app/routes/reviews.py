from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.database.session import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.review import PaginatedReviewResponse, ReviewOut, ValidateReviewRequest, ReviewStatsOut
from app.services import review_service

router = APIRouter(prefix="/reviews", tags=["reviews"])


def _build_response(items, total, page, page_size) -> PaginatedReviewResponse:
    return PaginatedReviewResponse(
        items=[ReviewOut.model_validate(item) for item in items],
        total=total,
        page=page,
        page_size=page_size,
    )


def _list_reviews(status_filter, page, page_size, search, sentimen_operasional, sentimen_model63, date_from, date_to, db, current_user):
    items, total = review_service.get_reviews(
        db, status_filter, page, page_size, current_user,
        search=search, sentimen_operasional=sentimen_operasional,
        sentimen_model63=sentimen_model63, date_from=date_from, date_to=date_to,
    )
    return _build_response(items, total, page, page_size)


@router.get("", response_model=PaginatedReviewResponse)
def list_all_reviews(
    page: int = Query(1, ge=1),
    page_size: int = Query(5, ge=1, le=100),
    search: Optional[str] = None,
    sentimen_operasional: Optional[str] = None,
    sentimen_model63: Optional[str] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return _list_reviews("all", page, page_size, search, sentimen_operasional, sentimen_model63, date_from, date_to, db, current_user)


@router.get("/pending", response_model=PaginatedReviewResponse)
def list_pending_reviews(
    page: int = Query(1, ge=1),
    page_size: int = Query(5, ge=1, le=100),
    search: Optional[str] = None,
    sentimen_operasional: Optional[str] = None,
    sentimen_model63: Optional[str] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return _list_reviews("pending", page, page_size, search, sentimen_operasional, sentimen_model63, date_from, date_to, db, current_user)


@router.get("/validated", response_model=PaginatedReviewResponse)
def list_validated_reviews(
    page: int = Query(1, ge=1),
    page_size: int = Query(5, ge=1, le=100),
    search: Optional[str] = None,
    sentimen_operasional: Optional[str] = None,
    sentimen_model63: Optional[str] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return _list_reviews("validated", page, page_size, search, sentimen_operasional, sentimen_model63, date_from, date_to, db, current_user)


@router.get("/stats", response_model=ReviewStatsOut)
def review_stats(
    search: Optional[str] = None,
    sentimen_operasional: Optional[str] = None,
    sentimen_model63: Optional[str] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return review_service.get_review_stats(
        db,
        current_user,
        search=search,
        sentimen_operasional=sentimen_operasional,
        sentimen_model63=sentimen_model63,
        date_from=date_from,
        date_to=date_to,
    )


@router.post("/{temp_pk}/validate", response_model=ReviewOut)
def validate_review(
    temp_pk: str,
    payload: ValidateReviewRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return review_service.validate_review(db, temp_pk, payload, current_user)