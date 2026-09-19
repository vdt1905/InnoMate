import { Notification } from '../models/Notification.js';

// Record a notification and push it to the recipient's open tabs. Never throws:
// a failed notification must not undo the action that triggered it.
export const notify = async (req, { recipient, actor, type, idea, joinRequest }) => {
  if (!recipient || recipient.toString() === actor?.toString()) return;

  try {
    const notification = await Notification.create({ recipient, actor, type, idea, joinRequest });
    req.app.get('io')?.to(`user:${recipient}`).emit('notification:new', { _id: notification._id, type });
  } catch (err) {
    console.error('Failed to create notification:', err.message);
  }
};
