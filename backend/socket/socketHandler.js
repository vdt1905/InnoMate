import { Message } from '../models/Message.js';

export const socketHandler = (io) => {
    io.on('connection', (socket) => {
        console.log('A user connected:', socket.id);

        socket.on('joinRoom', (teamId) => {
            socket.join(teamId);
            // console.log(`User ${socket.id} joined room ${teamId}`);
        });

        socket.on('sendMessage', async (data) => {
            const { teamId, senderId, text, reqSender } = data;

            try {
                // Persist message to DB
                const newMessage = new Message({
                    teamId,
                    senderId,
                    reqSender,
                    text
                });
                await newMessage.save();

                // Broadcast to room (including sender, for simple optimistic UI confirmation)
                io.to(teamId).emit('receiveMessage', newMessage);

            } catch (error) {
                console.error('Error sending message:', error);
            }
        });

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });
    });
};
