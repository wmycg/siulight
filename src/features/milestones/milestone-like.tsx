import { useState } from 'react';
import { Heart } from 'lucide-react';
import { toast } from 'sonner';
import type { Milestone } from '@shared/types';
import { useAuth } from '@/features/auth/auth-provider';
import { queryClient, send } from '@/lib/api';

export function MilestoneLike({ item }: { item: Milestone }) {
  const { user, openLogin } = useAuth();
  const [busy, setBusy] = useState(false);
  async function like() {
    if (!user) {
      openLogin();
      return;
    }
    if (busy) return;
    setBusy(true);
    try {
      await send(`/milestones/${item.id}/like`, { liked: !item.liked }, 'PUT');
      await queryClient.invalidateQueries({ queryKey: ['milestones'] });
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <button
      className={`like-button ${item.liked ? 'is-liked' : ''}`}
      aria-label={item.liked ? '取消喜欢' : '喜欢这条纪念'}
      aria-pressed={item.liked}
      disabled={busy}
      onClick={like}
    >
      <Heart size={16} fill={item.liked ? 'currentColor' : 'none'} />
      <span>{item.likes}</span>
    </button>
  );
}
