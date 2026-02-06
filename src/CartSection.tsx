import { useState } from 'react';
import { apiCall } from './api';
import { ResultLog } from './ResultLog';
import type { CallResult } from './api';

interface CartSectionProps {
  token: string | null;
  device: 'mobile' | 'laptop';
  lastItemId: string | null;
  onCartLoaded?: (cartId: string) => void;
}

export function CartSection({ token, device, lastItemId, onCartLoaded }: CartSectionProps) {
  const [itemId, setItemId] = useState('');
  const [itemType, setItemType] = useState<'resale' | 'donation'>('resale');
  const [charityId, setCharityId] = useState('');
  const [addResult, setAddResult] = useState<CallResult | null>(null);
  const [getResult, setGetResult] = useState<CallResult | null>(null);
  const [removeResult, setRemoveResult] = useState<CallResult | null>(null);
  const [updateResult, setUpdateResult] = useState<CallResult | null>(null);
  const [clearResult, setClearResult] = useState<CallResult | null>(null);

  const effectiveItemId = itemId || lastItemId || '';

  const addToCart = async () => {
    if (!effectiveItemId) {
      setAddResult({ status: 400, ok: false, body: 'Enter item_id.' });
      return;
    }
    if (!token) {
      setAddResult({ status: 401, ok: false, body: 'Login first.' });
      return;
    }
    const body: { item_id: string; item_type: 'resale' | 'donation'; charity_id?: string } = {
      item_id: effectiveItemId,
      item_type: itemType,
    };
    if (itemType === 'donation') body.charity_id = charityId;
    const r = await apiCall('add-to-cart', { method: 'POST', body, token, device });
    setAddResult(r);
    if (r.ok && r.body && typeof r.body === 'object' && 'data' in r.body) {
      const data = (r.body as { data: { cart?: { id?: string } } }).data;
      if (data?.cart?.id) onCartLoaded?.(data.cart.id);
    }
  };

  const getCart = async () => {
    if (!token) {
      setGetResult({ status: 401, ok: false, body: 'Login first.' });
      return;
    }
    const r = await apiCall('get-cart', { method: 'GET', token, device });
    setGetResult(r);
    if (r.ok && r.body && typeof r.body === 'object' && 'data' in r.body) {
      const data = (r.body as { data: { cart?: { id?: string } } }).data;
      if (data?.cart?.id) onCartLoaded?.(data.cart.id);
    }
  };

  const removeFromCart = async () => {
    if (!effectiveItemId) {
      setRemoveResult({ status: 400, ok: false, body: 'Enter item_id.' });
      return;
    }
    if (!token) {
      setRemoveResult({ status: 401, ok: false, body: 'Login first.' });
      return;
    }
    const r = await apiCall('remove-from-cart', {
      method: 'POST',
      body: { item_id: effectiveItemId },
      token,
      device,
    });
    setRemoveResult(r);
  };

  const updateCartItem = async () => {
    if (!effectiveItemId) {
      setUpdateResult({ status: 400, ok: false, body: 'Enter item_id.' });
      return;
    }
    if (!token) {
      setUpdateResult({ status: 401, ok: false, body: 'Login first.' });
      return;
    }
    const body: { item_id: string; new_item_type: 'resale' | 'donation'; charity_id?: string } = {
      item_id: effectiveItemId,
      new_item_type: itemType,
    };
    if (itemType === 'donation') body.charity_id = charityId;
    const r = await apiCall('update-cart-item', { method: 'POST', body, token, device });
    setUpdateResult(r);
  };

  const clearCart = async () => {
    if (!token) {
      setClearResult({ status: 401, ok: false, body: 'Login first.' });
      return;
    }
    const r = await apiCall('clear-cart', { method: 'POST', token, device });
    setClearResult(r);
  };

  return (
    <section style={{ border: '1px solid #ccc', padding: 12, marginBottom: 12 }}>
      <h2 style={{ marginTop: 0 }}>4. Cart</h2>
      <div style={{ marginBottom: 8 }}>
        <input
          placeholder="item_id"
          value={itemId || lastItemId || ''}
          onChange={(e) => setItemId(e.target.value)}
        />
        <select value={itemType} onChange={(e) => setItemType(e.target.value as 'resale' | 'donation')}>
          <option value="resale">resale</option>
          <option value="donation">donation</option>
        </select>
        {itemType === 'donation' && (
          <input
            placeholder="charity_id (required for donation)"
            value={charityId}
            onChange={(e) => setCharityId(e.target.value)}
            style={{ width: 240 }}
          />
        )}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
        <button type="button" onClick={addToCart} disabled={!token}>Add to cart</button>
        <button type="button" onClick={getCart} disabled={!token}>Get cart</button>
        <button type="button" onClick={removeFromCart} disabled={!token}>Remove from cart</button>
        <button type="button" onClick={updateCartItem} disabled={!token}>Update cart item</button>
        <button type="button" onClick={clearCart} disabled={!token}>Clear cart</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <div>
          <strong>Add / Update / Remove</strong>
          <ResultLog result={addResult} />
          <ResultLog result={updateResult} />
          <ResultLog result={removeResult} />
        </div>
        <div>
          <strong>Get cart / Clear cart</strong>
          <ResultLog result={getResult} />
          <ResultLog result={clearResult} />
        </div>
      </div>
    </section>
  );
}
