import { useState } from 'react';
import { useRetainedValue } from '@/hooks/use-retained-value';
import { Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Milestone } from '@shared/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/avatar';
import { formatDate } from '@/lib/utils';
import { api, queryClient } from '@/lib/api';
import { useAuth } from '@/features/auth/auth-provider';
export function MilestoneDialog({
  item: activeItem,
  onClose,
  onEdit,
}: {
  item: Milestone | null;
  onClose: () => void;
  onEdit: (m: Milestone) => void;
}) {
  const item = useRetainedValue(activeItem);
  const { user } = useAuth();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  async function remove() {
    if (!activeItem || !item) return;
    setBusy(true);
    try {
      await api(`/milestones/${item.id}`, { method: 'DELETE' });
      await queryClient.invalidateQueries({ queryKey: ['milestones'] });
      await queryClient.invalidateQueries({ queryKey: ['stats'] });
      onClose();
      toast.success('纪念已删除');
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
      setConfirming(false);
    }
  }
  return (
    <Dialog
      open={!!activeItem}
      onOpenChange={(v) => {
        if (!v) {
          onClose();
          setConfirming(false);
        }
      }}
    >
      <DialogContent className="detail-dialog">
        {item && (
          <>
            {item.image && <img className="detail-cover" src={item.image} alt={item.title} />}
            <DialogHeader>
              <span className="eyebrow">
                {item.kind === 'club' ? '✦ 社团纪念' : item.category} · {formatDate(item.date)}
              </span>
              <DialogTitle>{item.title}</DialogTitle>
              <DialogDescription>
                {item.participants.length > 1
                  ? `${item.participants.length} 位伙伴，共同收藏的瞬间`
                  : `${item.author.name}的闪光时刻`}
              </DialogDescription>
            </DialogHeader>
            <p className="story-body">{item.body}</p>
            <div className="story-people">
              {item.participants.map((p) => (
                <div key={p.id}>
                  <Avatar member={p} />
                  <span>{p.name}</span>
                </div>
              ))}
            </div>
            {user && (user.id === item.authorId || user.role !== 'member') && (
              <div className="story-tools">
                {user.id === item.authorId && (
                  <Button variant="outline" size="sm" onClick={() => onEdit(item)}>
                    <Pencil />
                    编辑纪念
                  </Button>
                )}
                <Button
                  variant={confirming ? 'destructive' : 'ghost'}
                  size="sm"
                  disabled={busy}
                  onClick={() => (confirming ? remove() : setConfirming(true))}
                >
                  <Trash2 />
                  {confirming ? '确认永久删除' : '删除'}
                </Button>
                {confirming && (
                  <Button variant="ghost" size="sm" onClick={() => setConfirming(false)}>
                    取消
                  </Button>
                )}
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
