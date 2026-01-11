import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useAuthStore from '../Store/authStore';
import { Lightbulb, User, Calendar, Tag, Heart, MessageCircle, TrendingUp, Share2, ArrowLeft, Mail, Github, Users, Code, Zap, Check, X, Shield } from 'lucide-react';

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
        addCommentToIdea
    } = useAuthStore();
    const [idea, setIdea] = useState(null);
    const [loading, setLoading] = useState(true);
    const [newComment, setNewComment] = useState('');

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
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <div className="text-white text-lg">Loading project details...</div>
                </div>
            </div>
        );
    }

    if (!idea) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-white mb-2">Project Not Found</h2>
                    <button
                        onClick={() => navigate('/allideas')}
                        className="text-purple-400 hover:text-purple-300"
                    >
                        Back to All Ideas
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
            <div className="max-w-5xl mx-auto">
                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center space-x-2 text-gray-400 hover:text-white mb-8 transition-colors duration-200"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Back</span>
                </button>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Project Info */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8">
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex items-center space-x-4">
                                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center">
                                        <Lightbulb className="w-8 h-8 text-white" />
                                    </div>
                                    <div>
                                        <h1 className="text-3xl font-bold text-white mb-2">{idea.title}</h1>
                                        <div className="flex items-center space-x-3 text-gray-400 text-sm">
                                            <div className="flex items-center space-x-1">
                                                <User className="w-4 h-4" />
                                                <span>{idea.createdBy?.name || 'Anonymous'}</span>
                                            </div>
                                            <span>•</span>
                                            <div className="flex items-center space-x-1">
                                                <Calendar className="w-4 h-4" />
                                                <span>{formatDate(idea.createdAt)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <button className="p-2 bg-gray-700/50 rounded-xl hover:bg-gray-600/50 transition-colors duration-200">
                                    <Share2 className="w-5 h-5 text-gray-300" />
                                </button>
                            </div>

                            <div className="prose prose-invert max-w-none mb-8">
                                <h3 className="text-xl font-semibold text-white mb-3">About the Project</h3>
                                <p className="text-gray-300 leading-relaxed whitespace-pre-line">
                                    {idea.description}
                                </p>
                            </div>

                            {/* Required Skills Section */}
                            {idea.skillsRequired && idea.skillsRequired.length > 0 && (
                                <div className="mb-8">
                                    <h3 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
                                        <Code className="w-5 h-5 text-blue-400" />
                                        Required Skills
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {Array.isArray(idea.skillsRequired) ? idea.skillsRequired.map((skill, index) => (
                                            <span
                                                key={index}
                                                className="px-4 py-2 bg-blue-500/10 text-blue-300 rounded-xl text-sm font-medium border border-blue-500/20"
                                            >
                                                {skill}
                                            </span>
                                        )) : (
                                            // Handle case where it might be a comma-separated string from older data
                                            idea.skillsRequired.toString().split(',').map((skill, index) => (
                                                <span
                                                    key={index}
                                                    className="px-4 py-2 bg-blue-500/10 text-blue-300 rounded-xl text-sm font-medium border border-blue-500/20"
                                                >
                                                    {skill.trim()}
                                                </span>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Hackathon Details Section */}
                            {idea.projectType === 'hackathon' && idea.hackathon && (
                                <div className="mb-8 p-6 bg-purple-500/10 rounded-2xl border border-purple-500/20">
                                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                                        <Zap className="w-5 h-5 text-yellow-400" />
                                        Hackathon Details
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="bg-gray-800/50 p-4 rounded-xl">
                                                <div className="text-gray-400 text-sm mb-1">Max Team Size</div>
                                                <div className="text-white font-semibold text-lg flex items-center gap-2">
                                                    <Users className="w-5 h-5 text-purple-400" />
                                                    {idea.hackathon.maxTeamSize} Members
                                                </div>
                                            </div>
                                            <div className="bg-gray-800/50 p-4 rounded-xl">
                                                <div className="text-gray-400 text-sm mb-1">Status</div>
                                                <div className="text-green-400 font-semibold text-lg flex items-center gap-2">
                                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                                    Active
                                                </div>
                                            </div>
                                        </div>
                                        {idea.hackathon.description && (
                                            <div>
                                                <div className="text-gray-400 text-sm mb-2">Goals & Timeline</div>
                                                <p className="text-gray-300 bg-gray-800/50 p-4 rounded-xl leading-relaxed whitespace-pre-line">
                                                    {idea.hackathon.description}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="flex flex-wrap gap-2 mb-8">
                                {idea.tags && idea.tags.map((tag, index) => (
                                    <span
                                        key={index}
                                        className="px-4 py-2 bg-green-500/10 text-green-300 rounded-full text-sm border border-green-500/20 flex items-center gap-1"
                                    >
                                        <Tag className="w-3 h-3" />
                                        {tag}
                                    </span>
                                ))}
                            </div>

                            <div className="flex items-center justify-between pt-6 border-t border-gray-700/50">
                                <div className="flex items-center space-x-6">
                                    <div className="flex items-center space-x-2 text-gray-300">
                                        <Heart className="w-5 h-5 text-pink-500" />
                                        <span className="font-medium">{Array.isArray(idea.likes) ? idea.likes.length : (idea.likes || 0)}</span>
                                    </div>
                                    <div className="flex items-center space-x-2 text-gray-300">
                                        <MessageCircle className="w-5 h-5 text-blue-500" />
                                        <span className="font-medium">{Array.isArray(idea.comments) ? idea.comments.length : (idea.comments || 0)}</span>
                                    </div>
                                    <div className="flex items-center space-x-2 text-gray-300">
                                        <TrendingUp className="w-5 h-5 text-green-500" />
                                        <span className="font-medium">{Array.isArray(idea.views) ? idea.views.length : (idea.views || 0)} views</span>
                                    </div>
                                </div>
                            </div>
                        </div>


                    </div>

                    {/* Right Column - Team & Info */}
                    <div className="space-y-6">
                        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
                            <h3 className="text-xl font-bold text-white mb-4">Project Lead</h3>
                            <div
                                onClick={() => navigate(`/${idea.createdBy?.username}`)}
                                className="flex items-center space-x-3 cursor-pointer hover:bg-gray-700/30 p-2 rounded-xl transition-colors duration-200"
                            >
                                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                                    {idea.createdBy?.name?.charAt(0) || <User />}
                                </div>
                                <div>
                                    <div className="text-white font-medium">{idea.createdBy?.name || 'Anonymous'}</div>
                                    <div className="text-gray-400 text-sm">@{idea.createdBy?.username}</div>
                                </div>
                            </div>

                            <div className="mt-6 space-y-3">
                                <button className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-colors duration-200 flex items-center justify-center space-x-2">
                                    <Mail className="w-4 h-4" />
                                    <span>Contact Lead</span>
                                </button>
                            </div>
                        </div>

                        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold text-white">Team</h3>
                                {idea.hackathon?.isHackathon && (
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${idea.teamMembers?.length >= idea.hackathon.maxTeamSize
                                        ? 'bg-red-500/20 text-red-300 border-red-500/30'
                                        : 'bg-green-500/20 text-green-300 border-green-500/30'
                                        }`}>
                                        {idea.teamMembers?.length || 0}/{idea.hackathon.maxTeamSize}
                                    </span>
                                )}
                            </div>

                            {/* MEMBER LIST - VISIBLE ONLY TO TEAM MEMBERS/OWNER */}
                            {(isOwner || isMember) && idea.teamMembers?.length > 0 && (
                                <div className="mb-6 space-y-3">
                                    {idea.teamMembers.map((member) => (
                                        <div key={member._id} className="flex items-center justify-between p-2 hover:bg-white/5 rounded-xl transition-colors group">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                                    {member.avatar ? (
                                                        <img src={member.avatar} alt={member.name} className="w-full h-full rounded-full object-cover" />
                                                    ) : (
                                                        member.name?.charAt(0).toUpperCase()
                                                    )}
                                                </div>
                                                <div className="text-sm text-gray-300">
                                                    <span className="font-medium text-white">{member.name}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                {member._id === idea.createdBy._id && (
                                                    <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/30">
                                                        Lead
                                                    </span>
                                                )}
                                                {isOwner && member._id !== user?._id && (
                                                    <button
                                                        onClick={() => handleRemoveMember(member._id)}
                                                        className="p-1 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                                        title="Remove Member"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* OWNER VIEW: Show Pending Requests */}
                            {isOwner ? (
                                <div className="space-y-4">
                                    {idea.projectType !== 'personal' && (
                                        <button
                                            onClick={() => navigate(`/team/${id}`)}
                                            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center space-x-2 shadow-lg shadow-blue-900/20 mb-4"
                                        >
                                            <Shield className="w-4 h-4" />
                                            <span>Go to Team Dashboard</span>
                                        </button>
                                    )}

                                    <div className="flex items-center space-x-2 text-gray-400 mb-2">
                                        <Users className="w-5 h-5" />
                                        <span>Manage Requests</span>
                                    </div>

                                    {pendingRequests.length === 0 ? (
                                        <p className="text-gray-500 text-sm italic">No pending requests.</p>
                                    ) : (
                                        <div className="space-y-3">
                                            {pendingRequests.map((req) => (
                                                <div key={req._id} className="bg-gray-700/30 p-3 rounded-xl border border-gray-600/30">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div>
                                                            <div className="font-medium text-white text-sm">{req.requesterName}</div>
                                                            <div className="text-xs text-gray-400">@{req.requesterUsername}</div>
                                                        </div>
                                                        <div className="flex space-x-1">
                                                            <button
                                                                onClick={() => handleAccept(req._id)}
                                                                className="p-1.5 bg-green-500/20 text-green-400 hover:bg-green-500/30 rounded-lg transition-colors"
                                                                title="Accept"
                                                            >
                                                                <Check className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleReject(req._id)}
                                                                className="p-1.5 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg transition-colors"
                                                                title="Reject"
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    {req.note && (
                                                        <p className="text-xs text-gray-400 italic">"{req.note}"</p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                /* USER VIEW: Join Button or Status */
                                <div className="flex flex-col space-y-4">
                                    {!isMember && (
                                        <div className="flex items-center space-x-2 text-gray-400">
                                            <Users className="w-5 h-5" />
                                            <span>Open for collaboration</span>
                                        </div>
                                    )}

                                    {isMember ? (
                                        <div className="space-y-3">
                                            <div className="w-full py-3 bg-green-500/10 border border-green-500/50 text-green-400 rounded-xl font-medium flex items-center justify-center space-x-2">
                                                <Check className="w-5 h-5" />
                                                <span>You are a member</span>
                                            </div>
                                            {idea.projectType !== 'personal' && (
                                                <button
                                                    onClick={() => navigate(`/team/${id}`)}
                                                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center space-x-2 shadow-lg shadow-blue-900/20"
                                                >
                                                    <Shield className="w-4 h-4" />
                                                    <span>Go to Team Dashboard</span>
                                                </button>
                                            )}
                                            {!isOwner && (
                                                <button
                                                    onClick={handleLeaveTeam}
                                                    className="w-full py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl font-medium transition-colors flex items-center justify-center space-x-2 text-sm"
                                                >
                                                    <X className="w-4 h-4" />
                                                    <span>Leave Team</span>
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        /* JOIN BUTTON / MAX LIMIT LOGIC */
                                        idea.hackathon?.isHackathon && (idea.teamMembers?.length || 0) >= idea.hackathon.maxTeamSize ? (
                                            <div className="w-full py-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-center font-bold flex items-center justify-center gap-2">
                                                <Users className="w-5 h-5" />
                                                Max user limit reached
                                            </div>
                                        ) : (
                                            <button
                                                onClick={handleJoinClick}
                                                disabled={loadingJoin || requestStatus === 'pending'}
                                                className={`w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl font-medium transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg shadow-purple-900/20 ${loadingJoin || requestStatus === 'pending' ? 'opacity-75 cursor-not-allowed' : ''
                                                    }`}
                                            >
                                                {loadingJoin ? (
                                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                ) : requestStatus === 'pending' ? (
                                                    'Request Pending'
                                                ) : (
                                                    'Request to Join'
                                                )}
                                            </button>
                                        )
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                    {/* Comments Section */}
                    <div className="lg:col-span-3 mt-8 bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-6 md:p-8">
                        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <MessageCircle className="w-5 h-5 text-blue-400" />
                            Discussion ({idea.comments?.length || 0})
                        </h2>

                        <div className="space-y-6 mb-8">
                            {idea.comments?.length > 0 ? (
                                idea.comments.map((comment, index) => (
                                    <div key={index} className="flex gap-4 group animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${index * 100}ms` }}>
                                        <div className="flex-shrink-0">
                                            {comment.user?.avatar ? (
                                                <img
                                                    src={comment.user.avatar}
                                                    alt={comment.user.name}
                                                    className="w-10 h-10 rounded-full object-cover border-2 border-slate-700/50 group-hover:border-blue-500/50 transition-colors duration-300"
                                                />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-600 border border-slate-600 flex items-center justify-center text-white font-bold text-sm shadow-lg group-hover:scale-105 transition-transform duration-300">
                                                    {comment.user?.name?.charAt(0) || 'U'}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 p-4 rounded-2xl rounded-tl-sm hover:border-slate-600 transition-colors duration-300 shadow-sm">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold text-slate-200">
                                                            {comment.user?.name || 'Unknown User'}
                                                        </span>
                                                        {comment.user?._id === idea.createdBy?._id && (
                                                            <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                                                Owner
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className="text-xs text-slate-500 font-medium">
                                                        {new Date(comment.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                                                    {comment.text}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12 rounded-2xl bg-slate-800/30 border border-slate-700/30 border-dashed">
                                    <div className="w-16 h-16 mx-auto mb-4 bg-slate-800 rounded-full flex items-center justify-center">
                                        <MessageCircle className="w-8 h-8 text-slate-500" />
                                    </div>
                                    <h3 className="text-slate-300 font-medium mb-1">No comments yet</h3>
                                    <p className="text-slate-500 text-sm">Be the first to start the conversation!</p>
                                </div>
                            )}
                        </div>

                        {/* Comment Input */}
                        {user ? (
                            <div className="flex gap-4 items-start">
                                <div className="flex-shrink-0">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                                        {user.name?.charAt(0) || 'U'}
                                    </div>
                                </div>
                                <div className="flex-1 relative">
                                    <textarea
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        placeholder="Ask a question or share your thoughts..."
                                        className="w-full bg-gray-900/50 border border-gray-700 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 min-h-[100px] resize-y"
                                    />
                                    <div className="absolute bottom-3 right-3">
                                        <button
                                            onClick={handlePostComment}
                                            disabled={!newComment.trim()}
                                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                                        >
                                            <Share2 className="w-4 h-4" />
                                            Post Comment
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-6 bg-blue-500/5 rounded-xl border border-blue-500/10">
                                <p className="text-blue-200">Please <button onClick={() => navigate('/login')} className="text-blue-400 hover:underline font-medium">log in</button> to join the discussion.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};


export default ProjectDetails;
