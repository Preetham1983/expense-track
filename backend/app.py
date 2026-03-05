"""FastAPI application entry point.

Configures CORS, rate limiting, database lifecycle, observer
pattern wiring, and route registration.
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from config.database import Database, create_indexes
from config.settings import settings
from controllers import expense_controller, emi_controller
from middleware.rate_limiter import limiter
from notifications.emi_observer import EMIObserver
from notifications.observer import NotificationSubject
from notifications.spending_observer import SpendingObserver
from routes.router import api_router
from services.emi_service import EMIService
from services.expense_service import ExpenseService


@asynccontextmanager
async def lifespan(application: FastAPI):
    """Application lifespan handler for startup/shutdown.

    On startup: initialises database indexes and wires the
    observer-based notification system.
    On shutdown: closes the database connection.
    """
    # --- Startup ---
    await create_indexes()

    # Wire up Observer pattern
    notification_subject = NotificationSubject()
    notification_subject.attach(EMIObserver())
    notification_subject.attach(SpendingObserver())

    # Inject services into controllers
    expense_service = ExpenseService(notification_subject)
    emi_service = EMIService(notification_subject)

    expense_controller.set_service(expense_service)
    emi_controller.set_service(emi_service)

    yield

    # --- Shutdown ---
    await Database.close()


app = FastAPI(
    title="Expense Tracker API",
    description="Production-grade expense tracking with EMI management and notifications.",
    version="1.0.0",
    lifespan=lifespan,
)

# --- Middleware ---
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all for simplified Vercel setup
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Routes ---
app.include_router(api_router)


@app.get("/", tags=["Health"])
async def health_check() -> dict:
    """Health check endpoint."""
    return {"status": "healthy", "message": "Expense Tracker API is running."}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
