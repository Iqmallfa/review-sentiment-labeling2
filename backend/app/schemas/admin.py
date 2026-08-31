from pydantic import BaseModel
from typing import Optional, Literal


class UserOut(BaseModel):
    id: int
    username: str
    role: str
    is_active: bool
    requires_password: bool
    total_assigned: int
    total_validated: int


class UserCreateRequest(BaseModel):
    username: str
    role: Literal["admin", "validator"]
    requires_password: bool = False
    password: Optional[str] = None


class UserUpdateRequest(BaseModel):
    username: str
    role: Literal["admin", "validator"]
    requires_password: bool = False
    password: Optional[str] = None


class AssignReviewsRequest(BaseModel):
    validator_id: int
    count: int


class AssignReviewsResponse(BaseModel):
    assigned_count: int
    requested_count: int


class UnassignReviewsRequest(BaseModel):
    validator_id: int
    count: int


class UnassignReviewsResponse(BaseModel):
    unassigned_count: int
    requested_count: int


class ReassignReviewsRequest(BaseModel):
    from_validator_id: int
    to_validator_id: int
    count: int


class ReassignReviewsResponse(BaseModel):
    reassigned_count: int
    requested_count: int


class ReviewAssignmentSummary(BaseModel):
    total_reviews: int
    unassigned: int
    assigned: int