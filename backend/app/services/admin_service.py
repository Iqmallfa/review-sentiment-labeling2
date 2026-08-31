from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.user import User
from app.models.review import Review
from app.core.security import hash_password
from app.schemas.admin import UserCreateRequest, UserUpdateRequest


def list_users(db: Session) -> list[dict]:
    users = db.query(User).all()
    result = []
    for user in users:
        total_assigned = db.query(Review).filter(Review.assigned_to_id == user.id).count()
        total_validated = db.query(Review).filter(
            Review.assigned_to_id == user.id,
            Review.sentimen_validasi.isnot(None),
        ).count()
        result.append({
            "id": user.id,
            "username": user.username,
            "role": user.role,
            "is_active": user.is_active,
            "requires_password": bool(user.hashed_password),
            "total_assigned": total_assigned,
            "total_validated": total_validated,
        })
    return result


def create_user(db: Session, payload: UserCreateRequest) -> dict:
    if db.query(User).filter(User.username == payload.username).first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username sudah dipakai.")

    if payload.requires_password and not payload.password:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Password wajib diisi karena 'Wajibkan Password' aktif.")

    user = User(
        username=payload.username,
        role=payload.role,
        hashed_password=hash_password(payload.password) if payload.requires_password else None,
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return {
        "id": user.id, "username": user.username, "role": user.role, "is_active": user.is_active,
        "requires_password": bool(user.hashed_password), "total_assigned": 0, "total_validated": 0,
    }


def update_user(db: Session, user_id: int, payload: UserUpdateRequest) -> None:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User tidak ditemukan.")

    # Username BOLEH diganti bebas -- assignment tugas tidak akan terpengaruh
    # karena disambungkan lewat user.id (angka permanen), bukan username (teks).
    user.username = payload.username
    user.role = payload.role

    if payload.requires_password:
        if payload.password:
            user.hashed_password = hash_password(payload.password)
        elif not user.hashed_password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password wajib diisi karena 'Wajibkan Password' baru diaktifkan untuk user ini.",
            )
        # kalau requires_password True dan password kosong tapi SUDAH ada hash sebelumnya -> biarkan (tidak ganti)
    else:
        user.hashed_password = None

    db.commit()


def toggle_user_status(db: Session, user_id: int) -> None:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User tidak ditemukan.")
    user.is_active = not user.is_active
    db.commit()


def assign_reviews(db: Session, validator_id: int, count: int) -> dict:
    validator = db.query(User).filter(User.id == validator_id).first()
    if not validator:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Validator tidak ditemukan.")
    if validator.role != "validator":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User ini bukan role validator.")

    available = (
        db.query(Review)
        .filter(Review.assigned_to_id.is_(None), Review.sentimen_validasi.is_(None))
        .order_by(Review.sort_index)
        .limit(count)
        .all()
    )
    for review in available:
        review.assigned_to_id = validator.id
    db.commit()
    return {"assigned_count": len(available), "requested_count": count}


def unassign_reviews(db: Session, validator_id: int, count: int) -> dict:
    """Kurangi tugas: kembalikan N data (yang belum divalidasi) ke 'stok' unassigned."""
    validator = db.query(User).filter(User.id == validator_id).first()
    if not validator:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Validator tidak ditemukan.")

    to_unassign = (
        db.query(Review)
        .filter(Review.assigned_to_id == validator_id, Review.sentimen_validasi.is_(None))
        .order_by(Review.sort_index.desc())  # lepas yang paling akhir urutannya dulu
        .limit(count)
        .all()
    )
    for review in to_unassign:
        review.assigned_to_id = None
    db.commit()
    return {"unassigned_count": len(to_unassign), "requested_count": count}


def reassign_reviews(db: Session, from_validator_id: int, to_validator_id: int, count: int) -> dict:
    """Alihkan tugas: pindahkan N data (yang belum divalidasi) dari satu validator ke validator lain."""
    if from_validator_id == to_validator_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Validator asal dan tujuan tidak boleh sama.")

    from_validator = db.query(User).filter(User.id == from_validator_id).first()
    to_validator = db.query(User).filter(User.id == to_validator_id).first()
    if not from_validator or not to_validator:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Validator tidak ditemukan.")
    if to_validator.role != "validator":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tujuan alih tugas harus role validator.")

    to_move = (
        db.query(Review)
        .filter(Review.assigned_to_id == from_validator_id, Review.sentimen_validasi.is_(None))
        .order_by(Review.sort_index)
        .limit(count)
        .all()
    )
    for review in to_move:
        review.assigned_to_id = to_validator_id
    db.commit()
    return {"reassigned_count": len(to_move), "requested_count": count}


def get_review_assignment_summary(db: Session) -> dict:
    total = db.query(Review).count()
    unassigned = db.query(Review).filter(Review.assigned_to_id.is_(None)).count()
    return {"total_reviews": total, "unassigned": unassigned, "assigned": total - unassigned}