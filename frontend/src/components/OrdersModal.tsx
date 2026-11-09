import React, { useEffect, useState } from 'react';
import { X, Clock, Package } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { fetchGuestOrders } from '../services/api';
import { Order } from '../types';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OrdersModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  const { guestSessionId } = useCart();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      fetchGuestOrders(guestSessionId)
        .then((res) => setOrders(res))
        .catch((err) => console.error('Failed to load guest orders:', err))
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, guestSessionId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-ink-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl border border-ivory-300 shadow-elevated overflow-hidden max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-ivory-200 bg-ivory-50">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-cobalt-700" />
            <h3 className="font-serif font-bold text-ink-900 text-base">
              Guest Order History
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-ink-400 hover:text-ink-900 hover:bg-ivory-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Orders list */}
        <div className="overflow-y-auto p-6 space-y-4">
          {isLoading ? (
            <div className="py-12 text-center text-ink-500">
              <div className="w-7 h-7 border-2 border-cobalt-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-xs">Loading order history...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="py-16 text-center text-ink-500">
              <Package className="w-10 h-10 stroke-1 mx-auto text-ink-300 mb-2" />
              <p className="text-sm font-medium text-ink-800">No orders placed yet</p>
              <p className="text-xs text-ink-400 mt-1">Orders placed during this browser session will appear here.</p>
            </div>
          ) : (
            orders.map((ord) => (
              <div
                key={ord.id}
                className="p-4 rounded-2xl bg-ivory-50 border border-ivory-200 space-y-3"
              >
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="font-mono font-bold text-ink-900">{ord.id}</span>
                    <span className="text-ink-400 ml-2">
                      {new Date(ord.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full font-semibold text-[11px] ${
                      ord.status === 'PAID'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-ivory-200 text-ink-700'
                    }`}
                  >
                    {ord.status}
                  </span>
                </div>

                <div className="text-xs space-y-1">
                  {ord.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-ink-700">
                      <span>{item.quantity}x {item.product_name}</span>
                      <span className="font-medium">${item.line_total.toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-ivory-200/80 flex justify-between items-center text-xs">
                  <span className="text-ink-500">Total Charged</span>
                  <span className="font-bold text-ink-900 text-sm">${ord.total_amount.toFixed(2)} {ord.currency}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
