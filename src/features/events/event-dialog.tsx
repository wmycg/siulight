import { useState } from 'react';
import { useRetainedValue } from '@/hooks/use-retained-value';
import { CalendarDays, MapPin, Users, ArrowUpRight } from 'lucide-react';
import { toast } from 'sonner';
import type { ClubEvent } from '@shared/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { formatDate, today } from '@/lib/utils';
import { send, queryClient } from '@/lib/api';
import { useAuth } from '@/features/auth/auth-provider';
export function EventDialog({
  event: activeEvent,
  onClose,
}: {
  event: ClubEvent | null;
  onClose: () => void;
}) {
  const event = useRetainedValue(activeEvent);
  const { user, openLogin } = useAuth();
  const [busy, setBusy] = useState(false);
  async function join() {
    if (!activeEvent || !event) return;
    if (!user) {
      onClose();
      openLogin();
      return;
    }
    setBusy(true);
    try {
      await send(`/events/${event.id}/join`, { joined: !event.joined }, 'PUT');
      await queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success(event.joined ? '已取消报名' : '报名成功，到时见！');
      onClose();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Dialog open={!!activeEvent} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="detail-dialog">
        {event && (
          <>
            {event.image && <img className="detail-cover" src={event.image} alt="" />}
            <DialogHeader>
              <span className="eyebrow">LET’S MEET · {event.category}</span>
              <DialogTitle>{event.title}</DialogTitle>
              <DialogDescription>{event.brief}</DialogDescription>
            </DialogHeader>
            <div className="detail-facts">
              <span>
                <CalendarDays />
                {formatDate(event.date)}
              </span>
              <span>
                <MapPin />
                {event.place}
              </span>
              <span>
                <Users />
                {event.attendees} / {event.capacity} 人已报名
              </span>
            </div>
            <p className="story-body">{event.body}</p>
            <Button
              disabled={
                busy ||
                (!event.joined && (event.date < today() || event.attendees >= event.capacity))
              }
              onClick={join}
            >
              {busy
                ? '提交中…'
                : event.joined
                  ? '取消我的报名'
                  : event.date < today()
                    ? '这次活动已结束'
                    : event.attendees >= event.capacity
                      ? '名额已满'
                      : '报名，一起出发'}
              <ArrowUpRight />
            </Button>
            <p className="micro-copy">报名记录与你的账号关联，活动开始前请留意社群通知。</p>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
