import express from 'express';
const router = express.Router();
import { logout, firebaseAuth, resolveEmail } from '../controllers/authController.js';

// All sign-in and sign-up goes through Firebase, which is what proves the user
// owns the email address. There is deliberately no password endpoint here.
router.post('/firebase', firebaseAuth);
router.post('/resolve-email', resolveEmail);
router.post('/logout', logout);

export default router;
