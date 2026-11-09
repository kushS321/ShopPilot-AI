import React from 'react';
import { ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-ivory-300 bg-ivory-50/80 py-12 text-xs text-ink-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          {/* Brand & Purpose */}
          <div className="space-y-1">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className="font-serif text-lg font-bold text-ink-900">
                ShopPilot<span className="text-cobalt-600">.</span>ai
              </span>
            </div>
            <p className="text-ink-600 max-w-sm">
              Precision AI shopping agent grounded in verified catalogue specifications and official PayPal Sandbox checkout.
            </p>
          </div>

          {/* Sandbox & Security Statement */}
          <div className="flex items-center gap-2 p-3 rounded-xl bg-white border border-ivory-300 text-ink-600 text-[11px] max-w-md shadow-subtle">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              All transactions operate strictly in the official PayPal Developer Sandbox environment. No real funds or credit cards are charged.
            </span>
          </div>

          {/* Copyright & Open Source Notice */}
          <div className="text-ink-400 space-y-1 text-xs">
            <div>MIT Licensed Open-Source Project</div>
          </div>
        </div>
      </div>
    </footer>
  );
};
