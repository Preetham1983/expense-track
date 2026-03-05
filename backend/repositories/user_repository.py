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
