import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Users, Plus, MessageSquare, LayoutDashboard, Compass } from 'lucide-react';
import useAuthStore from '../Store/authStore';
import Avatar from '../components/Avatar';

const MAX_STACK = 4;

export default function MyTeams() {
  const navigate = useNavigate();
  const {
    user,
    fetchUser,
    fetchUserTeams,
    myLeadTeams,
    myMemberTeams,
    loadingTeams,
    errorTeams,
  } = useAuthStore();

  const [tab, setTab] = useState('lead');

  useEffect(() => {
    const initializeData = async () => {
      if (!user) await fetchUser();
      await fetchUserTeams();
    };
    initializeData();
  }, [fetchUser, fetchUserTeams, user]);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Recently';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const TeamCard = ({ team, isLeader = false }) => {
    const members = team.teamMembers || [];
    const memberCount = members.length;
    const pending = team.pendingRequests || 0;
    const leaderName = isLeader ? 'You' : (team.createdBy?.name || team.createdBy?.username || 'Unknown');

    return (
      <article className="card card-hover p-4 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <button onClick={() => navigate(`/project/${team._id}`)} className="min-w-0 text-left">
                <h3 className="truncate text-base font-semibold text-fg hover:underline">{team.title}</h3>
              </button>
              <span className="badge">{isLeader ? 'Leader' : 'Member'}</span>
              {isLeader && pending > 0 && (
                <button onClick={() => navigate(`/project/${team._id}`)} className="chip-accent">
                  {pending} {pending === 1 ? 'request' : 'requests'}
                </button>
              )}
            </div>
            {team.description && (
              <p className="mt-1 line-clamp-2 text-sm text-muted">{team.description}</p>
            )}

            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-subtle">
              {memberCount > 0 && (
                <span className="flex -space-x-2">
                  {members.slice(0, MAX_STACK).map((m, idx) => (
                    <Avatar
                      key={m._id || idx}
                      src={m.avatar}
                      name={m.name || m.username}
                      size="xs"
                      className="ring-2 ring-bg"
                    />
                  ))}
                  {memberCount > MAX_STACK && (
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-line bg-surface-2 text-[10px] font-semibold text-muted ring-2 ring-bg">
                      +{memberCount - MAX_STACK}
                    </span>
                  )}
                </span>
              )}
              <span className="text-muted">
                {memberCount} {memberCount === 1 ? 'member' : 'members'}
              </span>
              <span>·</span>
              <span>Led by {leaderName}</span>
              <span>·</span>
              <span>{formatDate(team.createdAt)}</span>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button onClick={() => navigate(`/team/${team._id}`)} className="btn btn-secondary btn-sm">
              <LayoutDashboard className="h-4 w-4" strokeWidth={1.8} />
              Dashboard
            </button>
            <button onClick={() => navigate(`/team/${team._id}/chat`)} className="btn btn-secondary btn-sm">
              <MessageSquare className="h-4 w-4" strokeWidth={1.8} />
              Chat
            </button>
          </div>
        </div>
      </article>
    );
  };

  if (loadingTeams) {
    return (
      <div className="page">
        <div className="empty">
          <span className="spinner" />
          <p className="empty-text">Loading your teams…</p>
        </div>
      </div>
    );
  }

  if (errorTeams) {
    return (
      <div className="page">
        <div className="empty">
          <h3 className="empty-title">Unable to load teams</h3>
          <p className="empty-text">{errorTeams}</p>
          <button onClick={() => fetchUserTeams()} className="btn btn-primary mt-5">
            Try again
          </button>
        </div>
      </div>
    );
  }

  const total = myLeadTeams.length + myMemberTeams.length;
  const isLeadTab = tab === 'lead';
  const list = isLeadTab ? myLeadTeams : myMemberTeams;

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Teams</h1>
          <p className="page-subtitle">
            {total} {total === 1 ? 'team' : 'teams'} · {myLeadTeams.length} leading, {myMemberTeams.length} joined
          </p>
        </div>
        <Link to="/newproject" className="btn btn-primary self-start sm:self-auto">
          <Plus className="h-4 w-4" strokeWidth={2} />
          New project
        </Link>
      </header>

      <div className="tabs mb-6" role="tablist">
        <button
          role="tab"
          aria-selected={isLeadTab}
          onClick={() => setTab('lead')}
          className={`tab ${isLeadTab ? 'tab-active' : ''}`}
        >
          Leading <span className="ml-1 font-normal text-subtle">{myLeadTeams.length}</span>
        </button>
        <button
          role="tab"
          aria-selected={!isLeadTab}
          onClick={() => setTab('member')}
          className={`tab ${!isLeadTab ? 'tab-active' : ''}`}
        >
          Member <span className="ml-1 font-normal text-subtle">{myMemberTeams.length}</span>
        </button>
      </div>

      {list.length === 0 ? (
        isLeadTab ? (
          <div className="empty">
            <span className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-fg">
              <Users className="h-8 w-8" strokeWidth={1.5} />
            </span>
            <h3 className="empty-title">You're not leading any teams</h3>
            <p className="empty-text">Create a project to start building a team around it.</p>
            <button onClick={() => navigate('/newproject')} className="btn btn-outline mt-5">
              Create your first project
            </button>
          </div>
        ) : (
          <div className="empty">
            <span className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-fg">
              <Compass className="h-8 w-8" strokeWidth={1.5} />
            </span>
            <h3 className="empty-title">You haven't joined a team yet</h3>
            <p className="empty-text">Browse projects and request to join one that fits your skills.</p>
            <button onClick={() => navigate('/allideas')} className="btn btn-primary mt-5">
              Browse projects
            </button>
          </div>
        )
      ) : (
        <div className="space-y-3">
          {list.map((team) => (
            <TeamCard key={team._id} team={team} isLeader={isLeadTab} />
          ))}
        </div>
      )}
    </div>
  );
}
