import { useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowUpRight, Check, Sparkles, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { departments } from '@shared/content';
import { applicationSchema } from '@shared/validation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Field, Select, FormError } from '@/components/field';
import { Reveal } from '@/components/reveal';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { send } from '@/lib/api';
export function JoinPage() {
  const [params] = useSearchParams();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [receipt, setReceipt] = useState('');
  const [qr, setQr] = useState(false);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const parsed = applicationSchema.safeParse(Object.fromEntries(new FormData(e.currentTarget)));
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    setBusy(true);
    setError('');
    try {
      const result = await send<{ id: string }>('/applications', parsed.data);
      setReceipt(result.id);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="page-shell join-page">
      <Reveal className="page-intro">
        <span className="eyebrow">COME AS YOU ARE</span>
        <h1>
          故事的下一页，
          <br />
          想和<span className="serif-accent">你一起写。</span>
        </h1>
        <p>不需要「会什么」，只要你真的喜欢。</p>
      </Reveal>
      <div className="join-grid">
        <Reveal className="join-left">
          <div className="join-photo">
            <img src="/images/studio.webp" alt="等待新伙伴加入的创作桌" />
            <span>ROOM FOR ONE MORE DREAMER.</span>
          </div>
          <h2>你的热爱，我们接住了。</h2>
          <p>
            喜欢动画、漫画、游戏或影像的你，
            <br />
            欢迎来到微光。留下一点信息，让我们认识你。
          </p>
          <div className="join-promises">
            <span>
              <Check size={16} />
              常年开放，无需等到招新季
            </span>
            <span>
              <Check size={16} />
              新手友好，从零开始也没关系
            </span>
            <span>
              <Check size={16} />
              不同部门，一起探索你的兴趣
            </span>
          </div>
          <button onClick={() => setQr(true)} className="text-arrow">
            先来社群坐坐
            <ArrowUpRight size={17} />
          </button>
        </Reveal>
        <Reveal className="application-panel">
          {receipt ? (
            <div className="application-success" role="status">
              <div className="success-symbol">
                <Check size={28} />
              </div>
              <span className="eyebrow">NICE TO MEET YOU</span>
              <h2>
                申请已送达，
                <br />
                很高兴认识你！
              </h2>
              <p>
                我们会通过你填写的 QQ 联系你。
                <br />
                请保留这份回执，期待和你见面。
              </p>
              <div className="receipt">
                <small>你的申请编号</small>
                <code>{receipt}</code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    navigator.clipboard
                      .writeText(receipt)
                      .then(() => toast.success('回执已复制'))
                      .catch(() => toast.error('复制失败，请手动保存回执'))
                  }
                >
                  <Copy />
                  复制回执
                </Button>
              </div>
              <Button onClick={() => setQr(true)}>
                加入社群
                <ArrowUpRight />
              </Button>
            </div>
          ) : (
            <>
              <div className="application-heading">
                <span className="eyebrow">A NEW CHAPTER</span>
                <h2>加入微光</h2>
                <p>大约 2 分钟，让我们认识一下。</p>
                <Sparkles strokeWidth={1} />
              </div>
              <form onSubmit={submit} className="form-stack">
                <div className="form-grid">
                  <Field label="你的昵称">
                    <Input name="nickname" placeholder="怎么称呼你" maxLength={20} required />
                  </Field>
                  <Field label="真实姓名">
                    <Input
                      name="realName"
                      autoComplete="name"
                      placeholder="用于入社登记"
                      maxLength={30}
                      required
                    />
                  </Field>
                </div>
                <div className="form-grid">
                  <Field label="学号">
                    <Input
                      name="studentId"
                      placeholder="你的学号"
                      pattern="[a-zA-Z0-9]{4,25}"
                      maxLength={25}
                      required
                    />
                  </Field>
                  <Field label="QQ 号码">
                    <Input
                      name="qq"
                      inputMode="numeric"
                      placeholder="我们会在这里联系你"
                      pattern="[1-9][0-9]{4,14}"
                      maxLength={15}
                      required
                    />
                  </Field>
                </div>
                <Field label="意向部门">
                  <Select name="department" defaultValue={params.get('department') || ''} required>
                    <option value="" disabled>
                      选择最让你心动的部门
                    </option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="想对我们说的话（选填）">
                  <Textarea
                    name="note"
                    placeholder="喜欢的作品、想尝试的事情，或者打个招呼…"
                    maxLength={500}
                    rows={4}
                  />
                </Field>
                <label className="consent-label">
                  <input type="checkbox" required />
                  <span>
                    我同意社团管理员使用以上信息进行入社联系。真实姓名、学号和 QQ 不会公开展示。
                  </span>
                </label>
                <FormError message={error} />
                <Button size="lg" disabled={busy} type="submit" className="w-full">
                  {busy ? '正在送出申请…' : '递出我的入社申请'}
                  <ArrowUpRight />
                </Button>
              </form>
            </>
          )}
        </Reveal>
      </div>
      <Dialog open={qr} onOpenChange={setQr}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>来微光社群坐坐</DialogTitle>
            <DialogDescription>使用 QQ 扫描社团原有的招新海报二维码。</DialogDescription>
          </DialogHeader>
          <img className="qr-poster" src="/images/qq.jpg" alt="微光漫摄协会 QQ 群二维码海报" />
        </DialogContent>
      </Dialog>
    </div>
  );
}
