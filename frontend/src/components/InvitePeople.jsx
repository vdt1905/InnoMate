import React, { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import useAuthStore from '../Store/authStore';
import Avatar from './Avatar';

// Project-lead search box: find a person and invite them to this project.
const InvitePeople = ({ idea, onTeamChanged }) => {
  const { user, searchUsers, inviteToProject } = useAuthStore();
  const [query, setQuery] = useState('');
  const [people, setPeople] = useState([]);
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState({}); // userId -> { ok, text }

  const teamIds = new Set([idea.createdBy?._id, ...(idea.teamMembers || []).map((m) => m._id || m)]);

  // Debounced, so typing a name doesn't fire a request per keystroke.
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setPeople([]);
      return;
    }
    setSearching(true);
    const timer = setTimeout(async () => {
      const found = await searchUsers(encodeURIComponent(q));
      setPeople((found || []).filter((p) => p._id !== user?._id).slice(0, 6));
      setSearching(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, searchUsers, user?._id]);

  const invite = async (person) => {
    const res = await inviteToProject(idea._id, person._id);
    setResults((r) => ({ ...r, [person._id]: { ok: res.ok, text: res.ok ? (res.joined ? 'Added' : 'Invited') : res.error } }));
    if (res.ok && res.joined) onTeamChanged?.();
  };

  return (
    <div>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or username"
          className="input pl-9"
          aria-label="Search people to invite"
        />
      </div>

      {searching && <div className="mt-3 flex justify-center"><span className="spinner h-4 w-4" /></div>}

      {!searching && query.trim().length >= 2 && people.length === 0 && (
        <p className="mt-3 text-sm text-muted">No one found.</p>
      )}

      {people.length > 0 && (
        <ul className="mt-2 -mx-2">
          {people.map((person) => {
            const result = results[person._id];
            return (
              <li key={person._id} className="flex items-center gap-3 rounded-lg px-2 py-2">
                <Avatar src={person.avatar} name={person.name} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-fg">{person.name}</p>
                  <p className="truncate text-xs text-subtle">
                    {result && !result.ok ? <span className="text-danger">{result.text}</span> : `@${person.username}`}
                  </p>
                </div>
                {teamIds.has(person._id) ? (
                  <span className="text-xs text-subtle">On team</span>
                ) : result?.ok ? (
                  <span className="text-xs font-semibold text-success">{result.text}</span>
                ) : (
                  <button onClick={() => invite(person)} className="btn btn-secondary btn-sm">Invite</button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default InvitePeople;
