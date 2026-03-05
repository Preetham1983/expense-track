"""Notification data models for request validation and serialization."""

from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field


class NotificationType(str, Enum):
    """Types of notifications the system can generate."""

    EMI_REMINDER = "emi_reminder"
    SPENDING_ALERT = "spending_alert"
    BUDGET_WARNING = "budget_warning"
    MONTHLY_SUMMARY = "monthly_summary"


class NotificationCreate(BaseModel):
    """Internal schema for creating notifications (not user-facing)."""

    user_id: str
    type: NotificationType
    title: str = Field(..., max_length=200)
    message: str = Field(..., max_length=1000)


class NotificationResponse(BaseModel):
    """Schema for notification data returned in API responses."""

    id: str
    user_id: str
    type: str
    title: str
    message: str
    is_read: bool
    created_at: datetime
