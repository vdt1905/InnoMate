import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Users, Crown, ArrowRight, Sparkles } from 'lucide-react';
import useAuthStore from '../Store/authStore';

export default function ChatList() {
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

    useEffect(() => {
        const initializeData = async () => {
            if (!user) await fetchUser();
            await fetchUserTeams();
        };
        initializeData();
    }, [fetchUser, fetchUserTeams, user]);

    const allTeams = [...myLeadTeams, ...myMemberTeams];

    const getInitials = (name) => {
        if (!name) return 'GP';
        return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase().slice(0, 2);
    };

    if (loadingTeams) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-900">
                <div className="text-center">
                    <div className="relative mb-6">
                        <div className="w-16 h-16 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin mx-auto" />
                    </div>
                    <div className="text-white font-semibold text-lg mb-2">Loading your chats</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-900">
            <div className="max-w-4xl mx-auto px-6 py-12">
                <div className="text-center mb-12">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="p-3 bg-violet-500/20 rounded-xl">
                            <MessageSquare className="w-8 h-8 text-violet-400" />
                        </div>
                        <h1 className="text-4xl font-bold text-white">
                            Messages
                        </h1>
                    </div>
                    <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                        Connect and collaborate with your team members
                    </p>
                </div>

                {allTeams.length === 0 ? (
                    <div className="text-center py-16 bg-slate-800/50 rounded-xl border border-slate-700/50 backdrop-blur">
                        <div className="max-w-md mx-auto">
                            <div className="w-20 h-20 bg-slate-700/50 rounded-xl flex items-center justify-center mx-auto mb-6">
                                <MessageSquare className="w-10 h-10 text-slate-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-3">No conversations yet</h3>
                            <p className="text-slate-400 mb-6">Join a team to start chatting!</p>
                            <button
                                onClick={() => navigate('/allideas')}
                                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all duration-200"
                            >
                                Find Teams
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {allTeams.map(team => (
                            <div
                                key={team._id}
                                onClick={() => navigate(`/team/${team._id}/chat`)}
                                className="group p-4 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-violet-500/30 rounded-xl cursor-pointer transition-all duration-200 flex items-center gap-4"
                            >
                                <div className="w-12 h-12 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 shadow-lg shadow-violet-900/20">
                                    {getInitials(team.title)}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <h3 className="text-white font-semibold truncate group-hover:text-violet-300 transition-colors">
                                            {team.title}
                                        </h3>
                                        <span className="text-xs text-slate-500 bg-slate-900/50 px-2 py-1 rounded">
                                            {team.teamMembers?.length || 0} members
                                        </span>
                                    </div>
                                    <p className="text-slate-400 text-sm truncate">
                                        {team.description || 'No description available'}
                                    </p>
                                </div>

                                <div className="text-slate-500 group-hover:text-violet-400 transition-colors">
                                    <ArrowRight className="w-5 h-5" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
