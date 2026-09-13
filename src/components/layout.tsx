import { useLayoutEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { ArrowUpRight, Menu, X, LogOut, Settings } from 'lucide-react';
import { Button } from './ui/button';
import { useAuth } from '@/features/auth/auth-provider';
import { Avatar } from './avatar';
import { toast } from 'sonner';
export const navItems = [
  { to: '/', label: '首页' },
  { to: '/about', label: '关于微光' },
  { to: '/departments', label: '我们的部门' },
  { to: '/events', label: '活动日历' },
  { to: '/milestones', label: '微光纪念册' },
];
export function Brand() {
  return (
    <Link className="brand" to="/" aria-label="微光漫摄首页">
      <img
        className="brand-logo"
        src="/images/club-original.png"
        alt=""
        width="1920"
        height="1920"
      />
      <span>
        <b>微光漫摄</b>
        <small>SIULIGHT CLUB</small>
      </span>
    </Link>
  );
}
export function Layout() {
  const { user, openLogin, logout } = useAuth();
  const [menu, setMenu] = useState(false);
  const location = useLocation();
  useLayoutEffect(() => {
    setMenu(false);
    window.scrollTo({ top: 0, behavior: 'instant' });
    const label = navItems.find((i) => i.to === location.pathname)?.label || '微光漫摄';
    document.title = `${label} · 微光漫摄`;
  }, [location.pathname]);
  return (
    <>
      <a href="#main" className="skip-link">
        跳转到内容
      </a>
      <header className="site-header">
        <div className="header-inner">
          <Brand />
          <nav aria-label="主导航" className="desktop-nav">
            {navItems.map((i) => (
              <NavLink key={i.to} to={i.to} end={i.to === '/'}>
                {i.label}
              </NavLink>
            ))}
          </nav>
          <div className="header-actions">
            {user ? (
              <>
                <Link
                  className="my-account"
                  to={`/members/${user.id}`}
                  aria-label={`${user.name}的纪念册`}
                >
                  <Avatar member={user} link={false} />
                  <span>{user.name}</span>
                </Link>
                {user.role !== 'member' && (
                  <Button variant="ghost" size="icon" asChild>
                    <Link to="/admin" aria-label="管理后台">
                      <Settings />
                    </Link>
                  </Button>
                )}
                <Button
                  className="desktop-logout"
                  variant="ghost"
                  size="icon"
                  onClick={() => logout().catch((e) => toast.error(e.message))}
                  aria-label="退出登录"
                >
                  <LogOut />
                </Button>
              </>
            ) : (
              <button className="login-link" onClick={openLogin}>
                登录
              </button>
            )}
            <Button asChild size="sm" className="header-join">
              <Link to="/join">
                加入我们
                <ArrowUpRight />
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="mobile-menu-button"
              aria-label={menu ? '关闭导航' : '打开导航'}
              aria-expanded={menu}
              aria-controls="mobile-navigation"
              onClick={() => setMenu(!menu)}
            >
              {menu ? <X /> : <Menu />}
            </Button>
          </div>
        </div>
        {menu && (
          <nav id="mobile-navigation" className="mobile-nav" aria-label="手机导航">
            {navItems.map((i, n) => (
              <NavLink key={i.to} to={i.to} end={i.to === '/'}>
                <span>
                  <small>0{n + 1}</small>
                  {i.label}
                </span>
                <ArrowUpRight size={18} />
              </NavLink>
            ))}
            <Link to="/join">
              加入我们
              <ArrowUpRight size={18} />
            </Link>
            {user && (
              <button
                onClick={() => {
                  logout().catch((e) => toast.error(e.message));
                  setMenu(false);
                }}
              >
                退出登录
                <LogOut size={16} />
              </button>
            )}
          </nav>
        )}
      </header>
      <main id="main" tabIndex={-1}>
        <Outlet />
      </main>
      <footer className="site-footer">
        <div className="footer-top">
          <Brand />
          <p>
            因为热爱，所以相遇。
            <br />
            <span>Every little light makes a story.</span>
          </p>
          <Link to="/join" className="footer-cta">
            下一帧，和我们一起
            <ArrowUpRight size={23} />
          </Link>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} 微光漫摄协会</span>
          <span className="footer-note">ANIMATION · COMICS · GAMES · PHOTOGRAPHY</span>
          <Link to="/admin">
            社团管理
            <ArrowUpRight size={12} />
          </Link>
        </div>
      </footer>
    </>
  );
}
