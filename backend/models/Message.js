import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    teamId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Idea',
        required: true
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    reqSender: {
        name: String,
        username: String,
        avatar: String
    },
    text: {
        type: String,
        required: true
    }
}, { timestamps: true });

export const Message = mongoose.model('Message', messageSchema);
