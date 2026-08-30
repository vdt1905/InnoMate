import mongoose from 'mongoose';

const joinRequestSchema = new mongoose.Schema({
  ideaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Idea',
    required: true
  },
  projectTitle: {
    type: String,
    required: true
  },
  leaderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  leaderName: {
    type: String,
    required: true
  },
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  requesterName: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  }
}, { timestamps: true });

// A user can only ever have one request per project — the controller re-opens
// the existing row rather than inserting a second one.
joinRequestSchema.index({ ideaId: 1, requester: 1 }, { unique: true });
joinRequestSchema.index({ ideaId: 1, status: 1 });

export const JoinRequest = mongoose.model('JoinRequest', joinRequestSchema);
