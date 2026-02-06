import { useState } from 'react';
import { login, signup } from '../api-flow';

interface LoginGateProps {
  onLogin: (token: string) => void;
}

export function LoginGate({ onLogin }: LoginGateProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('5551234567');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        const { session } = await login(email, password);
        onLogin(session.access_token);
      } else {
        const { session } = await signup({ email, password, full_name: fullName, phone });
        onLogin(session.access_token);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 24, background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
      <h1 style={{ marginTop: 0, marginBottom: 24 }}>Sign in to continue</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ padding: 12, borderRadius: 8, border: '1px solid #ccc' }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ padding: 12, borderRadius: 8, border: '1px solid #ccc' }}
        />
        {mode === 'signup' && (
          <>
            <input
              type="text"
              placeholder="Full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              style={{ padding: 12, borderRadius: 8, border: '1px solid #ccc' }}
            />
            <input
              type="tel"
              placeholder="Phone (10 digits)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={{ padding: 12, borderRadius: 8, border: '1px solid #ccc' }}
            />
          </>
        )}
        {error && <div style={{ color: '#c62828', fontSize: 14 }}>{error}</div>}
        <button type="submit" disabled={loading} style={{ padding: 14, background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>
          {loading ? '...' : mode === 'login' ? 'Log in' : 'Sign up'}
        </button>
      </form>
      <button
        type="button"
        onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
        style={{ marginTop: 12, background: 'none', border: 'none', color: '#666', cursor: 'pointer', textDecoration: 'underline', fontSize: 14 }}
      >
        {mode === 'login' ? 'Create account' : 'Already have an account? Log in'}
      </button>
    </div>
  );
}
