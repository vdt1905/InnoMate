import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import useAuthStore from '../Store/authStore';
import axios from '../api/axiosInstance';
import {
    Send, Phone, Video, Info, MoreVertical,
    ArrowLeft, Search, Paperclip, Smile, Image as ImageIcon,
    Check, CheckCheck
} from 'lucide-react';

const TeamChat = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, getTeamDetails } = useAuthStore();

    const [team, setTeam] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [socket, setSocket] = useState(null);
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef(null);
    const [isSidebarOpen, setSidebarOpen] = useState(true); // For mobile responsiveness

    // Initial Data Fetch
    useEffect(() => {
        const init = async () => {
            // Fetch Team Info for Sidebar
            const teamRes = await getTeamDetails(id);
            if (teamRes.ok) {
                setTeam(teamRes.data);
            } else {
                navigate('/home'); // access denied
                return;
            }

            // Fetch Chat History
            try {
                const historyRes = await axios.get(`/ideas/${id}/messages`);
                setMessages(historyRes.data);
            } catch (err) {
                console.error("Failed to load history", err);
            }
            setLoading(false);
        };

        init();
    }, [id, getTeamDetails, navigate]);

    // Socket Connection
    useEffect(() => {
        if (!user) return;

        // Derive Socket URL from API URL (remove /api suffix) or fallback to localhost
        const SOCKET_URL = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000';

        const socketInstance = io(SOCKET_URL, {
            withCredentials: true,
        });
        setSocket(socketInstance);

        socketInstance.emit('joinRoom', id);

        socketInstance.on('receiveMessage', (msg) => {
            setMessages((prev) => [...prev, msg]);
        });

        return () => {
            socketInstance.disconnect();
        };
    }, [id, user]);

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !socket || !user) return;

        const payload = {
            teamId: id,
            senderId: user._id,
            reqSender: {
                name: user.name,
                username: user.username,
                avatar: user.avatar
            },
            text: newMessage
        };

        socket.emit('sendMessage', payload);
        setNewMessage('');
    };

    const formatTime = (dateString) => {
        return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    if (loading || !team) {
        return (
            <div className="h-screen bg-slate-900 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-slate-900 text-slate-200 overflow-hidden">

            {/* LEFT SIDEBAR (Members & Info) - Hidden on small screens if chat open */}
            <div className={`w-full md:w-80 lg:w-96 bg-slate-800 border-r border-slate-700/50 flex flex-col ${!isSidebarOpen ? 'hidden md:flex' : 'flex'}`}>

                {/* Sidebar Header */}
                <div className="h-16 px-4 py-3 bg-slate-800 border-b border-slate-700/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div onClick={() => navigate(`/team/${id}`)} className="cursor-pointer p-1.5 hover:bg-slate-700 rounded-full transition-colors">
                            <ArrowLeft className="w-5 h-5 text-slate-400" />
                        </div>
                        <h2 className="font-bold text-white truncate max-w-[150px]">{team.title}</h2>
                    </div>
                    <div className="flex gap-2">
                        <button className="p-2 hover:bg-slate-700 rounded-full text-slate-400">
                            <Search className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Team Members List */}
                <div className="flex-1 overflow-y-auto">
                    <div className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Team Members ({team.teamMembers.length})
                    </div>
                    <div className="space-y-1">
                        {/* Render Owner First */}
                        <div className="px-3 py-2 mx-2 hover:bg-slate-700/50 rounded-lg flex items-center gap-3 cursor-pointer transition-colors group">
                            <div className="relative">
                                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold">
                                    {team.createdBy.name[0]}
                                </div>
                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-slate-800 rounded-full"></div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline">
                                    <h3 className="text-sm font-semibold text-white truncate">{team.createdBy.name}</h3>
                                    <span className="text-[10px] text-orange-400 font-medium">Owner</span>
                                </div>
                                <p className="text-xs text-slate-400 truncate">@{team.createdBy.username}</p>
                            </div>
                        </div>

                        {/* Render Other Members */}
                        {team.teamMembers.map((member) => (
                            member._id !== team.createdBy._id && (
                                <div key={member._id} className="px-3 py-2 mx-2 hover:bg-slate-700/50 rounded-lg flex items-center gap-3 cursor-pointer transition-colors group">
                                    <div className="relative">
                                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                                            {member.name[0]}
                                        </div>
                                        {/* Placeholder status indicator */}
                                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-slate-500 border-2 border-slate-800 rounded-full"></div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-sm font-semibold text-white truncate">{member.name}</h3>
                                        <p className="text-xs text-slate-400 truncate">@{member.username}</p>
                                    </div>
                                </div>
                            )
                        ))}
                    </div>
                </div>

                {/* Current User Profile Footer */}
                <div className="h-16 bg-slate-800/80 border-t border-slate-700/50 px-4 flex items-center gap-3">
                    <div className="w-9 h-9 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold">
                        {user.name[0]}
                    </div>
                    <div className="flex-1">
                        <div className="text-sm font-medium text-white">You</div>
                        <div className="text-xs text-emerald-400">Online</div>
                    </div>
                </div>
            </div>


            {/* MAIN CHAT AREA */}
            <div className={`flex-1 flex flex-col bg-[#0f172a] bg-opacity-95 relative ${isSidebarOpen ? 'hidden md:flex' : 'flex'}`}>
                {/* Chat Background Pattern (Optional) */}
                <div className="absolute inset-0 opacity-5 pointer-events-none"
                    style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '24px 24px' }}>
                </div>

                {/* Chat Header */}
                <div className="h-16 px-6 bg-slate-800/90 backdrop-blur-sm border-b border-slate-700/50 flex items-center justify-between z-10">
                    <div className="flex items-center gap-4">
                        <div className="md:hidden" onClick={() => setSidebarOpen(true)}>
                            <ArrowLeft className="w-6 h-6 text-slate-400" />
                        </div>
                        <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400">
                            <CheckCheck className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-white">Team Discussion</h3>
                            <p className="text-xs text-slate-400 flex items-center gap-1">
                                {team.teamMembers.length} members
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 text-slate-400">
                        <button className="hover:text-white transition-colors"><Video className="w-5 h-5" /></button>
                        <button className="hover:text-white transition-colors"><Phone className="w-5 h-5" /></button>
                        <div className="h-6 w-px bg-slate-700 mx-1"></div>
                        <button className="hover:text-white transition-colors"><MoreVertical className="w-5 h-5" /></button>
                    </div>
                </div>

                {/* Messages List */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 z-10 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                    {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-slate-500 opacity-70">
                            <div className="p-4 bg-slate-800 rounded-full mb-3">
                                <div className="w-8 h-8 bg-emerald-500 rounded-full animate-ping absolute opacity-20"></div>
                                <Smile className="w-8 h-8 text-emerald-500 relative" />
                            </div>
                            <p>No messages yet. Say hello!</p>
                        </div>
                    )}

                    {messages.map((msg, idx) => {
                        const isMe = msg.senderId === user?._id;
                        const showHeader = idx === 0 || messages[idx - 1].senderId !== msg.senderId;

                        return (
                            <div key={msg._id || idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'} group`}>

                                {/* Avatar (Left side only) */}
                                {!isMe && (
                                    <div className={`w-8 h-8 rounded-full bg-indigo-500 flex-shrink-0 flex items-center justify-center text-xs text-white font-bold mr-3 mt-1 ${!showHeader ? 'opacity-0' : ''}`}>
                                        {msg.reqSender?.name?.[0] || '?'}
                                    </div>
                                )}

                                <div className={`max-w-[75%] sm:max-w-[60%]`}>
                                    {/* Sender Name (Left side only) */}
                                    {!isMe && showHeader && (
                                        <div className="text-xs text-slate-400 mb-1 ml-1">{msg.reqSender?.name}</div>
                                    )}

                                    {/* Bubble */}
                                    <div className={`relative px-4 py-2 text-[15px] shadow-sm ${isMe
                                        ? 'bg-emerald-600 text-white rounded-2xl rounded-tr-none'
                                        : 'bg-slate-700 text-slate-200 rounded-2xl rounded-tl-none'
                                        }`}>
                                        {msg.text}

                                        {/* Timestamp */}
                                        <div className={`text-[10px] mt-1 text-right ${isMe ? 'text-emerald-200' : 'text-slate-400'}`}>
                                            {formatTime(msg.createdAt)}
                                            {isMe && <Check className="w-3 h-3 inline ml-1 opacity-70" />}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-4 bg-slate-800 border-t border-slate-700/50 z-10">
                    <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto relative flex items-end gap-2 bg-slate-900/50 p-2 rounded-2xl border border-slate-700 focus-within:border-emerald-500/50 focus-within:ring-1 focus-within:ring-emerald-500/20 transition-all">

                        {/* Attachment Button */}
                        <button type="button" className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-full transition-colors self-end mb-0.5">
                            <Paperclip className="w-5 h-5" />
                        </button>

                        <textarea
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendMessage(e);
                                }
                            }}
                            placeholder="Type a message..."
                            className="flex-1 bg-transparent border-none text-white placeholder-slate-500 focus:ring-0 resize-none max-h-32 py-2.5 px-2"
                            rows="1"
                            style={{ minHeight: '44px' }}
                        />

                        <div className="flex gap-1 self-end mb-0.5">
                            <button type="button" className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-full transition-colors md:block hidden">
                                <ImageIcon className="w-5 h-5" />
                            </button>
                            <button
                                type="submit"
                                disabled={!newMessage.trim()}
                                className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg shadow-emerald-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-95"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </div>
                    </form>
                    <div className="text-center text-[10px] text-slate-600 mt-2 hidden md:block">
                        Press Enter to send, Shift + Enter for new line
                    </div>
                </div>

            </div>
        </div>
    );
};

export default TeamChat;
