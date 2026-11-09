import React, { useState } from 'react';
import { ShoppingBag, Scale, Check, ChevronDown, ChevronUp, Star, ShieldCheck, Zap } from 'lucide-react';
import { Product, ExplainedProduct } from '../types';
import { useCart } from '../context/CartContext';
import { useComparison } from '../context/ComparisonContext';

interface ProductCardProps {
  product: Product;
  explained?: ExplainedProduct;
  onOpenDetails: (product: Product, explained?: ExplainedProduct) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  explained,
  onOpenDetails,
}) => {
  const { addToCart } = useCart();
  const { addToCompare, isComparing } = useComparison();
  const [showTradeoffs, setShowTradeoffs] = useState<boolean>(false);
  const [isAdded, setIsAdded] = useState<boolean>(false);

  const comparing = isComparing(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1200);
  };

  const handleCompareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCompare(product);
  };

  // Determine badge styling based on tier
  const matchScore = explained?.match_score ?? null;
  const matchTier = explained?.match_tier ?? null;

  const getTierColor = (tier: string | null) => {
    if (tier === 'Strong Match') {
      return 'bg-emerald-50 text-emerald-800 border-emerald-300';
    }
    if (tier === 'Budget Exceeded Alternative') {
      return 'bg-amber-50 text-amber-800 border-amber-300';
    }
    return 'bg-cobalt-50 text-cobalt-800 border-cobalt-200';
  };

  return (
    <div
      onClick={() => onOpenDetails(product, explained)}
      className="group relative flex flex-col bg-white rounded-2xl border border-ivory-300 hover:border-cobalt-300 shadow-card hover:shadow-elevated transition-all duration-200 overflow-hidden cursor-pointer"
    >
      {/* Product Image Area */}
      <div className="relative h-56 w-full bg-ivory-100 overflow-hidden">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          {matchScore !== null ? (
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-semibold border shadow-subtle ${getTierColor(
                matchTier
              )}`}
            >
              <Zap className="w-3 h-3 inline-block mr-1 -mt-0.5 fill-current" />
              {matchScore}% Match • {matchTier}
            </span>
          ) : (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-ivory-200/90 text-ink-700 backdrop-blur-sm">
              {product.category}
            </span>
          )}

          {/* Compare Checkbox Button */}
          <button
            type="button"
            onClick={handleCompareClick}
            className={`pointer-events-auto p-1.5 rounded-full border text-xs font-medium transition-all shadow-subtle ${
              comparing
                ? 'bg-cobalt-600 text-white border-cobalt-700'
                : 'bg-white/95 text-ink-600 border-ivory-400 hover:bg-white hover:text-ink-900'
            }`}
            title={comparing ? 'Remove from comparison' : 'Add to compare'}
          >
            <Scale className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Stock / Verified Pill */}
        <div className="absolute bottom-2.5 left-3">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-ink-900/75 backdrop-blur-sm text-ivory-100 text-[11px] font-medium">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            Verified Catalogue
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Brand & Title */}
          <div className="flex items-center justify-between text-xs font-medium text-ink-500 mb-1">
            <span className="uppercase tracking-wider">{product.brand}</span>
            <div className="flex items-center gap-1 text-ink-700">
              <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
              <span>{product.rating}</span>
              <span className="text-ink-400">({product.review_count})</span>
            </div>
          </div>

          <h3 className="font-medium text-ink-900 text-sm sm:text-base leading-snug line-clamp-2 mb-2 group-hover:text-cobalt-700 transition-colors">
            {product.name}
          </h3>

          {/* Pricing */}
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-lg sm:text-xl font-bold text-ink-900">
              ${product.price.toFixed(2)}
            </span>
            <span className="text-xs sm:text-sm text-ink-500 font-normal">
              (₹{product.price_inr.toLocaleString()})
            </span>
          </div>

          {/* Key Specs Pill Bar */}
          <div className="flex flex-wrap gap-1.5 mb-3 text-[11px]">
            {product.specifications?.battery_life && (
              <span className="px-2 py-0.5 rounded bg-ivory-200 text-ink-700 font-medium">
                🔋 {product.specifications.battery_life}
              </span>
            )}
            {product.specifications?.weight && (
              <span className="px-2 py-0.5 rounded bg-ivory-200 text-ink-700 font-medium">
                ⚖️ {product.specifications.weight}
              </span>
            )}
            {product.specifications?.noise_cancelling && (
              <span className="px-2 py-0.5 rounded bg-ivory-200 text-ink-700 font-medium">
                🎧 {product.specifications.noise_cancelling}
              </span>
            )}
          </div>

          {/* AI Grounded Reason */}
          {explained && (
            <div className="p-2.5 rounded-lg bg-ivory-100 border border-ivory-200 text-xs text-ink-700 mb-3">
              <div className="font-medium text-ink-900 mb-0.5">Why it matches:</div>
              <p className="line-clamp-2 leading-relaxed text-ink-600">
                {explained.why_recommended}
              </p>
            </div>
          )}

          {/* Advantages / Trade-offs toggle */}
          {explained && (explained.key_advantages.length > 0 || explained.trade_offs.length > 0) && (
            <div className="mb-3">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowTradeoffs(!showTradeoffs);
                }}
                className="flex items-center gap-1 text-[11px] font-medium text-cobalt-700 hover:text-cobalt-900"
              >
                <span>{showTradeoffs ? 'Hide trade-offs' : 'View advantages & trade-offs'}</span>
                {showTradeoffs ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>

              {showTradeoffs && (
                <div className="mt-2 space-y-1.5 text-xs animate-in fade-in">
                  {explained.key_advantages.map((adv, idx) => (
                    <div key={idx} className="flex items-start gap-1.5 text-emerald-800 text-[11px]">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span>{adv}</span>
                    </div>
                  ))}
                  {explained.trade_offs.map((to, idx) => (
                    <div key={idx} className="flex items-start gap-1.5 text-amber-800 text-[11px]">
                      <span className="text-amber-600 font-bold">•</span>
                      <span>{to}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="pt-3 border-t border-ivory-200 flex items-center gap-2">
          <button
            type="button"
            onClick={handleAddToCart}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl font-medium text-xs sm:text-sm transition-all ${
              isAdded
                ? 'bg-emerald-600 text-white'
                : 'bg-ink-900 hover:bg-cobalt-700 text-white shadow-subtle'
            }`}
          >
            {isAdded ? (
              <>
                <Check className="w-4 h-4" />
                <span>Added to Cart</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4 text-ivory-300" />
                <span>Add to Cart</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetails(product, explained);
            }}
            className="px-3 py-2 rounded-xl bg-ivory-200 hover:bg-ivory-300 text-ink-700 text-xs sm:text-sm font-medium transition-colors"
          >
            Specs
          </button>
        </div>
      </div>
    </div>
  );
};

