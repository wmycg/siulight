import { Sparkles, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';
export function Loading({ label = '正在翻开这一页…' }: { label?: string }) {
  return (
    <div role="status" className="state-panel">
      <span className="loading-spark">
        <Sparkles size={24} />
      </span>
      <p>{label}</p>
    </div>
  );
}
export function ErrorState({ error, retry }: { error: Error; retry?: () => void }) {
  return (
    <div role="alert" className="state-panel">
      <p>{error.message}</p>
      {retry && (
        <Button variant="outline" onClick={retry}>
          <RefreshCw />
          重新加载
        </Button>
      )}
    </div>
  );
}
export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="state-panel empty-state">
      <Sparkles size={28} />
      <h3>{title}</h3>
      {body && <p>{body}</p>}
      {action}
    </div>
  );
}
