import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { PromptHero } from './components/PromptHero';
import { AssistantWorkspace } from './components/AssistantWorkspace';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { ComparisonMatrix } from './components/ComparisonMatrix';
import { CartDrawer } from './components/CartDrawer';
import { PayPalCheckoutModal } from './components/PayPalCheckoutModal';
import { OrderConfirmationModal } from './components/OrderConfirmationModal';
import { OrdersModal } from './components/OrdersModal';
import { Footer } from './components/Footer';

import { useAI } from './context/AIContext';
import { fetchProducts } from './services/api';
import { Product, ExplainedProduct, Order } from './types';
import { PackageSearch } from 'lucide-react';

export const App: React.FC = () => {
  const { recommendations, isLoading: isAILoading } = useAI();

  // Catalogue browsing state when not using AI or filtering AI results
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('relevance');
  const [categories, setCategories] = useState<string[]>([]);
  const [isCatalogueLoading, setIsCatalogueLoading] = useState<boolean>(true);

  // Modals & Drawers state
  const [activeDetailProduct, setActiveDetailProduct] = useState<{
    product: Product;
    explained?: ExplainedProduct;
  } | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState<boolean>(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  // Fetch initial catalogue
  useEffect(() => {
    setIsCatalogueLoading(true);
    fetchProducts({
      category: selectedCategory || undefined,
      sort_by: sortBy,
    })
      .then((data) => {
        setAllProducts(data);
        const uniqueCats = Array.from(new Set(data.map((p) => p.category)));
        if (categories.length === 0) setCategories(uniqueCats);
      })
      .catch((err) => console.error('Failed to load catalogue:', err))
      .finally(() => setIsCatalogueLoading(false));
  }, [selectedCategory, sortBy]);

  // Handle opening details modal
  const handleOpenDetails = (product: Product, explained?: ExplainedProduct) => {
    setActiveDetailProduct({ product, explained });
  };

  // Handle payment confirmation
  const handlePaymentSuccess = (verifiedOrder: Order) => {
    setIsCheckoutOpen(false);
    setConfirmedOrder(verifiedOrder);
  };

  // Determine which list of products to display
  let displayedItems: { product: Product; explained?: ExplainedProduct }[] = [];

  if (recommendations && recommendations.recommendations.length > 0) {
    // If AI recommendations are active, display ranked recommendations
    displayedItems = recommendations.recommendations
      .filter((rec) => (!selectedCategory ? true : rec.product.category === selectedCategory))
      .map((rec) => ({
        product: rec.product,
        explained: rec,
      }));

    // Apply manual sort if chosen
    if (sortBy === 'price_asc') {
      displayedItems.sort((a, b) => a.product.price - b.product.price);
    } else if (sortBy === 'price_desc') {
      displayedItems.sort((a, b) => b.product.price - a.product.price);
    } else if (sortBy === 'rating') {
      displayedItems.sort((a, b) => b.product.rating - a.product.rating);
    }
  } else {
    // Standard catalogue browsing
    displayedItems = allProducts.map((p) => ({ product: p }));
  }

  return (
    <div className="min-h-screen flex flex-col bg-ivory-100 font-sans selection:bg-cobalt-100 selection:text-cobalt-900">
      {/* Top Navigation */}
      <Navbar onOpenOrders={() => setIsOrdersOpen(true)} />

      {/* Main Hero & Prompt Composer */}
      <PromptHero />

      {/* AI Assistant Workspace (active when an AI search has results) */}
      <AssistantWorkspace
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        categories={categories}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />

      {/* Products Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 flex-1 w-full">
        {/* Section title & count */}
        <div className="flex items-center justify-between mb-6 pb-2 border-b border-ivory-300">
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold font-serif text-ink-900">
              {recommendations ? 'Recommended Matches' : 'Verified Product Catalogue'}
            </h2>
            <span className="text-xs font-semibold text-ink-500 bg-ivory-200 px-2 py-0.5 rounded-full">
              {displayedItems.length} Products
            </span>
          </div>

          {!recommendations && (
            <div className="flex items-center gap-3 text-xs">
              {/* Category pills */}
              <div className="hidden md:flex items-center gap-1.5">
                <button
                  onClick={() => setSelectedCategory('')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                    !selectedCategory
                      ? 'bg-ink-900 text-white'
                      : 'bg-ivory-200 text-ink-700 hover:bg-ivory-300'
                  }`}
                >
                  All
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                      selectedCategory === cat
                        ? 'bg-ink-900 text-white'
                        : 'bg-ivory-200 text-ink-700 hover:bg-ivory-300'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Sort by */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-ivory-100 border border-ivory-300 rounded-lg px-2.5 py-1 text-ink-800 text-xs font-medium focus:outline-none"
              >
                <option value="relevance">Featured</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Rating</option>
              </select>
            </div>
          )}
        </div>

        {/* Product Cards Grid */}
        {isCatalogueLoading || isAILoading ? (
          <div className="py-24 text-center">
            <div className="w-10 h-10 border-3 border-cobalt-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm font-medium text-ink-700">
              {isAILoading
                ? 'Evaluating constraints and ranking verified catalogue...'
                : 'Loading products...'}
            </p>
          </div>
        ) : displayedItems.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-3xl border border-ivory-300 p-8">
            <PackageSearch className="w-12 h-12 stroke-1 text-ink-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-ink-900 mb-1">No products found</h3>
            <p className="text-xs text-ink-500 max-w-sm mx-auto mb-4">
              Try adjusting your category filter, relaxing your budget, or asking for another product type.
            </p>
            <button
              onClick={() => setSelectedCategory('')}
              className="px-4 py-2 rounded-xl bg-ink-900 text-white text-xs font-semibold hover:bg-cobalt-700 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedItems.map(({ product, explained }) => (
              <ProductCard
                key={product.id}
                product={product}
                explained={explained}
                onOpenDetails={handleOpenDetails}
              />
            ))}
          </div>
        )}
      </main>

      {/* Slide-out Cart Drawer */}
      <CartDrawer onProceedToCheckout={() => setIsCheckoutOpen(true)} />

      {/* Comparison Matrix Modal */}
      <ComparisonMatrix />

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={activeDetailProduct?.product || null}
        explained={activeDetailProduct?.explained}
        onClose={() => setActiveDetailProduct(null)}
      />

      {/* PayPal Sandbox Checkout Modal */}
      <PayPalCheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onPaymentSuccess={handlePaymentSuccess}
      />

      {/* Order Confirmation Modal */}
      <OrderConfirmationModal
        order={confirmedOrder}
        onClose={() => setConfirmedOrder(null)}
      />

      {/* Guest Orders History Modal */}
      <OrdersModal
        isOpen={isOrdersOpen}
        onClose={() => setIsOrdersOpen(false)}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
};
