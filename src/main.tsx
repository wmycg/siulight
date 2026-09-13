import React, { Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { MotionConfig } from 'motion/react';
import { Toaster } from 'sonner';
import { queryClient } from '@/lib/api';
import { AuthProvider } from '@/features/auth/auth-provider';
import { Layout } from '@/components/layout';
import { HomePage } from '@/pages/home';
import { Loading, EmptyState } from '@/components/states';
import { Button } from '@/components/ui/button';
import './styles.css';
const EventsPage = lazy(() => import('@/pages/events').then((m) => ({ default: m.EventsPage })));
const MilestonesPage = lazy(() =>
  import('@/pages/milestones').then((m) => ({ default: m.MilestonesPage })),
);
const AboutPage = lazy(() => import('@/pages/about').then((m) => ({ default: m.AboutPage })));
const DepartmentsPage = lazy(() =>
  import('@/pages/departments').then((m) => ({ default: m.DepartmentsPage })),
);
const JoinPage = lazy(() => import('@/pages/join').then((m) => ({ default: m.JoinPage })));
const AdminPage = lazy(() => import('@/pages/admin').then((m) => ({ default: m.AdminPage })));
createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <MotionConfig reducedMotion="user">
        <BrowserRouter>
          <AuthProvider>
            <Suspense fallback={<Loading />}>
              <Routes>
                <Route element={<Layout />}>
                  <Route index element={<HomePage />} />
                  <Route path="about" element={<AboutPage />} />
                  <Route path="departments" element={<DepartmentsPage />} />
                  <Route path="events" element={<EventsPage />} />
                  <Route path="milestones" element={<MilestonesPage />} />
                  <Route path="members/:id" element={<MilestonesPage />} />
                  <Route path="join" element={<JoinPage />} />
                  <Route path="admin" element={<AdminPage />} />
                  <Route
                    path="*"
                    element={
                      <div className="page-shell">
                        <EmptyState
                          title="这一页，好像走丢了"
                          body="故事还在，回到首页继续探索吧。"
                          action={
                            <Button asChild>
                              <Link to="/">回到首页</Link>
                            </Button>
                          }
                        />
                      </div>
                    }
                  />
                </Route>
              </Routes>
            </Suspense>
            <Toaster position="bottom-center" richColors closeButton />
          </AuthProvider>
        </BrowserRouter>
      </MotionConfig>
    </QueryClientProvider>
  </React.StrictMode>,
);
