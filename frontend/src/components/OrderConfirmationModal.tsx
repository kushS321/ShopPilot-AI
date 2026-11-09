import React from 'react';
import { CheckCircle2, ShieldCheck, Printer, ArrowRight, Package } from 'lucide-react';
import { Order } from '../types';

interface ModalProps {
  order: Order | null;
  onClose: () => void;
}

export const OrderConfirmationModal: React.FC<ModalProps> = ({ order, onClose }) => {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-ink-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl border border-ivory-300 shadow-elevated overflow-hidden">
        {/* Header */}
        <div className="p-6 sm:p-8 text-center border-b border-ivory-200 bg-ivory-50/60">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-subtle">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold mb-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Verified PayPal Sandbox Transaction
          </span>

          <h2 className="text-2xl sm:text-3xl font-bold font-serif text-ink-900 mb-1">
            Payment Confirmed
          </h2>
          <p className="text-xs sm:text-sm text-ink-600 max-w-md mx-auto">
            Your payment was authoritatively captured and verified on the ShopPilot backend.
          </p>
        </div>

        {/* Receipt Content */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Metadata Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-ivory-100 border border-ivory-200">
              <span className="text-ink-400 block mb-0.5">Order ID</span>
              <span className="font-mono font-bold text-ink-900 text-xs truncate block">{order.id}</span>
            </div>
            <div className="p-3 rounded-xl bg-ivory-100 border border-ivory-200">
              <span className="text-ink-400 block mb-0.5">Status</span>
              <span className="font-bold text-emerald-700 block">{order.status}</span>
            </div>
            <div className="p-3 rounded-xl bg-ivory-100 border border-ivory-200">
              <span className="text-ink-400 block mb-0.5">PayPal Order ID</span>
              <span className="font-mono font-bold text-ink-900 text-xs truncate block">{order.paypal_order_id || 'N/A'}</span>
            </div>
            <div className="p-3 rounded-xl bg-ivory-100 border border-ivory-200">
              <span className="text-ink-400 block mb-0.5">Capture Reference</span>
              <span className="font-mono font-bold text-ink-900 text-xs truncate block">{order.paypal_capture_id || 'CAP_VERIFIED'}</span>
            </div>
          </div>

          {/* Purchased Items Table */}
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-ink-600 mb-3">
              <Package className="w-4 h-4 text-cobalt-600" />
              <span>Purchased Line Items</span>
            </div>

            <div className="border border-ivory-300 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs divide-y divide-ivory-200">
                <thead className="bg-ivory-100 text-ink-500 text-[11px] uppercase">
                  <tr>
                    <th className="px-4 py-2.5">Product</th>
                    <th className="px-4 py-2.5 text-center">Qty</th>
                    <th className="px-4 py-2.5 text-right">Price</th>
                    <th className="px-4 py-2.5 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ivory-200 bg-white">
                  {order.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3 font-medium text-ink-900">
                        {item.product_name}
                      </td>
                      <td className="px-4 py-3 text-center text-ink-600">
                        {item.quantity}
                      </td>
                      <td className="px-4 py-3 text-right text-ink-600">
                        ${item.unit_price.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-ink-900">
                        ${item.line_total.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Financial Breakdown */}
          <div className="p-4 rounded-xl bg-ivory-50 border border-ivory-200 text-xs space-y-2">
            <div className="flex justify-between text-ink-600">
              <span>Subtotal</span>
              <span className="font-medium text-ink-900">${order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-ink-600">
              <span>Shipping</span>
              <span className="font-medium text-ink-900">
                {order.shipping_cost === 0 ? 'Free' : `$${order.shipping_cost.toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between text-ink-600">
              <span>Tax (5%)</span>
              <span className="font-medium text-ink-900">${order.tax_amount.toFixed(2)}</span>
            </div>
            <div className="pt-2 border-t border-ivory-300 flex justify-between text-base font-bold text-ink-900">
              <span>Total Paid via PayPal</span>
              <span className="text-emerald-700">${order.total_amount.toFixed(2)} {order.currency}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-ivory-200 hover:bg-ivory-300 text-ink-800 text-xs font-semibold transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Verified Receipt</span>
            </button>

            <button
              onClick={onClose}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-ink-900 hover:bg-cobalt-700 text-white text-xs sm:text-sm font-semibold transition-all shadow-subtle"
            >
              <span>Continue Shopping</span>
              <ArrowRight className="w-4 h-4 text-ivory-300" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
