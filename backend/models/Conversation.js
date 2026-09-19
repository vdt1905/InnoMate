import mongoose from 'mongoose';

// A one-to-one conversation between two users.
const conversationSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
  // Both participant ids, sorted and joined. Unique, so a pair of people can
  // only ever have one conversation no matter who starts it.
  key: { type: String, required: true, unique: true },
  lastMessage: {
    text: String,
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: Date,
  },
  // userId -> when they last opened the conversation; drives the unread dot.
  lastReadAt: { type: Map, of: Date, default: {} },
}, { timestamps: true });

conversationSchema.index({ participants: 1, updatedAt: -1 });

export const conversationKey = (a, b) => [a.toString(), b.toString()].sort().join('_');

export const Conversation = mongoose.model('Conversation', conversationSchema);
