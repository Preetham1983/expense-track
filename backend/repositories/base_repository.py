"""Base repository providing generic CRUD operations for MongoDB.

Implements the Repository Pattern to abstract data access logic
away from the service layer.  All entity-specific repositories
inherit from this class (Open/Closed Principle).
"""

from typing import Any, Optional

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorCollection

from config.database import Database


class BaseRepository:
    """Generic async CRUD repository for a single MongoDB collection.

    Subclasses only need to set ``collection_name`` to bind to a
    specific collection.  Additional query methods can be added in
    the subclass without modifying this base (OCP).
    """

    collection_name: str = ""

    @classmethod
    def _get_collection(cls) -> AsyncIOMotorCollection:
        """Return the Motor collection handle."""
        db = Database.get_database()
        return db[cls.collection_name]

    @classmethod
    async def create(cls, document: dict) -> str:
        """Insert a new document and return its string ID.

        Args:
            document: The document dictionary to insert.

        Returns:
            The inserted document's ID as a string.
        """
        collection = cls._get_collection()
        result = await collection.insert_one(document)
        return str(result.inserted_id)

    @classmethod
    async def find_by_id(cls, doc_id: str) -> Optional[dict]:
        """Find a single document by its ObjectId.

        Args:
            doc_id: The document ID as a string.

        Returns:
            The document dict or None if not found.
        """
        collection = cls._get_collection()
        document = await collection.find_one({"_id": ObjectId(doc_id)})
        return cls._serialize(document) if document else None

    @classmethod
    async def find_one(cls, query: dict) -> Optional[dict]:
        """Find a single document matching the query.

        Args:
            query: MongoDB query filter.

        Returns:
            The document dict or None.
        """
        collection = cls._get_collection()
        document = await collection.find_one(query)
        return cls._serialize(document) if document else None

    @classmethod
    async def find_many(
        cls,
        query: dict,
        skip: int = 0,
        limit: int = 20,
        sort: Optional[list[tuple[str, int]]] = None,
    ) -> list[dict]:
        """Find multiple documents with pagination and optional sorting.

        Args:
            query: MongoDB query filter.
            skip: Number of documents to skip.
            limit: Maximum number of documents to return.
            sort: Optional list of (field, direction) tuples.

        Returns:
            List of serialized document dicts.
        """
        collection = cls._get_collection()
        cursor = collection.find(query).skip(skip).limit(limit)
        if sort:
            cursor = cursor.sort(sort)
        documents = await cursor.to_list(length=limit)
        return [cls._serialize(doc) for doc in documents]

    @classmethod
    async def count(cls, query: dict) -> int:
        """Count documents matching the query.

        Args:
            query: MongoDB query filter.

        Returns:
            The count of matching documents.
        """
        collection = cls._get_collection()
        return await collection.count_documents(query)

    @classmethod
    async def update(cls, doc_id: str, update_data: dict) -> bool:
        """Update a document by ID.

        Args:
            doc_id: The document ID as a string.
            update_data: Fields to update (passed to $set).

        Returns:
            True if the document was modified, False otherwise.
        """
        collection = cls._get_collection()
        result = await collection.update_one(
            {"_id": ObjectId(doc_id)},
            {"$set": update_data},
        )
        return result.modified_count > 0

    @classmethod
    async def delete(cls, doc_id: str) -> bool:
        """Delete a document by ID.

        Args:
            doc_id: The document ID as a string.

        Returns:
            True if the document was deleted, False otherwise.
        """
        collection = cls._get_collection()
        result = await collection.delete_one({"_id": ObjectId(doc_id)})
        return result.deleted_count > 0

    @classmethod
    async def aggregate(cls, pipeline: list[dict]) -> list[dict]:
        """Run an aggregation pipeline.

        Args:
            pipeline: List of aggregation stage dicts.

        Returns:
            List of result documents.
        """
        collection = cls._get_collection()
        cursor = collection.aggregate(pipeline)
        return await cursor.to_list(length=None)

    @staticmethod
    def _serialize(document: dict) -> dict:
        """Convert MongoDB document to JSON-serializable dict.

        Renames ``_id`` to ``id`` and converts ObjectId to string.
        """
        if document and "_id" in document:
            document["id"] = str(document["_id"])
            del document["_id"]
        # Convert any ObjectId fields to string
        for key, value in document.items():
            if isinstance(value, ObjectId):
                document[key] = str(value)
        return document
