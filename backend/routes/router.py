"""Central route registry — includes all controller routers."""

from fastapi import APIRouter

from controllers.auth_controller import router as auth_router
from controllers.expense_controller import router as expense_router
from controllers.emi_controller import router as emi_router
from controllers.notification_controller import router as notification_router
from controllers.user_controller import router as user_router

api_router = APIRouter()

api_router.include_router(auth_router)
api_router.include_router(expense_router)
api_router.include_router(emi_router)
api_router.include_router(notification_router)
api_router.include_router(user_router)
