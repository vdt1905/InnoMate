import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useAuthStore from '../Store/authStore';
import Avatar from './Avatar';

// Right-hand rail on wide screens: who you are, where you work, who to meet.
// Hidden below xl, where the feed needs the full width.
const HomeSidebar = () => {
  const { user, myTeams, fetchUserTeams, searchUsers } = useAuthStore();
  const [people, setPeople] = useState([]);

  useEffect(() => {
    fetchUserTeams();
    searchUsers('').then((users) => {
      const others = (users || []).filter((u) => u._id !== user?._id);
      setPeople(others.slice(0, 5));
    });
  }, [fetchUserTeams, searchUsers, user?._id]);

  const skills = user?.skills || [];

  return (
    <aside className="hidden w-[320px] shrink-0 xl:block">
      <div className="sticky top-10 space-y-4">
        {/* You */}
        <section className="card p-5">
          <div className="flex items-center gap-3">
            <Avatar src={user?.avatar} name={user?.name} size="lg" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-fg">{user?.name}</p>
              <p className="truncate text-sm text-muted">@{user?.username}</p>
            </div>
          </div>
          {skills.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {skills.slice(0, 6).map((skill) => (
                <span key={skill} className="chip">{skill}</span>
              ))}
              {skills.length > 6 && <span className="chip text-muted">+{skills.length - 6}</span>}
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted">
              You haven't added any skills yet, so matches are generic.
            </p>
          )}
          <Link to={`/${user?.username}`} className="btn btn-secondary btn-sm mt-4 w-full">
            {skills.length ? 'View profile' : 'Add your skills'}
          </Link>
        </section>

        {/* Teams */}
        <section className="card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="section-title text-sm">Your teams</h2>
            <Link to="/myteams" className="text-xs font-semibold text-link hover:underline">See all</Link>
          </div>
          {myTeams.length === 0 ? (
            <p className="text-sm text-muted">
              You're not on a team yet.{' '}
              <Link to="/newproject" className="font-semibold text-link hover:underline">Start a project</Link>
            </p>
          ) : (
            <ul className="-mx-2 space-y-0.5">
              {myTeams.slice(0, 4).map((team) => (
                <li key={team._id}>
                  <Link
                    to={`/team/${team._id}`}
                    className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-surface-2"
                  >
                    <Avatar name={team.title} size="sm" className="rounded-lg" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-fg">{team.title}</span>
                      <span className="block text-xs text-subtle">
                        {team.role === 'leader' ? 'Leader' : 'Member'} · {team.teamMembers?.length || 0} members
                      </span>
                    </span>
                    {team.pendingRequests > 0 && (
                      <span className="chip-accent">{team.pendingRequests}</span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* People */}
        {people.length > 0 && (
          <section className="card p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="section-title text-sm">People to meet</h2>
              <Link to="/search-peers" className="text-xs font-semibold text-link hover:underline">See all</Link>
            </div>
            <ul className="-mx-2 space-y-0.5">
              {people.map((person) => (
                <li key={person._id}>
                  <Link
                    to={`/${person.username}`}
                    className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-surface-2"
                  >
                    <Avatar src={person.avatar} name={person.name} size="sm" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-fg">{person.username}</span>
                      <span className="block truncate text-xs text-subtle">
                        {person.skills?.length ? person.skills.slice(0, 3).join(' · ') : person.name}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <p className="px-1 text-xs text-subtle">© {new Date().getFullYear()} InnoMate</p>
      </div>
    </aside>
  );
};

export default HomeSidebar;
