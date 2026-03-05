"""Expense data models for request validation and serialization."""

from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


class ExpenseCategory(str, Enum):
    """Allowed expense categories."""

    GROCERIES = "groceries"
    RENT = "rent"
    TRAVEL = "travel"
    SUBSCRIPTIONS = "subscriptions"
    SHOPPING = "shopping"
    BILLS = "bills"
    DAILY = "daily"
    FOOD = "food"
    ENTERTAINMENT = "entertainment"
    HEALTH = "health"
    EDUCATION = "education"
    OTHER = "other"


class PaymentMethod(str, Enum):
    """Allowed payment methods."""

    CASH = "cash"
    CREDIT_CARD = "credit_card"
    DEBIT_CARD = "debit_card"
    UPI = "upi"
    NET_BANKING = "net_banking"
    WALLET = "wallet"
    OTHER = "other"


class ExpenseCreate(BaseModel):
    """Schema for creating a new expense."""

    amount: float = Field(..., gt=0)
    category: ExpenseCategory
    date: datetime
    description: str = Field(..., max_length=500)
    payment_method: PaymentMethod


class ExpenseUpdate(BaseModel):
    """Schema for updating an existing expense."""

    amount: Optional[float] = Field(None, gt=0)
    category: Optional[ExpenseCategory] = None
    date: Optional[datetime] = None
    description: Optional[str] = Field(None, max_length=500)
    payment_method: Optional[PaymentMethod] = None


class ExpenseResponse(BaseModel):
    """Schema for expense data returned in API responses."""

    id: str
    user_id: str
    amount: float
    category: str
    date: datetime
    description: str
    payment_method: str
    created_at: datetime


class MonthlySummary(BaseModel):
    """Schema for monthly spending summary."""

    month: str
    year: int
    total_spent: float
    category_breakdown: dict[str, float]
    expense_count: int
