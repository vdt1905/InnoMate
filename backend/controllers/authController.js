// controllers/authController.js
import { User } from '../models/user.model.js';
import admin, { isFirebaseReady } from '../config/firebaseAdmin.js';
import generateToken from '../utils/generateToken.js';

const isProduction = () => process.env.NODE_ENV === 'production';

// Set and cleared with identical attributes — a mismatch here means the browser
// silently keeps the old cookie on logout.
const cookieOptions = () => ({
  httpOnly: true,
  secure: isProduction(),
  sameSite: isProduction() ? 'None' : 'Lax',
});

const sendSession = (res, user, status = 200, extra = {}) => {
  res.cookie('token', generateToken(user._id), {
    ...cookieOptions(),
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  res.status(status).json({ user, ...extra });
};

// FIREBASE AUTH (Handles Google, Email/Password, Email link)
// This is the only way an account is created or a session is issued: it is the
// single point where Firebase has already proven ownership of the address.
export const firebaseAuth = async (req, res) => {
  const { token, username: customUsername } = req.body;

  if (!token) {
    return res.status(400).json({ message: 'No token provided' });
  }

  // Without this the call fails deep inside the SDK with "the default Firebase
  // app does not exist", which says nothing about the actual misconfiguration.
  if (!isFirebaseReady) {
    return res.status(503).json({ message: 'Authentication is not configured on the server' });
  }

  try {
    // 1. Verify Token
    const decodedToken = await admin.auth().verifyIdToken(token);
    const { email, name, picture, uid, email_verified } = decodedToken;

    // 2. Check if user exists
    let user = await User.findOne({ email });

    if (user) {
      // Update existing user with latest info from Firebase
      if (!user.googleId) user.googleId = uid; // Link Firebase UID
      if (picture && !user.avatar) user.avatar = picture;
      await user.save();
    } else {
      // Create new user
      const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);

      let finalUsername = customUsername;

      // If no custom username or it's taken, fallback to email-based
      if (!finalUsername) {
        finalUsername = email.split('@')[0];
      }

      // Ensure username uniqueness (the model also enforces it)
      const checkUsername = await User.findOne({ username: finalUsername });
      if (checkUsername) {
        finalUsername = finalUsername + Math.floor(Math.random() * 1000);
      }

      user = await User.create({
        name: name || finalUsername,
        email,
        username: finalUsername,
        password: randomPassword, // Legacy field, random for Firebase users
        googleId: uid,
        avatar: picture || ''
      });
    }

    sendSession(res, user, 200, { emailVerified: email_verified });
  } catch (error) {
    console.error('Firebase auth error:', error);
    res.status(500).json({ message: 'Server error during Firebase auth', error: error.message });
  }
};

// RESOLVE EMAIL (For Username Login)
export const resolveEmail = async (req, res) => {
  const { username } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: 'Username not found' });
    }
    res.status(200).json({ email: user.email });
  } catch (error) {
    res.status(500).json({ message: 'Server error resolving email', error: error.message });
  }
};

// LOGOUT
export const logout = (req, res) => {
  res.clearCookie('token', cookieOptions());
  res.status(200).json({ message: 'Logged out' });
};
