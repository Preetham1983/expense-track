"""EMI controller — CRUD routes for EMI tracking."""

from fastapi import APIRouter, Depends, Query

from middleware.auth_middleware import get_current_user
from models.emi import EMICreate, EMIResponse, EMIUpdate
from services.emi_service import EMIService

router = APIRouter(prefix="/api/emis", tags=["EMIs"])

# Will be set by the app factory
emi_service: EMIService | None = None


def set_service(service: EMIService) -> None:
    """Inject the EMI service instance (set at app startup)."""
    global emi_service
    emi_service = service


@router.post("", response_model=EMIResponse)
async def create_emi(
    emi_data: EMICreate,
    current_user: dict = Depends(get_current_user),
) -> EMIResponse:
    """Create a new EMI entry.

    Args:
        emi_data: Validated EMI payload.
        current_user: Injected authenticated user.

    Returns:
        The created EMI.
    """
    return await emi_service.create_emi(
        current_user["user_id"], emi_data,
    )


@router.get("")
async def get_emis(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    active_only: bool = Query(True),
    current_user: dict = Depends(get_current_user),
) -> dict:
    """Get paginated EMIs for the current user.

    Args:
        page: Page number.
        per_page: Items per page.
        active_only: Only return active EMIs.
        current_user: Injected authenticated user.

    Returns:
        Paginated EMI list.
    """
    return await EMIService.get_emis(
        current_user["user_id"],
        page=page,
        per_page=per_page,
        active_only=active_only,
    )


@router.get("/upcoming")
async def get_upcoming_emis(
    current_user: dict = Depends(get_current_user),
) -> dict:
    """Check and return upcoming EMI payments (due within 3 days).

    Also triggers notifications for upcoming payments.

    Args:
        current_user: Injected authenticated user.

    Returns:
        List of upcoming EMIs.
    """
    upcoming = await emi_service.check_upcoming_emis(
        current_user["user_id"],
    )
    return {"upcoming_emis": upcoming}


@router.put("/{emi_id}", response_model=EMIResponse)
async def update_emi(
    emi_id: str,
    update_data: EMIUpdate,
    current_user: dict = Depends(get_current_user),
) -> EMIResponse:
    """Update an existing EMI.

    Args:
        emi_id: The EMI to update.
        update_data: Fields to update.
        current_user: Injected authenticated user.

    Returns:
        Updated EMI.
    """
    return await EMIService.update_emi(
        current_user["user_id"], emi_id, update_data,
    )


@router.delete("/{emi_id}")
async def delete_emi(
    emi_id: str,
    current_user: dict = Depends(get_current_user),
) -> dict:
    """Delete an EMI.

    Args:
        emi_id: The EMI to delete.
        current_user: Injected authenticated user.

    Returns:
        Success message.
    """
    await EMIService.delete_emi(current_user["user_id"], emi_id)
    return {"message": "EMI deleted successfully."}
