"""Password hashing utilities using the bcrypt library directly.

This avoids compatibility issues between passlib and modern bcrypt
on newer Python versions (3.12+).
"""

import bcrypt


def hash_password(password: str) -> str:
    """Hash a plain-text password using bcrypt.

    Args:
        password: The plain-text password to hash.

    Returns:
        The bcrypt-hashed password string.
    """
    # bcrypt expects bytes
    byte_password = password.encode('utf-8')
    # Generate salt and hash
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(byte_password, salt)
    return hashed.decode('utf-8')


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain-text password against a stored hash.

    Args:
        plain_password: The user-supplied plain-text password.
        hashed_password: The stored bcrypt hash to compare against.

    Returns:
        True if the password matches, False otherwise.
    """
    try:
        byte_password = plain_password.encode('utf-8')
        byte_hash = hashed_password.encode('utf-8')
        return bcrypt.checkpw(byte_password, byte_hash)
    except Exception:
        return False
