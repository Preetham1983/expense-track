"""Authentication service handling registration, login, and JWT tokens."""

from datetime import datetime

from fastapi import HTTPException, status

from models.user import UserCreate, UserLogin, UserResponse, TokenResponse
from repositories.user_repository import UserRepository
from utils.hashing import hash_password, verify_password
from utils.jwt_handler import create_access_token


class AuthService:
    """Business logic for user authentication.

    Follows Single Responsibility: only handles auth concerns.
    Depends on repository abstraction (DIP).
    """

    @staticmethod
    async def register(user_data: UserCreate) -> TokenResponse:
        """Register a new user account.

        Args:
            user_data: Validated registration data.

        Returns:
            Token response with JWT and user info.

        Raises:
            HTTPException: If email is already registered.
        """
        existing = await UserRepository.find_by_email(user_data.email)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered.",
            )

        user_doc = {
            "username": user_data.username,
            "email": user_data.email,
            "hashed_password": hash_password(user_data.password),
            "monthly_budget": None,
            "monthly_income": None,
            "created_at": datetime.utcnow(),
        }

        user_id = await UserRepository.create(user_doc)

        user_response = UserResponse(
            id=user_id,
            username=user_data.username,
            email=user_data.email,
            monthly_budget=None,
            monthly_income=None,
            created_at=user_doc["created_at"],
        )

        token = create_access_token({"sub": user_id, "email": user_data.email})

        return TokenResponse(
            access_token=token,
            user=user_response,
        )

    @staticmethod
    async def login(credentials: UserLogin) -> TokenResponse:
        """Authenticate a user and issue a JWT.

        Args:
            credentials: Email and password.

        Returns:
            Token response with JWT and user info.

        Raises:
            HTTPException: If credentials are invalid.
        """
        user = await UserRepository.find_by_email(credentials.email)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password.",
            )

        if not verify_password(credentials.password, user["hashed_password"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password.",
            )

        user_response = UserResponse(
            id=user["id"],
            username=user["username"],
            email=user["email"],
            monthly_budget=user.get("monthly_budget"),
            monthly_income=user.get("monthly_income"),
            created_at=user["created_at"],
        )

        token = create_access_token(
            {"sub": user["id"], "email": user["email"]}
        )

        return TokenResponse(
            access_token=token,
            user=user_response,
        )

    @staticmethod
    async def get_current_user(user_id: str) -> UserResponse:
        """Fetch the current user's profile.

        Args:
            user_id: The authenticated user's ID.

        Returns:
            User response object.

        Raises:
            HTTPException: If user not found.
        """
        user = await UserRepository.find_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found.",
            )
        return UserResponse(
            id=user["id"],
            username=user["username"],
            email=user["email"],
            monthly_budget=user.get("monthly_budget"),
            monthly_income=user.get("monthly_income"),
            created_at=user["created_at"],
        )

    @staticmethod
    async def update_budget(user_id: str, monthly_budget: float) -> UserResponse:
        """Update the user's monthly budget.

        Args:
            user_id: The user's ID.
            monthly_budget: New budget amount.

        Returns:
            Updated user response.
        """
        await UserRepository.update(user_id, {"monthly_budget": monthly_budget})
        return await AuthService.get_current_user(user_id)

    @staticmethod
    async def update_user(user_id: str, update_data: 'UserUpdate') -> UserResponse:
        """Update user profile (username, password).

        Args:
            user_id: The user's ID.
            update_data: Fields to update.

        Returns:
            Updated user response.

        Raises:
            HTTPException: If current password verification fails or user not found.
        """
        user = await UserRepository.find_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found.",
            )

        update_dict = {}
        if update_data.username:
            update_dict["username"] = update_data.username
        
        if update_data.monthly_income is not None:
            update_dict["monthly_income"] = update_data.monthly_income

        if update_data.new_password:
            if not update_data.current_password:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Current password is required to set a new password.",
                )
            
            if not verify_password(update_data.current_password, user["hashed_password"]):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Incorrect current password.",
                )
            
            update_dict["hashed_password"] = hash_password(update_data.new_password)

        if update_dict:
            await UserRepository.update(user_id, update_dict)

        return await AuthService.get_current_user(user_id)
