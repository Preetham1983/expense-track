"""User profile controller — routes for user profile management."""

from fastapi import APIRouter, Depends

from middleware.auth_middleware import get_current_user
from models.user import UserResponse
from services.auth_service import AuthService
from pydantic import BaseModel

router = APIRouter(prefix="/api/user", tags=["User"])


class BudgetUpdate(BaseModel):
    """Schema for updating monthly budget."""
    monthly_budget: float


@router.get("/me", response_model=UserResponse)
async def get_profile(
    current_user: dict = Depends(get_current_user),
) -> UserResponse:
    """Get the current user's profile.

    Args:
        current_user: Injected authenticated user.

    Returns:
        User profile data.
    """
    return await AuthService.get_current_user(current_user["user_id"])


@router.put("/budget", response_model=UserResponse)
async def update_budget(
    data: BudgetUpdate,
    current_user: dict = Depends(get_current_user),
) -> UserResponse:
    """Update the current user's monthly budget.

    Args:
        data: Budget update payload.
        current_user: Injected authenticated user.

    Returns:
        Updated user profile.
    """
    return await AuthService.update_budget(
        current_user["user_id"], data.monthly_budget,
    )
