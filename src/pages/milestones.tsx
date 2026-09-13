import { useState, useEffect } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, ArrowLeft, ArrowRight, BookOpen } from 'lucide-react';
import type { Member, Milestone, MemoryChapter } from '@shared/types';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FilterTabs, FilterTabsList, FilterTabsTrigger } from '@/components/filter-tabs';
import { Select } from '@/components/field';
import { Avatar } from '@/components/avatar';
import { Reveal } from '@/components/reveal';
import { MemoryTimeline } from '@/features/milestones/memory-timeline';
import { Loading, ErrorState, EmptyState } from '@/components/states';
import { MilestoneDialog } from '@/features/milestones/milestone-dialog';
import { MilestoneEditor } from '@/features/milestones/milestone-editor';
import { useAuth } from '@/features/auth/auth-provider';
import { PasswordDialog } from '@/features/auth/password-dialog';
export function MilestonesPage() {
  const { id } = useParams();
  const { user, openLogin } = useAuth();
  const [params, setParams] = useSearchParams();
  const [draft, setDraft] = useState(params.get('q') || '');
  const [selected, setSelected] = useState<Milestone | null>(null);
  const [editor, setEditor] = useState<{ item?: Milestone } | null>(null);
  const [password, setPassword] = useState(false);
  const tab = params.get('kind') || 'all',
    year = params.get('year') || '';
  const author = id || (tab === 'mine' ? user?.id : undefined);
  const query = new URLSearchParams({
    ...(tab === 'club' || tab === 'personal' ? { kind: tab } : {}),
    ...(author ? { author } : {}),
    q: params.get('q') || '',
    year,
  });
  const memories = useQuery({
    queryKey: ['milestones', 'chapters', query.toString()],
    queryFn: () => api<MemoryChapter[]>(`/milestones/chapters?${query}`),
    enabled: tab !== 'mine' || !!user,
  });
  const years = useQuery({
    queryKey: ['milestones', 'years'],
    queryFn: () => api<{ year: number }[]>('/milestones/years'),
  });
  const member = useQuery({
    queryKey: ['member', id],
    queryFn: () => api<Member>(`/members/${id}`),
    enabled: !!id,
  });
  useEffect(() => {
    setDraft(params.get('q') || '');
  }, [params]);
  const change = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    next.set(key, value);
    if (key !== 'page') next.delete('page');
    setParams(next, { replace: true });
  };
  function write() {
    if (!user) {
      openLogin();
      return;
    }
    setEditor({});
  }
  return (
    <div className={`page-shell milestones-page ${id ? 'personal-page' : ''}`}>
      {id ? (
        <div className="profile-heading">
          <Link to="/milestones" className="text-arrow">
            <ArrowLeft size={15} />
            回到微光纪念册
          </Link>
          {member.isPending ? (
            <Loading />
          ) : member.error ? (
            <ErrorState error={member.error} />
          ) : (
            member.data && (
              <Reveal className="profile-person">
                <Avatar member={member.data} link={false} className="profile-avatar" />
                <div>
                  <span className="eyebrow">A PERSONAL CHAPTER</span>
                  <h1>
                    {member.data.name}的纪念册<span className="heading-dot">.</span>
                  </h1>
                  <p>{member.data.bio || '小小的进步，喜欢的日常。每一步都算数。'}</p>
                </div>
                {user?.id === id && (
                  <div className="profile-actions">
                    <Button onClick={write}>
                      <Plus />
                      写一条纪念
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setPassword(true)}>
                      修改密码
                    </Button>
                  </div>
                )}
              </Reveal>
            )
          )}
        </div>
      ) : (
        <Reveal className="page-intro memory-intro">
          <span className="eyebrow">THE SIULIGHT MEMORY BOOK</span>
          <div className="intro-title-row">
            <div>
              <h1>
                微光纪念册<span className="heading-dot">.</span>
              </h1>
              <p className="intro-subhead">
                我们一起走过的，<span className="serif-accent">闪光日子。</span>
              </p>
            </div>
            <div className="album-cover-art" aria-hidden="true">
              <div className="album-cover-photo">
                <img src="/images/club-days.webp" alt="" />
                <span>一起，把日常写成故事。</span>
              </div>
              <img className="album-cover-seal" src="/images/club-original.png" alt="" />
            </div>
          </div>
          <div className="intro-bottom">
            <p>
              社团的每一次成长，每个人的小小里程碑。
              <br />
              不必足够盛大，值得你记住就好。
            </p>
            <Button size="lg" onClick={write}>
              <Plus />
              写下我的里程碑
            </Button>
          </div>
        </Reveal>
      )}
      <div className="memory-filter">
        <FilterTabs
          value={id ? 'all' : tab}
          onValueChange={(v) => {
            if (v === 'mine' && !user) {
              openLogin();
              return;
            }
            change('kind', v);
          }}
        >
          <FilterTabsList>
            <FilterTabsTrigger value="all">{id ? '全部纪念' : '所有微光'}</FilterTabsTrigger>
            {!id && (
              <>
                <FilterTabsTrigger value="club">社团足迹</FilterTabsTrigger>
                <FilterTabsTrigger value="personal">个人时刻</FilterTabsTrigger>
                <FilterTabsTrigger value="mine">我的纪念</FilterTabsTrigger>
              </>
            )}
          </FilterTabsList>
        </FilterTabs>
        <div className="memory-search">
          <form
            className="search-input"
            onSubmit={(e) => {
              e.preventDefault();
              change('q', draft);
            }}
          >
            <Search size={16} />
            <Input
              aria-label="搜索纪念"
              value={draft}
              onChange={(e) => {
                setDraft(e.target.value);
                if (!e.target.value) change('q', '');
              }}
              placeholder="搜索瞬间或作者…"
            />
            <button type="submit" aria-label="开始搜索">
              <ArrowRight size={16} />
            </button>
          </form>
          <Select
            aria-label="按年份筛选"
            value={year}
            onChange={(e) => change('year', e.target.value)}
          >
            <option value="">所有年份</option>
            {years.data?.map((y) => (
              <option key={y.year} value={y.year}>
                {y.year} 年
              </option>
            ))}
          </Select>
        </div>
      </div>
      {tab === 'mine' && !user ? (
        <EmptyState
          title="登录，翻开自己的那一页"
          action={<Button onClick={openLogin}>登录</Button>}
        />
      ) : memories.isPending ? (
        <Loading />
      ) : memories.error ? (
        <ErrorState error={memories.error} retry={() => memories.refetch()} />
      ) : memories.data?.length ? (
        <MemoryTimeline
          key={query.toString()}
          chapters={memories.data}
          filters={query.toString()}
          onOpen={setSelected}
        />
      ) : (
        <EmptyState
          title={
            params.get('q') || year
              ? '还没有找到这个瞬间'
              : id
                ? '这一页，等着新的故事'
                : '第一束微光，从你开始'
          }
          body={
            params.get('q') || year
              ? '试试其他关键词或年份。'
              : '第一次创作、一个新朋友、一场难忘的活动，都值得记上一笔。'
          }
          action={
            <Button onClick={write}>
              <Plus />
              写一条纪念
            </Button>
          }
        />
      )}{' '}
      <div className="album-bottom">
        <BookOpen strokeWidth={1} />
        <p>故事还长，我们慢慢写。</p>
        <small>TO BE CONTINUED…</small>
      </div>
      <MilestoneDialog
        item={selected}
        onClose={() => setSelected(null)}
        onEdit={(item) => {
          setSelected(null);
          setEditor({ item });
        }}
      />
      {editor && (
        <MilestoneEditor
          key={editor.item?.id || 'new'}
          open
          item={editor.item}
          onClose={() => setEditor(null)}
        />
      )}
      <PasswordDialog open={password} onClose={() => setPassword(false)} />
    </div>
  );
}
