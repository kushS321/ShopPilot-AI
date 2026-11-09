import React from 'react';
import { X, Trash2, ShoppingBag, ShieldCheck, ArrowRight, Truck } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface CartDrawerProps {
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onProceedToCheckout }) => {
  const { cartData, isOpen, setIsOpen, updateQuantity, removeFromCart, clearCart, isLoading } = useCart();

  if (!isOpen) return null;

  const items = cartData?.items || [];
  const subtotal = cartData?.subtotal || 0;
  const shipping = cartData?.shipping_cost || 0;
  const tax = cartData?.tax_amount || 0;
  const total = cartData?.total_amount || 0;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-ink-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l border-ivory-300 shadow-elevated flex flex-col justify-between">
          {/* Header */}
          <div className="px-6 py-5 border-b border-ivory-200 bg-ivory-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-cobalt-700" />
              <h2 className="text-lg font-bold text-ink-900 font-serif">Your Cart</h2>
              {items.length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-ivory-200 text-ink-700 text-xs font-semibold">
                  {cartData?.item_count} items
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {items.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-xs text-ink-400 hover:text-red-600 transition-colors p-1"
                  title="Empty Cart"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full text-ink-400 hover:text-ink-900 hover:bg-ivory-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {items.length === 0 ? (
              <div className="py-20 text-center text-ink-500">
                <ShoppingBag className="w-12 h-12 stroke-1 mx-auto text-ink-300 mb-3" />
                <p className="text-base font-medium text-ink-800 mb-1">Your cart is empty</p>
                <p className="text-xs text-ink-500 max-w-xs mx-auto">
                  Ask ShopPilot AI for product recommendations or browse the catalogue.
                </p>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.product_id}
                  className="flex gap-4 p-3.5 rounded-2xl bg-ivory-50 border border-ivory-200/80 shadow-subtle relative group"
                >
                  {/* Thumbnail */}
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-ivory-200 shrink-0">
                    <img
                      src={item.image_url}
                      alt={item.product_name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-ink-400">
                        {item.brand}
                      </div>
                      <h4 className="text-xs sm:text-sm font-semibold text-ink-900 line-clamp-1 mb-1">
                        {item.product_name}
                      </h4>
                      <div className="text-xs font-bold text-ink-800">
                        ${item.unit_price.toFixed(2)}
                        <span className="text-ink-400 font-normal ml-1">
                          (₹{item.price_inr.toLocaleString()})
                        </span>
                      </div>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-ivory-200/80">
                      <div className="flex items-center border border-ivory-300 rounded-lg bg-white overflow-hidden text-xs">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                          className="px-2 py-0.5 text-ink-600 hover:bg-ivory-200 transition-colors"
                        >
                          -
                        </button>
                        <span className="px-2.5 font-semibold text-ink-900">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                          className="px-2 py-0.5 text-ink-600 hover:bg-ivory-200 transition-colors"
                        >
                          +
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-ink-900">
                          ${item.line_total.toFixed(2)}
                        </span>
                        <button
                          onClick={() => removeFromCart(item.product_id)}
                          className="text-ink-400 hover:text-red-600 transition-colors"
                          title="Remove"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer with Authoritative Price Summary & Checkout Button */}
          {items.length > 0 && (
            <div className="p-6 border-t border-ivory-200 bg-ivory-50 space-y-4">
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-ink-600">
                  <span>Authoritative Subtotal</span>
                  <span className="font-medium text-ink-900">${subtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-ink-600">
                  <span className="flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-cobalt-600" />
                    <span>Shipping</span>
                  </span>
                  <span className="font-medium text-ink-900">
                    {shipping === 0 ? (
                      <span className="text-emerald-700 font-bold">Free</span>
                    ) : (
                      `$${shipping.toFixed(2)}`
                    )}
                  </span>
                </div>

                <div className="flex justify-between text-ink-600">
                  <span>Estimated Tax (5%)</span>
                  <span className="font-medium text-ink-900">${tax.toFixed(2)}</span>
                </div>

                <div className="pt-2 border-t border-ivory-300 flex justify-between text-sm sm:text-base font-bold text-ink-900">
                  <span>Total Amount</span>
                  <span className="text-cobalt-800">${total.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-ink-500">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verified PayPal Sandbox Checkout • Server-side Authoritative</span>
              </div>

              <button
                onClick={() => {
                  setIsOpen(false);
                  onProceedToCheckout();
                }}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-ink-900 hover:bg-cobalt-700 text-white font-medium text-sm transition-all shadow-card disabled:opacity-50"
              >
                <span>Checkout with PayPal</span>
                <ArrowRight className="w-4 h-4 text-ivory-300" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

