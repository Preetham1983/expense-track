"""Notification repository for MongoDB notification collection operations."""

from repositories.base_repository import BaseRepository


class NotificationRepository(BaseRepository):
    """Data access layer for the notifications collection."""

    collection_name = "notifications"

    @classmethod
    async def find_by_user(
        cls,
        user_id: str,
        skip: int = 0,
        limit: int = 20,
        unread_only: bool = False,
    ) -> list[dict]:
        """Find notifications for a user.

        Args:
            user_id: The user's ID.
            skip: Pagination offset.
            limit: Max items to return.
            unread_only: If True, return only unread notifications.

        Returns:
            List of notification documents.
        """
        query: dict = {"user_id": user_id}
        if unread_only:
            query["is_read"] = False
        return await cls.find_many(
            query,
            skip=skip,
            limit=limit,
            sort=[("created_at", -1)],
        )

    @classmethod
    async def count_by_user(
        cls,
        user_id: str,
        unread_only: bool = False,
    ) -> int:
        """Count notifications for a user."""
        query: dict = {"user_id": user_id}
        if unread_only:
            query["is_read"] = False
        return await cls.count(query)

    @classmethod
    async def mark_as_read(cls, notification_id: str) -> bool:
        """Mark a single notification as read.

        Args:
            notification_id: The notification's ID.

        Returns:
            True if updated successfully.
        """
        return await cls.update(notification_id, {"is_read": True})

    @classmethod
    async def mark_all_read(cls, user_id: str) -> int:
        """Mark all notifications for a user as read.

        Args:
            user_id: The user's ID.

        Returns:
            Number of notifications marked as read.
        """
        collection = cls._get_collection()
        result = await collection.update_many(
            {"user_id": user_id, "is_read": False},
            {"$set": {"is_read": True}},
        )
        return result.modified_count
