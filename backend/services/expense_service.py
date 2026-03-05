"""Expense service handling business logic for expense operations."""

from datetime import datetime
from typing import Optional

from fastapi import HTTPException, status

from models.expense import (
    ExpenseCreate,
    ExpenseResponse,
    ExpenseUpdate,
    MonthlySummary,
)
from notifications.observer import NotificationSubject
from repositories.expense_repository import ExpenseRepository


class ExpenseService:
    """Business logic for expense management.

    Integrates with the Observer-based notification system
    to emit spending alerts when thresholds are crossed.
    """

    def __init__(self, notification_subject: NotificationSubject) -> None:
        self._subject = notification_subject

    async def create_expense(
        self,
        user_id: str,
        expense_data: ExpenseCreate,
    ) -> ExpenseResponse:
        """Create a new expense and check spending thresholds.

        Args:
            user_id: The authenticated user's ID.
            expense_data: Validated expense data.

        Returns:
            The created expense response.
        """
        doc = {
            "user_id": user_id,
            "amount": expense_data.amount,
            "category": expense_data.category.value,
            "date": expense_data.date,
            "description": expense_data.description,
            "payment_method": expense_data.payment_method.value,
            "created_at": datetime.utcnow(),
        }

        expense_id = await ExpenseRepository.create(doc)

        # Check monthly spending and notify if needed
        now = datetime.utcnow()
        summary = await ExpenseRepository.monthly_summary(
            user_id, now.year, now.month,
        )

        # Alert if monthly spending exceeds ₹50,000
        if summary["total_spent"] > 50000:
            await self._subject.notify(
                "high_spending",
                {
                    "user_id": user_id,
                    "total_spent": summary["total_spent"],
                },
            )

        return ExpenseResponse(
            id=expense_id,
            user_id=user_id,
            amount=expense_data.amount,
            category=expense_data.category.value,
            date=expense_data.date,
            description=expense_data.description,
            payment_method=expense_data.payment_method.value,
            created_at=doc["created_at"],
        )

    @staticmethod
    async def get_expenses(
        user_id: str,
        page: int = 1,
        per_page: int = 20,
        category: Optional[str] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
    ) -> dict:
        """Get paginated expenses with optional filters.

        Args:
            user_id: The user's ID.
            page: Page number (1-indexed).
            per_page: Items per page.
            category: Optional category filter.
            start_date: Optional start of date range.
            end_date: Optional end of date range.

        Returns:
            Paginated response dict with items and metadata.
        """
        from utils.pagination import paginate_params, paginated_response

        params = paginate_params(page, per_page)
        items = await ExpenseRepository.find_by_user(
            user_id,
            skip=params["skip"],
            limit=params["limit"],
            category=category,
            start_date=start_date,
            end_date=end_date,
        )
        total = await ExpenseRepository.count_by_user(
            user_id, category=category,
            start_date=start_date, end_date=end_date,
        )

        expenses = [
            ExpenseResponse(**item).model_dump() for item in items
        ]
        return paginated_response(expenses, total, page, per_page)

    @staticmethod
    async def update_expense(
        user_id: str,
        expense_id: str,
        update_data: ExpenseUpdate,
    ) -> ExpenseResponse:
        """Update an existing expense.

        Args:
            user_id: The user's ID (for ownership check).
            expense_id: The expense to update.
            update_data: Fields to update.

        Returns:
            Updated expense response.

        Raises:
            HTTPException: If expense not found or not owned by user.
        """
        expense = await ExpenseRepository.find_by_id(expense_id)
        if not expense or expense["user_id"] != user_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Expense not found.",
            )

        update_dict = update_data.model_dump(exclude_none=True)
        # Convert enums to their values
        if "category" in update_dict:
            update_dict["category"] = update_dict["category"].value
        if "payment_method" in update_dict:
            update_dict["payment_method"] = update_dict["payment_method"].value

        if update_dict:
            await ExpenseRepository.update(expense_id, update_dict)

        updated = await ExpenseRepository.find_by_id(expense_id)
        return ExpenseResponse(**updated)

    @staticmethod
    async def delete_expense(user_id: str, expense_id: str) -> bool:
        """Delete an expense (ownership verified).

        Args:
            user_id: The user's ID.
            expense_id: The expense to delete.

        Returns:
            True if deleted successfully.

        Raises:
            HTTPException: If expense not found or not owned by user.
        """
        expense = await ExpenseRepository.find_by_id(expense_id)
        if not expense or expense["user_id"] != user_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Expense not found.",
            )
        return await ExpenseRepository.delete(expense_id)

    @staticmethod
    async def get_monthly_summary(
        user_id: str,
        year: int,
        month: int,
    ) -> MonthlySummary:
        """Get spending summary for a specific month.

        Args:
            user_id: The user's ID.
            year: Year.
            month: Month (1-12).

        Returns:
            MonthlySummary with totals and category breakdown.
        """
        import calendar

        data = await ExpenseRepository.monthly_summary(user_id, year, month)
        return MonthlySummary(
            month=calendar.month_name[month],
            year=year,
            **data,
        )
