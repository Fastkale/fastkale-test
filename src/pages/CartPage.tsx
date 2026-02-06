import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCart } from '../api-flow';
import type { CartData } from '../flow-types';

interface CartPageProps {
  token: string;
  onCartUpdate: () => void;
}

export function CartPage({ token, onCartUpdate }: CartPageProps) {
  const [cart, setCart] = useState<CartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getCart(token)
      .then(setCart)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Failed to load cart'))
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    onCartUpdate();
  }, [cart, onCartUpdate]);

  if (loading) return <div style={{ padding: 24, textAlign: 'center' }}>Loading cart...</div>;
  if (error) return <div style={{ padding: 24, color: '#c62828' }}>{error}</div>;
  if (!cart) return null;

  const resaleItems = cart.items?.filter((i) => i.item_type === 'resale') ?? [];
  const donationItems = cart.items?.filter((i) => i.item_type === 'donation') ?? [];
  const totalResale = cart.total_resale_value ?? 0;
  const totalDonation = cart.total_donation_value ?? 0;
  const meetsMinimum = cart.meets_minimum ?? false;
  const minAmount = 50;

  return (
    <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', padding: 24 }}>
      <h2 style={{ marginTop: 0, marginBottom: 16 }}>Your cart</h2>

      {(!cart.items || cart.items.length === 0) ? (
        <div style={{ textAlign: 'center', padding: 32 }}>
          <p style={{ color: '#666', marginBottom: 16 }}>Your cart is empty. Scan items to get started.</p>
          <Link to="/" style={{ padding: '12px 24px', background: '#1a1a1a', color: '#fff', textDecoration: 'none', borderRadius: 8, fontWeight: 600 }}>
            Scan items
          </Link>
        </div>
      ) : (
        <>
          <section style={{ marginBottom: 24 }}>
            <h3 style={{ marginBottom: 8, fontSize: 16 }}>Sell Now — Resale items</h3>
            <div style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>
              Resale minimum: ${minAmount} (currently ${totalResale.toFixed(2)})
            </div>
            {resaleItems.map((item) => (
              <div key={item.item_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #eee' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{item.title ?? 'Item'}</div>
                  <div style={{ fontSize: 12, color: '#666' }}>{item.category} · {item.condition}</div>
                </div>
                <div style={{ fontWeight: 600 }}>${item.estimated_value?.toFixed(2) ?? '0.00'}</div>
              </div>
            ))}
            <div style={{ marginTop: 8, fontWeight: 600 }}>Subtotal: ${totalResale.toFixed(2)}</div>
          </section>

          <section style={{ marginBottom: 24 }}>
            <h3 style={{ marginBottom: 8, fontSize: 16 }}>Donate Now — Donation items</h3>
            <div style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>
              Donation minimum: ${minAmount} (currently ${totalDonation.toFixed(2)})
            </div>
            {donationItems.map((item) => (
              <div key={item.item_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #eee' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{item.title ?? 'Item'}</div>
                  <div style={{ fontSize: 12, color: '#666' }}>{item.charity?.name ?? 'Charity TBD'}</div>
                </div>
                <div style={{ fontWeight: 600 }}>${item.estimated_value?.toFixed(2) ?? '0.00'}</div>
              </div>
            ))}
            <div style={{ marginTop: 8, fontWeight: 600 }}>Subtotal: ${totalDonation.toFixed(2)}</div>
          </section>

          <div style={{ padding: 16, background: meetsMinimum ? '#e8f5e9' : '#fff3e0', borderRadius: 8, marginBottom: 16 }}>
            {meetsMinimum ? (
              <div style={{ fontWeight: 600, color: '#2e7d32' }}>Minimum met — you can continue to offer.</div>
            ) : (
              <div style={{ fontWeight: 600, color: '#e65100' }}>Minimum not met. Need $50+ in resale and/or donation to continue.</div>
            )}
          </div>

          <Link
            to="/offer"
            style={{
              display: 'block',
              padding: 14,
              background: meetsMinimum ? '#4CAF50' : '#ccc',
              color: '#fff',
              textAlign: 'center',
              textDecoration: 'none',
              borderRadius: 8,
              fontWeight: 600,
              pointerEvents: meetsMinimum ? 'auto' : 'none',
            }}
          >
            Schedule Pick Up / Continue to Offer
          </Link>
        </>
      )}
    </div>
  );
}
