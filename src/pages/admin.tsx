import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Shield, ArrowUpRight } from 'lucide-react';
import { toast } from 'sonner';
import type { Application, AuditLog, ClubEvent, Page, User } from '@shared/types';
import { departments } from '@shared/content';
import { useAuth } from '@/features/auth/auth-provider';
import { api, send, queryClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/field';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ErrorState, Loading, EmptyState } from '@/components/states';
import { EventEditor } from '@/features/admin/event-editor';
import { UserEditor } from '@/features/admin/user-editor';
import { PasswordDialog } from '@/features/auth/password-dialog';
export function AdminPage() {
  const { user, loading, openLogin } = useAuth();
  const allowed = !!user && user.role !== 'member';
  const [tab, setTab] = useState('events');
  const [editor, setEditor] = useState<{ item?: ClubEvent } | null>(null);
  const [newUser, setNewUser] = useState(false);
  const [password, setPassword] = useState(false);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [applicationPage, setApplicationPage] = useState(1);
  const [logPage, setLogPage] = useState(1);
  const [userPage, setUserPage] = useState(1);
  const [confirm, setConfirm] = useState<{ title: string; path: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const events = useQuery({
    queryKey: ['events'],
    queryFn: ({ signal }) => api<ClubEvent[]>('/events', { signal }),
    enabled: allowed,
  });
  const applications = useQuery({
    queryKey: ['applications', applicationPage, search, status],
    queryFn: ({ signal }) =>
      api<Page<Application>>(
        `/admin/applications?page=${applicationPage}&q=${encodeURIComponent(search)}&status=${status}`,
        { signal },
      ),
    enabled: allowed && tab === 'applications',
  });
  const logs = useQuery({
    queryKey: ['logs', logPage],
    queryFn: ({ signal }) => api<Page<AuditLog>>(`/admin/logs?page=${logPage}`, { signal }),
    enabled: allowed && tab === 'logs',
  });
  const users = useQuery({
    queryKey: ['admin-users', userPage],
    queryFn: ({ signal }) => api<Page<User>>(`/admin/users?page=${userPage}`, { signal }),
    enabled: user?.role === 'superadmin' && tab === 'users',
  });
  const applicationItems = applications.data?.items || [];
  async function mutate(path: string, data?: unknown, method = 'PATCH') {
    setBusy(true);
    try {
      await send(path, data, method);
      const keys = path.startsWith('/admin/applications')
        ? [['applications']]
        : path.startsWith('/admin/events')
          ? [['events'], ['logs'], ['stats']]
          : [['admin-users'], ['logs']];
      await Promise.all(keys.map((queryKey) => queryClient.invalidateQueries({ queryKey })));
      toast.success('已保存');
      setConfirm(null);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <Loading />;
  if (!allowed)
    return (
      <div className="page-shell">
        <EmptyState
          title={user ? '这里是社团管理员的工作台' : '登录社团管理后台'}
          body={
            user
              ? '你的账号没有管理权限，可以回纪念册继续分享故事。'
              : '请使用管理员账号登录后继续。'
          }
          action={
            user ? (
              <Button asChild>
                <Link to="/milestones">回到纪念册</Link>
              </Button>
            ) : (
              <Button onClick={openLogin}>管理员登录</Button>
            )
          }
        />
      </div>
    );
  return (
    <div className="page-shell admin-page">
      <div className="admin-heading">
        <div>
          <span className="eyebrow">SIULIGHT WORKSPACE</span>
          <h1>
            社团工作台<span className="heading-dot">.</span>
          </h1>
          <p>你好，{user.name}。这里是微光的幕后。</p>
        </div>
        <Button variant="outline" onClick={() => setPassword(true)}>
          <Shield />
          修改密码
        </Button>
      </div>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="admin-tabs">
          <TabsTrigger value="events">活动管理</TabsTrigger>
          <TabsTrigger value="applications">入社申请</TabsTrigger>
          <TabsTrigger value="logs">操作日志</TabsTrigger>
          {user.role === 'superadmin' && <TabsTrigger value="users">账号管理</TabsTrigger>}
        </TabsList>
        <TabsContent value="events">
          <div className="admin-toolbar">
            <h2>
              活动列表 <small>{events.data?.length || 0}</small>
            </h2>
            <Button onClick={() => setEditor({})}>
              <Plus />
              发布活动
            </Button>
          </div>
          {events.isPending ? (
            <Loading />
          ) : events.error ? (
            <ErrorState error={events.error} retry={() => events.refetch()} />
          ) : !events.data?.length ? (
            <EmptyState title="还没有活动" />
          ) : (
            <div className="admin-event-list">
              {events.data.map((e) => (
                <div key={e.id}>
                  <div className="admin-event-image">{e.image && <img src={e.image} alt="" />}</div>
                  <div className="admin-event-copy">
                    <h3>{e.title}</h3>
                    <p>
                      {e.date} · {e.place}
                    </p>
                    <small>
                      {e.attendees} / {e.capacity} 人报名
                    </small>
                  </div>
                  <div className="admin-row-actions">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`编辑${e.title}`}
                      onClick={() => setEditor({ item: e })}
                    >
                      <Pencil />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`删除${e.title}`}
                      onClick={() =>
                        setConfirm({
                          title: `删除活动「${e.title}」？关联报名也会移除。`,
                          path: `/admin/events/${e.id}`,
                        })
                      }
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="admin-hint">
            社团里程碑可在纪念册中选择「社团官方纪念」发布。
            <Link to="/milestones">
              前往纪念册
              <ArrowUpRight size={15} />
            </Link>
          </div>
        </TabsContent>
        <TabsContent value="applications">
          <div className="admin-toolbar">
            <h2>
              入社申请 <small>{applications.data?.total || 0}</small>
            </h2>
            <div className="admin-filters">
              <Input
                placeholder="搜索姓名、学号或 QQ"
                aria-label="搜索入社申请"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setApplicationPage(1);
                }}
              />
              <Select
                aria-label="筛选申请状态"
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setApplicationPage(1);
                }}
              >
                <option value="all">全部状态</option>
                <option value="pending">待联系</option>
                <option value="contacted">已联系</option>
                <option value="accepted">已入社</option>
              </Select>
            </div>
          </div>
          {applications.isPending ? (
            <Loading />
          ) : applications.error ? (
            <ErrorState error={applications.error} retry={() => applications.refetch()} />
          ) : !applicationItems?.length ? (
            <EmptyState title="没有符合条件的申请" />
          ) : (
            <div className="application-list">
              {applicationItems.map((a) => (
                <article key={a.id}>
                  <div className="application-item-heading">
                    <h3>
                      {a.nickname}
                      <span>{a.realName}</span>
                    </h3>
                    <Select
                      aria-label={`更新${a.nickname}的申请状态`}
                      value={a.status}
                      disabled={busy}
                      onChange={(e) =>
                        mutate(`/admin/applications/${a.id}`, { status: e.target.value })
                      }
                    >
                      <option value="pending">待联系</option>
                      <option value="contacted">已联系</option>
                      <option value="accepted">已入社</option>
                    </Select>
                  </div>
                  <dl>
                    <div>
                      <dt>学号</dt>
                      <dd>{a.studentId}</dd>
                    </div>
                    <div>
                      <dt>QQ</dt>
                      <dd>{a.qq}</dd>
                    </div>
                    <div>
                      <dt>意向部门</dt>
                      <dd>{departments.find((d) => d.id === a.department)?.name}</dd>
                    </div>
                    <div>
                      <dt>提交时间</dt>
                      <dd>{a.createdAt}</dd>
                    </div>
                  </dl>
                  {a.note && <p>{a.note}</p>}
                  <small className="application-id">回执 {a.id}</small>
                </article>
              ))}
            </div>
          )}
          <AdminPager
            page={applications.data?.page || 1}
            pages={applications.data?.pages || 1}
            onChange={setApplicationPage}
          />
        </TabsContent>
        <TabsContent value="logs">
          <div className="admin-toolbar">
            <h2>最近操作</h2>
            <span className="micro-copy">按时间分页</span>
          </div>
          {logs.isPending ? (
            <Loading />
          ) : logs.error ? (
            <ErrorState error={logs.error} retry={() => logs.refetch()} />
          ) : !logs.data?.items.length ? (
            <EmptyState title="还没有操作日志" />
          ) : (
            <div className="log-list">
              {logs.data.items.map((l) => (
                <div key={l.id}>
                  <time>{l.createdAt}</time>
                  <span>{l.actor}</span>
                  <p>{l.action}</p>
                </div>
              ))}
            </div>
          )}
          <AdminPager
            page={logs.data?.page || 1}
            pages={logs.data?.pages || 1}
            onChange={setLogPage}
          />
        </TabsContent>
        {user.role === 'superadmin' && (
          <TabsContent value="users">
            <div className="admin-toolbar">
              <h2>账号与权限</h2>
              <Button onClick={() => setNewUser(true)}>
                <Plus />
                新增管理员
              </Button>
            </div>
            {users.isPending ? (
              <Loading />
            ) : users.error ? (
              <ErrorState error={users.error} retry={() => users.refetch()} />
            ) : (
              <div className="user-list">
                {users.data?.items.map((u) => (
                  <div key={u.id}>
                    <div>
                      <h3>{u.name}</h3>
                      <small>{u.email}</small>
                    </div>
                    <div className="user-actions">
                      {u.role === 'superadmin' ? (
                        <span className="role-label">超级管理员</span>
                      ) : (
                        <>
                          <Select
                            aria-label={`${u.name}的权限`}
                            disabled={busy}
                            value={u.role}
                            onChange={(e) =>
                              mutate(`/admin/users/${u.id}`, { role: e.target.value })
                            }
                          >
                            <option value="member">成员</option>
                            <option value="admin">管理员</option>
                          </Select>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`删除账号${u.name}`}
                            onClick={() =>
                              setConfirm({
                                title: `删除账号「${u.name}」？此操作无法撤销。`,
                                path: `/admin/users/${u.id}`,
                              })
                            }
                          >
                            <Trash2 />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <AdminPager
              page={users.data?.page || 1}
              pages={users.data?.pages || 1}
              onChange={setUserPage}
            />
          </TabsContent>
        )}
      </Tabs>
      {editor && <EventEditor item={editor.item} onClose={() => setEditor(null)} />}{' '}
      {newUser && <UserEditor onClose={() => setNewUser(false)} />}
      <PasswordDialog open={password} onClose={() => setPassword(false)} />
      <Dialog open={!!confirm} onOpenChange={(v) => !v && setConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>{confirm?.title}</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setConfirm(null)}>
              取消
            </Button>
            <Button
              variant="destructive"
              disabled={busy}
              onClick={() => confirm && mutate(confirm.path, undefined, 'DELETE')}
            >
              {busy ? '正在删除…' : '确认删除'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AdminPager({
  page,
  pages,
  onChange,
}: {
  page: number;
  pages: number;
  onChange: (page: number) => void;
}) {
  if (pages <= 1) return null;
  return (
    <div className="admin-pager" aria-label="分页">
      <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        上一页
      </Button>
      <span>
        {page} / {pages}
      </span>
      <Button
        variant="outline"
        size="sm"
        disabled={page >= pages}
        onClick={() => onChange(page + 1)}
      >
        下一页
      </Button>
    </div>
  );
}
