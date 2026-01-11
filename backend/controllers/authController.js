// controllers/authController.js
import { User } from '../models/user.model.js';
import generateToken from '../utils/generateToken.js';

// REGISTER
export const register = async (req, res) => {
  const { username, name, email, password } = req.body;

  const exists = await User.findOne({ email });
  const userexist = await User.findOne({ username });

  if (exists || userexist) {
    return res.status(400).json({ message: 'User already exists' });
  }


  const user = await User.create({ username, name, email, password });

  const token = generateToken(user._id);

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });


  res.status(201).json({ user });
};

// LOGIN
export const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = generateToken(user._id);

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });


  res.status(200).json({ user });
};

// LOGOUT
export const logout = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    sameSite: 'Strict',
    secure: process.env.NODE_ENV === 'production',
  });
  res.status(200).json({ message: 'Logged out' });
};


import admin from '../config/firebaseAdmin.js';


// FIREBASE AUTH (Handles Google, Email/Password, etc.)
export const firebaseAuth = async (req, res) => {
  const { token, username: customUsername } = req.body; // Accept custom username

  if (!token) {
    return res.status(400).json({ message: "No token provided" });
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

      // Ensure specific username uniqueness if custom one provided too
      // (The model usually has unique: true, so create would fail if dup)
      // Let's do a quick check to be safe/friendly
      const checkUsername = await User.findOne({ username: finalUsername });
      if (checkUsername) {
        // If custom was taken, throw error? Or append number?
        // For now, append number to ensure creation
        finalUsername = finalUsername + Math.floor(Math.random() * 1000);
      }

      user = await User.create({
        name: name || finalUsername,
        email,
        username: finalUsername,
        password: randomPassword, // Legacy field, random for Firebase users
        googleId: uid,
        avatar: picture || ""
      });
    }

    const jwtToken = generateToken(user._id);

    res.cookie('token', jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ user, emailVerified: email_verified });
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
