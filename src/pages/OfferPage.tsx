import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCart } from '../api-flow';
import { apiCall } from '../api';
import type { CartData } from '../flow-types';

interface OfferPageProps {
  token: string;
}

export function OfferPage({ token }: OfferPageProps) {
  const [cart, setCart] = useState<CartData | null>(null);
  const [offer, setOffer] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getCart(token)
      .then(setCart)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Failed to load cart'))
      .finally(() => setLoading(false));
  }, [token]);

  const handleCreateOffer = async () => {
    if (!cart?.id) return;
    setCreating(true);
    setError('');
    try {
      const res = await apiCall('create-offer', {
        method: 'POST',
        token,
        body: {
          cart_id: cart.id,
          pickup_address: {
            street_address: '123 Main St',
            city: 'Orlando',
            state: 'FL',
            zip_code: '32801',
          },
        },
      });
      if (res.ok && res.body && typeof res.body === 'object' && 'data' in res.body) {
        setOffer((res.body as { data: unknown }).data);
      } else {
        setError((res.body as { error?: { message?: string } })?.error?.message ?? 'Create offer failed');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Create offer failed');
    } finally {
      setCreating(false);
    }
  };

  if (loading) return <div style={{ padding: 24, textAlign: 'center' }}>Loading...</div>;
  if (error && !offer) return <div style={{ padding: 24, color: '#c62828' }}>{error}</div>;
  if (!cart) return null;

  const totalResale = cart.total_resale_value ?? 0;
  const totalDonation = cart.total_donation_value ?? 0;
  const gmv = totalResale + totalDonation;

  if (offer) {
    const data = offer as {
      offer_id?: string;
      status?: string;
      pricing_summary?: { total_resale_value?: number; total_donation_value?: number; gmv?: number; total_seller_payout?: number };
      breakdown?: unknown[];
    };
    const summary = data.pricing_summary ?? {};
    return (
      <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', padding: 24 }}>
        <h2 style={{ marginTop: 0, marginBottom: 16 }}>Offer summary</h2>
        <div style={{ textAlign: 'center', padding: '24px 0', marginBottom: 24, background: '#e8f5e9', borderRadius: 12 }}>
          <div style={{ fontSize: 14, color: '#666', marginBottom: 4 }}>Your payout</div>
          <div style={{ fontSize: 32, fontWeight: 700 }}>${(summary.total_seller_payout ?? 0).toFixed(2)}</div>
        </div>
        <details style={{ marginBottom: 16 }}>
          <summary style={{ cursor: 'pointer', fontWeight: 600 }}>Breakdown</summary>
          <div style={{ marginTop: 12, fontSize: 14, color: '#666' }}>
            <div>Total resale value: ${(summary.total_resale_value ?? 0).toFixed(2)}</div>
            <div>Total donation value: ${(summary.total_donation_value ?? 0).toFixed(2)}</div>
            <div>GMV: ${(summary.gmv ?? 0).toFixed(2)}</div>
            <div>Minus: Distance / logistics, processing, CAC</div>
            <div>Result: Your payout (above)</div>
          </div>
        </details>
        <p style={{ fontSize: 12, color: '#666' }}>For donation items, tax receipt will be sent to your email.</p>
        <Link to="/cart" style={{ display: 'block', marginTop: 16, padding: 12, background: '#1a1a1a', color: '#fff', textAlign: 'center', textDecoration: 'none', borderRadius: 8 }}>
          Back to cart
        </Link>
      </div>
    );
  }

  return (
    <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', padding: 24 }}>
      <h2 style={{ marginTop: 0, marginBottom: 16 }}>Offer & pricing</h2>
      <p style={{ color: '#666', marginBottom: 16 }}>
        Review your cart total and create an offer. You'll get a payout breakdown (resale minus costs).
      </p>
      <div style={{ marginBottom: 16 }}>
        <div>Total resale value: ${totalResale.toFixed(2)}</div>
        <div>Total donation value: ${totalDonation.toFixed(2)}</div>
        <div style={{ fontWeight: 600, marginTop: 4 }}>GMV: ${gmv.toFixed(2)}</div>
      </div>
      <button
        type="button"
        onClick={handleCreateOffer}
        disabled={creating || !cart.meets_minimum || (cart.items?.length ?? 0) === 0}
        style={{
          padding: 14,
          width: '100%',
          background: cart.meets_minimum && (cart.items?.length ?? 0) > 0 ? '#4CAF50' : '#ccc',
          color: '#fff',
          border: 'none',
          borderRadius: 8,
          cursor: cart.meets_minimum ? 'pointer' : 'not-allowed',
          fontWeight: 600,
        }}
      >
        {creating ? 'Creating offer...' : 'Create offer'}
      </button>
      {error && <div style={{ marginTop: 16, color: '#c62828', fontSize: 14 }}>{error}</div>}
      <Link to="/cart" style={{ display: 'block', marginTop: 16, textAlign: 'center', color: '#666', fontSize: 14 }}>
        Back to cart
      </Link>
    </div>
  );
}
