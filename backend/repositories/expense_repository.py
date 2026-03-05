"""Expense repository for MongoDB expense collection operations."""

from bson import ObjectId

from repositories.base_repository import BaseRepository


class ExpenseRepository(BaseRepository):
    """Data access layer for the expenses collection.

    Provides category filtering, date-range queries, and
    aggregation pipelines for spending summaries.
    """

    collection_name = "expenses"

    @classmethod
    async def find_by_user(
        cls,
        user_id: str,
        skip: int = 0,
        limit: int = 20,
        category: str | None = None,
        start_date=None,
        end_date=None,
    ) -> list[dict]:
        """Find expenses for a user with optional filters.

        Args:
            user_id: The user's ID.
            skip: Pagination offset.
            limit: Max items to return.
            category: Optional category filter.
            start_date: Optional start of date range.
            end_date: Optional end of date range.

        Returns:
            List of expense documents.
        """
        query: dict = {"user_id": user_id}
        if category:
            query["category"] = category
        if start_date or end_date:
            query["date"] = {}
            if start_date:
                query["date"]["$gte"] = start_date
            if end_date:
                query["date"]["$lte"] = end_date

        return await cls.find_many(
            query,
            skip=skip,
            limit=limit,
            sort=[("date", -1)],
        )

    @classmethod
    async def count_by_user(
        cls,
        user_id: str,
        category: str | None = None,
        start_date=None,
        end_date=None,
    ) -> int:
        """Count expenses for a user with optional filters."""
        query: dict = {"user_id": user_id}
        if category:
            query["category"] = category
        if start_date or end_date:
            query["date"] = {}
            if start_date:
                query["date"]["$gte"] = start_date
            if end_date:
                query["date"]["$lte"] = end_date
        return await cls.count(query)

    @classmethod
    async def monthly_summary(cls, user_id: str, year: int, month: int) -> dict:
        """Get spending summary for a specific month.

        Uses MongoDB aggregation to group expenses by category
        and compute totals.

        Args:
            user_id: The user's ID.
            year: Year (e.g. 2026).
            month: Month number (1-12).

        Returns:
            Dict with total_spent, category_breakdown, expense_count.
        """
        from datetime import datetime

        start = datetime(year, month, 1)
        if month == 12:
            end = datetime(year + 1, 1, 1)
        else:
            end = datetime(year, month + 1, 1)

        pipeline = [
            {
                "$match": {
                    "user_id": user_id,
                    "date": {"$gte": start, "$lt": end},
                }
            },
            {
                "$group": {
                    "_id": "$category",
                    "total": {"$sum": "$amount"},
                    "count": {"$sum": 1},
                }
            },
        ]

        results = await cls.aggregate(pipeline)

        category_breakdown = {}
        total_spent = 0.0
        expense_count = 0

        for item in results:
            category_breakdown[item["_id"]] = item["total"]
            total_spent += item["total"]
            expense_count += item["count"]

        return {
            "total_spent": round(total_spent, 2),
            "category_breakdown": category_breakdown,
            "expense_count": expense_count,
        }
