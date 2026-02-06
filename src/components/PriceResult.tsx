import type { ScanResult, PriceResult as PriceResultType } from '../flow-types';

interface PriceResultProps {
  scanResult: ScanResult;
  priceResult: PriceResultType;
  onNext: () => void;
  error: string;
}

export function PriceResult({ scanResult, priceResult, onNext, error }: PriceResultProps) {
  const value = priceResult.estimated_resale_value;
  const hasPrice = value != null && value > 0;
  const nextStep = priceResult.next_step;

  return (
    <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', padding: 24 }}>
      <h2 style={{ marginTop: 0, marginBottom: 8 }}>Step 3: Your offer</h2>

      {hasPrice ? (
        <>
          <div style={{ textAlign: 'center', padding: '24px 0', marginBottom: 16 }}>
            <div style={{ fontSize: 14, color: '#666', marginBottom: 4 }}>Estimated Sell Now value</div>
            <div style={{ fontSize: 36, fontWeight: 700 }}>${value.toFixed(2)}</div>
          </div>
          <div style={{ marginBottom: 16, fontSize: 14, color: '#666' }}>
            <div>Category: {scanResult.category?.display_name ?? '—'}</div>
            <div>Condition: {scanResult.condition ?? '—'}</div>
          </div>
        </>
      ) : (
        <div style={{ padding: 16, background: '#fff3e0', borderRadius: 8, marginBottom: 16 }}>
          {priceResult.message ?? "We couldn't find enough comparables. You can enter a price manually on the next screen or try different photos."}
        </div>
      )}

      <button type="button" onClick={onNext} style={{ padding: '12px 24px', background: '#4CAF50', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, width: '100%' }}>
        Continue — Choose Sell or Donate
      </button>

      {error && (
        <div style={{ marginTop: 16, padding: 12, background: '#ffebee', color: '#c62828', borderRadius: 8, fontSize: 14 }}>
          {error}
        </div>
      )}
    </div>
  );
}
