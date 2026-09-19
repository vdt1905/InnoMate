import React, { useEffect, useRef } from 'react';
import Avatar from '../Avatar';

const formatTime = (date) => new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
const dayKey = (date) => new Date(date).toDateString();
const formatDay = (date) => {
  const d = new Date(date);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
};

/**
 * Chat bubbles shared by team chat and direct messages.
 * messages: [{ id, senderId, senderName, senderAvatar, text, createdAt }]
 * showSenderNames: label groups with the sender's name (team chat only — in a
 * one-to-one conversation it's always the other person).
 */
const MessageList = ({ messages, currentUserId, showSenderNames = false, empty }) => {
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) return <div className="empty h-full">{empty}</div>;

  return (
    <div className="flex flex-col">
      {messages.map((msg, idx) => {
        const isMe = msg.senderId === currentUserId;
        const prev = messages[idx - 1];
        const next = messages[idx + 1];
        const newDay = !prev || dayKey(prev.createdAt) !== dayKey(msg.createdAt);
        const startsGroup = newDay || prev.senderId !== msg.senderId;
        const endsGroup = !next || next.senderId !== msg.senderId || dayKey(next.createdAt) !== dayKey(msg.createdAt);

        return (
          <React.Fragment key={msg.id || idx}>
            {newDay && (
              <div className="my-4 text-center text-xs font-medium text-subtle">{formatDay(msg.createdAt)}</div>
            )}
            <div className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'} ${startsGroup && !newDay ? 'mt-4' : 'mt-0.5'}`}>
              {!isMe && (
                <div className={`w-6 shrink-0 ${endsGroup ? 'mb-5' : ''}`}>
                  {endsGroup && <Avatar src={msg.senderAvatar} name={msg.senderName} size="xs" />}
                </div>
              )}
              <div className={`flex min-w-0 max-w-[70%] flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                {showSenderNames && !isMe && startsGroup && (
                  <span className="mb-1 px-3 text-xs text-muted">{msg.senderName}</span>
                )}
                <div className={`max-w-full whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2 text-sm ${isMe ? 'bg-accent text-white' : 'bg-surface-2 text-fg'}`}>
                  {msg.text}
                </div>
                {endsGroup && <span className="mt-1 px-1 text-[11px] text-subtle">{formatTime(msg.createdAt)}</span>}
              </div>
            </div>
          </React.Fragment>
        );
      })}
      <div ref={endRef} />
    </div>
  );
};

export default MessageList;
