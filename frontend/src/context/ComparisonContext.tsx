import React, { createContext, useContext, useState } from 'react';
import { Product } from '../types';

interface ComparisonContextType {
  selectedProducts: Product[];
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  addToCompare: (product: Product) => boolean;
  removeFromCompare: (productId: string) => void;
  clearComparison: () => void;
  isComparing: (productId: string) => boolean;
}

const ComparisonContext = createContext<ComparisonContextType | undefined>(undefined);

export const ComparisonProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const addToCompare = (product: Product): boolean => {
    if (selectedProducts.some((p) => p.id === product.id)) {
      removeFromCompare(product.id);
      return false;
    }
    if (selectedProducts.length >= 4) {
      alert('You can compare up to 4 products at a time.');
      return false;
    }
    setSelectedProducts((prev) => [...prev, product]);
    return true;
  };

  const removeFromCompare = (productId: string) => {
    setSelectedProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const clearComparison = () => {
    setSelectedProducts([]);
    setIsOpen(false);
  };

  const isComparing = (productId: string) => {
    return selectedProducts.some((p) => p.id === productId);
  };

  return (
    <ComparisonContext.Provider
      value={{
        selectedProducts,
        isOpen,
        setIsOpen,
        addToCompare,
        removeFromCompare,
        clearComparison,
        isComparing,
      }}
    >
      {children}
    </ComparisonContext.Provider>
  );
};

export const useComparison = () => {
  const context = useContext(ComparisonContext);
  if (!context) throw new Error('useComparison must be used within a ComparisonProvider');
  return context;
};

