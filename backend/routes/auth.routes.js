import express from 'express';
const router = express.Router();
import { register, login, logout, firebaseAuth, resolveEmail } from '../controllers/authController.js';

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/firebase', firebaseAuth); // Endpoint for all Firebase logins (Google, Email/Pass)
router.post('/resolve-email', resolveEmail);
// Keeping /google for backward compat if needed, but better to migrate
// router.post('/google', firebaseAuth);

export default router;
