import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ProductCard } from '../components/ProductCard';
import { CartProvider } from '../context/CartContext';
import { ComparisonProvider } from '../context/ComparisonContext';
import { Product, ExplainedProduct } from '../types';

const mockProduct: Product = {
  id: 'prod_sony_whch520',
  name: 'Sony WH-CH520 Wireless On-Ear Bluetooth Headphones',
  brand: 'Sony',
  category: 'Headphones',
  description: 'Engineered for daily student life.',
  price: 54.0,
  price_inr: 4490.0,
  currency: 'USD',
  image_url: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b',
  features: ['50hr battery', 'Lightweight'],
  specifications: {
    battery_life: '50 hours',
    weight: '147 g',
  },
  is_in_stock: true,
  stock_quantity: 42,
  rating: 4.6,
  review_count: 1420,
  data_source: 'ShopPilot Verified Catalogue',
};

const mockExplained: ExplainedProduct = {
  product: mockProduct,
  match_score: 95,
  match_tier: 'Strong Match',
  why_recommended: 'Directly satisfies student requirements with 50hr battery.',
  key_advantages: ['Exceptional 50hr battery', 'Ultra-lightweight 147g'],
  trade_offs: ['Passive sound isolation only'],
  score_breakdown: { category: 25, budget: 25, features_and_specs: 25, brand: 10, quality_rating: 10 },
};

describe('ProductCard component', () => {
  it('renders product details and verified pricing accurately', () => {
    const handleOpenDetails = vi.fn();

    render(
      <CartProvider>
        <ComparisonProvider>
          <ProductCard
            product={mockProduct}
            explained={mockExplained}
            onOpenDetails={handleOpenDetails}
          />
        </ComparisonProvider>
      </CartProvider>
    );

    // Assert name and brand
    expect(screen.getByText('Sony WH-CH520 Wireless On-Ear Bluetooth Headphones')).toBeInTheDocument();
    expect(screen.getByText('Sony')).toBeInTheDocument();

    // Assert authoritative prices
    expect(screen.getByText('$54.00')).toBeInTheDocument();
    expect(screen.getByText('(₹4,490)')).toBeInTheDocument();

    // Assert Match score badge
    expect(screen.getByText(/95% Match • Strong Match/)).toBeInTheDocument();

    // Assert specs
    expect(screen.getByText(/50 hours/)).toBeInTheDocument();
    expect(screen.getByText(/147 g/)).toBeInTheDocument();

    // Assert Why Recommended is present
    expect(screen.getByText(/Directly satisfies student requirements/)).toBeInTheDocument();
  });
});
