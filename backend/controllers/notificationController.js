import { Notification } from '../models/Notification.js';

const LIMIT = 50;

// GET /api/notifications
export const getNotifications = async (req, res) => {
  const notifications = await Notification.find({ recipient: req.user._id })
    .sort({ createdAt: -1 })
    .limit(LIMIT)
    .populate('actor', 'name username avatar')
    .populate('idea', 'title')
    .populate('joinRequest', 'status type');

  // Drop ones whose project was deleted since.
  const items = notifications.filter((n) => n.idea);
  const unread = items.filter((n) => !n.read).length;

  res.status(200).json({ notifications: items, unread });
};

// POST /api/notifications/read — mark everything read (opening the panel).
export const markAllRead = async (req, res) => {
  await Notification.updateMany({ recipient: req.user._id, read: false }, { $set: { read: true } });
  res.status(204).end();
};
