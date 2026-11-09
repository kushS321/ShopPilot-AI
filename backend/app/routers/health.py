from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.config import settings
from backend.app.services.paypal_service import PayPalService

router = APIRouter(tags=["Health"])

@router.get("/health")
def health_check(db: Session = Depends(get_db)):
    db_ok = False
    try:
        from sqlalchemy import text
        db.execute(text("SELECT 1"))
        db_ok = True
    except Exception:
        db_ok = False

    paypal_svc = PayPalService()

    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "database_connected": db_ok,
        "ai_provider": {
            "name": "Google Gemini",
            "model": settings.GEMINI_MODEL,
            "configured": bool(settings.GEMINI_API_KEY)
        },
        "paypal_sandbox": {
            "environment": settings.PAYPAL_ENVIRONMENT,
            "configured": paypal_svc.is_configured(),
            "client_id_available": bool(settings.PAYPAL_CLIENT_ID)
        }
    }

