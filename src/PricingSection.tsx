import { useState } from 'react';
import { apiCall } from './api';
import { ResultLog } from './ResultLog';
import type { CallResult } from './api';

interface PricingSectionProps {
  token: string | null;
  device: 'mobile' | 'laptop';
  lastItemId: string | null;
}

const PURITIES = ['24K', '18K', '14K', '10K', 'Sterling', '22K'];

export function PricingSection({ token, device, lastItemId }: PricingSectionProps) {
  const [itemId, setItemId] = useState('');
  const [ebayResult, setEbayResult] = useState<CallResult | null>(null);
  const [manualPayload, setManualPayload] = useState({
    item_id: '',
    manual_price: 100,
    reason: '',
  });
  const [manualResult, setManualResult] = useState<CallResult | null>(null);

  const effectiveItemId = itemId || lastItemId || '';

  const handleGetEbayPrice = async () => {
    if (!effectiveItemId) {
      setEbayResult({ status: 400, ok: false, body: 'Enter item_id (or run Scan first).' });
      return;
    }
    if (!token) {
      setEbayResult({ status: 401, ok: false, body: 'Login first.' });
      return;
    }
    const r = await apiCall('get-ebay-price', {
      method: 'POST',
      body: { item_id: effectiveItemId },
      token,
      device,
    });
    setEbayResult(r);
  };

  const handleManualOverride = async () => {
    const id = manualPayload.item_id || effectiveItemId;
    if (!id) {
      setManualResult({ status: 400, ok: false, body: 'Enter item_id.' });
      return;
    }
    if (!token) {
      setManualResult({ status: 401, ok: false, body: 'Login first.' });
      return;
    }
    const r = await apiCall('manual-price-override', {
      method: 'POST',
      body: { item_id: id, manual_price: manualPayload.manual_price, reason: manualPayload.reason || undefined },
      token,
      device,
    });
    setManualResult(r);
  };

  return (
    <section style={{ border: '1px solid #ccc', padding: 12, marginBottom: 12 }}>
      <h2 style={{ marginTop: 0 }}>3. Pricing Engines</h2>
      <div style={{ marginBottom: 8 }}>
        <input
          placeholder="item_id (from scan/confirm)"
          value={itemId || lastItemId || ''}
          onChange={(e) => setItemId(e.target.value)}
          style={{ width: 320 }}
        />
        <button type="button" onClick={handleGetEbayPrice} disabled={!token}>
          Get eBay / Jewelry price (get-ebay-price)
        </button>
      </div>
      <ResultLog result={ebayResult} label="eBay / Jewelry response (raw + final price)" />
      <div style={{ marginTop: 12, padding: 8, background: '#fffde7', fontSize: 12 }}>
        <strong>Jewelry pricing:</strong> Backend uses Metals API for spot price. For jewelry items, the item must have
        weight_grams and purity (from AI scan or DB). Purity options: {PURITIES.join(', ')}. If get-ebay-price returns
        400 &quot;weight in grams&quot;, the item does not have weight_grams set (no public API to set it in M1).
      </div>
      <div style={{ marginTop: 12 }}>
        <div>Manual price override</div>
        <input
          placeholder="item_id"
          value={manualPayload.item_id || effectiveItemId}
          onChange={(e) => setManualPayload((p) => ({ ...p, item_id: e.target.value }))}
        />
        <input
          type="number"
          placeholder="manual_price"
          value={manualPayload.manual_price}
          onChange={(e) => setManualPayload((p) => ({ ...p, manual_price: Number(e.target.value) }))}
        />
        <input
          placeholder="reason (optional)"
          value={manualPayload.reason}
          onChange={(e) => setManualPayload((p) => ({ ...p, reason: e.target.value }))}
        />
        <button type="button" onClick={handleManualOverride} disabled={!token}>
          Manual override
        </button>
      </div>
      <ResultLog result={manualResult} label="Manual override response" />
    </section>
  );
}
