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
console.log("Current NODE_ENV:", process.env.NODE_ENV);
console.log("Starting server on PORT:", PORT);
const app = express();

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: ['https://innomate.vercel.app', 'http://localhost:3000', 'http://localhost:5173'],
    credentials: true,
  }
});

// Run Socket Handler
socketHandler(io);

app.use(cors({
  origin: ['https://innomate.vercel.app', 'http://localhost:3000', 'http://localhost:5173', process.env.CLIENT_URL],
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
// Conditional listen for local development (and local production test)
// Only skip this if we are strictly on Vercel (VERCEL=1)
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
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