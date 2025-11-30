import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    from_user_id: {type: String, required: true, ref: 'User'},
    to_user_id: {type: String, required: true, ref: 'User'},
    text: {type: String, default: ''},
    media_url: {type: String, default: ''},
    message_type: {type: String, enum: ['text', 'image'], default: 'text'},
    isRead: {type: Boolean, default: false},
    readAt: {type: Date, default: null},
}, {collection: 'messages', timestamps: true});

const Message = mongoose.model('Message', messageSchema, 'messages');

export default Message;
