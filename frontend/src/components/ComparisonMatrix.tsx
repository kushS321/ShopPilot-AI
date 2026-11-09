import React, { useEffect, useState } from 'react';
import { X, ShoppingBag, Trash2, Sparkles } from 'lucide-react';
import { useComparison } from '../context/ComparisonContext';
import { useCart } from '../context/CartContext';
import { compareProducts } from '../services/api';
import { ProductComparisonResponse } from '../types';

export const ComparisonMatrix: React.FC = () => {
  const { selectedProducts, isOpen, setIsOpen, removeFromCompare, clearComparison } = useComparison();
  const { addToCart } = useCart();
  const [data, setData] = useState<ProductComparisonResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && selectedProducts.length >= 2) {
      setIsLoading(true);
      setError(null);
      const ids = selectedProducts.map((p) => p.id);
      compareProducts(ids)
        .then((res) => setData(res))
        .catch((err) => setError(err.message))
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, selectedProducts]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-ink-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-6xl bg-white rounded-3xl border border-ivory-300 shadow-elevated overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-ivory-200 bg-ivory-50">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-ink-900 font-serif">
              Product Comparison Matrix
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-cobalt-100 text-cobalt-800 text-xs font-semibold">
              {selectedProducts.length} Products Selected
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={clearComparison}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-ink-500 hover:text-red-600 hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All</span>
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-full text-ink-400 hover:text-ink-900 hover:bg-ivory-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content area */}
        <div className="overflow-y-auto p-6">
          {selectedProducts.length < 2 ? (
            <div className="py-12 text-center text-ink-500">
              <p className="text-base font-medium mb-2">Select at least 2 products to compare.</p>
              <p className="text-xs text-ink-400">
                Click the scale icon on any product card in the catalogue to add it to your comparison tray.
              </p>
            </div>
          ) : isLoading ? (
            <div className="py-16 text-center text-ink-500">
              <div className="w-8 h-8 border-3 border-cobalt-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm font-medium">Calculating technical differences...</p>
            </div>
          ) : error ? (
            <div className="p-4 rounded-xl bg-red-50 text-red-800 text-sm">
              {error}
            </div>
          ) : data ? (
            <div className="space-y-6">
              {/* AI Comparison Verdict */}
              {data.ai_comparison_verdict && (
                <div className="p-4 rounded-2xl bg-cobalt-50/70 border border-cobalt-200/80 flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-cobalt-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-cobalt-900 block mb-0.5">
                      AI Recommendation Verdict
                    </span>
                    <p className="text-sm text-ink-800 leading-relaxed font-normal">
                      {data.ai_comparison_verdict}
                    </p>
                  </div>
                </div>
              )}

              {/* Comparison Grid Table */}
              <div className="overflow-x-auto border border-ivory-300 rounded-2xl">
                <table className="w-full text-left text-xs divide-y divide-ivory-200">
                  {/* Product Cards Header Row */}
                  <thead>
                    <tr className="bg-ivory-50 divide-x divide-ivory-200">
                      <th className="p-4 w-44 font-medium text-ink-500 text-xs">Product Details</th>
                      {data.products.map((p) => {
                        const isBestVal = p.id === data.best_value_product_id;
                        return (
                          <th key={p.id} className="p-4 min-w-[220px] align-top relative">
                            {isBestVal && (
                              <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold mb-2">
                                ★ Best Value Pick
                              </span>
                            )}
                            <div className="relative h-28 rounded-lg overflow-hidden bg-ivory-100 mb-2">
                              <img
                                src={p.image_url}
                                alt={p.name}
                                className="w-full h-full object-cover"
                              />
                              <button
                                onClick={() => removeFromCompare(p.id)}
                                className="absolute top-1.5 right-1.5 p-1 rounded-full bg-ink-900/60 text-white hover:bg-ink-900 transition-colors"
                                title="Remove"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>

                            <span className="text-[10px] uppercase font-bold text-ink-400 block mb-0.5">
                              {p.brand}
                            </span>
                            <div className="font-semibold text-ink-900 text-sm line-clamp-2 mb-2">
                              {p.name}
                            </div>

                            <div className="flex items-baseline gap-1.5 mb-3">
                              <span className="text-base font-bold text-ink-900">
                                ${p.price.toFixed(2)}
                              </span>
                              <span className="text-xs text-ink-500">
                                (₹{p.price_inr.toLocaleString()})
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={() => addToCart(p, 1)}
                              className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-ink-900 hover:bg-cobalt-700 text-white font-medium text-xs transition-colors shadow-subtle"
                            >
                              <ShoppingBag className="w-3.5 h-3.5 text-ivory-300" />
                              <span>Add to Cart</span>
                            </button>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-ivory-200 bg-white">
                    {/* Price Difference Row */}
                    <tr className="divide-x divide-ivory-200 bg-ivory-50/50">
                      <td className="p-3.5 font-bold text-ink-700 uppercase tracking-wider text-[11px]">
                        Price Difference
                      </td>
                      {data.products.map((p) => {
                        const diff = data.price_differences[p.id] || 0;
                        return (
                          <td key={p.id} className="p-3.5 font-mono font-medium text-xs">
                            {diff === 0 ? (
                              <span className="text-emerald-700 font-bold">Lowest Price</span>
                            ) : (
                              <span className="text-ink-600">+${diff.toFixed(2)} vs lowest</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>

                    {/* Specifications Rows */}
                    {data.all_spec_keys.map((specKey, rowIdx) => (
                      <tr
                        key={specKey}
                        className={`divide-x divide-ivory-200 ${
                          rowIdx % 2 === 0 ? 'bg-white' : 'bg-ivory-50/30'
                        }`}
                      >
                        <td className="p-3.5 font-medium text-ink-600 capitalize text-[11px]">
                          {specKey.replace('_', ' ')}
                        </td>
                        {data.products.map((p) => {
                          const val = data.spec_matrix[specKey]?.[p.id] || '—';
                          return (
                            <td key={p.id} className="p-3.5 text-ink-900 font-medium">
                              {val}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
