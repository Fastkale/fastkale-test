import { useState, useCallback } from 'react';
import { ImageCapture } from '../components/ImageCapture';
import { AIResults } from '../components/AIResults';
import { JewelryFields } from '../components/JewelryFields';
import { PriceResult } from '../components/PriceResult';
import { DonateOrSell } from '../components/DonateOrSell';
import { scanItem, confirmItem, getEbayPrice, addToCart } from '../api-flow';
import type { ScanResult, PriceResult as PriceResultType } from '../flow-types';

type Step = 'capture' | 'results' | 'jewelry' | 'price' | 'donate-sell' | 'added';

interface ScanFlowProps {
  token: string;
  onCartUpdate: () => void;
}

export function ScanFlow({ token, onCartUpdate }: ScanFlowProps) {
  const [step, setStep] = useState<Step>('capture');
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [priceResult, setPriceResult] = useState<PriceResultType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [jewelryWeight, setJewelryWeight] = useState('');
  const [jewelryPurity, setJewelryPurity] = useState('');
  const [jewelryMetal, setJewelryMetal] = useState('Gold');

  const isJewelry = scanResult?.category?.display_name?.toLowerCase().includes('jewel') ?? false;

  const handleImagesSubmit = useCallback(
    async (files: File[]) => {
      setError('');
      setLoading(true);
      try {
        const result = await scanItem(token, files);
        setScanResult(result);
        if (result.category?.display_name?.toLowerCase().includes('jewel')) {
          setJewelryPurity(result.purity || '');
          setJewelryMetal(result.metal_type || 'Gold');
          setStep('results');
        } else {
          setStep('results');
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Scan failed');
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  const handleConfirm = useCallback(
    async (payload: { item_id: string; category_id: string; condition: string; attributes: Record<string, string>; manually_verified: boolean }) => {
      setError('');
      setLoading(true);
      try {
        await confirmItem(token, payload);
        if (isJewelry) {
          setStep('jewelry');
        } else {
          setStep('price');
          await fetchPrice(payload.item_id);
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Confirm failed');
      } finally {
        setLoading(false);
      }
    },
    [token, isJewelry]
  );

  const fetchPrice = useCallback(
    async (itemId: string) => {
      setLoading(true);
      try {
        const result = await getEbayPrice(token, itemId);
        setPriceResult(result);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Price failed');
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  const handleJewelryNext = useCallback(() => {
    if (!scanResult?.item_id) return;
    setStep('price');
    setPriceResult(null);
    setLoading(true);
    fetchPrice(scanResult.item_id);
  }, [scanResult?.item_id, fetchPrice]);

  const handleDonateOrSell = useCallback(
    async (choice: 'resale' | 'donation', charityId?: string) => {
      if (!scanResult?.item_id) return;
      setError('');
      setLoading(true);
      try {
        await addToCart(token, scanResult.item_id, choice, charityId);
        setStep('added');
        onCartUpdate();
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Add to cart failed');
      } finally {
        setLoading(false);
      }
    },
    [token, scanResult?.item_id, onCartUpdate]
  );

  const handleReScan = useCallback(() => {
    setStep('capture');
    setScanResult(null);
    setPriceResult(null);
    setError('');
  }, []);

  const handleScanAnother = useCallback(() => {
    setStep('capture');
    setScanResult(null);
    setPriceResult(null);
    setError('');
  }, []);

  if (step === 'capture') {
    return (
      <ImageCapture
        onSubmit={handleImagesSubmit}
        loading={loading}
        error={error}
        onRetry={() => setError('')}
      />
    );
  }

  if (step === 'results' && scanResult) {
    return (
      <AIResults
        result={scanResult}
        onConfirm={handleConfirm}
        onReScan={handleReScan}
        loading={loading}
        error={error}
      />
    );
  }

  if (step === 'jewelry' && scanResult) {
    return (
      <JewelryFields
        scanResult={scanResult}
        weight={jewelryWeight}
        purity={jewelryPurity}
        metal={jewelryMetal}
        onWeightChange={setJewelryWeight}
        onPurityChange={setJewelryPurity}
        onMetalChange={setJewelryMetal}
        onNext={handleJewelryNext}
        loading={loading}
        error={error}
      />
    );
  }

  if (step === 'price' && scanResult) {
    if (loading || priceResult === null) {
      return (
        <div style={{ textAlign: 'center', padding: 48, background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <div style={{ marginBottom: 16 }}>Reviewing your item…</div>
          <div style={{ color: '#666' }}>Calculating your offer...</div>
        </div>
      );
    }
    return (
      <PriceResult
        scanResult={scanResult}
        priceResult={priceResult}
        onNext={() => setStep('donate-sell')}
        error={error}
      />
    );
  }

  if (step === 'donate-sell' && scanResult && priceResult) {
    return (
      <DonateOrSell
        priceResult={priceResult}
        onSelect={handleDonateOrSell}
        onNoThanks={handleScanAnother}
        loading={loading}
        error={error}
      />
    );
  }

  if (step === 'added') {
    return (
      <div style={{ textAlign: 'center', padding: 32, background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>✓</div>
        <h2 style={{ margin: '0 0 8px' }}>Item added to cart</h2>
        <p style={{ color: '#666', marginBottom: 24 }}>You can scan another item or view your cart.</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button type="button" onClick={handleScanAnother} style={{ padding: '12px 24px', background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>
            Scan Another Item
          </button>
          <a href="/cart" style={{ padding: '12px 24px', background: '#4CAF50', color: '#fff', textDecoration: 'none', borderRadius: 8, fontWeight: 600 }}>
            View Cart
          </a>
        </div>
      </div>
    );
  }

  return (
    <ImageCapture
      onSubmit={handleImagesSubmit}
      loading={loading}
      error={error}
      onRetry={() => setError('')}
    />
  );
}
