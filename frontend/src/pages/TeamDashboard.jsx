import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useAuthStore from '../Store/authStore';
import {
    ArrowLeft, Lock, MessageSquare
} from 'lucide-react';
import Avatar from '../components/Avatar';

const TeamDashboard = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { getTeamDetails, user, removeMember } = useAuthStore();

    const [team, setTeam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDashboard = async () => {
            const result = await getTeamDetails(id);
            if (result.ok) {
                setTeam(result.data);
            } else {
                setError(result.error);
            }
            setLoading(false);
        };
        fetchDashboard();
    }, [id, getTeamDetails]);

    const handleRemoveMember = async (memberId) => {
        if (!window.confirm("Are you sure you want to remove this member?")) return;

        const result = await removeMember(id, memberId);
        if (result.ok) {
            // Refresh dashboard data
            const updated = await getTeamDetails(id);
            if (updated.ok) setTeam(updated.data);
        } else {
            alert("Failed to remove member: " + result.error);
        }
    };

    if (loading) {
        return (
            <div className="page">
                <div className="empty">
                    <span className="spinner" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="page">
                <div className="empty">
                    <span className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-fg">
                        <Lock className="h-8 w-8" strokeWidth={1.5} />
                    </span>
                    <h2 className="empty-title">Access restricted</h2>
                    <p className="empty-text">{error}</p>
                    <button onClick={() => navigate('/home')} className="btn btn-secondary mt-5">
                        Return home
                    </button>
                </div>
            </div>
        );
    }

    const isOwner = user?._id === team.createdBy._id;
    const leader = team.createdBy;
    const members = team.teamMembers.filter((member) => member._id !== team.createdBy._id);

    const MemberRow = ({ person, isLeader }) => (
        <li className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
            <Avatar src={person.avatar} name={person.name} size="md" />
            <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="truncate text-sm font-semibold text-fg">{person.name}</span>
                    {person.username && <span className="text-sm text-subtle">@{person.username}</span>}
                    {isLeader && <span className="badge">Leader</span>}
                </div>
                {person.email && (
                    <a href={`mailto:${person.email}`} className="block truncate text-sm text-muted hover:text-fg">
                        {person.email}
                    </a>
                )}
            </div>
            {!isLeader && isOwner && (
                <button
                    onClick={() => handleRemoveMember(person._id)}
                    className="btn btn-danger btn-sm shrink-0"
                    title="Remove member from team"
                >
                    Remove
                </button>
            )}
        </li>
    );

    return (
        <div className="page">
            <button
                onClick={() => navigate(`/project/${id}`)}
                className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-fg"
            >
                <ArrowLeft className="h-4 w-4" strokeWidth={2} />
                Back to project
            </button>

            <header className="page-header">
                <div className="min-w-0">
                    <p className="eyebrow">Team dashboard</p>
                    <div className="mt-1 flex flex-wrap items-center gap-3">
                        <h1 className="page-title min-w-0 break-words">{team.title}</h1>
                        <span className="badge">{isOwner ? 'Leader' : 'Member'}</span>
                    </div>
                    <p className="page-subtitle">
                        {team.teamMembers.length} {team.teamMembers.length === 1 ? 'member' : 'members'} · Created{' '}
                        {new Date(team.createdAt).toLocaleDateString()}
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <button onClick={() => navigate(`/team/${id}/chat`)} className="btn btn-primary">
                        <MessageSquare className="h-4 w-4" strokeWidth={1.8} />
                        Open chat
                    </button>
                </div>
            </header>

            <div className="space-y-4 lg:space-y-6">
                <section className="card p-5">
                    <h2 className="section-title">About</h2>
                    <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-fg/90">
                        {team.description}
                    </p>
                    {team.skillsRequired?.length > 0 && (
                        <>
                            <h3 className="eyebrow mt-5">Skills</h3>
                            <div className="mt-2 flex flex-wrap gap-1.5">
                                {team.skillsRequired.map((skill) => (
                                    <span key={skill} className="chip">{skill}</span>
                                ))}
                            </div>
                        </>
                    )}
                    {team.tags?.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-x-2 gap-y-1">
                            {team.tags.map((tag) => (
                                <span key={tag} className="tag">#{tag.replace(/\s+/g, '')}</span>
                            ))}
                        </div>
                    )}
                </section>

                <section className="card p-5">
                    <div className="flex items-baseline justify-between">
                        <h2 className="section-title">Members</h2>
                        <span className="text-xs text-subtle">Visible to team members only</span>
                    </div>
                    <ul className="mt-4 divide-y divide-line">
                        <MemberRow person={leader} isLeader />
                        {members.map((member) => (
                            <MemberRow key={member._id} person={member} isLeader={false} />
                        ))}
                    </ul>
                </section>
            </div>
        </div>
    );

};

export default TeamDashboard;
