import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartValidationResponse, Product } from '../types';
import { validateCart } from '../services/api';

interface CartItemState {
  product_id: string;
  quantity: number;
}

interface CartContextType {
  guestSessionId: string;
  items: CartItemState[];
  cartData: CartValidationResponse | null;
  isLoading: boolean;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function getOrCreateGuestSession(): string {
  let sess = localStorage.getItem('shoppilot_guest_session');
  if (!sess) {
    sess = `guest_${Math.random().toString(36).substring(2, 12)}_${Date.now()}`;
    localStorage.setItem('shoppilot_guest_session', sess);
  }
  return sess;
}

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [guestSessionId] = useState<string>(getOrCreateGuestSession);
  const [items, setItems] = useState<CartItemState[]>(() => {
    try {
      const saved = localStorage.getItem('shoppilot_cart_items');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [cartData, setCartData] = useState<CartValidationResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const syncCartWithServer = async (cartItems: CartItemState[]) => {
    if (cartItems.length === 0) {
      setCartData({
        items: [],
        item_count: 0,
        subtotal: 0,
        shipping_cost: 0,
        tax_amount: 0,
        total_amount: 0,
        currency: 'USD',
        is_valid: true,
        validation_errors: [],
      });
      return;
    }
    setIsLoading(true);
    try {
      const data = await validateCart(cartItems);
      setCartData(data);
    } catch (err) {
      console.error('Failed to validate cart:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    localStorage.setItem('shoppilot_cart_items', JSON.stringify(items));
    syncCartWithServer(items);
  }, [items]);

  const addToCart = (product: Product, quantity: number = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product_id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product_id === product.id
            ? { ...i, quantity: Math.min(i.quantity + quantity, product.stock_quantity) }
            : i
        );
      }
      return [...prev, { product_id: product.id, quantity }];
    });
    setIsOpen(true);
  };

  const removeFromCart = (productId: string) => {
    setItems((prev) => prev.filter((i) => i.product_id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.product_id === productId ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const refreshCart = async () => {
    await syncCartWithServer(items);
  };

  return (
    <CartContext.Provider
      value={{
        guestSessionId,
        items,
        cartData,
        isLoading,
        isOpen,
        setIsOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};

