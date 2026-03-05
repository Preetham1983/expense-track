"""Spending alert observer — generates notifications for high spending."""

from datetime import datetime
from typing import Any

from notifications.observer import Observer
from repositories.notification_repository import NotificationRepository


class SpendingObserver(Observer):
    """Observer that creates spending alert notifications.

    Triggered after an expense is created, when the monthly
    total exceeds a threshold or the user's budget.
    """

    async def update(self, event_type: str, data: dict[str, Any]) -> None:
        """Create a spending alert notification.

        Args:
            event_type: Expected to be 'high_spending' or 'budget_exceeded'.
            data: Must contain 'user_id', 'total_spent', and optionally 'budget'.
        """
        if event_type == "budget_exceeded":
            notification = {
                "user_id": data["user_id"],
                "type": "budget_warning",
                "title": "Budget Exceeded!",
                "message": (
                    f"You have spent ₹{data['total_spent']:,.2f} this month, "
                    f"exceeding your budget of ₹{data['budget']:,.2f}."
                ),
                "is_read": False,
                "created_at": datetime.utcnow(),
            }
            await NotificationRepository.create(notification)

        elif event_type == "high_spending":
            notification = {
                "user_id": data["user_id"],
                "type": "spending_alert",
                "title": "High Spending Alert",
                "message": (
                    f"You've spent ₹{data['total_spent']:,.2f} this month. "
                    f"Consider reviewing your expenses."
                ),
                "is_read": False,
                "created_at": datetime.utcnow(),
            }
            await NotificationRepository.create(notification)
