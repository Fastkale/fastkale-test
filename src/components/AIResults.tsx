import { useState } from 'react';
import type { ScanResult } from '../flow-types';
import { CONDITION_OPTIONS } from '../flow-types';

interface AIResultsProps {
  result: ScanResult;
  onConfirm: (payload: { item_id: string; category_id: string; condition: string; attributes: Record<string, string>; manually_verified: boolean }) => void;
  onReScan: () => void;
  loading: boolean;
  error: string;
}

export function AIResults({ result, onConfirm, onReScan, loading, error }: AIResultsProps) {
  const [condition, setCondition] = useState(result.condition || 'Good');
  const [attributes, setAttributes] = useState<Record<string, string>>(() => {
    const attrs: Record<string, string> = {};
    result.attributes?.forEach((a) => {
      attrs[a.name] = a.value;
    });
    return attrs;
  });
  const [editing, setEditing] = useState(false);

  const lowConfidence = (result.confidence_score ?? 0) < 70;
  const attrsList = result.attributes ?? [];

  const handleConfirm = () => {
    onConfirm({
      item_id: result.item_id,
      category_id: result.category.id,
      condition,
      attributes,
      manually_verified: editing || lowConfidence,
    });
  };

  return (
    <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', padding: 24 }}>
      <h2 style={{ marginTop: 0, marginBottom: 8 }}>Step 2: Verify details</h2>

      {lowConfidence && (
        <div style={{ padding: 12, background: '#fff3e0', borderRadius: 8, marginBottom: 16, border: '1px solid #ffb74d' }}>
          <strong>We're not quite sure — can you verify these details?</strong>
          <div style={{ fontSize: 12, marginTop: 4 }}>AI confidence: {result.confidence_score}%</div>
        </div>
      )}

      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Category</div>
        <div style={{ fontWeight: 600 }}>{result.category?.display_name ?? result.category?.name ?? '—'}</div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Condition</div>
        {editing ? (
          <select value={condition} onChange={(e) => setCondition(e.target.value)} style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc', width: '100%' }}>
            {CONDITION_OPTIONS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        ) : (
          <div style={{ fontWeight: 600 }}>{condition}</div>
        )}
      </div>

      {attrsList.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Details</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {attrsList.map((a) => (
              <div key={a.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 14 }}>{a.label || a.name}</span>
                {editing ? (
                  <input
                    value={attributes[a.name] ?? ''}
                    onChange={(e) => setAttributes((prev) => ({ ...prev, [a.name]: e.target.value }))}
                    style={{ padding: 6, borderRadius: 4, border: '1px solid #ccc', width: 140 }}
                  />
                ) : (
                  <span style={{ fontWeight: 500 }}>{attributes[a.name] ?? a.value ?? '—'}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 24 }}>
        <button type="button" onClick={onReScan} style={{ padding: '10px 20px', background: '#f5f5f5', border: '1px solid #ccc', borderRadius: 8, cursor: 'pointer' }}>
          Re-scan item
        </button>
        <button type="button" onClick={() => setEditing(!editing)} style={{ padding: '10px 20px', background: '#f5f5f5', border: '1px solid #ccc', borderRadius: 8, cursor: 'pointer' }}>
          {editing ? 'Done editing' : 'Edit details'}
        </button>
        <button type="button" onClick={handleConfirm} disabled={loading} style={{ padding: '10px 24px', background: '#4CAF50', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>
          {loading ? 'Saving...' : 'Confirm'}
        </button>
      </div>

      {error && (
        <div style={{ marginTop: 16, padding: 12, background: '#ffebee', color: '#c62828', borderRadius: 8, fontSize: 14 }}>
          {error}
        </div>
      )}
    </div>
  );
}
