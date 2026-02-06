import { useState, useRef } from 'react';

const MAX_FILES = 5;
const MAX_SIZE_MB = 2;

interface ImageCaptureProps {
  onSubmit: (files: File[]) => void;
  loading: boolean;
  error: string;
  onRetry: () => void;
}

export function ImageCapture({ onSubmit, loading, error, onRetry }: ImageCaptureProps) {
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const valid: File[] = [];
    for (const f of files) {
      if (valid.length >= MAX_FILES) break;
      if (!f.type.startsWith('image/')) continue;
      if (f.size > MAX_SIZE_MB * 1024 * 1024) continue;
      valid.push(f);
    }
    setSelectedFiles(valid);
    const urls = valid.map((f) => URL.createObjectURL(f));
    setPreviewUrls((prev) => prev.forEach((u) => URL.revokeObjectURL(u)));
    setPreviewUrls(urls);
    e.target.value = '';
  };

  const handleRemove = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = () => {
    if (selectedFiles.length === 0) return;
    onSubmit(selectedFiles);
  };

  const handleRetake = () => {
    setPreviewUrls((prev) => prev.forEach((u) => URL.revokeObjectURL(u)));
    setPreviewUrls([]);
    setSelectedFiles([]);
    fileInputRef.current?.click();
  };

  return (
    <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', padding: 24 }}>
      <h2 style={{ marginTop: 0, marginBottom: 8 }}>Step 1: Capture photos</h2>
      <p style={{ color: '#666', fontSize: 14, marginBottom: 16 }}>
        Add 1–5 photos (JPEG/PNG, max 2MB each). Multiple angles help.
      </p>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png"
        multiple
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      {previewUrls.length === 0 ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: '2px dashed #ccc',
            borderRadius: 12,
            padding: 48,
            textAlign: 'center',
            cursor: 'pointer',
            background: '#fafafa',
          }}
        >
          <div style={{ fontSize: 32, marginBottom: 8 }}>📷</div>
          <div>Tap to choose from gallery</div>
          <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>or use camera on mobile</div>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
            {previewUrls.map((url, i) => (
              <div key={url} style={{ position: 'relative', width: 80, height: 80 }}>
                <img src={url} alt={`Preview ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} />
                <button
                  type="button"
                  onClick={() => handleRemove(i)}
                  style={{ position: 'absolute', top: -4, right: -4, width: 24, height: 24, borderRadius: 12, background: '#c62828', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 14, lineHeight: 1 }}
                >
                  ×
                </button>
              </div>
            ))}
            {selectedFiles.length < MAX_FILES && (
              <button type="button" onClick={() => fileInputRef.current?.click()} style={{ width: 80, height: 80, border: '2px dashed #ccc', borderRadius: 8, background: '#fafafa', cursor: 'pointer', fontSize: 24 }}>
                +
              </button>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" onClick={handleRetake} style={{ padding: '10px 20px', background: '#f5f5f5', border: '1px solid #ccc', borderRadius: 8, cursor: 'pointer' }}>
              Retake
            </button>
            <button type="button" onClick={handleSubmit} disabled={loading} style={{ padding: '10px 20px', background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>
              {loading ? 'Analyzing your item...' : 'Confirm & analyze'}
            </button>
          </div>
        </>
      )}

      {error && (
        <div style={{ marginTop: 16, padding: 12, background: '#ffebee', color: '#c62828', borderRadius: 8, fontSize: 14 }}>
          {error}
          <button type="button" onClick={onRetry} style={{ marginLeft: 8, textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', color: '#c62828' }}>
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}
