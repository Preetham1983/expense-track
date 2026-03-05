"""EMI data models for request validation and serialization."""

from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


class EMIFrequency(str, Enum):
    """Allowed EMI payment frequencies."""

    MONTHLY = "monthly"
    QUARTERLY = "quarterly"
    HALF_YEARLY = "half_yearly"
    YEARLY = "yearly"


class EMICreate(BaseModel):
    """Schema for creating a new EMI entry."""

    emi_name: str = Field(..., min_length=1, max_length=200)
    amount: float = Field(..., gt=0)
    due_date: int = Field(..., ge=1, le=31)
    frequency: EMIFrequency
    description: str = Field("", max_length=500)


class EMIUpdate(BaseModel):
    """Schema for updating an existing EMI entry."""

    emi_name: Optional[str] = Field(None, min_length=1, max_length=200)
    amount: Optional[float] = Field(None, gt=0)
    due_date: Optional[int] = Field(None, ge=1, le=31)
    frequency: Optional[EMIFrequency] = None
    description: Optional[str] = Field(None, max_length=500)
    is_active: Optional[bool] = None


class EMIResponse(BaseModel):
    """Schema for EMI data returned in API responses."""

    id: str
    user_id: str
    emi_name: str
    amount: float
    due_date: int
    frequency: str
    description: str
    is_active: bool
    created_at: datetime
