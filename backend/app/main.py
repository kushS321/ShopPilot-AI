from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import logging

from backend.app.config import settings
from backend.app.database import engine, Base
from backend.app.seed_data.seed import seed_database
from backend.app.routers import (
    health,
    products,
    ai,
    cart,
    orders,
    payments,
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("shoppilot")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: ensure tables exist and catalogue is seeded
    logger.info("Initializing database tables...")
    Base.metadata.create_all(bind=engine)
    logger.info("Seeding initial catalogue if needed...")
    try:
        seed_database()
    except Exception as e:
        logger.warning(f"Seed step encountered note: {e}")
    yield
    # Shutdown
    logger.info("ShopPilot AI backend shutting down...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Precision AI Shopping Agent with Official PayPal Sandbox Integration",
    lifespan=lifespan,
    docs_url="/api/docs",
    openapi_url="/api/openapi.json"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers under /api
app.include_router(health.router, prefix=settings.API_V1_STR)
app.include_router(products.router, prefix=settings.API_V1_STR)
app.include_router(ai.router, prefix=settings.API_V1_STR)
app.include_router(cart.router, prefix=settings.API_V1_STR)
app.include_router(orders.router, prefix=settings.API_V1_STR)
app.include_router(payments.router, prefix=settings.API_V1_STR)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error processing {request.method} {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred. Please try again."}
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)

