import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, Bell } from 'lucide-react';
import useAuthStore from '../Store/authStore';
import Avatar from './Avatar';

const timeAgo = (date) => {
  const mins = Math.floor((Date.now() - new Date(date)) / 60000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return `${Math.floor(days / 7)}w`;
};

// Sentence for each notification type. `project` is a link to the project.
const describe = (n, project) => {
  const who = <span className="font-semibold text-fg">{n.actor?.username || 'Someone'}</span>;
  switch (n.type) {
    case 'invite': return <>{who} invited you to join {project}</>;
    case 'join_request': return <>{who} wants to join {project}</>;
    case 'request_accepted': return <>{who} accepted your request to join {project}</>;
    case 'request_declined': return <>{who} declined your request to join {project}</>;
    case 'invite_accepted': return <>{who} accepted your invite and joined {project}</>;
    case 'invite_declined': return <>{who} declined your invite to {project}</>;
    default: return <>{who} · {project}</>;
  }
};

const NotificationItem = ({ n, isNew, onNavigate }) => {
  const { respondToInvite, respondToJoinRequest } = useAuthStore();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const status = n.joinRequest?.status;
  const actionable = (n.type === 'invite' || n.type === 'join_request') && status === 'pending';
  const joinedTeam = n.type === 'request_accepted' || (n.type === 'invite' && status === 'accepted');

  const act = async (accept) => {
    setBusy(true);
    setError('');
    const res = n.type === 'invite'
      ? await respondToInvite(n.joinRequest._id, accept)
      : await respondToJoinRequest(n.idea._id, n.joinRequest._id, accept);
    setBusy(false);
    if (!res.ok) setError(res.error);
    else if (accept && n.type === 'invite') {
      onNavigate();
      navigate(`/team/${n.idea._id}`);
    }
  };

  const project = (
    <Link to={`/project/${n.idea._id}`} onClick={onNavigate} className="font-semibold text-fg hover:underline">
      {n.idea.title}
    </Link>
  );

  return (
    <li className={`flex gap-3 px-5 py-3 ${isNew ? 'bg-accent-soft' : ''}`}>
      <Link to={`/${n.actor?.username}`} onClick={onNavigate} className="shrink-0">
        <Avatar src={n.actor?.avatar} name={n.actor?.name} size="md" />
      </Link>
      <div className="min-w-0 flex-1">
        <p className="text-sm leading-snug text-muted">
          {describe(n, project)} <span className="whitespace-nowrap text-subtle">· {timeAgo(n.createdAt)}</span>
        </p>

        {actionable && (
          <div className="mt-2 flex gap-2">
            <button onClick={() => act(true)} disabled={busy} className="btn btn-primary btn-sm">
              {n.type === 'invite' ? 'Join team' : 'Accept'}
            </button>
            <button onClick={() => act(false)} disabled={busy} className="btn btn-secondary btn-sm">
              Decline
            </button>
          </div>
        )}
        {!actionable && (n.type === 'invite' || n.type === 'join_request') && status && (
          <p className="mt-1 text-xs text-subtle">{status === 'accepted' ? 'Accepted' : 'Declined'}</p>
        )}
        {joinedTeam && (
          <Link to={`/team/${n.idea._id}`} onClick={onNavigate} className="mt-1 inline-block text-xs font-semibold text-link hover:underline">
            Open team
          </Link>
        )}
        {error && <p className="mt-1.5 text-xs text-danger">{error}</p>}
      </div>
    </li>
  );
};

const NotificationsPanel = ({ open, onClose }) => {
  const { notifications, fetchNotifications, markNotificationsRead } = useAuthStore();
  // Snapshot what was unread when the panel opened, so those stay highlighted
  // while you look even though opening marks them read.
  const [newIds, setNewIds] = useState(new Set());
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const unread = useAuthStore.getState().notifications.filter((n) => !n.read).map((n) => n._id);
    setNewIds(new Set(unread));
    markNotificationsRead();
    fetchNotifications();
    panelRef.current?.focus();

    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose, fetchNotifications, markNotificationsRead]);

  if (!open) return null;

  return (
    <>
      {/* Click-away layer */}
      <div className="fixed inset-0 z-40 bg-black/40 md:bg-transparent" onClick={onClose} />

      <section
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-label="Notifications"
        className="fixed inset-x-0 bottom-14 top-14 z-50 flex flex-col border-line bg-bg outline-none md:inset-y-0 md:left-[72px] md:right-auto md:w-[400px] md:border-r md:shadow-2xl md:shadow-black/50 lg:left-[244px]"
      >
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-line px-5">
          <h2 className="text-lg font-semibold text-fg">Notifications</h2>
          <button onClick={onClose} className="icon-btn" aria-label="Close notifications">
            <X className="h-5 w-5" strokeWidth={1.8} />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="empty">
              <span className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-fg">
                <Bell className="h-7 w-7" strokeWidth={1.5} />
              </span>
              <h3 className="empty-title">Nothing yet</h3>
              <p className="empty-text">Invites, join requests and their answers will show up here.</p>
            </div>
          ) : (
            <ul className="py-2">
              {notifications.map((n) => (
                <NotificationItem key={n._id} n={n} isNew={newIds.has(n._id)} onNavigate={onClose} />
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  );
};

export default NotificationsPanel;
