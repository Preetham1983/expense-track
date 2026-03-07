"""Expense controller — CRUD routes for expense management."""

from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, Query

from middleware.auth_middleware import get_current_user
from pydantic import BaseModel
from models.expense import ExpenseCreate, ExpenseResponse, ExpenseUpdate
from services.expense_service import ExpenseService

router = APIRouter(prefix="/api/expenses", tags=["Expenses"])

# Will be set by the app factory
expense_service: ExpenseService | None = None


def set_service(service: ExpenseService) -> None:
    """Inject the expense service instance (set at app startup)."""
    global expense_service
    expense_service = service


@router.post("", response_model=ExpenseResponse)
async def create_expense(
    expense_data: ExpenseCreate,
    current_user: dict = Depends(get_current_user),
) -> ExpenseResponse:
    """Create a new expense entry.

    Args:
        expense_data: Validated expense payload.
        current_user: Injected authenticated user.

    Returns:
        The created expense.
    """
    return await expense_service.create_expense(
        current_user["user_id"], expense_data,
    )


@router.get("")
async def get_expenses(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    category: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    current_user: dict = Depends(get_current_user),
) -> dict:
    """Get paginated expenses with optional filters.

    Args:
        page: Page number.
        per_page: Items per page.
        category: Optional category filter.
        start_date: Optional start date.
        end_date: Optional end date.
        current_user: Injected authenticated user.

    Returns:
        Paginated expense list.
    """
    return await ExpenseService.get_expenses(
        current_user["user_id"],
        page=page,
        per_page=per_page,
        category=category,
        start_date=start_date,
        end_date=end_date,
    )


@router.get("/summary")
async def get_monthly_summary(
    year: int = Query(...),
    month: int = Query(..., ge=1, le=12),
    current_user: dict = Depends(get_current_user),
) -> dict:
    """Get monthly spending summary.

    Args:
        year: Year.
        month: Month (1-12).
        current_user: Injected authenticated user.

    Returns:
        Monthly summary with category breakdown.
    """
    summary = await ExpenseService.get_monthly_summary(
        current_user["user_id"], year, month,
    )
    return summary.model_dump()


@router.put("/{expense_id}", response_model=ExpenseResponse)
async def update_expense(
    expense_id: str,
    update_data: ExpenseUpdate,
    current_user: dict = Depends(get_current_user),
) -> ExpenseResponse:
    """Update an existing expense.

    Args:
        expense_id: The expense to update.
        update_data: Fields to update.
        current_user: Injected authenticated user.

    Returns:
        Updated expense.
    """
    return await ExpenseService.update_expense(
        current_user["user_id"], expense_id, update_data,
    )


@router.delete("/{expense_id}")
async def delete_expense(
    expense_id: str,
    current_user: dict = Depends(get_current_user),
) -> dict:
    """Delete an expense.

    Args:
        expense_id: The expense to delete.
        current_user: Injected authenticated user.

    Returns:
        Success message.
    """
    await ExpenseService.delete_expense(
        current_user["user_id"], expense_id,
    )
    return {"message": "Expense deleted successfully."}
