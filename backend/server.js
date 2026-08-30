import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// Database connection
import { connectDB } from './DB/connectDB.js';

// Route imports
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import ideaRoutes from './routes/idea.routes.js'

// Middleware imports
import { errorHandler } from './middleware/errorHandler.js';

// Socket.io imports
import http from 'http';
import { Server } from 'socket.io';
import { socketHandler } from './socket/socketHandler.js';

// Load environment variables from .env file
dotenv.config();

// Define port for the server
const PORT = process.env.PORT || 5000;
console.log("Current NODE_ENV:", process.env.NODE_ENV);
console.log("Starting server on PORT:", PORT);

// Initialize Express app
const app = express();

// Render/Vercel put the app behind one proxy hop. Without this, req.ip is the
// proxy's address, so the rate limiter buckets every visitor together.
app.set('trust proxy', 1);

// Create HTTP server from the Express app
const server = http.createServer(app);

// Initialize Socket.io with CORS configuration
const allowedOrigins = [
  'https://innomate.vercel.app',
  'http://localhost:3000',
  'http://localhost:5173',
  process.env.CLIENT_URL,
].filter(Boolean);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  }
});

// Run Socket Handler to manage real-time connections
socketHandler(io);

// Global Middleware
// CORS configuration for Express routes
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

// Baseline security headers. crossOriginResourcePolicy is relaxed because the
// API is called from the separately-hosted frontend.
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// Parse JSON request bodies
app.use(express.json());
// Parse cookies from incoming requests
app.use(cookieParser());
// Parse URL-encoded request bodies (built into Express 5 — body-parser was
// imported without ever being declared as a dependency)
app.use(express.urlencoded({ extended: true }));

// Auth is the one surface worth throttling: it hits Firebase token
// verification and exposes username lookup.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many attempts, please try again later' },
});

// API Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ideas', ideaRoutes);

// Simple health check route
app.get("/ping", (req, res) => res.send("pong"));

// Unknown API paths should read as 404, not fall through to the SPA-style
// catch-all behaviour of the host.
app.use((req, res) => {
  res.status(404).json({ message: `Not found: ${req.method} ${req.originalUrl}` });
});

// Error handling middleware (should be last)
app.use(errorHandler);

// Bind the port first, then connect: a database outage should not stop the
// server from accepting requests (or from answering /ping).
server.listen(PORT, () => {
  console.log(`🚀 Server (Socket.io) is running on port ${PORT}`);
});

connectDB();

// Hosts send SIGTERM on deploy and restart; close in-flight work rather than
// dropping connections mid-request.
const shutdown = (signal) => {
  console.log(`${signal} received, shutting down.`);
  io.close();
  server.close(() => {
    mongoose.connection.close(false).finally(() => process.exit(0));
  });
  // Do not hang forever on a stuck connection.
  setTimeout(() => process.exit(1), 10000).unref();
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

export default app;