import { useRef, useState } from 'react';
import { ImagePlus, X, LoaderCircle } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
export function ImageUpload({
  value,
  onChange,
  onBusy,
}: {
  value: string;
  onChange: (v: string) => void;
  onBusy?: (v: boolean) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  async function upload(file?: File) {
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      toast.error('图片不能超过 8 MB');
      return;
    }
    setBusy(true);
    onBusy?.(true);
    try {
      const data = new FormData();
      data.append('image', file);
      const result = await api<{ url: string }>('/uploads', { method: 'POST', body: data });
      onChange(result.url);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
      onBusy?.(false);
      if (input.current) input.current.value = '';
    }
  }
  return (
    <div className="upload-field">
      <input
        ref={input}
        type="file"
        className="sr-only"
        accept="image/png,image/jpeg,image/webp"
        aria-label="上传纪念图片"
        onChange={(e) => upload(e.target.files?.[0])}
      />
      {value ? (
        <div className="upload-preview">
          <img src={value} alt="已选择的封面" />
          <button type="button" onClick={() => onChange('')} aria-label="移除封面">
            <X size={16} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          disabled={busy}
          onClick={() => input.current?.click()}
          className="upload-button"
        >
          {busy ? <LoaderCircle className="animate-spin" /> : <ImagePlus />}
          <span>
            {busy ? '正在保存图片…' : '给这个瞬间，添一张照片'}
            <small>可选 · JPG / PNG / WebP · 最大 8 MB</small>
          </span>
        </button>
      )}
    </div>
  );
}
