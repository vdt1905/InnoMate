import { Message } from '../models/Message.js';
import { Idea } from '../models/Idea.js';
import { getUserFromToken } from '../middleware/authMiddleware.js';

// Minimal cookie header parser — the handshake does not run Express middleware.
const parseCookies = (header = '') =>
    header.split(';').reduce((acc, part) => {
        const idx = part.indexOf('=');
        if (idx === -1) return acc;
        acc[part.slice(0, idx).trim()] = decodeURIComponent(part.slice(idx + 1).trim());
        return acc;
    }, {});

// Owner or accepted member of the project this room belongs to.
const isTeamMember = async (teamId, userId) => {
    const idea = await Idea.findById(teamId).select('createdBy teamMembers');
    if (!idea) return false;
    return (
        idea.createdBy.toString() === userId.toString() ||
        idea.teamMembers.some((m) => m.toString() === userId.toString())
    );
};

export const socketHandler = (io) => {
    // Authenticate the handshake: the client connects with withCredentials, so
    // the same session cookie the REST API uses is available here.
    io.use(async (socket, next) => {
        const { token } = parseCookies(socket.handshake.headers.cookie);
        const user = await getUserFromToken(token);

        if (!user) return next(new Error('Not authorized'));

        socket.user = user;
        next();
    });

    io.on('connection', (socket) => {
        console.log('A user connected:', socket.id, socket.user.username);

        socket.on('joinRoom', async (teamId) => {
            // Without this check any signed-in user could listen in on any
            // team's chat just by knowing the project id.
            if (!(await isTeamMember(teamId, socket.user._id))) {
                socket.emit('chatError', { message: 'You are not a member of this team' });
                return;
            }
            socket.join(teamId.toString());
        });

        socket.on('sendMessage', async (data) => {
            const { teamId, text } = data || {};

            if (!teamId || !text?.trim()) return;

            try {
                if (!(await isTeamMember(teamId, socket.user._id))) {
                    socket.emit('chatError', { message: 'You are not a member of this team' });
                    return;
                }

                // Sender identity comes from the session, never from the client
                // payload, which could otherwise impersonate any user.
                const newMessage = await Message.create({
                    teamId,
                    senderId: socket.user._id,
                    reqSender: {
                        name: socket.user.name,
                        username: socket.user.username,
                        avatar: socket.user.avatar
                    },
                    text: text.trim()
                });

                // Broadcast to room (including sender, for simple optimistic UI confirmation)
                io.to(teamId.toString()).emit('receiveMessage', newMessage);
            } catch (error) {
                console.error('Error sending message:', error);
                socket.emit('chatError', { message: 'Failed to send message' });
            }
        });

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });
    });
};
