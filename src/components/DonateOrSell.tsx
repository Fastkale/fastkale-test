import { useState } from 'react';
import type { PriceResult } from '../flow-types';

interface DonateOrSellProps {
  priceResult: PriceResult;
  onSelect: (choice: 'resale' | 'donation', charityId?: string) => void;
  onNoThanks: () => void;
  loading: boolean;
  error: string;
}

export function DonateOrSell({ priceResult, onSelect, onNoThanks, loading, error }: DonateOrSellProps) {
  const [charityId, setCharityId] = useState('');
  const value = priceResult.estimated_resale_value ?? 0;

  return (
    <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', padding: 24 }}>
      <h2 style={{ marginTop: 0, marginBottom: 8 }}>Step 4: Sell or Donate</h2>
      <p style={{ color: '#666', fontSize: 14, marginBottom: 20 }}>
        Choose how to add this item to your cart.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
        <button
          type="button"
          onClick={() => onSelect('resale')}
          disabled={loading}
          style={{ padding: 16, background: '#e8f5e9', border: '2px solid #4CAF50', borderRadius: 12, cursor: 'pointer', textAlign: 'left', fontWeight: 600 }}
        >
          Sell Now for Cash
          {value > 0 && <div style={{ fontSize: 14, color: '#666', marginTop: 4 }}>Estimated payout: ${(value * 0.5).toFixed(2)}+</div>}
        </button>

        <button
          type="button"
          onClick={() => onSelect('donation', charityId || undefined)}
          disabled={loading}
          style={{ padding: 16, background: '#e3f2fd', border: '2px solid #2196F3', borderRadius: 12, cursor: 'pointer', textAlign: 'left', fontWeight: 600 }}
        >
          Donate Now to Charity
          <div style={{ fontSize: 14, color: '#666', marginTop: 4 }}>Tax benefit — estimated deduction value</div>
        </button>

        <p style={{ fontSize: 12, color: '#666', marginTop: 8 }}>For donation, enter Charity ID (required by backend). Charity list at checkout.</p>
        <input
          placeholder="Charity ID (required for Donate)"
          value={charityId}
          onChange={(e) => setCharityId(e.target.value)}
          style={{ padding: 10, borderRadius: 8, border: '1px solid #ccc', width: '100%' }}
        />
      </div>

      <button type="button" onClick={onNoThanks} disabled={loading} style={{ padding: '10px 20px', background: '#f5f5f5', border: '1px solid #ccc', borderRadius: 8, cursor: 'pointer' }}>
        No Thanks
      </button>

      {error && (
        <div style={{ marginTop: 16, padding: 12, background: '#ffebee', color: '#c62828', borderRadius: 8, fontSize: 14 }}>
          {error}
        </div>
      )}
    </div>
  );
}
