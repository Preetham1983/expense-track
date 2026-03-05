"""Notification controller — routes for managing notifications."""

from fastapi import APIRouter, Depends, Query

from middleware.auth_middleware import get_current_user
from services.notification_service import NotificationService

router = APIRouter(prefix="/api/notifications", tags=["Notifications"])


@router.get("")
async def get_notifications(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    unread_only: bool = Query(False),
    current_user: dict = Depends(get_current_user),
) -> dict:
    """Get paginated notifications for the current user.

    Args:
        page: Page number.
        per_page: Items per page.
        unread_only: Only return unread notifications.
        current_user: Injected authenticated user.

    Returns:
        Paginated notification list.
    """
    return await NotificationService.get_notifications(
        current_user["user_id"],
        page=page,
        per_page=per_page,
        unread_only=unread_only,
    )


@router.get("/unread-count")
async def get_unread_count(
    current_user: dict = Depends(get_current_user),
) -> dict:
    """Get the count of unread notifications.

    Args:
        current_user: Injected authenticated user.

    Returns:
        Dict with unread_count.
    """
    count = await NotificationService.get_unread_count(
        current_user["user_id"],
    )
    return {"unread_count": count}


@router.put("/{notification_id}/read")
async def mark_as_read(
    notification_id: str,
    current_user: dict = Depends(get_current_user),
) -> dict:
    """Mark a single notification as read.

    Args:
        notification_id: The notification to mark.
        current_user: Injected authenticated user.

    Returns:
        Success message.
    """
    await NotificationService.mark_as_read(notification_id)
    return {"message": "Notification marked as read."}


@router.put("/read-all")
async def mark_all_read(
    current_user: dict = Depends(get_current_user),
) -> dict:
    """Mark all notifications as read for the current user.

    Args:
        current_user: Injected authenticated user.

    Returns:
        Count of notifications marked read.
    """
    count = await NotificationService.mark_all_read(
        current_user["user_id"],
    )
    return {"message": f"{count} notifications marked as read."}
