"""Auth controller — routes for registration and login."""

from fastapi import APIRouter, Request

from middleware.rate_limiter import limiter
from models.user import UserCreate, UserLogin, TokenResponse
from services.auth_service import AuthService

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse)
@limiter.limit("10/minute")
async def register(request: Request, user_data: UserCreate) -> TokenResponse:
    """Register a new user and return a JWT token.

    Args:
        request: FastAPI request (needed by rate limiter).
        user_data: Registration payload.

    Returns:
        JWT access token and user profile.
    """
    return await AuthService.register(user_data)


@router.post("/login", response_model=TokenResponse)
@limiter.limit("20/minute")
async def login(request: Request, credentials: UserLogin) -> TokenResponse:
    """Authenticate a user and return a JWT token.

    Args:
        request: FastAPI request.
        credentials: Login payload.

    Returns:
        JWT access token and user profile.
    """
    return await AuthService.login(credentials)
