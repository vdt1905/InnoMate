import jwt from 'jsonwebtoken';
import { User } from '../models/user.model.js';

// Resolves the signed-in user from a JWT, or null when the token is missing,
// invalid, or points at a user that no longer exists. Shared by the HTTP
// middleware and the Socket.io handshake.
export const getUserFromToken = async (token) => {
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return await User.findById(decoded.id).select('-password');
  } catch {
    return null;
  }
};

export const protect = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: 'Not authorized, no token' });

  const user = await getUserFromToken(token);
  // A deleted user with a still-valid token used to leave req.user null and
  // crash every downstream controller with a 500.
  if (!user) return res.status(401).json({ message: 'Not authorized, token failed' });

  req.user = user;
  next();
};
