import { useState } from 'react';
import { apiCall } from './api';
import { ResultLog } from './ResultLog';
import type { CallResult } from './api';
import type { AuthData, UserProfile } from './types';

interface AuthSectionProps {
  token: string | null;
  user: UserProfile | null;
  setToken: (t: string | null) => void;
  setUser: (u: UserProfile | null) => void;
  device: 'mobile' | 'laptop';
}

export function AuthSection({ token, user, setToken, setUser, device }: AuthSectionProps) {
  const [signupPayload, setSignupPayload] = useState({
    email: 'test@example.com',
    password: 'Test1234',
    full_name: 'Test User',
    phone: '5551234567',
  });
  const [loginPayload, setLoginPayload] = useState({ email: 'test@example.com', password: 'Test1234' });
  const [refreshToken, setRefreshToken] = useState('');
  const [result, setResult] = useState<CallResult | null>(null);
  const [passwordResetEmail, setPasswordResetEmail] = useState('test@example.com');
  const [passwordResetResult, setPasswordResetResult] = useState<CallResult | null>(null);
  const [passwordResetConfirmPayload, setPasswordResetConfirmPayload] = useState({
    reset_token: '',
    new_password: 'NewPass123',
  });
  const [passwordResetConfirmResult, setPasswordResetConfirmResult] = useState<CallResult | null>(null);

  const handleSignup = async () => {
    const r = await apiCall('signup', { method: 'POST', body: signupPayload, device });
    setResult(r);
    if (r.ok && r.body && typeof r.body === 'object' && 'data' in r.body) {
      const d = (r.body as { data: AuthData }).data;
      if (d?.session?.access_token) {
        setToken(d.session.access_token);
        setRefreshToken(d.session.refresh_token || '');
        setUser(d.user ?? null);
      }
    }
  };

  const handleLogin = async () => {
    const r = await apiCall('login', { method: 'POST', body: loginPayload, device });
    setResult(r);
    if (r.ok && r.body && typeof r.body === 'object' && 'data' in r.body) {
      const d = (r.body as { data: AuthData }).data;
      if (d?.session?.access_token) {
        setToken(d.session.access_token);
        setRefreshToken(d.session.refresh_token || '');
        setUser(d.user ?? null);
      }
    }
  };

  const handleLogout = async () => {
    const r = await apiCall('logout', { method: 'POST', token, device });
    setResult(r);
    if (r.ok) {
      setToken(null);
      setUser(null);
      setRefreshToken('');
    }
  };

  const handleRefresh = async () => {
    const r = await apiCall('refresh-token', {
      method: 'POST',
      body: { refresh_token: refreshToken || (token ? 'use-stored' : '') },
      device,
    });
    setResult(r);
    if (r.ok && r.body && typeof r.body === 'object' && 'data' in r.body) {
      const d = (r.body as { data: { access_token?: string; refresh_token?: string } }).data;
      if (d?.access_token) setToken(d.access_token);
      if (d?.refresh_token) setRefreshToken(d.refresh_token);
    }
  };

  const handlePasswordResetRequest = async () => {
    const r = await apiCall('password-reset-request', {
      method: 'POST',
      body: { email: passwordResetEmail },
      device,
    });
    setPasswordResetResult(r);
  };

  const handlePasswordResetConfirm = async () => {
    const r = await apiCall('password-reset-confirm', {
      method: 'POST',
      body: passwordResetConfirmPayload,
      device,
    });
    setPasswordResetConfirmResult(r);
  };

  return (
    <section style={{ border: '1px solid #ccc', padding: 12, marginBottom: 12 }}>
      <h2 style={{ marginTop: 0 }}>1. Authentication</h2>
      <div style={{ marginBottom: 8 }}>
        <strong>Auth state:</strong>{' '}
        {user ? `${user.email} (${user.full_name})` : 'Not logged in'}
        {token && (
          <span style={{ marginLeft: 8 }}>
            Token: <code style={{ fontSize: 10 }}>{token.slice(0, 20)}…</code>
          </span>
        )}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'flex-start' }}>
        <div>
          <div>Signup</div>
          <input
            placeholder="email"
            value={signupPayload.email}
            onChange={(e) => setSignupPayload((p) => ({ ...p, email: e.target.value }))}
          />
          <input
            type="password"
            placeholder="password"
            value={signupPayload.password}
            onChange={(e) => setSignupPayload((p) => ({ ...p, password: e.target.value }))}
          />
          <input
            placeholder="full_name"
            value={signupPayload.full_name}
            onChange={(e) => setSignupPayload((p) => ({ ...p, full_name: e.target.value }))}
          />
          <input
            placeholder="phone"
            value={signupPayload.phone}
            onChange={(e) => setSignupPayload((p) => ({ ...p, phone: e.target.value }))}
          />
          <button type="button" onClick={handleSignup}>Signup</button>
        </div>
        <div>
          <div>Login</div>
          <input
            placeholder="email"
            value={loginPayload.email}
            onChange={(e) => setLoginPayload((p) => ({ ...p, email: e.target.value }))}
          />
          <input
            type="password"
            placeholder="password"
            value={loginPayload.password}
            onChange={(e) => setLoginPayload((p) => ({ ...p, password: e.target.value }))}
          />
          <button type="button" onClick={handleLogin}>Login</button>
        </div>
        <div>
          <button type="button" onClick={handleLogout} disabled={!token}>Logout</button>
        </div>
        <div>
          <div>Refresh token</div>
          <input
            placeholder="refresh_token (or use stored)"
            value={refreshToken}
            onChange={(e) => setRefreshToken(e.target.value)}
            style={{ width: 200 }}
          />
          <button type="button" onClick={handleRefresh}>Refresh</button>
        </div>
        <div>
          <div>Password reset request</div>
          <input
            placeholder="email"
            value={passwordResetEmail}
            onChange={(e) => setPasswordResetEmail(e.target.value)}
          />
          <button type="button" onClick={handlePasswordResetRequest}>Send reset</button>
        </div>
        <div>
          <div>Password reset confirm</div>
          <input
            placeholder="reset_token (from email)"
            value={passwordResetConfirmPayload.reset_token}
            onChange={(e) => setPasswordResetConfirmPayload((p) => ({ ...p, reset_token: e.target.value }))}
            style={{ width: 200 }}
          />
          <input
            type="password"
            placeholder="new_password"
            value={passwordResetConfirmPayload.new_password}
            onChange={(e) => setPasswordResetConfirmPayload((p) => ({ ...p, new_password: e.target.value }))}
          />
          <button type="button" onClick={handlePasswordResetConfirm}>Confirm reset</button>
        </div>
      </div>
      <ResultLog result={result} />
      <details style={{ marginTop: 8 }}>
        <summary>Password reset</summary>
        <ResultLog result={passwordResetResult} label="Reset request" />
        <ResultLog result={passwordResetConfirmResult} label="Reset confirm" />
      </details>
    </section>
  );
}
