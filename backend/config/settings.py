"""Application configuration loaded from environment variables."""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Centralised application settings.

    Values are read from the `.env` file located in the backend root
    directory.  Every attribute can be overridden by setting the
    corresponding environment variable.
    """

    mongodb_uri: str = "mongodb://localhost:27017/expense_tracker"
    jwt_secret_key: str = "change-me-in-production"
    jwt_algorithm: str = "HS256"
    jwt_expiration_minutes: int = 1440  # 24 hours
    frontend_url: str = "http://localhost:5173"
    vapid_public_key: str = ""
    vapid_private_key: str = ""
    admin_email: str = "admin@example.com"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
