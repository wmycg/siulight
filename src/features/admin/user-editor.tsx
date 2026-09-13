import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Field, Select, FormError } from '@/components/field';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { send, queryClient } from '@/lib/api';
export function UserEditor({ onClose }: { onClose: () => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    setBusy(true);
    setError('');
    try {
      await send('/admin/users', data);
      await queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('管理员已创建');
      onClose();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>新增管理员</DialogTitle>
          <DialogDescription>管理员可维护活动、查看入社申请和管理公开内容。</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="form-stack">
          <Field label="姓名">
            <Input name="name" minLength={2} maxLength={20} required />
          </Field>
          <Field label="邮箱">
            <Input name="email" type="email" required />
          </Field>
          <Field label="初始密码">
            <Input
              name="password"
              type="password"
              minLength={10}
              maxLength={128}
              autoComplete="new-password"
              required
            />
          </Field>
          <Field label="权限">
            <Select name="role">
              <option value="admin">管理员</option>
              <option value="superadmin">超级管理员（可管理账号）</option>
            </Select>
          </Field>
          <FormError message={error} />
          <Button disabled={busy}>{busy ? '创建中…' : '创建管理员'}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
