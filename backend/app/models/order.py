from sqlalchemy import Column, String, Float, Integer, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from backend.app.database import Base

class OrderStatus(str, enum.Enum):
    PENDING = "PENDING"
    AWAITING_PAYMENT_APPROVAL = "AWAITING_PAYMENT_APPROVAL"
    PROCESSING_CAPTURE = "PROCESSING_CAPTURE"
    PAID = "PAID"
    CANCELLED = "CANCELLED"
    FAILED = "FAILED"

class Order(Base):
    __tablename__ = "orders"

    id = Column(String(64), primary_key=True, index=True)
    guest_session_id = Column(String(128), index=True, nullable=False)
    status = Column(String(32), default=OrderStatus.PENDING.value, nullable=False, index=True)
    currency = Column(String(10), default="USD", nullable=False)
    
    subtotal = Column(Float, nullable=False)
    shipping_cost = Column(Float, default=0.0, nullable=False)
    tax_amount = Column(Float, default=0.0, nullable=False)
    total_amount = Column(Float, nullable=False)
    
    # PayPal Sandbox tracking fields
    paypal_order_id = Column(String(128), unique=True, nullable=True, index=True)
    paypal_capture_id = Column(String(128), unique=True, nullable=True, index=True)
    payer_email = Column(String(255), nullable=True)
    payer_name = Column(String(255), nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    paid_at = Column(DateTime, nullable=True)

    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    payment_records = relationship("PaymentRecord", back_populates="order", cascade="all, delete-orphan")

class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(String(64), primary_key=True, index=True)
    order_id = Column(String(64), ForeignKey("orders.id"), nullable=False, index=True)
    product_id = Column(String(64), ForeignKey("products.id"), nullable=False)
    product_name = Column(String(255), nullable=False)
    unit_price = Column(Float, nullable=False)
    quantity = Column(Integer, nullable=False)
    line_total = Column(Float, nullable=False)

    order = relationship("Order", back_populates="items")
    product = relationship("Product")

class PaymentRecord(Base):
    __tablename__ = "payment_records"

    id = Column(String(64), primary_key=True, index=True)
    order_id = Column(String(64), ForeignKey("orders.id"), nullable=False, index=True)
    paypal_order_id = Column(String(128), nullable=False, index=True)
    paypal_capture_id = Column(String(128), nullable=True, index=True)
    amount = Column(Float, nullable=False)
    currency = Column(String(10), nullable=False)
    status = Column(String(32), nullable=False)
    raw_response = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    order = relationship("Order", back_populates="payment_records")

