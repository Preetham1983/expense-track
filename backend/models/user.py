"""User data models for request validation and serialization."""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class UserCreate(BaseModel):
    """Schema for user registration requests."""

    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=128)


class UserLogin(BaseModel):
    """Schema for user login requests."""

    email: EmailStr
    password: str


class UserResponse(BaseModel):
    """Schema for user data returned in API responses."""

    id: str
    username: str
    email: str
    monthly_budget: Optional[float] = None
    created_at: datetime


class UserInDB(BaseModel):
    """Internal representation of a user stored in MongoDB."""

    username: str
    email: str
    hashed_password: str
    monthly_budget: Optional[float] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)


class TokenResponse(BaseModel):
    """Schema for JWT token response after login."""

    access_token: str
    token_type: str = "bearer"
    user: UserResponse
