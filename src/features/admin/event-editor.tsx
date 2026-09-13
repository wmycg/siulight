import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import type { ClubEvent } from '@shared/types';
import { categories } from '@shared/content';
import { eventSchema } from '@shared/validation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Field, Select, FormError } from '@/components/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ImageUpload } from '@/components/image-upload';
import { send, queryClient } from '@/lib/api';
import { today } from '@/lib/utils';
export function EventEditor({ item, onClose }: { item?: ClubEvent; onClose: () => void }) {
  const [image, setImage] = useState(item?.image || '');
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = eventSchema.safeParse({
      ...Object.fromEntries(new FormData(e.currentTarget)),
      image,
    });
    if (!data.success) {
      setError(data.error.issues[0].message);
      return;
    }
    setBusy(true);
    setError('');
    try {
      await send(
        item ? `/admin/events/${item.id}` : '/admin/events',
        data.data,
        item ? 'PUT' : 'POST',
      );
      await queryClient.invalidateQueries({ queryKey: ['events'] });
      await queryClient.invalidateQueries({ queryKey: ['logs'] });
      await queryClient.invalidateQueries({ queryKey: ['stats'] });
      toast.success('活动已保存');
      onClose();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Dialog open onOpenChange={(v) => !v && !busy && !uploading && onClose()}>
      <DialogContent className="editor-dialog">
        <DialogHeader>
          <DialogTitle>{item ? '编辑活动' : '发布新活动'}</DialogTitle>
          <DialogDescription>保存后会立即在活动日历公开展示。</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="form-stack">
          <ImageUpload value={image} onChange={setImage} onBusy={setUploading} />
          <Field label="活动名称">
            <Input name="title" defaultValue={item?.title} maxLength={80} required />
          </Field>
          <div className="form-grid">
            <Field label="日期">
              <Input type="date" name="date" defaultValue={item?.date || today()} required />
            </Field>
            <Field label="类别">
              <Select name="category" defaultValue={item?.category || '社团'}>
                {categories.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </Select>
            </Field>
          </div>
          <div className="form-grid">
            <Field label="地点">
              <Input name="place" defaultValue={item?.place} maxLength={100} required />
            </Field>
            <Field label="报名人数上限">
              <Input
                name="capacity"
                type="number"
                min={Math.max(1, item?.attendees || 1)}
                max={10000}
                defaultValue={item?.capacity || 30}
                required
              />
            </Field>
          </div>
          <Field label="简短介绍">
            <Input name="brief" defaultValue={item?.brief} minLength={5} maxLength={160} required />
          </Field>
          <Field label="详细说明（时间、集合点、准备事项）">
            <Textarea
              name="body"
              defaultValue={item?.body}
              rows={6}
              minLength={5}
              maxLength={5000}
              required
            />
          </Field>
          <FormError message={error} />
          <Button disabled={busy || uploading}>{busy ? '正在保存…' : '保存活动'}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
