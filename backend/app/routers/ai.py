from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.schemas.ai import (
    AIQueryRequest,
    AIRecommendationResponse,
)
from backend.app.services.ai_service import AIService

router = APIRouter(prefix="/ai", tags=["AI Intelligence"])

@router.post("/query", response_model=AIRecommendationResponse)
def process_ai_query(req: AIQueryRequest, db: Session = Depends(get_db)):
    ai_service = AIService(db)
    return ai_service.process_recommendation_request(req)

@router.post("/refine", response_model=AIRecommendationResponse)
def refine_ai_query(req: AIQueryRequest, db: Session = Depends(get_db)):
    ai_service = AIService(db)
    return ai_service.process_recommendation_request(req)

