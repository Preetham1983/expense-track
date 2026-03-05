"""EMI service handling business logic for EMI tracking."""

from datetime import datetime
from typing import Optional

from fastapi import HTTPException, status

from models.emi import EMICreate, EMIResponse, EMIUpdate
from notifications.observer import NotificationSubject
from repositories.emi_repository import EMIRepository


class EMIService:
    """Business logic for EMI management.

    Checks for upcoming EMI due dates and notifies users
    through the Observer notification system.
    """

    def __init__(self, notification_subject: NotificationSubject) -> None:
        self._subject = notification_subject

    async def create_emi(
        self,
        user_id: str,
        emi_data: EMICreate,
    ) -> EMIResponse:
        """Create a new EMI entry.

        Args:
            user_id: The user's ID.
            emi_data: Validated EMI data.

        Returns:
            The created EMI response.
        """
        doc = {
            "user_id": user_id,
            "emi_name": emi_data.emi_name,
            "amount": emi_data.amount,
            "due_date": emi_data.due_date,
            "frequency": emi_data.frequency.value,
            "description": emi_data.description,
            "is_active": True,
            "created_at": datetime.utcnow(),
        }

        emi_id = await EMIRepository.create(doc)

        # Check if EMI is due soon (within 3 days)
        today = datetime.utcnow().day
        if 0 <= emi_data.due_date - today <= 3:
            await self._subject.notify(
                "emi_due_soon",
                {
                    "user_id": user_id,
                    "emi_name": emi_data.emi_name,
                    "amount": emi_data.amount,
                    "due_date": emi_data.due_date,
                },
            )

        return EMIResponse(
            id=emi_id,
            user_id=user_id,
            emi_name=emi_data.emi_name,
            amount=emi_data.amount,
            due_date=emi_data.due_date,
            frequency=emi_data.frequency.value,
            description=emi_data.description,
            is_active=True,
            created_at=doc["created_at"],
        )

    @staticmethod
    async def get_emis(
        user_id: str,
        page: int = 1,
        per_page: int = 20,
        active_only: bool = True,
    ) -> dict:
        """Get paginated EMIs for a user.

        Args:
            user_id: The user's ID.
            page: Page number.
            per_page: Items per page.
            active_only: Only return active EMIs.

        Returns:
            Paginated response dict.
        """
        from utils.pagination import paginate_params, paginated_response

        params = paginate_params(page, per_page)
        items = await EMIRepository.find_by_user(
            user_id,
            skip=params["skip"],
            limit=params["limit"],
            active_only=active_only,
        )
        total = await EMIRepository.count_by_user(user_id, active_only)

        emis = [EMIResponse(**item).model_dump() for item in items]
        return paginated_response(emis, total, page, per_page)

    @staticmethod
    async def update_emi(
        user_id: str,
        emi_id: str,
        update_data: EMIUpdate,
    ) -> EMIResponse:
        """Update an existing EMI.

        Args:
            user_id: The user's ID.
            emi_id: The EMI to update.
            update_data: Fields to update.

        Returns:
            Updated EMI response.

        Raises:
            HTTPException: If EMI not found or not owned by user.
        """
        emi = await EMIRepository.find_by_id(emi_id)
        if not emi or emi["user_id"] != user_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="EMI not found.",
            )

        update_dict = update_data.model_dump(exclude_none=True)
        if "frequency" in update_dict:
            update_dict["frequency"] = update_dict["frequency"].value

        if update_dict:
            await EMIRepository.update(emi_id, update_dict)

        updated = await EMIRepository.find_by_id(emi_id)
        return EMIResponse(**updated)

    @staticmethod
    async def delete_emi(user_id: str, emi_id: str) -> bool:
        """Delete an EMI (ownership verified).

        Args:
            user_id: The user's ID.
            emi_id: The EMI to delete.

        Returns:
            True if deleted.

        Raises:
            HTTPException: If EMI not found or not owned by user.
        """
        emi = await EMIRepository.find_by_id(emi_id)
        if not emi or emi["user_id"] != user_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="EMI not found.",
            )
        return await EMIRepository.delete(emi_id)

    async def check_upcoming_emis(self, user_id: str) -> list[dict]:
        """Check for EMIs due within the next 3 days and notify.

        Args:
            user_id: The user's ID.

        Returns:
            List of upcoming EMI documents.
        """
        today = datetime.utcnow().day
        threshold = today + 3

        upcoming = await EMIRepository.find_upcoming(user_id, threshold)

        for emi in upcoming:
            if emi["due_date"] >= today:
                # Check if we already notified for this EMI this month
                # Use a specific title format or metadata if possible. 
                # For now, searching by user_id, type and a part of the message/title
                exists = await NotificationRepository.exists_by_metadata({
                    "user_id": user_id,
                    "type": "emi_reminder",
                    "title": f"EMI Due: {emi['emi_name']}",
                    "created_at": {
                        "$gte": datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
                    }
                })
                
                if not exists:
                    await self._subject.notify(
                        "emi_due_soon",
                        {
                            "user_id": user_id,
                            "emi_name": emi["emi_name"],
                            "amount": emi["amount"],
                            "due_date": emi["due_date"],
                        },
                    )

        return upcoming
