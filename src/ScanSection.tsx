import { useState, useRef } from 'react';
import { apiCall } from './api';
import { ResultLog } from './ResultLog';
import type { CallResult } from './api';

const CONDITIONS = ['New', 'Like New', 'Good', 'Fair', 'Poor'] as const;

interface ScanSectionProps {
  token: string | null;
  device: 'mobile' | 'laptop';
  lastItemId: string | null;
  lastCategoryId: string | null;
  lastAttributes: Record<string, string>;
  setLastScanIds: (itemId: string | null, categoryId: string | null, attrs: Record<string, string>) => void;
}

export function ScanSection({
  token,
  device,
  lastItemId,
  lastCategoryId,
  lastAttributes,
  setLastScanIds,
}: ScanSectionProps) {
  const [scanResult, setScanResult] = useState<CallResult | null>(null);
  const [confirmResult, setConfirmResult] = useState<CallResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [confirmPayload, setConfirmPayload] = useState({
    item_id: '',
    category_id: '',
    condition: 'Like New' as string,
    attributes: {} as Record<string, string>,
    manually_verified: true,
  });

  const handleScan = async () => {
    const input = fileInputRef.current;
    if (!input?.files?.length) {
      setScanResult({ status: 0, ok: false, body: 'Select 1–5 image files first.' });
      return;
    }
    if (!token) {
      setScanResult({ status: 401, ok: false, body: 'Login first.' });
      return;
    }
    const formData = new FormData();
    for (let i = 0; i < Math.min(5, input.files.length); i++) {
      formData.append('images', input.files[i]);
    }
    const r = await apiCall('scan-item', { method: 'POST', token, formData, device });
    setScanResult(r);
    if (r.ok && r.body && typeof r.body === 'object' && 'data' in r.body) {
      const d = (r.body as { data: Record<string, unknown> }).data;
      const itemId = d?.item_id as string | undefined;
      const cat = d?.category as { id?: string } | undefined;
      const attrs = (d?.attributes as { name: string; value: string }[] | undefined) || [];
      const attrMap: Record<string, string> = {};
      attrs.forEach((a) => {
        attrMap[a.name] = a.value;
      });
      if (itemId) {
        setLastScanIds(itemId, cat?.id ?? '', attrMap);
        setConfirmPayload((p) => ({
          ...p,
          item_id: itemId,
          category_id: cat?.id ?? '',
          condition: (d?.condition as string) ?? 'Like New',
          attributes: attrMap,
        }));
      }
    }
  };

  const handleConfirm = async () => {
    const payload = {
      item_id: confirmPayload.item_id || lastItemId,
      category_id: confirmPayload.category_id || lastCategoryId,
      condition: confirmPayload.condition,
      attributes: Object.keys(confirmPayload.attributes).length
        ? confirmPayload.attributes
        : lastAttributes,
      manually_verified: confirmPayload.manually_verified,
    };
    if (!payload.item_id || !payload.category_id) {
      setConfirmResult({ status: 400, ok: false, body: 'Run Scan first to get item_id and category_id.' });
      return;
    }
    if (!token) {
      setConfirmResult({ status: 401, ok: false, body: 'Login first.' });
      return;
    }
    const r = await apiCall('confirm-item', { method: 'POST', body: payload, token, device });
    setConfirmResult(r);
  };

  return (
    <section style={{ border: '1px solid #ccc', padding: 12, marginBottom: 12 }}>
      <h2 style={{ marginTop: 0 }}>2. Image Upload &amp; AI Scan</h2>
      <div style={{ marginBottom: 8 }}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png"
          multiple
        />
        <button type="button" onClick={handleScan} disabled={!token}>
          Upload &amp; Scan (scan-item)
        </button>
      </div>
      <ResultLog result={scanResult} label="Scan response" />
      <div style={{ marginTop: 12 }}>
        <div>Condition options: {CONDITIONS.join(', ')}</div>
        <div style={{ marginTop: 8 }}>
          Confirm item (confirm-item) — use item_id/category_id from scan above
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
          <input
            placeholder="item_id"
            value={confirmPayload.item_id || lastItemId || ''}
            onChange={(e) => setConfirmPayload((p) => ({ ...p, item_id: e.target.value }))}
            style={{ width: 280 }}
          />
          <input
            placeholder="category_id"
            value={confirmPayload.category_id || lastCategoryId || ''}
            onChange={(e) => setConfirmPayload((p) => ({ ...p, category_id: e.target.value }))}
            style={{ width: 280 }}
          />
          <select
            value={confirmPayload.condition}
            onChange={(e) => setConfirmPayload((p) => ({ ...p, condition: e.target.value }))}
          >
            {CONDITIONS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <button type="button" onClick={handleConfirm} disabled={!token}>
            Confirm item
          </button>
        </div>
        <div style={{ marginTop: 4, fontSize: 11 }}>
          Attributes (from scan):{' '}
          <code>{Object.keys(confirmPayload.attributes).length ? JSON.stringify(confirmPayload.attributes) : JSON.stringify(lastAttributes) || '{}'}</code>
        </div>
      </div>
      <ResultLog result={confirmResult} label="Confirm response" />
    </section>
  );
}
