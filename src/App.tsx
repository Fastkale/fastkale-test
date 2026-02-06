import { useState } from 'react';
import { AuthSection } from './AuthSection';
import { ScanSection } from './ScanSection';
import { PricingSection } from './PricingSection';
import { CartSection } from './CartSection';
import { OffersSection } from './OffersSection';
import { DeviceSection } from './DeviceSection';
import type { UserProfile } from './types';
import type { DeviceType } from './api';
import { apiBaseUrl } from './api';

export default function App() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [device, setDevice] = useState<DeviceType>('laptop');
  const [lastItemId, setLastItemId] = useState<string | null>(null);
  const [lastCategoryId, setLastCategoryId] = useState<string | null>(null);
  const [lastAttributes, setLastAttributes] = useState<Record<string, string>>({});
  const [lastCartId, setLastCartId] = useState<string | null>(null);

  const setLastScanIds = (itemId: string | null, categoryId: string | null, attrs: Record<string, string>) => {
    setLastItemId(itemId);
    setLastCategoryId(categoryId);
    setLastAttributes(attrs);
  };

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: 16, fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ marginTop: 0 }}>FastKale Milestone 1 — Test Harness</h1>
      <p style={{ fontSize: 12, color: '#666' }}>
        Base URL: <code>{apiBaseUrl}</code> (set <code>VITE_API_BASE_URL</code> in .env)
      </p>
      <AuthSection
        token={token}
        user={user}
        setToken={setToken}
        setUser={setUser}
        device={device}
      />
      <ScanSection
        token={token}
        device={device}
        lastItemId={lastItemId}
        lastCategoryId={lastCategoryId}
        lastAttributes={lastAttributes}
        setLastScanIds={setLastScanIds}
      />
      <PricingSection token={token} device={device} lastItemId={lastItemId} />
      <CartSection
        token={token}
        device={device}
        lastItemId={lastItemId}
        onCartLoaded={setLastCartId}
      />
      <OffersSection token={token} device={device} lastCartId={lastCartId} />
      <DeviceSection device={device} setDevice={setDevice} token={token} />
    </div>
  );
}
