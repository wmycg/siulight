import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { ArrowUpRight, Check, LoaderCircle, Trash2, Shuffle } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/features/auth/auth-provider';
import { send, api } from '@/lib/api';
import { noteColors, type NoteColor, type WallNote } from '@shared/types';
import { colorLabels, paperStyle } from './paper';

export function NoteComposer({
  open,
  onClose,
  onPosted,
}: {
  open: boolean;
  onClose: () => void;
  onPosted: (note: WallNote) => void;
}) {
  const { user, openLogin } = useAuth();
  const [body, setBody] = useState('');
  const [nickname, setNickname] = useState('');
  const [color, setColor] = useState<NoteColor>('random');
  const post = useMutation({
    mutationFn: () => send<WallNote>('/wall', { body, nickname, color }),
    onSuccess: (note) => {
      onPosted(note);
      setBody('');
      setColor('random');
      onClose();
      toast.success('纸条贴好了，愿它遇见懂你的人。');
    },
    onError: (e) => toast.error(e.message),
  });
  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!value && !post.isPending) onClose();
      }}
    >
      <DialogContent className="note-composer">
        <DialogHeader>
          <span className="eyebrow">A LITTLE NOTE, A LITTLE LIGHT</span>
          <DialogTitle>把心情，留在这里。</DialogTitle>
          <DialogDescription>
            一段日常、一个脑洞，或一句想说的话。所有人都可以看见。
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!post.isPending) post.mutate();
          }}
        >
          <div className="composer-paper" style={paperStyle(color === 'random' ? 'butter' : color)}>
            <label htmlFor="note-body" className="sr-only">
              留言内容
            </label>
            <Textarea
              id="note-body"
              maxLength={280}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="今天，有什么想分享的？"
              required
              disabled={post.isPending}
            />
            <div className="composer-sign">
              <span>— {user?.name || nickname || '路过的同好'}</span>
              <small>{body.length} / 280</small>
            </div>
          </div>
          <fieldset className="paper-palette">
            <legend>选一张喜欢的纸</legend>
            <div>
              {noteColors.map((c) => (
                <button
                  type="button"
                  key={c}
                  style={paperStyle(c)}
                  className={c === 'random' ? 'random-paper-color' : undefined}
                  title={colorLabels[c]}
                  aria-label={colorLabels[c]}
                  aria-pressed={c === color}
                  onClick={() => setColor(c)}
                  disabled={post.isPending}
                >
                  {c === 'random' ? <Shuffle size={14} /> : color === c && <Check size={15} />}
                </button>
              ))}
            </div>
          </fieldset>
          {!user && (
            <label className="composer-name" htmlFor="note-nickname">
              署名 <span>可选</span>
              <Input
                id="note-nickname"
                maxLength={20}
                placeholder="路过的同好"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                disabled={post.isPending}
              />
            </label>
          )}
          <div className="composer-actions">
            <span>
              {user ? (
                `以 ${user.name} 的身份留言`
              ) : (
                <>
                  游客也可以留言 ·{' '}
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      openLogin();
                    }}
                  >
                    登录
                  </button>
                </>
              )}
            </span>
            <Button type="submit" disabled={!body.trim() || post.isPending}>
              {post.isPending ? <LoaderCircle className="animate-spin" /> : null}贴上纸条
              <ArrowUpRight size={16} />
            </Button>
          </div>
          {!user && <p className="composer-hint">游客可在当前浏览器收回自己的纸条。</p>}
        </form>
      </DialogContent>
    </Dialog>
  );
}
export function NoteReader({
  note,
  onClose,
  onDeleted,
}: {
  note: WallNote | null;
  onClose: () => void;
  onDeleted: (id: number) => void;
}) {
  const [confirm, setConfirm] = useState(false);
  const remove = useMutation({
    mutationFn: (id: number) => api(`/wall/${id}`, { method: 'DELETE' }),
    onSuccess: (_, id) => {
      onDeleted(id);
      onClose();
      setConfirm(false);
      toast.success('纸条已收回');
    },
    onError: (e) => toast.error(e.message),
  });
  return (
    <Dialog
      open={!!note}
      onOpenChange={(value) => {
        if (!value) {
          onClose();
          setConfirm(false);
        }
      }}
    >
      <DialogContent
        className="note-reader"
        style={note ? paperStyle(note.color, note.id) : undefined}
      >
        {note && (
          <>
            <DialogHeader>
              <span className="eyebrow">TO SOMEONE WHO FINDS THIS</span>
              <DialogTitle>一张来自{note.nickname}的纸条</DialogTitle>
              <DialogDescription>
                {note.isDemo ? '开发示例 · ' : ''}
                {new Date(note.createdAt).toLocaleDateString('zh-CN')} ·{' '}
                {note.registered ? '微光的朋友' : '偶然路过的同好'}
              </DialogDescription>
            </DialogHeader>
            <p className="reader-body">{note.body}</p>
            <div className="reader-sign">
              — {note.nickname} <span>✳</span>
            </div>
            {note.canDelete && (
              <div className="reader-delete">
                {confirm ? (
                  <>
                    <span>确定收回这张纸条？</span>
                    <Button variant="ghost" size="sm" onClick={() => setConfirm(false)}>
                      取消
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={remove.isPending}
                      onClick={() => remove.mutate(note.id)}
                    >
                      收回
                    </Button>
                  </>
                ) : (
                  <button onClick={() => setConfirm(true)}>
                    <Trash2 size={14} />
                    收回纸条
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
