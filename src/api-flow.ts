/**
 * Flow API helpers — call backend and return typed data. No business logic.
 */
import { apiCall } from './api';
import type { ScanResult, PriceResult, CartData } from './flow-types';

function getData<T>(res: { ok: boolean; body: unknown }): T {
  if (!res.ok) throw new Error((res.body as { error?: { message?: string } })?.error?.message || `Request failed`);
  const obj = res.body as { data?: T };
  if (obj?.data === undefined) throw new Error(`No data in response`);
  return obj.data as T;
}

export async function scanItem(token: string, files: File[]): Promise<ScanResult> {
  const form = new FormData();
  files.forEach((f) => form.append('images', f));
  const res = await apiCall('scan-item', { method: 'POST', token, formData: form });
  return getData<ScanResult>(res);
}

export async function confirmItem(
  token: string,
  payload: { item_id: string; category_id: string; condition: string; attributes: Record<string, string>; manually_verified: boolean }
): Promise<{ item_id: string; status: string; next_step: string }> {
  const res = await apiCall('confirm-item', { method: 'POST', body: payload, token });
  return getData(res);
}

export async function getEbayPrice(token: string, itemId: string): Promise<PriceResult> {
  const res = await apiCall('get-ebay-price', { method: 'POST', body: { item_id: itemId }, token });
  return getData<PriceResult>(res);
}

export async function manualPriceOverride(
  token: string,
  itemId: string,
  manualPrice: number,
  reason?: string
): Promise<PriceResult> {
  const res = await apiCall('manual-price-override', {
    method: 'POST',
    body: { item_id: itemId, manual_price: manualPrice, reason },
    token,
  });
  return getData<PriceResult>(res);
}

export async function addToCart(
  token: string,
  itemId: string,
  itemType: 'resale' | 'donation',
  charityId?: string
): Promise<{ cart: CartData }> {
  const body: { item_id: string; item_type: 'resale' | 'donation'; charity_id?: string } = {
    item_id: itemId,
    item_type: itemType,
  };
  if (itemType === 'donation' && charityId) body.charity_id = charityId;
  const res = await apiCall('add-to-cart', { method: 'POST', body, token });
  return getData(res);
}

export async function getCart(token: string): Promise<CartData> {
  const res = await apiCall('get-cart', { method: 'GET', token });
  return getData<CartData>(res);
}

export async function login(email: string, password: string): Promise<{ user: unknown; session: { access_token: string; refresh_token: string } }> {
  const res = await apiCall('login', { method: 'POST', body: { email, password } });
  return getData(res);
}

export async function signup(payload: { email: string; password: string; full_name: string; phone: string }): Promise<{ user: unknown; session: { access_token: string; refresh_token: string } }> {
  const res = await apiCall('signup', { method: 'POST', body: payload });
  return getData(res);
}
