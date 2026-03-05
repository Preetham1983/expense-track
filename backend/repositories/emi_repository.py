"""EMI repository for MongoDB EMI collection operations."""

from repositories.base_repository import BaseRepository


class EMIRepository(BaseRepository):
    """Data access layer for the emis collection."""

    collection_name = "emis"

    @classmethod
    async def find_by_user(
        cls,
        user_id: str,
        skip: int = 0,
        limit: int = 20,
        active_only: bool = True,
    ) -> list[dict]:
        """Find EMIs for a user.

        Args:
            user_id: The user's ID.
            skip: Pagination offset.
            limit: Max items to return.
            active_only: If True, return only active EMIs.

        Returns:
            List of EMI documents.
        """
        query: dict = {"user_id": user_id}
        if active_only:
            query["is_active"] = True
        return await cls.find_many(
            query,
            skip=skip,
            limit=limit,
            sort=[("due_date", 1)],
        )

    @classmethod
    async def count_by_user(
        cls,
        user_id: str,
        active_only: bool = True,
    ) -> int:
        """Count EMIs for a user."""
        query: dict = {"user_id": user_id}
        if active_only:
            query["is_active"] = True
        return await cls.count(query)

    @classmethod
    async def find_upcoming(cls, user_id: str, day_of_month: int) -> list[dict]:
        """Find EMIs due on or before a specific day of the month.

        Used to generate upcoming EMI reminders.

        Args:
            user_id: The user's ID.
            day_of_month: Day threshold (e.g. current day + 3).

        Returns:
            List of EMI documents due soon.
        """
        query = {
            "user_id": user_id,
            "is_active": True,
            "due_date": {"$lte": day_of_month},
        }
        return await cls.find_many(query, sort=[("due_date", 1)])
