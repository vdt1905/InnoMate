import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../Store/authStore';
import { Heart, MessageCircle, Eye, Share2, ArrowLeft, Check, X, Lock } from 'lucide-react';
import Avatar from '../components/Avatar';
import InvitePeople from '../components/InvitePeople';


const ProjectDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const {
        user,
        getIdeaById,
        sendJoinRequest,
        joinStatusByIdea,
        getJoinRequestStatus,
        getJoinRequests,
        joinRequestsByIdea,
        acceptJoinRequest,
        rejectJoinRequest,
        loadingJoin,
        removeMember,
        leaveTeam,
        addCommentToIdea,
        inviteIdByIdea,
        respondToInvite
    } = useAuthStore();
    const [idea, setIdea] = useState(null);
    const [loading, setLoading] = useState(true);
    const [newComment, setNewComment] = useState('');
    const [activeTab, setActiveTab] = useState('overview');
    const [linkCopied, setLinkCopied] = useState(false);
    const openConversation = useAuthStore((state) => state.openConversation);

    const handleMessageLead = async () => {
        const res = await openConversation(idea.createdBy._id);
        if (res.ok) navigate(`/chat/${res.id}`);
        else alert(res.error);
    };

    const handleShare = async () => {
        const url = `${window.location.origin}/project/${id}`;
        try {
            await navigator.clipboard.writeText(url);
            setLinkCopied(true);
            setTimeout(() => setLinkCopied(false), 2000);
        } catch {
            window.prompt('Copy this link:', url);
        }
    };

    const handlePostComment = async () => {
        if (!newComment.trim()) return;

        const success = await addCommentToIdea(id, newComment);
        if (success) {
            setNewComment('');
            // Refresh data
            const updatedData = await getIdeaById(id);
            setIdea(updatedData);
        }
    };

    useEffect(() => {
        const fetchIdea = async () => {
            if (id) {
                const data = await getIdeaById(id);
                setIdea(data);
                setLoading(false);
            }
        };
        fetchIdea();
    }, [id, getIdeaById]);

    // Fetch join status or requests
    useEffect(() => {
        if (user && id && idea) {
            const isOwner = user._id === idea.createdBy._id;
            if (isOwner) {
                getJoinRequests(id);
            } else {
                getJoinRequestStatus(id);
            }
        }
    }, [id, user, idea, getJoinRequests, getJoinRequestStatus]);

    const isOwner = user && idea && user._id === idea.createdBy?._id;
    // Check if already a member (assuming teamMembers is populated or list of IDs)
    const isMember = idea?.teamMembers?.some(m => (m._id || m) === user?._id);
    const requestStatus = joinStatusByIdea[id]; // 'pending', 'accepted', 'rejected', or null
    const pendingRequests = joinRequestsByIdea[id] || [];

    const handleJoinClick = async () => {
        if (!user) {
            navigate('/login');
            return;
        }
        await sendJoinRequest(id);
    };

    const [inviteError, setInviteError] = useState('');
    const handleInviteResponse = async (accept) => {
        setInviteError('');
        const res = await respondToInvite(inviteIdByIdea[id], accept);
        if (!res.ok) return setInviteError(res.error);
        const updatedIdea = await getIdeaById(id);
        setIdea(updatedIdea);
    };

    const refreshIdea = async () => setIdea(await getIdeaById(id));

    const handleAccept = async (requestId) => {
        await acceptJoinRequest(id, requestId);
        // refresh idea to show new member
        const updatedIdea = await getIdeaById(id);
        setIdea(updatedIdea);
    };

    const handleReject = async (requestId) => {
        await rejectJoinRequest(id, requestId);
    };

    const handleRemoveMember = async (memberId) => {
        if (window.confirm('Are you sure you want to remove this member?')) {
            await removeMember(id, memberId);
            // Update local state if needed, but the store action calls getIdeaById
            const updatedIdea = await getIdeaById(id);
            setIdea(updatedIdea);
        }
    };

    const handleLeaveTeam = async () => {
        if (window.confirm('Are you sure you want to leave this team?')) {
            await leaveTeam(id);
            navigate('/allideas'); // Redirect after leaving
        }
    };


    if (loading) {
        return (
            <div className="page">
                <div className="empty">
                    <span className="spinner" />
                    <p className="empty-text mt-4">Loading project…</p>
                </div>
            </div>
        );
    }

    if (!idea) {
        return (
            <div className="page">
                <div className="empty">
                    <h2 className="empty-title">Project not found</h2>
                    <p className="empty-text">It may have been removed or the link is wrong.</p>
                    <button
                        onClick={() => navigate('/allideas')}
                        className="btn btn-secondary mt-5"
                    >
                        Back to all ideas
                    </button>
                </div>
            </div>
        );
    }

    const formatDate = (dateString) => {
        if (!dateString) return 'Recently';
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const formatTimeAgo = (date) => {
        if (!date) return 'Recently';
        const diffInMs = new Date() - new Date(date);
        const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
        const diffInDays = Math.floor(diffInHours / 24);
        const diffInWeeks = Math.floor(diffInDays / 7);
        const diffInMonths = Math.floor(diffInDays / 30);

        if (diffInMonths > 0) return `${diffInMonths}mo ago`;
        if (diffInWeeks > 0) return `${diffInWeeks}w ago`;
        if (diffInDays > 0) return `${diffInDays}d ago`;
        if (diffInHours > 0) return `${diffInHours}h ago`;
        return 'Just now';
    };

    const skills = Array.isArray(idea.skillsRequired)
        ? idea.skillsRequired
        // Handle case where it might be a comma-separated string from older data
        : idea.skillsRequired
            ? idea.skillsRequired.toString().split(',').map((skill) => skill.trim())
            : [];
    const likeCount = Array.isArray(idea.likes) ? idea.likes.length : (idea.likes || 0);
    const commentCount = Array.isArray(idea.comments) ? idea.comments.length : (idea.comments || 0);
    const viewCount = Array.isArray(idea.views) ? idea.views.length : (idea.views || 0);
    const memberCount = idea.teamMembers?.length || 0;
    const isHackathonProject = idea.projectType === 'hackathon';
    // Any project can cap its team size — hackathons must, personal ones may.
    const teamLimit = idea.hackathon?.maxTeamSize || null;
    const teamFull = Boolean(teamLimit) && memberCount >= teamLimit;

    const tabs = [
        { id: 'overview', label: 'Overview' },
        {
            id: 'dashboard',
            label: 'Team dashboard',
            disabled: !isMember && !isOwner
        }
    ];

    return (
        <div className="page">
            {/* Back */}
            <button
                onClick={() => navigate('/home')}
                className="-ml-1 mb-5 inline-flex items-center gap-1.5 rounded-md px-1 py-0.5 text-sm font-medium text-muted transition-colors hover:text-fg"
            >
                <ArrowLeft className="h-4 w-4" strokeWidth={2} />
                Back
            </button>

            {/* Header */}
            <header className="mb-6">
                <div className="flex items-start justify-between gap-4">
                    <h1 className="page-title min-w-0 break-words">{idea.title}</h1>
                    {linkCopied && <span className="shrink-0 text-xs text-muted">Link copied</span>}
                    <button onClick={handleShare} className="icon-btn shrink-0 text-muted" aria-label="Copy link" title="Copy link">
                        <Share2 className="h-5 w-5" strokeWidth={1.8} />
                    </button>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
                    <Link to={`/${idea.createdBy?.username}`} className="flex min-w-0 items-center gap-2.5">
                        <Avatar src={idea.createdBy?.avatar} name={idea.createdBy?.name} size="sm" />
                        <span className="truncate text-sm">
                            <span className="font-semibold text-fg hover:text-muted">
                                {idea.createdBy?.username || idea.createdBy?.name || 'anonymous'}
                            </span>
                            <span className="text-subtle" title={formatDate(idea.createdAt)}> · {formatTimeAgo(idea.createdAt)}</span>
                        </span>
                    </Link>
                    <span className="badge">
                        {isHackathonProject ? 'Hackathon' : 'Personal project'}
                        {teamLimit ? ` · max ${teamLimit} members` : ''}
                    </span>
                </div>
            </header>

            {/* Tabs */}
            <nav className="tabs mb-8">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        disabled={tab.disabled}
                        onClick={() => {
                            if (tab.id === 'overview') {
                                setActiveTab('overview');
                            } else if (tab.id === 'dashboard') {
                                navigate(`/team/${id}`);
                            }
                        }}
                        className={`tab inline-flex items-center gap-1.5 disabled:cursor-not-allowed disabled:text-subtle disabled:hover:text-subtle ${activeTab === tab.id ? 'tab-active' : ''}`}
                        title={tab.disabled ? 'Only team members can open the dashboard' : undefined}
                    >
                        {tab.label}
                        {tab.id === 'dashboard' && tab.disabled && (
                            <Lock className="h-3.5 w-3.5" strokeWidth={2} />
                        )}
                    </button>
                ))}
            </nav>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-10">
                {/* Main column */}
                <div className="min-w-0 space-y-8 lg:col-start-1 lg:row-start-1">
                    <section>
                        <h2 className="section-title mb-2">About</h2>
                        <p className="whitespace-pre-line text-sm leading-relaxed text-fg/90">
                            {idea.description}
                        </p>
                    </section>

                    {skills.length > 0 && (
                        <section>
                            <h2 className="section-title mb-3">Required skills</h2>
                            <div className="flex flex-wrap gap-1.5">
                                {skills.map((skill, index) =>
                                    user?.skills?.includes(skill) ? (
                                        <span key={index} className="chip-accent" title="You have this skill">
                                            <Check className="h-3 w-3" strokeWidth={3} />
                                            {skill}
                                        </span>
                                    ) : (
                                        <span key={index} className="chip">{skill}</span>
                                    )
                                )}
                            </div>
                        </section>
                    )}

                    {/* Hackathon details */}
                    {isHackathonProject && idea.hackathon && (
                        <section>
                            <h2 className="section-title mb-3">Hackathon details</h2>
                            <dl className="card grid grid-cols-2 divide-x divide-line">
                                <div className="p-4">
                                    <dt className="text-xs text-muted">Max team size</dt>
                                    <dd className="mt-1 text-sm font-semibold text-fg">{idea.hackathon.maxTeamSize} members</dd>
                                </div>
                                <div className="p-4">
                                    <dt className="text-xs text-muted">Status</dt>
                                    <dd className="mt-1 flex items-center gap-2 text-sm font-semibold text-fg">
                                        <span className="dot bg-success" />
                                        Active
                                    </dd>
                                </div>
                            </dl>
                            {idea.hackathon.description && (
                                <div className="mt-4">
                                    <h3 className="eyebrow mb-1">Goals &amp; timeline</h3>
                                    <p className="whitespace-pre-line text-sm leading-relaxed text-fg/90">
                                        {idea.hackathon.description}
                                    </p>
                                </div>
                            )}
                        </section>
                    )}

                    {idea.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-x-2 gap-y-1">
                            {idea.tags.map((tag, index) => (
                                <span key={index} className="tag">#{tag.replace(/\s+/g, '')}</span>
                            ))}
                        </div>
                    )}

                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-line pt-4 text-sm text-muted">
                        <span className="inline-flex items-center gap-1.5">
                            <Heart className="h-4 w-4" strokeWidth={1.8} />
                            <span className="font-semibold text-fg">{likeCount}</span> {likeCount === 1 ? 'like' : 'likes'}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                            <MessageCircle className="h-4 w-4 -scale-x-100" strokeWidth={1.8} />
                            <span className="font-semibold text-fg">{commentCount}</span> {commentCount === 1 ? 'comment' : 'comments'}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                            <Eye className="h-4 w-4" strokeWidth={1.8} />
                            <span className="font-semibold text-fg">{viewCount}</span> views
                        </span>
                    </div>
                </div>

                {/* Sidebar */}
                <aside className="card divide-y divide-line self-start lg:sticky lg:top-6 lg:col-start-2 lg:row-span-2 lg:row-start-1">
                    {/* Primary action for the viewer */}
                    {!isOwner && (
                        <div className="space-y-3 p-5">
                            {isMember ? (
                                <>
                                    <p className="flex items-center gap-2 text-sm font-semibold text-fg">
                                        <span className="dot bg-success" />
                                        You're a member
                                    </p>
                                    <button
                                        onClick={() => navigate(`/team/${id}`)}
                                        className="btn btn-primary w-full"
                                    >
                                        Open team dashboard
                                    </button>
                                    <button
                                        onClick={handleLeaveTeam}
                                        className="btn btn-danger w-full"
                                    >
                                        Leave team
                                    </button>
                                </>
                            ) : (
                                /* JOIN BUTTON / MAX LIMIT LOGIC */
                                requestStatus === 'invited' ? (
                                <>
                                    <p className="text-sm text-fg">
                                        <span className="font-semibold">{idea.createdBy?.name}</span> invited you to join this team.
                                    </p>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleInviteResponse(true)} className="btn btn-primary flex-1">
                                            Join team
                                        </button>
                                        <button onClick={() => handleInviteResponse(false)} className="btn btn-secondary flex-1">
                                            Decline
                                        </button>
                                    </div>
                                    {inviteError && <p className="text-xs text-danger">{inviteError}</p>}
                                </>
                                ) : (
                                <>
                                    <p className="text-sm text-muted">Open for collaboration</p>
                                    {teamFull ? (
                                        <p className="rounded-lg border border-line bg-surface-2 px-3 py-2 text-center text-sm font-semibold text-danger">
                                            Max user limit reached
                                        </p>
                                    ) : (
                                        <button
                                            onClick={handleJoinClick}
                                            disabled={loadingJoin || requestStatus === 'pending'}
                                            className={`btn w-full ${requestStatus === 'pending' ? 'btn-secondary' : 'btn-primary'}`}
                                        >
                                            {loadingJoin ? (
                                                <span className="spinner h-4 w-4" />
                                            ) : requestStatus === 'pending' ? (
                                                'Request pending'
                                            ) : (
                                                'Request to join'
                                            )}
                                        </button>
                                    )}
                                </>
                                )
                            )}
                        </div>
                    )}

                    {/* Project lead */}
                    <div className="p-5">
                        <h2 className="eyebrow mb-3">Project lead</h2>
                        <button
                            onClick={() => navigate(`/${idea.createdBy?.username}`)}
                            className="-mx-2 flex w-[calc(100%+1rem)] items-center gap-3 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-surface-2"
                        >
                            <Avatar src={idea.createdBy?.avatar} name={idea.createdBy?.name} size="md" />
                            <span className="min-w-0">
                                <span className="block truncate text-sm font-semibold text-fg">{idea.createdBy?.name || 'Anonymous'}</span>
                                <span className="block truncate text-xs text-muted">@{idea.createdBy?.username}</span>
                            </span>
                        </button>
                        {!isOwner && user && (
                            <button onClick={handleMessageLead} className="btn btn-secondary btn-sm mt-3 w-full">
                                <MessageCircle className="h-4 w-4 -scale-x-100" strokeWidth={1.8} />
                                Message {idea.createdBy?.name?.split(' ')[0] || 'lead'}
                            </button>
                        )}
                    </div>

                    {/* Team */}
                    <div className="p-5">
                        <div className="mb-3 flex items-center justify-between">
                            <h2 className="eyebrow">Team</h2>
                            {teamLimit && (
                                <span className={`text-xs font-semibold ${teamFull ? 'text-danger' : 'text-muted'}`}>
                                    {memberCount}/{teamLimit}
                                </span>
                            )}
                        </div>

                        {/* MEMBER LIST - VISIBLE ONLY TO TEAM MEMBERS/OWNER */}
                        {(isOwner || isMember) && memberCount > 0 ? (
                            <ul className="space-y-1">
                                {idea.teamMembers.map((member) => (
                                    <li key={member._id} className="flex items-center gap-3 py-1">
                                        <Avatar src={member.avatar} name={member.name} size="sm" />
                                        <span className="min-w-0 flex-1 truncate text-sm font-medium text-fg">{member.name}</span>
                                        {member._id === idea.createdBy._id && (
                                            <span className="text-xs text-subtle">Lead</span>
                                        )}
                                        {isOwner && member._id !== user?._id && (
                                            <button
                                                onClick={() => handleRemoveMember(member._id)}
                                                className="icon-btn text-subtle hover:text-danger hover:opacity-100"
                                                title="Remove member"
                                                aria-label={`Remove ${member.name}`}
                                            >
                                                <X className="h-4 w-4" strokeWidth={2} />
                                            </button>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-muted">
                                {memberCount} {memberCount === 1 ? 'member' : 'members'}
                            </p>
                        )}
                    </div>

                    {/* OWNER VIEW: invite people */}
                    {isOwner && !teamFull && (
                        <div className="p-5">
                            <h2 className="eyebrow mb-3">Invite people</h2>
                            <InvitePeople idea={idea} onTeamChanged={refreshIdea} />
                        </div>
                    )}

                    {/* OWNER VIEW: Pending requests */}
                    {isOwner && (
                        <div className="p-5">
                            <h2 className="eyebrow mb-3">
                                Join requests{pendingRequests.length > 0 ? ` · ${pendingRequests.length}` : ''}
                            </h2>
                            {pendingRequests.length === 0 ? (
                                <p className="text-sm text-subtle">No pending requests.</p>
                            ) : (
                                <ul className="space-y-4">
                                    {pendingRequests.map((req) => (
                                        <li key={req._id}>
                                            <div className="flex items-center gap-3">
                                                <Avatar src={req.requester?.avatar} name={req.requesterName} size="sm" />
                                                <div className="min-w-0 flex-1">
                                                    <div className="truncate text-sm font-semibold text-fg">{req.requesterName}</div>
                                                    {req.requesterUsername && (
                                                        <div className="truncate text-xs text-muted">@{req.requesterUsername}</div>
                                                    )}
                                                </div>
                                            </div>
                                            {req.note && (
                                                <p className="mt-2 text-sm text-muted">“{req.note}”</p>
                                            )}
                                            <div className="mt-3 flex gap-2">
                                                <button
                                                    onClick={() => handleAccept(req._id)}
                                                    className="btn btn-primary btn-sm flex-1"
                                                >
                                                    Accept
                                                </button>
                                                <button
                                                    onClick={() => handleReject(req._id)}
                                                    className="btn btn-secondary btn-sm flex-1"
                                                >
                                                    Decline
                                                </button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}
                </aside>

                {/* Comments */}
                <section className="min-w-0 lg:col-start-1 lg:row-start-2">
                    <h2 className="section-title mb-4">
                        Comments <span className="font-normal text-subtle">{idea.comments?.length || 0}</span>
                    </h2>

                    {idea.comments?.length > 0 ? (
                        <div className="space-y-3">
                            {idea.comments.map((comment, index) => (
                                <div key={comment._id || index} className="flex gap-3 text-sm">
                                    <Avatar src={comment.user?.avatar} name={comment.user?.name} size="xs" className="mt-0.5" />
                                    <p className="min-w-0 flex-1 whitespace-pre-wrap break-words leading-relaxed">
                                        <span className="mr-1.5 font-semibold text-fg">
                                            {comment.user?.username || comment.user?.name || 'Unknown user'}
                                        </span>
                                        {comment.user?._id === idea.createdBy?._id && (
                                            <span className="mr-1.5 text-xs text-subtle">Owner</span>
                                        )}
                                        <span className="text-fg/90">{comment.text}</span>
                                        <span className="ml-2 text-xs text-subtle" title={formatDate(comment.createdAt)}>
                                            {formatTimeAgo(comment.createdAt)}
                                        </span>
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-subtle">No comments yet. Start the conversation.</p>
                    )}

                    {/* Comment input */}
                    {user ? (
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handlePostComment();
                            }}
                            className="mt-4 flex items-center gap-3 border-t border-line pt-3"
                        >
                            <Avatar src={user.avatar} name={user.name} size="xs" />
                            <input
                                type="text"
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Add a comment…"
                                className="min-w-0 flex-1 bg-transparent text-sm text-fg placeholder:text-subtle focus:outline-none"
                                aria-label="Add a comment"
                            />
                            <button
                                type="submit"
                                disabled={!newComment.trim()}
                                className="link-btn"
                            >
                                Post
                            </button>
                        </form>
                    ) : (
                        <p className="mt-4 border-t border-line pt-3 text-sm text-muted">
                            <button onClick={() => navigate('/login')} className="link-btn">Log in</button> to join the discussion.
                        </p>
                    )}
                </section>
            </div>
        </div>
    );
};


export default ProjectDetails;
