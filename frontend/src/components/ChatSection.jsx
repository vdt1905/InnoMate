import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import useAuthStore from '../Store/authStore';
import { Send, MessageSquare, Loader2 } from 'lucide-react';
import axios from '../api/axiosInstance'; // Or wherever your axios instance is

const ChatSection = ({ teamId }) => {
    const { user } = useAuthStore();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [socket, setSocket] = useState(null);
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        // 1. Connect Socket
        // Adjust URL if backend port differs. Assuming typical localhost:5000 or same host
        const socketInstance = io('http://localhost:5000', {
            withCredentials: true,
        });
        setSocket(socketInstance);

        // 2. Join Room
        socketInstance.emit('joinRoom', teamId);

        // 3. Listen for messages
        socketInstance.on('receiveMessage', (msg) => {
            setMessages((prev) => [...prev, msg]);
        });

        // 4. Load initial history
        const fetchHistory = async () => {
            try {
                const { data } = await axios.get(`/ideas/${teamId}/messages`);
                setMessages(data);
            } catch (err) {
                console.error('Failed to load chat history', err);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();

        return () => {
            socketInstance.disconnect();
        };
    }, [teamId]);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !socket || !user) return;

        const payload = {
            teamId,
            senderId: user._id,
            reqSender: {
                name: user.name,
                username: user.username,
                avatar: user.avatar
            },
            text: newMessage
        };

        // Emit to server
        socket.emit('sendMessage', payload);
        setNewMessage('');
    };

    if (loading) {
        return (
            <div className="h-64 flex items-center justify-center text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                Loading chat...
            </div>
        );
    }

    return (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl flex flex-col h-[600px]">
            {/* Header */}
            <div className="p-4 border-b border-slate-700/50 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-emerald-400" />
                <h3 className="font-semibold text-white">Team Chat</h3>
                <span className="text-xs text-slate-400 ml-auto flex items-center gap-1">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                    Live
                </span>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                    <div className="text-center text-slate-500 text-sm mt-10">
                        No messages yet. Start the conversation!
                    </div>
                ) : (
                    messages.map((msg, idx) => {
                        const isMe = msg.senderId === user?._id;
                        return (
                            <div key={msg._id || idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                {!isMe && (
                                    <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-xs text-white font-bold mr-2 mt-1">
                                        {msg.reqSender?.name?.[0] || '?'}
                                    </div>
                                )}
                                <div>
                                    {!isMe && <div className="text-xs text-slate-400 mb-0.5 ml-1">{msg.reqSender?.name}</div>}
                                    <div
                                        className={`max-w-xs md:max-w-md px-4 py-2 rounded-2xl text-sm ${isMe
                                                ? 'bg-blue-600 text-white rounded-tr-sm'
                                                : 'bg-slate-700 text-slate-200 rounded-tl-sm'
                                            }`}
                                    >
                                        {msg.text}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-700/50 bg-slate-800/30 rounded-b-2xl">
                <div className="flex gap-2">
                    <input
                        type="text"
                        className="flex-1 bg-slate-900/50 border border-slate-600/50 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500/50 placeholder-slate-500"
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ChatSection;
