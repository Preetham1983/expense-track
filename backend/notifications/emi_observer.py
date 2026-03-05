"""EMI reminder observer — generates notifications for upcoming EMI payments."""

from datetime import datetime
from typing import Any

from notifications.observer import Observer
from repositories.notification_repository import NotificationRepository


class EMIObserver(Observer):
    """Observer that creates EMI reminder notifications.

    Triggered when the system checks for upcoming EMIs or when
    a new EMI is created that is due within the alert window.
    """

    async def update(self, event_type: str, data: dict[str, Any]) -> None:
        """Create an EMI reminder notification.

        Args:
            event_type: Expected to be 'emi_due_soon'.
            data: Must contain 'user_id', 'emi_name', 'amount', 'due_date'.
        """
        if event_type != "emi_due_soon":
            return

        from repositories.user_repository import UserRepository
        from services.push_service import PushService

        # Fetch user's push subscriptions
        user = await UserRepository.find_by_id(data["user_id"])
        if user and user.get("push_subscriptions"):
            push_data = {
                "title": f"EMI Due: {data['emi_name']}",
                "body": f"Your EMI '{data['emi_name']}' of ₹{data['amount']:,.2f} is due on day {data['due_date']}.",
                "icon": "/logo192.png",
                "tag": f"emi-{data['user_id']}-{data['emi_name']}"
            }
            for sub in user["push_subscriptions"]:
                PushService.send_push(sub, push_data)

        notification = {
            "user_id": data["user_id"],
            "type": "emi_reminder",
            "title": f"EMI Due: {data['emi_name']}",
            "message": (
                f"Your EMI '{data['emi_name']}' of ₹{data['amount']:,.2f} "
                f"is due on day {data['due_date']} of this month."
            ),
            "is_read": False,
            "created_at": datetime.utcnow(),
        }
        await NotificationRepository.create(notification)
