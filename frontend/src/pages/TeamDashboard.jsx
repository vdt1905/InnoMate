import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useAuthStore from '../Store/authStore';
import {
    Shield, Users, Mail, Crown, Calendar,
    MessageSquare, FileText, CheckCircle, AlertTriangle,
    ArrowLeft, Lock, Activity, LayoutDashboard, Trash2
} from 'lucide-react';

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
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
                <div className="text-center max-w-md">
                    <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Lock className="w-10 h-10 text-red-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Access Restricted</h2>
                    <p className="text-slate-400 mb-6">{error}</p>
                    <button
                        onClick={() => navigate('/home')}
                        className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors"
                    >
                        Return Home
                    </button>
                </div>
            </div>
        );
    }

    const isOwner = user?._id === team.createdBy._id;

    return (
        <div className="min-h-screen bg-slate-900 text-slate-200">
            {/* Top Navigation Bar */}
            <div className="bg-slate-800/50 border-b border-slate-700/50 sticky top-0 z-10 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate(`/project/${id}`)}
                                className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors text-slate-400 hover:text-white"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <h1 className="text-xl font-bold text-white flex items-center gap-2">
                                <Shield className="w-5 h-5 text-emerald-500" />
                                Team Dashboard <span className="text-slate-500 font-normal">/ {team.title}</span>
                            </h1>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center gap-2">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                <span className="text-xs font-medium text-emerald-400">Secure Environment</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">

                    {/* Main Info Column */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Project Overview */}
                        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
                            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <LayoutDashboard className="w-5 h-5 text-purple-400" />
                                Project Overview
                            </h2>
                            <p className="text-slate-300 leading-relaxed whitespace-pre-line mb-6">
                                {team.description}
                            </p>
                            <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-700/50">
                                <div className="flex items-center gap-2 text-sm text-slate-400">
                                    <Calendar className="w-4 h-4" />
                                    Created {new Date(team.createdAt).toLocaleDateString()}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-400">
                                    <Users className="w-4 h-4" />
                                    {team.teamMembers.length} Members
                                </div>
                            </div>
                        </div>

                        {/* Team Roster (Sensitive Data) */}
                        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
                            <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                                <Users className="w-5 h-5 text-blue-400" />
                                Team Roster & Contacts
                            </h2>
                            <div className="space-y-4">
                                {/* Leader */}
                                <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-xl border border-slate-600/30">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                                            {team.createdBy.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-semibold text-white flex items-center gap-2">
                                                {team.createdBy.name}
                                                <Crown className="w-4 h-4 text-orange-400" />
                                            </div>
                                            <div className="text-sm text-slate-400 flex items-center gap-1.5 mt-0.5">
                                                <Mail className="w-3 h-3" />
                                                {team.createdBy.email}
                                            </div>
                                        </div>
                                    </div>
                                    <span className="px-3 py-1 bg-orange-500/10 text-orange-400 text-xs font-medium rounded-lg border border-orange-500/20">
                                        Project Lead
                                    </span>
                                </div>

                                {/* Members */}
                                {team.teamMembers.map(member => (
                                    member._id !== team.createdBy._id && (
                                        <div key={member._id} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-xl border border-slate-600/30 group">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                                                    {member.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-white">
                                                        {member.name}
                                                    </div>
                                                    <div className="text-sm text-slate-400 flex items-center gap-1.5 mt-0.5">
                                                        <Mail className="w-3 h-3" />
                                                        {member.email}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="px-3 py-1 bg-blue-500/10 text-blue-400 text-xs font-medium rounded-lg border border-blue-500/20">
                                                    Member
                                                </span>
                                                {isOwner && (
                                                    <button
                                                        onClick={() => handleRemoveMember(member._id)}
                                                        className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors border border-red-500/10 hover:border-red-500/30"
                                                        title="Remove Member from Team"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    {/* Quick Actions (Sidebar) */}
                    <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Internal Actions</h3>
                        <div className="space-y-3">
                            <button
                                onClick={() => navigate(`/team/${id}/chat`)}
                                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex items-center gap-3 transition-colors text-sm font-bold shadow-lg shadow-emerald-900/20"
                            >
                                <MessageSquare className="w-4 h-4" />
                                Open Team Chat
                            </button>
                            <button className="w-full py-3 px-4 bg-slate-700/50 hover:bg-slate-700 text-slate-200 rounded-xl flex items-center gap-3 transition-colors text-sm font-medium">
                                <FileText className="w-4 h-4 text-blue-400" />
                                Shared Files
                            </button>
                            <button className="w-full py-3 px-4 bg-slate-700/50 hover:bg-slate-700 text-slate-200 rounded-xl flex items-center gap-3 transition-colors text-sm font-medium">
                                <Activity className="w-4 h-4 text-purple-400" />
                                View Activity Log
                            </button>
                        </div>
                    </div>

                    {/* Status Card */}
                    <div className="bg-gradient-to-br from-emerald-900/40 to-slate-900/40 border border-emerald-500/20 rounded-2xl p-6 relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-emerald-400" />
                                Project Status
                            </h3>
                            <p className="text-slate-400 text-sm mb-4">
                                Everything looks good! Your team is active and on track.
                            </p>
                            <div className="w-full bg-slate-700/50 h-2 rounded-full overflow-hidden">
                                <div className="w-3/4 h-full bg-emerald-500 rounded-full" />
                            </div>
                            <div className="mt-2 text-right text-xs text-emerald-400 font-medium">
                                75% Complete
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

};

export default TeamDashboard;
