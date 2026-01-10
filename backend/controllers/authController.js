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



