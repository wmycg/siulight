import { useState, useEffect, type FormEvent } from 'react';
import { ArrowUpRight, Sparkles } from 'lucide-react';
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
import { queryClient, send } from '@/lib/api';
import type { User } from '@shared/types';
export function AuthDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [register, setRegister] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    if (open) {
      setRegister(false);
      setError('');
    }
  }, [open]);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const values = Object.fromEntries(new FormData(e.currentTarget));
    setBusy(true);
    setError('');
    try {
      const user = await send<User>(`/auth/${register ? 'register' : 'login'}`, values);
      queryClient.setQueryData(['me'], user);
      await queryClient.invalidateQueries();
      onOpenChange(false);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <div className="dialog-symbol">
          <Sparkles />
        </div>
        <DialogHeader>
          <DialogTitle>{register ? '让故事，从你开始。' : '好久不见，欢迎回来。'}</DialogTitle>
          <DialogDescription>
            {register
              ? '创建账号，收藏热爱，写下自己的闪光时刻。'
              : '登录微光，继续书写我们的纪念册。'}
          </DialogDescription>
        </DialogHeader>
        <form key={String(register)} onSubmit={submit} className="form-stack">
          {register && (
            <Field label="怎么称呼你">
              <Input
                name="name"
                autoComplete="nickname"
                placeholder="你的名字或昵称"
                minLength={2}
                maxLength={20}
                required
              />
            </Field>
          )}
          <Field label="邮箱">
            <Input
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              maxLength={190}
              required
            />
          </Field>
          <Field label="密码">
            <Input
              name="password"
              type="password"
              autoComplete={register ? 'new-password' : 'current-password'}
              placeholder="至少 10 位密码"
              minLength={10}
              maxLength={128}
              required
            />
          </Field>
          <FormError message={error} />
          <Button disabled={busy} type="submit" className="w-full">
            {busy ? '稍等一下…' : register ? '创建我的账号' : '登录'}
            <ArrowUpRight />
          </Button>
        </form>
        <button
          className="subtle-link text-center"
          onClick={() => {
            setRegister(!register);
            setError('');
          }}
        >
          {register ? '已经有账号？去登录' : '第一次来？创建一个账号'}
        </button>
      </DialogContent>
    </Dialog>
  );
}
