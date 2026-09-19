import mongoose from 'mongoose';

const directMessageSchema = new mongoose.Schema({
  conversation: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true, trim: true, maxlength: 2000 },
}, { timestamps: true });

// History is always read per conversation in time order.
directMessageSchema.index({ conversation: 1, createdAt: 1 });

export const DirectMessage = mongoose.model('DirectMessage', directMessageSchema);
