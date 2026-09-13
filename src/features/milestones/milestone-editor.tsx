import { useState, type FormEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowUpRight, Check, Search } from 'lucide-react';
import { toast } from 'sonner';
import type { Member, Milestone, ClubEvent } from '@shared/types';
import { categories } from '@shared/content';
import { milestoneSchema } from '@shared/validation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Field, Select, FormError } from '@/components/field';
import { ImageUpload } from '@/components/image-upload';
import { Avatar } from '@/components/avatar';
import { api, send, queryClient } from '@/lib/api';
import { today } from '@/lib/utils';
import { useAuth } from '@/features/auth/auth-provider';
export function MilestoneEditor({
  open,
  onClose,
  item,
}: {
  open: boolean;
  onClose: () => void;
  item?: Milestone;
}) {
  const { user } = useAuth();
  const [image, setImage] = useState(item?.image || '');
  const [eventId, setEventId] = useState(item?.eventId || '');
  const [participants, setParticipants] = useState<string[]>(
    item?.participants.filter((p) => p.id !== user?.id).map((p) => p.id) || [],
  );
  const [search, setSearch] = useState('');
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const { data: people } = useQuery({
    queryKey: ['members', search],
    queryFn: () => api<Member[]>(`/members?q=${encodeURIComponent(search)}`),
    enabled: open,
  });
  const { data: events, isError: eventsFailed } = useQuery({
    queryKey: ['events'],
    queryFn: () => api<ClubEvent[]>('/events'),
    enabled: open,
  });
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const values = Object.fromEntries(new FormData(e.currentTarget));
    const parsed = milestoneSchema.safeParse({ ...values, image, participantIds: participants });
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    setBusy(true);
    setError('');
    try {
      await send(
        item ? `/milestones/${item.id}` : '/milestones',
        parsed.data,
        item ? 'PUT' : 'POST',
      );
      await queryClient.invalidateQueries({ queryKey: ['milestones'] });
      await queryClient.invalidateQueries({ queryKey: ['stats'] });
      toast.success(item ? '纪念已更新' : '你的闪光时刻，已经被收藏在这里');
      onClose();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Dialog open={open} onOpenChange={(v) => !v && !busy && !uploading && onClose()}>
      <DialogContent className="editor-dialog">
        <DialogHeader>
          <span className="eyebrow">A LITTLE MOMENT, A LASTING MEMORY</span>
          <DialogTitle>{item ? '再添一笔，完善这个瞬间。' : '把这一刻，写进微光。'}</DialogTitle>
          <DialogDescription>
            大事小事都值得纪念。发布后，每个人都可以读到你的故事。
          </DialogDescription>
        </DialogHeader>
        <form className="form-stack" onSubmit={submit}>
          <ImageUpload value={image} onChange={setImage} onBusy={setUploading} />
          <Field label="给这个瞬间起个名字">
            <Input
              name="title"
              defaultValue={item?.title}
              placeholder="比如：人生第一次，把自己的画印成了明信片"
              minLength={2}
              maxLength={80}
              required
            />
          </Field>
          <div className="form-grid">
            <Field label="发生在哪一天">
              <Input
                name="date"
                type="date"
                defaultValue={item?.date || today()}
                min="1900-01-01"
                max={today()}
                required
              />
            </Field>
            <Field label="关于什么">
              <Select name="category" defaultValue={item?.category || '日常'}>
                {categories.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </Select>
            </Field>
          </div>
          <Field label="关联一场活动（可选）">
            <Select name="eventId" value={eventId} onChange={(e) => setEventId(e.target.value)}>
              <option value="">独立的个人时刻</option>
              {item?.eventId && !events?.some((event) => event.id === item.eventId) && (
                <option value={item.eventId}>保留原关联活动</option>
              )}
              {events?.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.date} · {event.title}
                </option>
              ))}
            </Select>
            <p className="micro-copy">
              {eventsFailed
                ? '活动暂时没加载出来，可以先记录独立时刻。'
                : '选中后，你的记录会和这场活动的其他回忆放在一起。'}
            </p>
          </Field>
          <Field label="写下想记住的事">
            <Textarea
              name="body"
              defaultValue={item?.body}
              placeholder="当时的心情、遇见的人、一个小小的进步……"
              minLength={5}
              maxLength={3000}
              rows={5}
              required
            />
          </Field>
          {user?.role !== 'member' ? (
            <Field label="纪念归属">
              <Select name="kind" defaultValue={item?.kind || 'personal'}>
                <option value="personal">个人纪念</option>
                <option value="club">社团官方纪念</option>
              </Select>
            </Field>
          ) : (
            <input type="hidden" name="kind" value="personal" />
          )}
          <div className="participant-picker">
            <div className="participant-heading">
              <span>和谁一起？</span>
              <small>可选 · 已选 {participants.length}/12 位伙伴</small>
            </div>
            <div className="search-input">
              <Search size={15} />
              <Input
                aria-label="搜索共同参与者"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="搜索已注册伙伴的昵称"
              />
            </div>
            <div className="participant-options">
              {people
                ?.filter((p) => p.id !== user?.id)
                .map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    aria-pressed={participants.includes(p.id)}
                    onClick={() =>
                      setParticipants((current) =>
                        current.includes(p.id)
                          ? current.filter((id) => id !== p.id)
                          : current.length < 12
                            ? [...current, p.id]
                            : current,
                      )
                    }
                    className={participants.includes(p.id) ? 'selected' : ''}
                  >
                    <Avatar member={p} link={false} />
                    {p.name}
                    {participants.includes(p.id) && <Check size={13} />}
                  </button>
                ))}
              {people?.length === 0 && <small>还没找到这个昵称，可以请伙伴先注册。</small>}
            </div>
            <p className="micro-copy">
              请先征得伙伴同意。共同署名的纪念会出现在彼此的公开纪念册中。
            </p>
          </div>
          <FormError message={error} />
          <Button type="submit" disabled={busy || uploading} className="w-full">
            {busy ? '正在保存…' : item ? '保存修改' : '发布这条纪念'}
            <ArrowUpRight />
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
