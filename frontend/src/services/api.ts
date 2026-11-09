import {
  Product,
  AIRecommendationResponse,
  CartValidationResponse,
  Order,
  PayPalClientConfig,
  ProductComparisonResponse,
  ExtractedPreferences,
} from '../types';

const API_BASE = '/api';

export async function fetchHealth() {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error(`Health check failed: ${res.statusText}`);
  return res.json();
}

export async function fetchProducts(params: {
  category?: string;
  brand?: string;
  min_price?: number;
  max_price?: number;
  currency?: string;
  search?: string;
  sort_by?: string;
}): Promise<Product[]> {
  const query = new URLSearchParams();
  if (params.category) query.append('category', params.category);
  if (params.brand) query.append('brand', params.brand);
  if (params.min_price !== undefined) query.append('min_price', params.min_price.toString());
  if (params.max_price !== undefined) query.append('max_price', params.max_price.toString());
  if (params.currency) query.append('currency', params.currency);
  if (params.search) query.append('search', params.search);
  if (params.sort_by) query.append('sort_by', params.sort_by);

  const res = await fetch(`${API_BASE}/products?${query.toString()}`);
  if (!res.ok) throw new Error(`Failed to fetch products: ${res.statusText}`);
  return res.json();
}

export async function fetchProductById(id: string): Promise<Product> {
  const res = await fetch(`${API_BASE}/products/${id}`);
  if (!res.ok) throw new Error(`Product not found: ${id}`);
  return res.json();
}

export async function compareProducts(productIds: string[]): Promise<ProductComparisonResponse> {
  const res = await fetch(`${API_BASE}/products/compare`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ product_ids: productIds }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to compare products');
  }
  return res.json();
}

export async function sendAIQuery(
  query: string,
  existingPreferences?: ExtractedPreferences
): Promise<AIRecommendationResponse> {
  const res = await fetch(`${API_BASE}/ai/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query,
      existing_preferences: existingPreferences,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to process AI recommendation');
  }
  return res.json();
}

export async function validateCart(
  items: { product_id: string; quantity: number }[],
  currency: string = 'USD'
): Promise<CartValidationResponse> {
  const res = await fetch(`${API_BASE}/cart/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items, currency }),
  });
  if (!res.ok) throw new Error('Cart validation failed');
  return res.json();
}

export async function createOrder(
  guestSessionId: string,
  items: { product_id: string; quantity: number }[]
): Promise<Order> {
  const res = await fetch(`${API_BASE}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      guest_session_id: guestSessionId,
      items,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to create internal order');
  }
  return res.json();
}

export async function fetchOrder(orderId: string, guestSessionId: string): Promise<Order> {
  const res = await fetch(`${API_BASE}/orders/${orderId}?guest_session_id=${guestSessionId}`);
  if (!res.ok) throw new Error('Failed to retrieve order');
  return res.json();
}

export async function fetchGuestOrders(guestSessionId: string): Promise<Order[]> {
  const res = await fetch(`${API_BASE}/orders/history/guest?guest_session_id=${guestSessionId}`);
  if (!res.ok) return [];
  return res.json();
}

export async function fetchPayPalConfig(): Promise<PayPalClientConfig> {
  const res = await fetch(`${API_BASE}/payments/paypal/config`);
  if (!res.ok) throw new Error('Failed to fetch PayPal config');
  return res.json();
}

export async function createPayPalOrder(orderId: string, guestSessionId: string) {
  const res = await fetch(`${API_BASE}/payments/paypal/create-order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      order_id: orderId,
      guest_session_id: guestSessionId,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to create PayPal sandbox order');
  }
  return res.json();
}

export async function capturePayPalOrder(orderId: string, paypalOrderId: string, guestSessionId: string) {
  const res = await fetch(`${API_BASE}/payments/paypal/capture-order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      order_id: orderId,
      paypal_order_id: paypalOrderId,
      guest_session_id: guestSessionId,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to capture PayPal order');
  }
  return res.json();
}

