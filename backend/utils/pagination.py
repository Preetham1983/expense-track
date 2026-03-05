"""Pagination utilities for list endpoints."""

from typing import Any


def paginate_params(page: int = 1, per_page: int = 20) -> dict[str, int]:
    """Calculate skip and limit values for MongoDB pagination.

    Args:
        page: The current page number (1-indexed).
        per_page: Number of items per page.

    Returns:
        Dictionary with 'skip' and 'limit' keys.
    """
    page = max(1, page)
    per_page = min(max(1, per_page), 100)  # Cap at 100 items
    return {
        "skip": (page - 1) * per_page,
        "limit": per_page,
    }


def paginated_response(
    items: list[Any],
    total: int,
    page: int,
    per_page: int,
) -> dict:
    """Build a standardized paginated API response.

    Args:
        items: The list of items for the current page.
        total: Total count of items matching the query.
        page: Current page number.
        per_page: Items per page.

    Returns:
        Dictionary with items, pagination metadata.
    """
    return {
        "items": items,
        "total": total,
        "page": page,
        "per_page": per_page,
        "total_pages": max(1, -(-total // per_page)),  # Ceiling division
    }
