import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MessageCircle, ChevronRight, PenSquare } from 'lucide-react';
import useAuthStore from '../Store/authStore';
import { getSocket } from '../api/socket';
import Avatar from '../components/Avatar';

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

const EmptyState = ({ title, text, action, onAction }) => (
  <div className="empty">
    <span className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-fg">
      <MessageCircle className="h-8 w-8 -scale-x-100" strokeWidth={1.5} />
    </span>
    <h3 className="empty-title">{title}</h3>
    <p className="empty-text">{text}</p>
    <button onClick={onAction} className="btn btn-primary mt-5">{action}</button>
  </div>
);

const rowClass =
  'group -mx-2 flex w-[calc(100%+1rem)] items-center gap-3 rounded-lg px-2 py-3 text-left transition-colors hover:bg-surface-2';

export default function ChatList() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get('tab') === 'teams' ? 'teams' : 'direct';

  const {
    user,
    fetchUserTeams,
    myLeadTeams,
    myMemberTeams,
    conversations,
    fetchConversations,
  } = useAuthStore();

  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    Promise.all([fetchConversations(), fetchUserTeams()]).finally(() => setLoaded(true));
  }, [fetchConversations, fetchUserTeams]);

  // New messages reorder the inbox and update previews live.
  useEffect(() => {
    const socket = getSocket();
    const refresh = () => fetchConversations();
    socket.on('dm:message', refresh);
    return () => socket.off('dm:message', refresh);
  }, [fetchConversations]);

  const allTeams = [...myLeadTeams, ...myMemberTeams];
  const leadIds = new Set(myLeadTeams.map((team) => team._id));
  const unreadCount = conversations.filter((c) => c.unread).length;

  return (
    <div className="page-narrow">
      <header className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h1 className="page-title">Messages</h1>
          <p className="page-subtitle">Talk to people directly, or with your whole team.</p>
        </div>
        <button onClick={() => navigate('/search-peers')} className="btn btn-secondary btn-sm shrink-0" title="Find someone to message">
          <PenSquare className="h-4 w-4" strokeWidth={1.8} />
          New message
        </button>
      </header>

      <div className="tabs mb-2">
        <button onClick={() => setSearchParams({})} className={`tab ${tab === 'direct' ? 'tab-active' : ''}`}>
          Direct{unreadCount > 0 && <span className="ml-1.5 text-link">{unreadCount}</span>}
        </button>
        <button onClick={() => setSearchParams({ tab: 'teams' })} className={`tab ${tab === 'teams' ? 'tab-active' : ''}`}>
          Teams <span className="ml-1 text-subtle">{allTeams.length}</span>
        </button>
      </div>

      {!loaded ? (
        <div className="empty"><span className="spinner" /></div>
      ) : tab === 'direct' ? (
        conversations.length === 0 ? (
          <EmptyState
            title="No messages yet"
            text="Find someone with the skills you need and send them a message."
            action="Find people"
            onAction={() => navigate('/search-peers')}
          />
        ) : (
          <ul>
            {conversations.map((c) => {
              const fromMe = c.lastMessage?.sender === user?._id;
              return (
                <li key={c._id}>
                  <button onClick={() => navigate(`/chat/${c._id}`)} className={rowClass}>
                    <Avatar src={c.other?.avatar} name={c.other?.name} size="lg" />
                    <div className="min-w-0 flex-1">
                      <p className={`truncate text-sm text-fg ${c.unread ? 'font-bold' : 'font-semibold'}`}>
                        {c.other?.name}
                      </p>
                      <p className={`flex gap-1 text-sm ${c.unread ? 'font-semibold text-fg' : 'text-muted'}`}>
                        <span className="truncate">
                          {fromMe && 'You: '}{c.lastMessage?.text}
                        </span>
                        <span className="shrink-0 text-subtle">· {timeAgo(c.lastMessage?.createdAt)}</span>
                      </p>
                    </div>
                    {c.unread && <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-link" aria-label="Unread" />}
                  </button>
                </li>
              );
            })}
          </ul>
        )
      ) : allTeams.length === 0 ? (
        <EmptyState
          title="No team chats"
          text="Join or start a project to chat with its team."
          action="Find teams"
          onAction={() => navigate('/allideas')}
        />
      ) : (
        <ul>
          {allTeams.map((team) => {
            const memberCount = team.teamMembers?.length || 0;
            return (
              <li key={team._id}>
                <button onClick={() => navigate(`/team/${team._id}/chat`)} className={rowClass}>
                  <Avatar name={team.title} size="lg" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-fg">{team.title}</p>
                    <p className="truncate text-sm text-muted">
                      {leadIds.has(team._id) ? 'Leader' : 'Member'} · {memberCount} {memberCount === 1 ? 'member' : 'members'}
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 shrink-0 text-subtle transition-colors group-hover:text-fg" strokeWidth={1.8} />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
