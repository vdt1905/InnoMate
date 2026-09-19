import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useAuthStore from '../Store/authStore';
import axios from '../api/axiosInstance';
import { getSocket } from '../api/socket';
import { ArrowLeft, Info } from 'lucide-react';
import Avatar from '../components/Avatar';
import MessageList from '../components/chat/MessageList';
import Composer from '../components/chat/Composer';

// Team messages carry a denormalised sender snapshot; map to the shared shape.
const toBubble = (msg) => ({
    id: msg._id,
    senderId: msg.senderId,
    senderName: msg.reqSender?.name,
    senderAvatar: msg.reqSender?.avatar,
    text: msg.text,
    createdAt: msg.createdAt,
});

const TeamChat = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, getTeamDetails } = useAuthStore();

    const [team, setTeam] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);

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

    // Real-time: join this team's room on the shared connection.
    useEffect(() => {
        if (!user) return;
        const socket = getSocket();
        const join = () => socket.emit('joinRoom', id);
        const onMessage = (msg) => {
            if (msg.teamId === id) setMessages((prev) => [...prev, msg]);
        };

        join();
        socket.on('connect', join); // rejoin after a reconnect
        socket.on('receiveMessage', onMessage);
        return () => {
            socket.off('connect', join);
            socket.off('receiveMessage', onMessage);
        };
    }, [id, user]);

    const handleSendMessage = (text) => {
        // Sender identity is taken from the session on the server.
        getSocket().emit('sendMessage', { teamId: id, text });
    };

    // Phones: Layout's fixed top and bottom bars are 3.5rem each.
    const shell = 'flex h-[calc(100dvh-7rem)] flex-col md:h-screen';

    if (loading || !team) {
        return (
            <div className={`${shell} items-center justify-center`}>
                <span className="spinner" />
            </div>
        );
    }

    const memberCount = team.teamMembers.length;

    return (
        <div className={shell}>
            {/* Header */}
            <header className="flex h-16 shrink-0 items-center gap-3 border-b border-line px-3 md:px-5">
                <button
                    type="button"
                    onClick={() => navigate(`/team/${id}`)}
                    className="icon-btn"
                    aria-label="Back to team"
                >
                    <ArrowLeft className="h-5 w-5" strokeWidth={1.8} />
                </button>
                <Avatar name={team.title} size="md" />
                <div className="min-w-0 flex-1">
                    <h1 className="truncate text-sm font-semibold text-fg">{team.title}</h1>
                    <p className="truncate text-xs text-muted">
                        {memberCount} {memberCount === 1 ? 'member' : 'members'}
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => navigate(`/team/${id}`)}
                    className="icon-btn"
                    aria-label="Team details"
                    title="Team details"
                >
                    <Info className="h-5 w-5" strokeWidth={1.8} />
                </button>
            </header>

            {/* Messages */}
            <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4 md:px-5">
                <MessageList
                    messages={messages.map(toBubble)}
                    currentUserId={user?._id}
                    showSenderNames
                    empty={
                        <>
                            <Avatar name={team.title} size="lg" />
                            <h2 className="empty-title">No messages yet</h2>
                            <p className="empty-text">Start the conversation with your team.</p>
                        </>
                    }
                />
            </div>

            <Composer onSend={handleSendMessage} />
        </div>
    );
};

export default TeamChat;
