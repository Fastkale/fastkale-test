// Types for the Item Scanning Flow (matches backend API shapes)

export type ScanStep = 'capture' | 'results' | 'jewelry' | 'price' | 'donate-sell' | 'added';

export interface CategoryOption {
  id: string;
  name: string;
  display_name: string;
}

export interface ScanResult {
  item_id: string;
  category: CategoryOption;
  condition: string;
  attributes: { name: string; label: string; value: string; ai_detected: boolean }[];
  description: string;
  confidence_score: number;
  requires_manual_review: boolean;
  image_urls: string[];
  ebay_search_suggestion: string;
  metal_type: string | null;
  purity: string | null;
  next_step: string;
}

export const CONDITION_OPTIONS = ['New', 'Like New', 'Good', 'Fair', 'Poor'] as const;
export type ConditionOption = (typeof CONDITION_OPTIONS)[number];

export const CATEGORY_DISPLAY_NAMES = [
  'Electronics',
  'Jewelry',
  'Clothing',
  'Baby Gear',
  'Other',
] as const;

export interface PriceResult {
  item_id: string;
  estimated_resale_value: number | null;
  calculation_method: string;
  ebay_data?: { search_query: string; results_count: number; median_price: number | null; top_comparables?: unknown[] };
  jewelry_data?: { metal_type: string; purity: string; weight_grams: number; spot_price_per_gram: number; final_value: number };
  next_step: string;
  message?: string;
}

export interface CartItem {
  item_id: string;
  title: string;
  estimated_value: number;
  item_type: 'resale' | 'donation';
  condition: string;
  category: string;
  image_url: string | null;
  charity?: { id: string; name: string; logo_url?: string } | null;
}

export interface CartData {
  id: string;
  total_resale_value: number;
  total_donation_value: number;
  resale_item_count: number;
  donation_item_count: number;
  meets_minimum: boolean;
  can_checkout: boolean;
  items: CartItem[];
}
