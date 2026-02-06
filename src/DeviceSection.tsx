import { useState } from 'react';
import { apiCall } from './api';
import { ResultLog } from './ResultLog';
import type { CallResult } from './api';
import type { DeviceType } from './api';

interface DeviceSectionProps {
  device: DeviceType;
  setDevice: (d: DeviceType) => void;
  token: string | null;
}

export function DeviceSection({ device, setDevice, token }: DeviceSectionProps) {
  const [result, setResult] = useState<CallResult | null>(null);

  const pingWithDevice = async () => {
    const r = await apiCall('get-cart', { method: 'GET', token: token ?? undefined, device });
    setResult(r);
  };

  return (
    <section style={{ border: '1px solid #ccc', padding: 12, marginBottom: 12 }}>
      <h2 style={{ marginTop: 0 }}>5. Device-Aware Inputs</h2>
      <p style={{ fontSize: 12, margin: '0 0 8px 0' }}>
        Toggle device type. Every API request sends <code>X-Device-Type</code> and <code>User-Agent</code> so the
        backend receives the chosen payload. Use &quot;Ping with current device&quot; to confirm.
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        <label>
          <input
            type="radio"
            name="device"
            checked={device === 'mobile'}
            onChange={() => setDevice('mobile')}
          />
          Mobile
        </label>
        <label>
          <input
            type="radio"
            name="device"
            checked={device === 'laptop'}
            onChange={() => setDevice('laptop')}
          />
          Laptop
        </label>
        <button type="button" onClick={pingWithDevice}>
          Ping get-cart with current device
        </button>
      </div>
      <ResultLog result={result} label="Response (check request headers in details above)" />
    </section>
  );
}
