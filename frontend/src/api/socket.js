// src/api/socket.js
import { io } from 'socket.io-client';

// Same host as the REST API, minus the /api suffix.
const SOCKET_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/api\/?$/, '') || 'http://localhost:5000';

let socket = null;

// One authenticated connection for the whole signed-in session. The server
// puts it in a personal room, so direct messages arrive wherever you are.
export const getSocket = () => {
  if (!socket) socket = io(SOCKET_URL, { withCredentials: true });
  return socket;
};

// Called on logout so the next account doesn't inherit this session's room.
export const disconnectSocket = () => {
  socket?.disconnect();
  socket = null;
};
