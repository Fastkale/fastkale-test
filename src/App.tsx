import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { ScanFlow } from './pages/ScanFlow';
import { CartPage } from './pages/CartPage';
import { OfferPage } from './pages/OfferPage';
import { LoginGate } from './components/LoginGate';
import { getCart } from './api-flow';

const TOKEN_KEY = 'fastkale_token';

export default function App() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  }, [token]);

  useEffect(() => {
    if (!token) {
      setCartCount(0);
      return;
    }
    getCart(token)
      .then((cart) => setCartCount(cart.items?.length ?? 0))
      .catch(() => setCartCount(0));
  }, [token]);

  const refreshCartCount = () => {
    if (!token) return;
    getCart(token).then((cart) => setCartCount(cart.items?.length ?? 0));
  };

  return (
    <BrowserRouter>
      <div style={{ minHeight: '100vh', fontFamily: 'system-ui, sans-serif', background: '#f5f5f5' }}>
        <header
          style={{
            background: '#1a1a1a',
            color: '#fff',
            padding: '12px 16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Link to="/" style={{ color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: 18 }}>
            FastKale
          </Link>
          <nav style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <Link to="/" style={{ color: '#fff', textDecoration: 'none' }}>
              Scan
            </Link>
            <Link to="/cart" style={{ color: '#fff', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
              Cart {cartCount > 0 && <span style={{ background: '#4CAF50', borderRadius: 12, padding: '2px 8px', fontSize: 12 }}>{cartCount}</span>}
            </Link>
            <Link to="/offer" style={{ color: '#fff', textDecoration: 'none' }}>
              Offer
            </Link>
            {token ? (
              <button type="button" onClick={() => setToken(null)} style={{ background: 'transparent', border: '1px solid #fff', color: '#fff', padding: '6px 12px', borderRadius: 6, cursor: 'pointer' }}>
                Logout
              </button>
            ) : null}
          </nav>
        </header>

        <main style={{ maxWidth: 480, margin: '0 auto', padding: 16, paddingBottom: 100 }}>
          {!token ? (
            <LoginGate onLogin={(t) => setToken(t)} />
          ) : (
            <Routes>
              <Route path="/" element={<ScanFlow token={token} onCartUpdate={refreshCartCount} />} />
              <Route path="/cart" element={<CartPage token={token} onCartUpdate={refreshCartCount} />} />
              <Route path="/offer" element={<OfferPage token={token} />} />
            </Routes>
          )}
        </main>

        <footer
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            background: '#fff',
            borderTop: '1px solid #eee',
            padding: '12px 16px',
            display: 'flex',
            justifyContent: 'center',
            gap: 12,
          }}
        >
          <Link to="/" style={{ padding: '10px 20px', background: '#1a1a1a', color: '#fff', textDecoration: 'none', borderRadius: 8 }}>
            Scan Another Item
          </Link>
          <Link to="/cart" style={{ padding: '10px 20px', background: '#4CAF50', color: '#fff', textDecoration: 'none', borderRadius: 8 }}>
            View Cart
          </Link>
        </footer>
      </div>
    </BrowserRouter>
  );
}
