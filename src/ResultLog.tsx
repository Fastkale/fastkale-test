import type { CallResult } from './api';

interface ResultLogProps {
  result: CallResult | null;
  label?: string;
}

export function ResultLog({ result, label = 'Response' }: ResultLogProps) {
  if (!result) return <pre style={{ margin: 0, fontSize: 12 }}>—</pre>;
  const { status, ok, body, requestPayload, requestHeaders } = result;
  return (
    <div style={{ marginTop: 8, fontFamily: 'monospace', fontSize: 12 }}>
      <div style={{ marginBottom: 4 }}>
        <strong>HTTP {status}</strong> {ok ? '✓' : '✗'}
      </div>
      {requestPayload !== undefined && (
        <details style={{ marginBottom: 4 }}>
          <summary>Request payload</summary>
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', margin: 4 }}>
            {JSON.stringify(requestPayload, null, 2)}
          </pre>
        </details>
      )}
      {requestHeaders && (
        <details style={{ marginBottom: 4 }}>
          <summary>Request headers</summary>
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', margin: 4 }}>
            {JSON.stringify(requestHeaders, null, 2)}
          </pre>
        </details>
      )}
      <div><strong>{label}</strong></div>
      <pre
        style={{
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-all',
          margin: 4,
          padding: 8,
          background: '#f5f5f5',
          border: '1px solid #ccc',
          maxHeight: 300,
          overflow: 'auto',
        }}
      >
        {typeof body === 'string' ? body : JSON.stringify(body, null, 2)}
      </pre>
    </div>
  );
}
