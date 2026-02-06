import { useState } from 'react';
import { apiCall } from './api';
import { ResultLog } from './ResultLog';
import type { CallResult } from './api';

interface OffersSectionProps {
  token: string | null;
  device: 'mobile' | 'laptop';
  lastCartId: string | null;
}

const defaultPickupAddress = {
  street_address: '123 Main St',
  city: 'Orlando',
  state: 'FL',
  zip_code: '32801',
  apartment_unit: '',
  google_place_id: '',
};

export function OffersSection({ token, device, lastCartId }: OffersSectionProps) {
  const [cartId, setCartId] = useState('');
  const [offerId, setOfferId] = useState('');
  const [pickupAddress, setPickupAddress] = useState(defaultPickupAddress);
  const [rejectReason, setRejectReason] = useState('');
  const [createResult, setCreateResult] = useState<CallResult | null>(null);
  const [getOfferResult, setGetOfferResult] = useState<CallResult | null>(null);
  const [acceptResult, setAcceptResult] = useState<CallResult | null>(null);
  const [rejectResult, setRejectResult] = useState<CallResult | null>(null);

  const effectiveCartId = cartId || lastCartId || '';
  const effectiveOfferId = offerId;

  const handleCreateOffer = async () => {
    if (!effectiveCartId) {
      setCreateResult({ status: 400, ok: false, body: 'Enter cart_id (or Get cart first).' });
      return;
    }
    if (!token) {
      setCreateResult({ status: 401, ok: false, body: 'Login first.' });
      return;
    }
    const body = {
      cart_id: effectiveCartId,
      pickup_address: {
        street_address: pickupAddress.street_address,
        city: pickupAddress.city,
        state: pickupAddress.state,
        zip_code: pickupAddress.zip_code,
        apartment_unit: pickupAddress.apartment_unit || undefined,
        google_place_id: pickupAddress.google_place_id || undefined,
      },
    };
    const r = await apiCall('create-offer', { method: 'POST', body, token, device });
    setCreateResult(r);
    if (r.ok && r.body && typeof r.body === 'object' && 'data' in r.body) {
      const d = (r.body as { data: { offer_id?: string } }).data;
      if (d?.offer_id) setOfferId(d.offer_id);
    }
  };

  const handleGetOffer = async () => {
    if (!effectiveOfferId) {
      setGetOfferResult({ status: 400, ok: false, body: 'Enter offer_id (from create-offer).' });
      return;
    }
    if (!token) {
      setGetOfferResult({ status: 401, ok: false, body: 'Login first.' });
      return;
    }
    const r = await apiCall('get-offer', {
      method: 'POST',
      body: { offer_id: effectiveOfferId },
      token,
      device,
    });
    setGetOfferResult(r);
  };

  const handleAcceptOffer = async () => {
    if (!effectiveOfferId) {
      setAcceptResult({ status: 400, ok: false, body: 'Enter offer_id.' });
      return;
    }
    if (!token) {
      setAcceptResult({ status: 401, ok: false, body: 'Login first.' });
      return;
    }
    const r = await apiCall('accept-offer', {
      method: 'POST',
      body: { offer_id: effectiveOfferId },
      token,
      device,
    });
    setAcceptResult(r);
  };

  const handleRejectOffer = async () => {
    if (!effectiveOfferId) {
      setRejectResult({ status: 400, ok: false, body: 'Enter offer_id.' });
      return;
    }
    if (!token) {
      setRejectResult({ status: 401, ok: false, body: 'Login first.' });
      return;
    }
    const r = await apiCall('reject-offer', {
      method: 'POST',
      body: { offer_id: effectiveOfferId, reason: rejectReason || undefined },
      token,
      device,
    });
    setRejectResult(r);
  };

  return (
    <section style={{ border: '1px solid #ccc', padding: 12, marginBottom: 12 }}>
      <h2 style={{ marginTop: 0 }}>6. Offers</h2>
      <div style={{ marginBottom: 8 }}>
        <input
          placeholder="cart_id (from Get cart)"
          value={cartId || lastCartId || ''}
          onChange={(e) => setCartId(e.target.value)}
          style={{ width: 280 }}
        />
      </div>
      <div style={{ fontSize: 12, marginBottom: 8 }}>
        Pickup address: street_address{' '}
        <input
          value={pickupAddress.street_address}
          onChange={(e) => setPickupAddress((p) => ({ ...p, street_address: e.target.value }))}
          style={{ width: 120 }}
        />
        city <input value={pickupAddress.city} onChange={(e) => setPickupAddress((p) => ({ ...p, city: e.target.value }))} style={{ width: 80 }} />
        state <input value={pickupAddress.state} onChange={(e) => setPickupAddress((p) => ({ ...p, state: e.target.value }))} style={{ width: 40 }} />
        zip <input value={pickupAddress.zip_code} onChange={(e) => setPickupAddress((p) => ({ ...p, zip_code: e.target.value }))} style={{ width: 60 }} />
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
        <button type="button" onClick={handleCreateOffer} disabled={!token}>
          Create offer
        </button>
      </div>
      <ResultLog result={createResult} label="Create offer" />
      <div style={{ marginTop: 12 }}>
        <input
          placeholder="offer_id (from create-offer)"
          value={offerId}
          onChange={(e) => setOfferId(e.target.value)}
          style={{ width: 280, marginRight: 8 }}
        />
        <button type="button" onClick={handleGetOffer} disabled={!token}>Get offer</button>
        <button type="button" onClick={handleAcceptOffer} disabled={!token}>Accept offer</button>
        <input
          placeholder="reason (reject)"
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          style={{ width: 120 }}
        />
        <button type="button" onClick={handleRejectOffer} disabled={!token}>Reject offer</button>
      </div>
      <ResultLog result={getOfferResult} label="Get offer" />
      <ResultLog result={acceptResult} label="Accept offer" />
      <ResultLog result={rejectResult} label="Reject offer" />
    </section>
  );
}
