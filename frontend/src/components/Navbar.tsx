import React from 'react';
import { ShoppingBag, Scale, Clock, ShieldCheck, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useComparison } from '../context/ComparisonContext';
import { useAI } from '../context/AIContext';

interface NavbarProps {
  onOpenOrders: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenOrders }) => {
  const { cartData, setIsOpen: setCartOpen } = useCart();
  const { selectedProducts, setIsOpen: setCompareOpen } = useComparison();
  const { resetSearch } = useAI();

  const totalItems = cartData?.item_count || 0;
  const subtotal = cartData?.subtotal || 0;

  return (
    <header className="sticky top-0 z-40 bg-ivory-50/95 backdrop-blur-md border-b border-ivory-300/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Brand Wordmark */}
          <button
            onClick={resetSearch}
            className="flex items-center gap-2.5 text-left group focus:outline-none"
          >
            <div className="w-9 h-9 rounded-lg bg-ink-900 flex items-center justify-center text-ivory-50 shadow-subtle group-hover:bg-cobalt-700 transition-colors">
              <Sparkles className="w-5 h-5 text-cobalt-200" />
            </div>
            <div>
              <span className="font-serif text-2xl font-bold tracking-tight text-ink-900 group-hover:text-cobalt-800 transition-colors">
                ShopPilot<span className="text-cobalt-600">.</span>ai
              </span>
            </div>
          </button>

          {/* Right Navigation & Status */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Sandbox Indicator */}
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cobalt-50 text-cobalt-800 border border-cobalt-200 text-xs font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-cobalt-600" />
              <span>PayPal Sandbox Verified</span>
            </div>

            {/* Compare Pill */}
            {selectedProducts.length > 0 && (
              <button
                onClick={() => setCompareOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-ivory-200 hover:bg-ivory-300 text-ink-800 border border-ivory-400 text-xs font-medium transition-all shadow-subtle animate-in fade-in"
              >
                <Scale className="w-3.5 h-3.5 text-cobalt-700" />
                <span>Compare</span>
                <span className="w-4 h-4 rounded-full bg-cobalt-600 text-white flex items-center justify-center text-[10px] font-bold">
                  {selectedProducts.length}
                </span>
              </button>
            )}

            {/* Orders History Link */}
            <button
              onClick={onOpenOrders}
              className="p-2 rounded-lg hover:bg-ivory-200 text-ink-700 hover:text-ink-900 transition-colors relative"
              title="Recent Orders"
              aria-label="View recent orders"
            >
              <Clock className="w-5 h-5" />
            </button>

            {/* Cart Button */}
            <button
              onClick={() => setCartOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-ink-900 hover:bg-cobalt-700 text-white font-medium text-sm transition-all shadow-card focus:outline-none focus:ring-2 focus:ring-cobalt-500 focus:ring-offset-2"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-4 h-4 text-ivory-300" />
              <span className="hidden sm:inline">Cart</span>
              {totalItems > 0 && (
                <>
                  <span className="px-1.5 py-0.2 bg-cobalt-500 text-white text-xs font-bold rounded-full">
                    {totalItems}
                  </span>
                  <span className="text-ivory-300 text-xs font-normal border-l border-ink-700 pl-1.5">
                    ${subtotal.toFixed(2)}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

