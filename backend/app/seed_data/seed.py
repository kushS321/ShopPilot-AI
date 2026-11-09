import json
from pathlib import Path
from backend.app.database import SessionLocal, Base, engine
from backend.app.models.product import Product

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        json_path = Path(__file__).parent / "products.json"
        with open(json_path, "r", encoding="utf-8") as f:
            products_data = json.load(f)
            
        count = 0
        for item in products_data:
            existing = db.query(Product).filter(Product.id == item["id"]).first()
            if not existing:
                product = Product(
                    id=item["id"],
                    name=item["name"],
                    brand=item["brand"],
                    category=item["category"],
                    description=item["description"],
                    price=item["price"],
                    price_inr=item["price_inr"],
                    currency=item.get("currency", "USD"),
                    image_url=item["image_url"],
                    features=item.get("features", []),
                    specifications=item.get("specifications", {}),
                    is_in_stock=item.get("is_in_stock", True),
                    stock_quantity=item.get("stock_quantity", 25),
                    rating=item.get("rating", 4.5),
                    review_count=item.get("review_count", 0),
                    data_source=item.get("data_source", "ShopPilot Verified Catalogue")
                )
                db.add(product)
                count += 1
            else:
                # Update existing records with latest specs
                for key, val in item.items():
                    setattr(existing, key, val)
                    
        db.commit()
        print(f"Successfully seeded/updated {len(products_data)} products ({count} newly inserted).")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()

