import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Field, FormError } from '@/components/field';
import { send } from '@/lib/api';
export function PasswordDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await send('/auth/password', Object.fromEntries(new FormData(e.currentTarget)));
      toast.success('密码已修改，其他设备已退出登录');
      onClose();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>修改密码</DialogTitle>
          <DialogDescription>
            使用至少 10 位的新密码。修改后，其他设备上的登录会失效。
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="form-stack">
          <Field label="当前密码">
            <Input
              name="currentPassword"
              type="password"
              autoComplete="current-password"
              required
            />
          </Field>
          <Field label="新密码">
            <Input
              name="newPassword"
              type="password"
              autoComplete="new-password"
              minLength={10}
              maxLength={128}
              required
            />
          </Field>
          <FormError message={error} />
          <Button disabled={busy}>{busy ? '保存中…' : '保存新密码'}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
