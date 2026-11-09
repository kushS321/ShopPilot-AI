from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, asc, desc
from typing import List, Optional, Dict, Any
from backend.app.models.product import Product
from backend.app.schemas.product import ProductResponse, ProductComparisonResponse

class CatalogueService:
    def __init__(self, db: Session):
        self.db = db

    def get_products(
        self,
        category: Optional[str] = None,
        brand: Optional[str] = None,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None,
        currency: str = "USD",
        search: Optional[str] = None,
        sort_by: Optional[str] = "relevance",
        limit: int = 20,
        offset: int = 0
    ) -> List[Product]:
        query = self.db.query(Product)

        if category:
            query = query.filter(Product.category.ilike(f"%{category}%"))
        
        if brand:
            query = query.filter(Product.brand.ilike(f"%{brand}%"))
            
        # Price filtering based on currency
        if currency.upper() == "INR":
            if min_price is not None:
                query = query.filter(Product.price_inr >= min_price)
            if max_price is not None:
                query = query.filter(Product.price_inr <= max_price)
        else:
            if min_price is not None:
                query = query.filter(Product.price >= min_price)
            if max_price is not None:
                query = query.filter(Product.price <= max_price)

        if search:
            search_terms = search.strip().split()
            for term in search_terms:
                term_like = f"%{term}%"
                query = query.filter(
                    or_(
                        Product.name.ilike(term_like),
                        Product.brand.ilike(term_like),
                        Product.category.ilike(term_like),
                        Product.description.ilike(term_like),
                    )
                )

        if sort_by == "price_asc":
            query = query.order_by(asc(Product.price))
        elif sort_by == "price_desc":
            query = query.order_by(desc(Product.price))
        elif sort_by == "rating":
            query = query.order_by(desc(Product.rating))
        else:
            # Default order
            query = query.order_by(desc(Product.rating), asc(Product.price))

        return query.offset(offset).limit(limit).all()

    def get_product_by_id(self, product_id: str) -> Optional[Product]:
        return self.db.query(Product).filter(Product.id == product_id).first()

    def get_categories(self) -> List[str]:
        results = self.db.query(Product.category).distinct().all()
        return [r[0] for r in results if r[0]]

    def get_brands(self) -> List[str]:
        results = self.db.query(Product.brand).distinct().all()
        return [r[0] for r in results if r[0]]

    def compare_products(self, product_ids: List[str]) -> ProductComparisonResponse:
        products = self.db.query(Product).filter(Product.id.in_(product_ids)).all()
        if len(products) < 2:
            raise ValueError("At least 2 valid products must be provided for comparison.")

        # Collect all spec keys
        all_spec_keys = set()
        for p in products:
            if p.specifications:
                all_spec_keys.update(p.specifications.keys())

        sorted_spec_keys = sorted(list(all_spec_keys))

        # Build spec matrix: spec_key -> {prod_id: value}
        spec_matrix: Dict[str, Dict[str, Any]] = {}
        for key in sorted_spec_keys:
            spec_matrix[key] = {}
            for p in products:
                spec_matrix[key][p.id] = (p.specifications or {}).get(key, "—")

        # Price differences relative to the lowest priced product
        min_price = min(p.price for p in products)
        price_differences = {p.id: round(p.price - min_price, 2) for p in products}

        # Best value candidate (highest rating-to-price ratio or lowest price with high rating)
        best_val = max(products, key=lambda p: (p.rating / max(p.price, 1.0)))

        return ProductComparisonResponse(
            products=[ProductResponse.model_validate(p) for p in products],
            all_spec_keys=sorted_spec_keys,
            spec_matrix=spec_matrix,
            price_differences=price_differences,
            best_value_product_id=best_val.id,
            ai_comparison_verdict=f"Across these {len(products)} products, the {best_val.name} delivers the most balanced performance and value per dollar."
        )

