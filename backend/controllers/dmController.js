import mongoose from 'mongoose';
import { Conversation, conversationKey } from '../models/Conversation.js';
import { DirectMessage } from '../models/DirectMessage.js';
import { User } from '../models/user.model.js';

const PUBLIC_USER_FIELDS = 'name username avatar';
const HISTORY_LIMIT = 200;

const isParticipant = (conversation, userId) =>
  conversation.participants.some((p) => (p._id || p).toString() === userId.toString());

// Shape a conversation for the viewer: who the other person is and whether
// there's something they haven't read yet.
const present = (conversation, viewerId) => {
  const me = viewerId.toString();
  const other = conversation.participants.find((p) => (p._id || p).toString() !== me);
  const last = conversation.lastMessage;
  const readAt = conversation.lastReadAt?.get?.(me);
  const unread = Boolean(
    last?.createdAt &&
    last.sender?.toString() !== me &&
    (!readAt || new Date(readAt) < new Date(last.createdAt))
  );

  return {
    _id: conversation._id,
    other,
    lastMessage: last?.createdAt ? last : null,
    unread,
    updatedAt: conversation.updatedAt,
  };
};

const loadConversation = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    res.status(404).json({ message: 'Conversation not found' });
    return null;
  }
  const conversation = await Conversation.findById(id).populate('participants', PUBLIC_USER_FIELDS);
  // Same response for "doesn't exist" and "not yours", so ids can't be probed.
  if (!conversation || !isParticipant(conversation, req.user._id)) {
    res.status(404).json({ message: 'Conversation not found' });
    return null;
  }
  return conversation;
};

// GET /api/messages/conversations
export const listConversations = async (req, res) => {
  const conversations = await Conversation.find({ participants: req.user._id })
    .sort({ updatedAt: -1 })
    .populate('participants', PUBLIC_USER_FIELDS);

  // Conversations opened but never used would just be noise in the inbox.
  const items = conversations
    .map((c) => present(c, req.user._id))
    .filter((c) => c.lastMessage && c.other);

  res.status(200).json(items);
};

// POST /api/messages/conversations  { userId }
// Returns the existing conversation with that person, or starts one.
export const openConversation = async (req, res) => {
  const { userId } = req.body || {};

  if (!mongoose.isValidObjectId(userId)) {
    return res.status(400).json({ message: 'A valid userId is required' });
  }
  if (userId.toString() === req.user._id.toString()) {
    return res.status(400).json({ message: "You can't message yourself" });
  }

  const other = await User.findById(userId).select('_id');
  if (!other) return res.status(404).json({ message: 'User not found' });

  const key = conversationKey(req.user._id, other._id);
  // Upsert on the unique key makes two people opening a chat at the same
  // moment converge on one conversation instead of creating two.
  const conversation = await Conversation.findOneAndUpdate(
    { key },
    { $setOnInsert: { key, participants: [req.user._id, other._id] } },
    { new: true, upsert: true }
  ).populate('participants', PUBLIC_USER_FIELDS);

  res.status(200).json(present(conversation, req.user._id));
};

// GET /api/messages/conversations/:id
// The conversation plus its recent history; opening it marks it read.
export const getConversation = async (req, res) => {
  const conversation = await loadConversation(req, res);
  if (!conversation) return;

  const recent = await DirectMessage.find({ conversation: conversation._id })
    .sort({ createdAt: -1 })
    .limit(HISTORY_LIMIT);

  conversation.lastReadAt.set(req.user._id.toString(), new Date());
  await conversation.save({ timestamps: false });

  res.status(200).json({
    conversation: present(conversation, req.user._id),
    messages: recent.reverse(),
  });
};

// POST /api/messages/conversations/:id/messages  { text }
export const sendMessage = async (req, res) => {
  const conversation = await loadConversation(req, res);
  if (!conversation) return;

  const text = typeof req.body?.text === 'string' ? req.body.text.trim() : '';
  if (!text) return res.status(400).json({ message: 'Message cannot be empty' });
  if (text.length > 2000) return res.status(400).json({ message: 'Message is too long (2000 characters max)' });

  const message = await DirectMessage.create({
    conversation: conversation._id,
    sender: req.user._id,
    text,
  });

  conversation.lastMessage = { text, sender: req.user._id, createdAt: message.createdAt };
  // Sending implies you've read everything up to now.
  conversation.lastReadAt.set(req.user._id.toString(), message.createdAt);
  await conversation.save();

  // Push to every open tab of both people; each user's sockets join user:<id>.
  const io = req.app.get('io');
  if (io) {
    for (const participant of conversation.participants) {
      io.to(`user:${participant._id}`).emit('dm:message', {
        conversationId: conversation._id.toString(),
        message,
      });
    }
  }

  res.status(201).json(message);
};

// POST /api/messages/conversations/:id/read
export const markRead = async (req, res) => {
  const conversation = await loadConversation(req, res);
  if (!conversation) return;

  conversation.lastReadAt.set(req.user._id.toString(), new Date());
  await conversation.save({ timestamps: false });
  res.status(204).end();
};
