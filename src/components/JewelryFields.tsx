import type { ScanResult } from '../flow-types';

const METALS = ['Gold', 'Silver', 'Platinum'];
const PURITIES_GOLD = ['24K', '22K', '18K', '14K', '10K'];
const PURITIES_SILVER = ['Sterling', 'Fine'];
const PURITIES_PLATINUM = ['950', '900', '850'];

interface JewelryFieldsProps {
  scanResult: ScanResult;
  weight: string;
  purity: string;
  metal: string;
  onWeightChange: (v: string) => void;
  onPurityChange: (v: string) => void;
  onMetalChange: (v: string) => void;
  onNext: () => void;
  loading: boolean;
  error: string;
}

function getPurities(metal: string): string[] {
  if (metal === 'Gold') return PURITIES_GOLD;
  if (metal === 'Silver') return PURITIES_SILVER;
  if (metal === 'Platinum') return PURITIES_PLATINUM;
  return PURITIES_GOLD;
}

export function JewelryFields({
  weight,
  purity,
  metal,
  onWeightChange,
  onPurityChange,
  onMetalChange,
  onNext,
  loading,
  error,
}: JewelryFieldsProps) {
  const purities = getPurities(metal);
  const weightNum = parseFloat(weight);
  const isValid = weightNum >= 0.1 && weightNum <= 10000 && purity.length > 0;

  return (
    <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', padding: 24 }}>
      <h2 style={{ marginTop: 0, marginBottom: 8 }}>Jewelry details</h2>
      <p style={{ color: '#666', fontSize: 14, marginBottom: 16 }}>
        Jewelry items require weight verification during pickup. Enter weight and purity for pricing.
      </p>

      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontSize: 12, color: '#666', marginBottom: 4 }}>Metal type</label>
        <select value={metal} onChange={(e) => onMetalChange(e.target.value)} style={{ padding: 10, borderRadius: 8, border: '1px solid #ccc', width: '100%' }}>
          {METALS.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontSize: 12, color: '#666', marginBottom: 4 }}>Purity</label>
        <select value={purity} onChange={(e) => onPurityChange(e.target.value)} style={{ padding: 10, borderRadius: 8, border: '1px solid #ccc', width: '100%' }}>
          <option value="">Select</option>
          {purities.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontSize: 12, color: '#666', marginBottom: 4 }}>Weight (grams)</label>
        <input
          type="number"
          inputMode="decimal"
          min={0.1}
          max={10000}
          step={0.01}
          placeholder="e.g. 5.5"
          value={weight}
          onChange={(e) => onWeightChange(e.target.value)}
          style={{ padding: 10, borderRadius: 8, border: '1px solid #ccc', width: '100%' }}
        />
        <div style={{ fontSize: 11, color: '#999', marginTop: 4 }}>0.1g – 10,000g (2 decimal places)</div>
      </div>

      <p style={{ fontSize: 12, color: '#666', marginBottom: 16 }}>
        Note: Backend may require weight/purity to be set on the item. If pricing fails, the API may not yet support updating jewelry weight from this flow.
      </p>

      <button type="button" onClick={onNext} disabled={loading || !isValid} style={{ padding: '12px 24px', background: isValid ? '#1a1a1a' : '#ccc', color: '#fff', border: 'none', borderRadius: 8, cursor: isValid ? 'pointer' : 'not-allowed', fontWeight: 600, width: '100%' }}>
        {loading ? 'Calculating price...' : 'Get price'}
      </button>

      {error && (
        <div style={{ marginTop: 16, padding: 12, background: '#ffebee', color: '#c62828', borderRadius: 8, fontSize: 14 }}>
          {error}
        </div>
      )}
    </div>
  );
}
