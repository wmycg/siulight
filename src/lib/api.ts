import { QueryClient } from '@tanstack/react-query';
export const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: false } },
});
export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`/api${path}`, {
    ...options,
    credentials: 'same-origin',
    headers: {
      ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...options.headers,
    },
  });
  const data = await res.json().catch(() => ({ message: '服务连接中断，请稍后重试' }));
  if (!res.ok) throw new Error(data.message || '请求未成功，请重试');
  return data as T;
}
export const send = <T>(path: string, data: unknown, method = 'POST') =>
  api<T>(path, { method, body: JSON.stringify(data) });
