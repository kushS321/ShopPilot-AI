from sqlalchemy.orm import Session
from decimal import Decimal, ROUND_HALF_UP
from typing import List, Tuple
from backend.app.models.product import Product
from backend.app.schemas.cart import (
    CartItemInput,
    CartItemValidated,
    CartValidationResponse,
)

class CartService:
    def __init__(self, db: Session):
        self.db = db

    def validate_and_calculate_cart(self, items: List[CartItemInput], currency: str = "USD") -> CartValidationResponse:
        """
        Authoritatively recalculates line totals, subtotal, shipping, tax,
        and final payable amount from database records. Never trusts client prices.
        """
        validated_items: List[CartItemValidated] = []
        errors: List[str] = []
        subtotal_dec = Decimal("0.00")

        if not items:
            return CartValidationResponse(
                items=[],
                item_count=0,
                subtotal=0.0,
                shipping_cost=0.0,
                tax_amount=0.0,
                total_amount=0.0,
                currency=currency,
                is_valid=True,
                validation_errors=[]
            )

        for item in items:
            if item.quantity <= 0:
                errors.append(f"Invalid quantity {item.quantity} for product ID {item.product_id}. Must be at least 1.")
                continue

            product = self.db.query(Product).filter(Product.id == item.product_id).first()
            if not product:
                errors.append(f"Product '{item.product_id}' was not found in the catalogue.")
                continue

            if not product.is_in_stock or product.stock_quantity <= 0:
                errors.append(f"Product '{product.name}' is currently out of stock.")
                continue

            if item.quantity > product.stock_quantity:
                errors.append(f"Requested {item.quantity} units of '{product.name}', but only {product.stock_quantity} available.")
                continue

            # Authoritative pricing
            unit_price_dec = Decimal(str(round(product.price, 2)))
            qty_dec = Decimal(str(item.quantity))
            line_total_dec = (unit_price_dec * qty_dec).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
            subtotal_dec += line_total_dec

            validated_items.append(
                CartItemValidated(
                    product_id=product.id,
                    product_name=product.name,
                    brand=product.brand,
                    image_url=product.image_url,
                    unit_price=float(unit_price_dec),
                    price_inr=product.price_inr,
                    quantity=item.quantity,
                    line_total=float(line_total_dec),
                    is_in_stock=product.is_in_stock,
                    stock_quantity=product.stock_quantity
                )
            )

        # Shipping calculation: Free shipping above $50.00, otherwise flat $5.00
        shipping_dec = Decimal("0.00") if (subtotal_dec >= Decimal("50.00") or subtotal_dec == 0) else Decimal("5.00")
        
        # Standard transparent tax rate (e.g. 5% tax or 0% for student sandbox demo)
        tax_dec = (subtotal_dec * Decimal("0.05")).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        total_dec = (subtotal_dec + shipping_dec + tax_dec).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

        is_valid = len(errors) == 0 and len(validated_items) > 0

        return CartValidationResponse(
            items=validated_items,
            item_count=sum(i.quantity for i in validated_items),
            subtotal=float(subtotal_dec),
            shipping_cost=float(shipping_dec),
            tax_amount=float(tax_dec),
            total_amount=float(total_dec),
            currency="USD",
            is_valid=is_valid,
            validation_errors=errors
        )

