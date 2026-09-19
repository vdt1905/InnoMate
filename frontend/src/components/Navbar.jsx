// src/components/Navbar.jsx
import React, { useCallback, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Compass, Users, MessageCircle, PlusSquare, LogOut, Bell } from 'lucide-react';
import useAuthStore from '../Store/authStore';
import Avatar from './Avatar';
import NotificationsPanel from './NotificationsPanel';

const NAV_ITEMS = [
  { path: '/home', label: 'Home', icon: Home },
  { path: '/search-peers', label: 'Search', icon: Search },
  { path: '/allideas', label: 'Explore', icon: Compass },
  { path: '/myteams', label: 'Teams', icon: Users },
  { path: '/chat', label: 'Messages', icon: MessageCircle },
  { path: '/newproject', label: 'Create', icon: PlusSquare },
];

// Phones get a bottom tab bar, so it holds the destinations people switch
// between most; Search moves to the top bar.
const MOBILE_TABS = ['/home', '/allideas', '/newproject', '/myteams', '/chat'];

// A section is "active" for its nested pages too, e.g. /team/:id under Teams.
const isActive = (pathname, path) => {
  if (pathname === path) return true;
  const isTeamChat = /^\/team\/[^/]+\/chat$/.test(pathname);
  if (path === '/chat') return isTeamChat || pathname.startsWith('/chat/');
  if (path === '/myteams') return pathname.startsWith('/team/') && !isTeamChat;
  if (path === '/allideas') return pathname.startsWith('/project/');
  return false;
};

const UnreadDot = () => (
  <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-bg bg-link" aria-label="Unread messages" />
);

const CountBadge = ({ count }) =>
  count > 0 ? (
    <span className="absolute -right-2 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-bg bg-danger px-1 text-[10px] font-bold leading-none text-white">
      {count > 9 ? '9+' : count}
    </span>
  ) : null;

const Wordmark = ({ className = '' }) => (
  <span className={`text-xl font-semibold tracking-tight text-fg ${className}`}>InnoMate</span>
);

const Logomark = () => (
  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-fg text-base font-bold text-bg">I</span>
);

const Navbar = () => {
  const { logout, user, conversations, unreadNotifications } = useAuthStore();
  const hasUnread = conversations.some((c) => c.unread);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  // Stable, because the panel's open effect depends on it.
  const closeNotifications = useCallback(() => setNotificationsOpen(false), []);
  const { pathname } = useLocation();
  const profilePath = `/${user?.username}`;
  const onProfile = pathname === profilePath;

  return (
    <>
      {/* Tablet + desktop: icon rail at md, full sidebar at lg */}
      <aside className="hidden h-screen w-[72px] shrink-0 flex-col border-r border-line bg-bg px-3 py-6 md:flex lg:w-[244px]">
        <Link to="/home" className="mb-8 flex h-10 items-center px-2">
          <span className="lg:hidden"><Logomark /></span>
          <Wordmark className="hidden lg:inline" />
        </Link>

        <nav className="flex flex-1 flex-col gap-1">
          {NAV_ITEMS.map(({ path, label, icon }) => {
            const Icon = icon;
            const active = isActive(pathname, path);
            return (
              <Link
                key={path}
                to={path}
                title={label}
                className={`group flex items-center gap-4 rounded-lg p-3 transition-colors hover:bg-surface-2 ${active ? 'font-semibold text-fg' : 'text-fg'}`}
              >
                <span className="relative shrink-0">
                  <Icon
                    className="h-6 w-6 transition-transform group-hover:scale-105"
                    strokeWidth={active ? 2.6 : 1.8}
                  />
                  {path === '/chat' && hasUnread && <UnreadDot />}
                </span>
                <span className="hidden text-[15px] lg:inline">{label}</span>
              </Link>
            );
          })}

          <button
            onClick={() => setNotificationsOpen((v) => !v)}
            title="Notifications"
            className={`group flex items-center gap-4 rounded-lg p-3 text-left transition-colors hover:bg-surface-2 ${notificationsOpen ? 'font-semibold' : ''}`}
          >
            <span className="relative shrink-0">
              <Bell className="h-6 w-6 transition-transform group-hover:scale-105" strokeWidth={notificationsOpen ? 2.6 : 1.8} />
              <CountBadge count={unreadNotifications} />
            </span>
            <span className="hidden text-[15px] lg:inline">Notifications</span>
          </button>

          <Link
            to={profilePath}
            title="Profile"
            className={`group flex items-center gap-4 rounded-lg p-3 transition-colors hover:bg-surface-2 ${onProfile ? 'font-semibold' : ''}`}
          >
            <Avatar
              src={user?.avatar}
              name={user?.name}
              size="xs"
              className={onProfile ? 'ring-2 ring-fg ring-offset-2 ring-offset-bg' : ''}
            />
            <span className="hidden text-[15px] lg:inline">Profile</span>
          </Link>
        </nav>

        <button
          onClick={logout}
          title="Log out"
          className="flex items-center gap-4 rounded-lg p-3 text-fg transition-colors hover:bg-surface-2"
        >
          <LogOut className="h-6 w-6 shrink-0" strokeWidth={1.8} />
          <span className="hidden text-[15px] lg:inline">Log out</span>
        </button>
      </aside>

      {/* Phone: top bar */}
      <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-line bg-bg px-4 md:hidden">
        <Link to="/home"><Wordmark /></Link>
        <div className="flex items-center gap-1">
          <button onClick={() => setNotificationsOpen((v) => !v)} className="icon-btn relative" title="Notifications">
            <Bell className="h-6 w-6" strokeWidth={notificationsOpen ? 2.6 : 1.8} />
            <CountBadge count={unreadNotifications} />
          </button>
          <Link to="/search-peers" className="icon-btn" title="Search">
            <Search className="h-6 w-6" strokeWidth={isActive(pathname, '/search-peers') ? 2.6 : 1.8} />
          </Link>
          <button onClick={logout} className="icon-btn" title="Log out">
            <LogOut className="h-6 w-6" strokeWidth={1.8} />
          </button>
        </div>
      </header>

      {/* Phone: bottom tab bar */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex h-14 items-center justify-around border-t border-line bg-bg md:hidden">
        {NAV_ITEMS.filter((item) => MOBILE_TABS.includes(item.path)).map(({ path, label, icon }) => {
          const Icon = icon;
          return (
            <Link key={path} to={path} title={label} className="icon-btn relative p-2">
              <Icon className="h-6 w-6" strokeWidth={isActive(pathname, path) ? 2.6 : 1.8} />
              {path === '/chat' && hasUnread && <UnreadDot />}
            </Link>
          );
        })}
        <Link to={profilePath} title="Profile" className="p-2">
          <Avatar
            src={user?.avatar}
            name={user?.name}
            size="xs"
            className={onProfile ? 'ring-2 ring-fg ring-offset-2 ring-offset-bg' : ''}
          />
        </Link>
      </nav>

      <NotificationsPanel open={notificationsOpen} onClose={closeNotifications} />
    </>
  );
};

export default Navbar;
