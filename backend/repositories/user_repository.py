"""User repository for MongoDB user collection operations."""

from repositories.base_repository import BaseRepository


class UserRepository(BaseRepository):
    """Data access layer for the users collection.

    Extends BaseRepository with user-specific query methods.
    """

    collection_name = "users"

    @classmethod
    async def find_by_email(cls, email: str) -> dict | None:
        """Find a user by email address.

        Args:
            email: The email address to search for.

        Returns:
            User document or None if not found.
        """
        return await cls.find_one({"email": email})
    
    @classmethod
    async def add_push_subscription(cls, user_id: str, subscription: dict) -> bool:
        """Add a push subscription to the user's profile.
        
        Avoid duplicates using $addToSet.
        """
        collection = cls._get_collection()
        await collection.update_one(
            {"_id": cls._to_object_id(user_id)},
            {"$addToSet": {"push_subscriptions": subscription}}
        )
        return True
