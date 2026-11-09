import React, { useState } from 'react';
import { X, ShoppingBag, Scale, Check, Star, ShieldCheck, Zap } from 'lucide-react';
import { Product, ExplainedProduct } from '../types';
import { useCart } from '../context/CartContext';
import { useComparison } from '../context/ComparisonContext';

interface ModalProps {
  product: Product | null;
  explained?: ExplainedProduct | null;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ModalProps> = ({
  product,
  explained,
  onClose,
}) => {
  const { addToCart } = useCart();
  const { addToCompare, isComparing } = useComparison();
  const [quantity, setQuantity] = useState<number>(1);
  const [isAdded, setIsAdded] = useState<boolean>(false);

  if (!product) return null;

  const comparing = isComparing(product.id);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-ink-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl border border-ivory-300 shadow-elevated overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-ivory-200">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-semibold tracking-wider text-ink-500">
              {product.brand} • {product.category}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-ink-400 hover:text-ink-900 hover:bg-ivory-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Image */}
            <div className="relative rounded-2xl overflow-hidden bg-ivory-100 aspect-square">
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-ink-900/80 backdrop-blur-sm text-ivory-100 text-xs font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Verified Catalogue Record
                </span>
              </div>
            </div>

            {/* Info and Price */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center text-amber-500">
                  <Star className="w-4 h-4 fill-amber-500" />
                  <span className="text-sm font-semibold ml-1 text-ink-900">{product.rating}</span>
                </div>
                <span className="text-xs text-ink-400">({product.review_count} verified reviews)</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-ink-900 leading-snug mb-3">
                {product.name}
              </h2>

              <p className="text-sm text-ink-600 leading-relaxed mb-4">
                {product.description}
              </p>

              {/* Price block */}
              <div className="p-4 rounded-xl bg-ivory-100 border border-ivory-200 mb-4">
                <div className="text-xs text-ink-500 mb-0.5">Verified Catalogue Price:</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-ink-900">
                    ${product.price.toFixed(2)}
                  </span>
                  <span className="text-sm text-ink-600 font-medium">
                    (₹{product.price_inr.toLocaleString()})
                  </span>
                </div>
                <div className="text-[11px] text-ink-400 mt-1">
                  Authoritative base currency: USD • Includes applicable domestic taxes at checkout
                </div>
              </div>

              {/* Match Score Radar / Breakdown if available */}
              {explained && (
                <div className="p-4 rounded-xl bg-cobalt-50/60 border border-cobalt-200 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-cobalt-900 flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-cobalt-600 fill-current" />
                      Recommendation Score
                    </span>
                    <span className="text-sm font-extrabold text-cobalt-800">
                      {explained.match_score}/100
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    {Object.entries(explained.score_breakdown).map(([k, val]) => (
                      <div key={k} className="flex items-center justify-between text-ink-600 text-[11px]">
                        <span className="capitalize">{k.replace('_', ' ')}</span>
                        <span className="font-mono font-medium text-ink-800">{val} pts</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity and Actions */}
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-ivory-400 rounded-xl bg-white overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 text-ink-600 hover:bg-ivory-200 transition-colors"
                  >
                    -
                  </button>
                  <span className="px-3 font-semibold text-sm text-ink-900">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                    className="px-3 py-2 text-ink-600 hover:bg-ivory-200 transition-colors"
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleAddToCart}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-medium text-sm transition-all shadow-subtle ${
                    isAdded
                      ? 'bg-emerald-600 text-white'
                      : 'bg-ink-900 hover:bg-cobalt-700 text-white'
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
                      <span>Add to Cart (${(product.price * quantity).toFixed(2)})</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => addToCompare(product)}
                  className={`p-2.5 rounded-xl border transition-colors ${
                    comparing
                      ? 'bg-cobalt-600 text-white border-cobalt-700'
                      : 'border-ivory-400 hover:bg-ivory-200 text-ink-700'
                  }`}
                  title="Compare"
                >
                  <Scale className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Features */}
          {product.features?.length > 0 && (
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-ink-700 mb-2">
                Key Features
              </h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-ink-700">
                {product.features.map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-2 p-2 rounded-lg bg-ivory-100">
                    <Check className="w-3.5 h-3.5 text-cobalt-600 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Structured Specifications Table */}
          {product.specifications && Object.keys(product.specifications).length > 0 && (
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-ink-700 mb-2">
                Technical Specifications
              </h3>
              <div className="border border-ivory-300 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs divide-y divide-ivory-200">
                  <tbody className="divide-y divide-ivory-200 bg-white">
                    {Object.entries(product.specifications).map(([specKey, specVal], idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-ivory-50/50' : 'bg-white'}>
                        <td className="px-4 py-2.5 font-medium text-ink-500 uppercase tracking-wider text-[11px] w-1/3">
                          {specKey.replace('_', ' ')}
                        </td>
                        <td className="px-4 py-2.5 text-ink-900 font-medium">
                          {specVal}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

