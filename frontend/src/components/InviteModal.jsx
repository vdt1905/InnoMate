import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import useAuthStore from '../Store/authStore';
import Avatar from './Avatar';

// "Invite <person> to one of my projects" — opened from a profile.
const InviteModal = ({ person, open, onClose }) => {
  const { myLeadTeams, fetchUserTeams, inviteToProject } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState({}); // ideaId -> { ok, text }
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    if (!open) return;
    setResults({});
    setLoading(true);
    fetchUserTeams().finally(() => setLoading(false));
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose, fetchUserTeams]);

  if (!open) return null;

  const invite = async (ideaId) => {
    setBusyId(ideaId);
    const res = await inviteToProject(ideaId, person._id);
    setBusyId(null);
    setResults((r) => ({ ...r, [ideaId]: { ok: res.ok, text: res.ok ? (res.joined ? 'Added to team' : 'Invited') : res.error } }));
  };

  const firstName = person.name?.split(' ')[0] || person.username;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-label={`Invite ${firstName}`}
        onClick={(e) => e.stopPropagation()}
        className="card flex max-h-[80vh] w-full flex-col rounded-b-none sm:max-w-md sm:rounded-b-lg"
      >
        <header className="flex items-center justify-between border-b border-line px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-fg">Invite {firstName}</h2>
            <p className="text-xs text-muted">They'll get a notification and can join with one tap.</p>
          </div>
          <button onClick={onClose} className="icon-btn" aria-label="Close">
            <X className="h-5 w-5" strokeWidth={1.8} />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto p-2">
          {loading ? (
            <div className="empty py-10"><span className="spinner" /></div>
          ) : myLeadTeams.length === 0 ? (
            <div className="empty py-10">
              <p className="empty-title mt-0">You don't lead any projects yet</p>
              <p className="empty-text">Create one and you can invite people to your team.</p>
              <Link to="/newproject" onClick={onClose} className="btn btn-primary mt-4">Create a project</Link>
            </div>
          ) : (
            <ul>
              {myLeadTeams.map((team) => {
                const onTeam = team.teamMembers?.some((m) => (m._id || m) === person._id);
                const limit = team.hackathon?.maxTeamSize;
                const full = limit && team.teamMembers.length >= limit;
                const result = results[team._id];
                return (
                  <li key={team._id} className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-surface-2">
                    <Avatar name={team.title} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-fg">{team.title}</p>
                      <p className="text-xs text-subtle">
                        {team.teamMembers?.length || 0}{limit ? `/${limit}` : ''} members
                        {result && !result.ok && <span className="text-danger"> · {result.text}</span>}
                      </p>
                    </div>
                    {onTeam ? (
                      <span className="text-xs text-subtle">On team</span>
                    ) : result?.ok ? (
                      <span className="text-xs font-semibold text-success">{result.text}</span>
                    ) : full ? (
                      <span className="text-xs text-subtle">Team full</span>
                    ) : (
                      <button onClick={() => invite(team._id)} disabled={busyId === team._id} className="btn btn-primary btn-sm">
                        Invite
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default InviteModal;
