from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from backend.app.database import get_db
from backend.app.schemas.product import (
    ProductResponse,
    ProductComparisonRequest,
    ProductComparisonResponse,
)
from backend.app.services.catalogue_service import CatalogueService

router = APIRouter(prefix="/products", tags=["Products"])

@router.get("", response_model=List[ProductResponse])
def list_products(
    category: Optional[str] = None,
    brand: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    currency: str = Query("USD", description="Currency for price filtering (USD or INR)"),
    search: Optional[str] = None,
    sort_by: str = Query("relevance", description="relevance | price_asc | price_desc | rating"),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    service = CatalogueService(db)
    return service.get_products(
        category=category,
        brand=brand,
        min_price=min_price,
        max_price=max_price,
        currency=currency,
        search=search,
        sort_by=sort_by,
        limit=limit,
        offset=offset
    )

@router.get("/categories", response_model=List[str])
def get_categories(db: Session = Depends(get_db)):
    service = CatalogueService(db)
    return service.get_categories()

@router.get("/brands", response_model=List[str])
def get_brands(db: Session = Depends(get_db)):
    service = CatalogueService(db)
    return service.get_brands()

@router.get("/{product_id}", response_model=ProductResponse)
def get_product(product_id: str, db: Session = Depends(get_db)):
    service = CatalogueService(db)
    product = service.get_product_by_id(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.post("/compare", response_model=ProductComparisonResponse)
def compare_products(req: ProductComparisonRequest, db: Session = Depends(get_db)):
    service = CatalogueService(db)
    try:
        return service.compare_products(req.product_ids)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

