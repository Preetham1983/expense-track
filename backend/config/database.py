"""MongoDB connection management using Motor async driver."""

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from config.settings import settings


class Database:
    """Singleton-style database connection manager.

    Provides a single shared connection pool to MongoDB Atlas
    that is reused across the application lifetime.
    """

    _client: AsyncIOMotorClient | None = None
    _database: AsyncIOMotorDatabase | None = None

    @classmethod
    def get_client(cls) -> AsyncIOMotorClient:
        """Create or return the MongoDB client singleton.

        Uses certifi to ensure SSL certificates are handled correctly
        on Windows/macOS.
        """
        if cls._client is None:
            try:
                import certifi
                cls._client = AsyncIOMotorClient(
                    settings.mongodb_uri,
                    tlsCAFile=certifi.where()
                )
            except ImportError:
                cls._client = AsyncIOMotorClient(settings.mongodb_uri)
        return cls._client

    @classmethod
    def get_database(cls) -> AsyncIOMotorDatabase:
        """Return the application database handle."""
        if cls._database is None:
            client = cls.get_client()
            cls._database = client.get_default_database("expense_tracker")
        return cls._database

    @classmethod
    async def close(cls) -> None:
        """Gracefully close the database connection."""
        if cls._client is not None:
            cls._client.close()
            cls._client = None
            cls._database = None


async def create_indexes() -> None:
    """Create MongoDB indexes for optimal query performance."""
    db = Database.get_database()

    # User indexes
    await db.users.create_index("email", unique=True)

    # Expense indexes – compound for user-scoped queries
    await db.expenses.create_index([("user_id", 1), ("date", -1)])
    await db.expenses.create_index([("user_id", 1), ("category", 1)])

    # EMI indexes
    await db.emis.create_index([("user_id", 1), ("due_date", 1)])

    # Notification indexes
    await db.notifications.create_index(
        [("user_id", 1), ("is_read", 1), ("created_at", -1)]
    )
