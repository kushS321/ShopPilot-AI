from sqlalchemy import Column, String, Float, Boolean, Integer, DateTime, JSON, Text
from datetime import datetime
from backend.app.database import Base

class Product(Base):
    __tablename__ = "products"

    id = Column(String(64), primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    brand = Column(String(128), nullable=False, index=True)
    category = Column(String(128), nullable=False, index=True)
    description = Column(Text, nullable=False)
    
    # Authoritative monetary pricing
    price = Column(Float, nullable=False) # In USD (base authoritative currency)
    price_inr = Column(Float, nullable=False) # Reference INR price
    currency = Column(String(10), default="USD", nullable=False)
    
    image_url = Column(String(512), nullable=False)
    features = Column(JSON, default=list) # List of key feature bullets
    specifications = Column(JSON, default=dict) # Dict of normalized specs
    
    is_in_stock = Column(Boolean, default=True, nullable=False)
    stock_quantity = Column(Integer, default=25, nullable=False)
    rating = Column(Float, default=4.5)
    review_count = Column(Integer, default=0)
    data_source = Column(String(128), default="ShopPilot Verified Catalogue")
    
    created_at = Column(DateTime, default=datetime.utcnow)

