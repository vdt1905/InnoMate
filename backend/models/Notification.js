import mongoose from 'mongoose';

export const NOTIFICATION_TYPES = [
  'invite',            // a leader invited you to their project (actionable)
  'join_request',      // someone asked to join your project (actionable)
  'request_accepted',  // your request to join was accepted
  'request_declined',  // your request to join was declined
  'invite_accepted',   // someone accepted your invite
  'invite_declined',   // someone declined your invite
];

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: { type: String, enum: NOTIFICATION_TYPES, required: true },
  idea: { type: mongoose.Schema.Types.ObjectId, ref: 'Idea' },
  // For actionable types; its live status tells the UI whether the
  // Accept/Decline buttons still apply.
  joinRequest: { type: mongoose.Schema.Types.ObjectId, ref: 'JoinRequest' },
  read: { type: Boolean, default: false },
}, { timestamps: true });

notificationSchema.index({ recipient: 1, createdAt: -1 });

export const Notification = mongoose.model('Notification', notificationSchema);
