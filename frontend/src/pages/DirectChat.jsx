import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import useAuthStore from '../Store/authStore';
import axios from '../api/axiosInstance';
import { getSocket } from '../api/socket';
import Avatar from '../components/Avatar';
import MessageList from '../components/chat/MessageList';
import Composer from '../components/chat/Composer';

const toBubble = (msg, people) => {
  const sender = people[msg.sender] || {};
  return {
    id: msg._id,
    senderId: msg.sender,
    senderName: sender.name,
    senderAvatar: sender.avatar,
    text: msg.text,
    createdAt: msg.createdAt,
  };
};

const DirectChat = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { user, markConversationRead } = useAuthStore();

  const [other, setOther] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    axios
      .get(`/messages/conversations/${conversationId}`)
      .then(({ data }) => {
        if (cancelled) return;
        setOther(data.conversation.other);
        setMessages(data.messages);
        markConversationRead(conversationId);
      })
      .catch(() => !cancelled && navigate('/chat', { replace: true }))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [conversationId, navigate, markConversationRead]);

  // Live messages for this conversation — including ones you send from
  // another tab. Opening them here counts as reading them.
  useEffect(() => {
    const socket = getSocket();
    const onMessage = ({ conversationId: cid, message }) => {
      if (cid !== conversationId) return;
      setMessages((prev) => (prev.some((m) => m._id === message._id) ? prev : [...prev, message]));
      if (message.sender !== user?._id) {
        axios.post(`/messages/conversations/${conversationId}/read`).catch(() => {});
        markConversationRead(conversationId);
      }
    };
    socket.on('dm:message', onMessage);
    return () => socket.off('dm:message', onMessage);
  }, [conversationId, user?._id, markConversationRead]);

  const handleSend = async (text) => {
    setError('');
    try {
      const { data } = await axios.post(`/messages/conversations/${conversationId}/messages`, { text });
      // The socket echo may land first; dedupe by id either way.
      setMessages((prev) => (prev.some((m) => m._id === data._id) ? prev : [...prev, data]));
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Message not sent. Try again.');
      return false;
    }
  };

  const shell = 'flex h-[calc(100dvh-7rem)] flex-col md:h-screen';

  if (loading || !other) {
    return (
      <div className={`${shell} items-center justify-center`}>
        <span className="spinner" />
      </div>
    );
  }

  const people = { [other._id]: other, [user._id]: user };

  return (
    <div className={shell}>
      <header className="flex h-16 shrink-0 items-center gap-3 border-b border-line px-3 md:px-5">
        <button type="button" onClick={() => navigate('/chat')} className="icon-btn" aria-label="Back to messages">
          <ArrowLeft className="h-5 w-5" strokeWidth={1.8} />
        </button>
        <Link to={`/${other.username}`} className="flex min-w-0 flex-1 items-center gap-3">
          <Avatar src={other.avatar} name={other.name} size="md" />
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold text-fg">{other.name}</span>
            <span className="block truncate text-xs text-muted">@{other.username}</span>
          </span>
        </Link>
        <Link to={`/${other.username}`} className="btn btn-secondary btn-sm">View profile</Link>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4 md:px-5">
        <MessageList
          messages={messages.map((m) => toBubble(m, people))}
          currentUserId={user?._id}
          empty={
            <>
              <Avatar src={other.avatar} name={other.name} size="lg" />
              <h2 className="empty-title">{other.name}</h2>
              <p className="empty-text">Say hi to start the conversation.</p>
            </>
          }
        />
      </div>

      {error && <p className="px-5 pb-1 text-xs text-danger">{error}</p>}
      <Composer onSend={handleSend} placeholder={`Message ${other.name.split(' ')[0]}…`} />
    </div>
  );
};

export default DirectChat;
