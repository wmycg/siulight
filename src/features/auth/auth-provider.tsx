import { createContext, useContext, useState, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { User } from '@shared/types';
import { api, queryClient, send } from '@/lib/api';
import { AuthDialog } from './auth-dialog';
const AuthContext = createContext<{
  user: User | null;
  loading: boolean;
  openLogin: () => void;
  logout: () => Promise<void>;
}>({ user: null, loading: true, openLogin: () => {}, logout: async () => {} });
export function AuthProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const { data, isPending } = useQuery({
    queryKey: ['me'],
    queryFn: () => api<User | null>('/auth/me'),
    retry: false,
  });
  async function logout() {
    await send('/auth/logout', {});
    queryClient.setQueryData(['me'], null);
    await queryClient.invalidateQueries();
  }
  return (
    <AuthContext.Provider
      value={{ user: data || null, loading: isPending, openLogin: () => setOpen(true), logout }}
    >
      {children}
      <AuthDialog open={open} onOpenChange={setOpen} />
    </AuthContext.Provider>
  );
}
export const useAuth = () => useContext(AuthContext);
