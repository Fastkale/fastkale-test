/**
 * API client for FastKale backend. No business logic — only calls and returns raw responses.
 * Base URL from VITE_API_BASE_URL (see .env.example).
 */

const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:54321/functions/v1';

export type DeviceType = 'mobile' | 'laptop';

// Custom headers (X-Device-Type, User-Agent) are not sent to avoid CORS preflight
// when backend Access-Control-Allow-Headers does not include them.
function getDeviceHeader(_device: DeviceType): Record<string, string> {
  return {};
}

export interface CallResult {
  status: number;
  ok: boolean;
  body: unknown;
  requestPayload?: unknown;
  requestHeaders?: Record<string, string>;
}

export async function apiCall(
  path: string,
  options: {
    method?: string;
    body?: unknown;
    token?: string | null;
    device?: DeviceType;
    formData?: FormData;
  } = {}
): Promise<CallResult> {
  const { method = 'GET', body, token, device = 'laptop', formData } = options;
  const url = `${BASE.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
  const headers: Record<string, string> = {
    ...getDeviceHeader(device),
  };
  if (!formData) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const init: RequestInit = { method, headers };
  if (formData) {
    init.body = formData;
    delete (headers as Record<string, unknown>)['Content-Type'];
  } else if (body !== undefined && method !== 'GET') {
    init.body = JSON.stringify(body);
  }
  const res = await fetch(url, init);
  let responseBody: unknown;
  const ct = res.headers.get('content-type');
  if (ct?.includes('application/json')) {
    try {
      responseBody = await res.json();
    } catch {
      responseBody = await res.text();
    }
  } else {
    responseBody = await res.text();
  }
  return {
    status: res.status,
    ok: res.ok,
    body: responseBody,
    requestPayload: formData ? undefined : body,
    requestHeaders: headers,
  };
}

export { BASE as apiBaseUrl };
