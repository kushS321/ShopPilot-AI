export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  description: string;
  price: number;
  price_inr: number;
  currency: string;
  image_url: string;
  features: string[];
  specifications: Record<string, string>;
  is_in_stock: boolean;
  stock_quantity: number;
  rating: number;
  review_count: number;
  data_source: string;
  created_at?: string;
}

export interface ExtractedPreferences {
  category?: string;
  use_case?: string;
  budget_min?: number;
  budget_max?: number;
  currency: string;
  budget_max_usd?: number;
  priorities: string[];
  required_features: string[];
  preferred_brands: string[];
  excluded_brands: string[];
  strict_budget: boolean;
  query_summary: string;
}

export interface ExplainedProduct {
  product: Product;
  match_score: number;
  match_tier: string;
  why_recommended: string;
  key_advantages: string[];
  trade_offs: string[];
  score_breakdown: Record<string, number>;
}

export interface AIRecommendationResponse {
  query: string;
  parsed_preferences: ExtractedPreferences;
  recommendations: ExplainedProduct[];
  total_matches: number;
  conversational_response: string;
  suggested_followups: string[];
  is_fallback: boolean;
  comparison_summary?: string;
}

export interface CartItem {
  product_id: string;
  product_name: string;
  brand: string;
  image_url: string;
  unit_price: number;
  price_inr: number;
  quantity: number;
  line_total: number;
  is_in_stock: boolean;
  stock_quantity: number;
}

export interface CartValidationResponse {
  items: CartItem[];
  item_count: number;
  subtotal: number;
  shipping_cost: number;
  tax_amount: number;
  total_amount: number;
  currency: string;
  is_valid: boolean;
  validation_errors: string[];
}

export interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  unit_price: number;
  quantity: number;
  line_total: number;
}

export interface Order {
  id: string;
  guest_session_id: string;
  status: 'PENDING' | 'AWAITING_PAYMENT_APPROVAL' | 'PROCESSING_CAPTURE' | 'PAID' | 'CANCELLED' | 'FAILED';
  currency: string;
  subtotal: number;
  shipping_cost: number;
  tax_amount: number;
  total_amount: number;
  paypal_order_id?: string;
  paypal_capture_id?: string;
  payer_email?: string;
  payer_name?: string;
  created_at: string;
  updated_at: string;
  paid_at?: string;
  items: OrderItem[];
}

export interface PayPalClientConfig {
  client_id?: string;
  environment: string;
  currency: string;
  is_configured: boolean;
}

export interface ProductComparisonResponse {
  products: Product[];
  all_spec_keys: string[];
  spec_matrix: Record<string, Record<string, any>>;
  price_differences: Record<string, number>;
  ai_comparison_verdict?: string;
  best_value_product_id?: string;
}

