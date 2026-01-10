import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import { connectDB } from './DB/connectDB.js';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import ideaRoutes from './routes/idea.routes.js'
import { errorHandler } from './middleware/errorHandler.js';


import http from 'http';
import { Server } from 'socket.io';
import { socketHandler } from './socket/socketHandler.js';

dotenv.config();
const PORT = process.env.PORT || 5000;
const app = express();

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true,
  }
});

// Run Socket Handler
socketHandler(io);

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
}));


app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ideas', ideaRoutes);


app.get("/ping", (req, res) => res.send("pong"));

app.use(errorHandler);


// Conditional listen for local development
if (process.env.NODE_ENV !== 'production') {
  connectDB().then(() => {
    server.listen(PORT, () => {
      console.log(`🚀 Server (Socket.io) is running on http://localhost:${PORT}`);
    });
  });
} else {
  // For Vercel, we need to connect to DB on every request (or rely on cached connection)
  connectDB();
}

// Export the Express API
export default app;