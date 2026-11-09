import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { CartProvider } from './context/CartContext';
import { ComparisonProvider } from './context/ComparisonContext';
import { AIProvider } from './context/AIContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <CartProvider>
      <ComparisonProvider>
        <AIProvider>
          <App />
        </AIProvider>
      </ComparisonProvider>
    </CartProvider>
  </React.StrictMode>
);

