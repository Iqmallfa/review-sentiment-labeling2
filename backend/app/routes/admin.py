import io
from fastapi.responses import StreamingResponse
from app.data_processing.export import build_validation_export
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.database.session import get_db
from app.core.deps import require_admin
from app.schemas.admin import (
    UserOut, UserCreateRequest, UserUpdateRequest,
    AssignReviewsRequest, AssignReviewsResponse,
    UnassignReviewsRequest, UnassignReviewsResponse,
    ReassignReviewsRequest, ReassignReviewsResponse,
    ReviewAssignmentSummary,
)
from app.services import admin_service

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/users", response_model=List[UserOut])
def get_users(db: Session = Depends(get_db), _admin=Depends(require_admin)):
    return admin_service.list_users(db)


@router.post("/users", response_model=UserOut)
def create_user(payload: UserCreateRequest, db: Session = Depends(get_db), _admin=Depends(require_admin)):
    return admin_service.create_user(db, payload)


@router.put("/users/{user_id}")
def update_user(user_id: int, payload: UserUpdateRequest, db: Session = Depends(get_db), _admin=Depends(require_admin)):
    admin_service.update_user(db, user_id, payload)
    return {"detail": "User berhasil diubah."}


@router.put("/users/{user_id}/toggle-status")
def toggle_user_status(user_id: int, db: Session = Depends(get_db), _admin=Depends(require_admin)):
    admin_service.toggle_user_status(db, user_id)
    return {"detail": "Status user berhasil diubah."}


@router.get("/reviews/summary", response_model=ReviewAssignmentSummary)
def get_review_summary(db: Session = Depends(get_db), _admin=Depends(require_admin)):
    return admin_service.get_review_assignment_summary(db)


@router.post("/reviews/assign", response_model=AssignReviewsResponse)
def assign_reviews(payload: AssignReviewsRequest, db: Session = Depends(get_db), _admin=Depends(require_admin)):
    return admin_service.assign_reviews(db, payload.validator_id, payload.count)


@router.post("/reviews/unassign", response_model=UnassignReviewsResponse)
def unassign_reviews(payload: UnassignReviewsRequest, db: Session = Depends(get_db), _admin=Depends(require_admin)):
    return admin_service.unassign_reviews(db, payload.validator_id, payload.count)


@router.post("/reviews/reassign", response_model=ReassignReviewsResponse)
def reassign_reviews(payload: ReassignReviewsRequest, db: Session = Depends(get_db), _admin=Depends(require_admin)):
    return admin_service.reassign_reviews(db, payload.from_validator_id, payload.to_validator_id, payload.count)

@router.get("/export/reviews-validation")
def export_reviews_validation(db: Session = Depends(get_db), _admin=Depends(require_admin)):
    df = build_validation_export(db)

    buffer = io.StringIO()
    df.to_csv(buffer, index=False)
    buffer.seek(0)

    return StreamingResponse(
        iter([buffer.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=hasil_validasi_review.csv"},
    )