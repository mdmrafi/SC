import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    from_user_id: { type: String, required: true, ref: 'User' },
    to_user_id: { type: String, required: true, ref: 'User' },
    text: { type: String, default: '' },
    media_url: { type: String, default: '' },
    message_type: { type: String, enum: ['text', 'image', 'video'], default: 'text' },
    status: { type: String, enum: ['sent', 'delivered', 'read'], default: 'sent' },
    isRead: { type: Boolean, default: false },
    readAt: { type: Date, default: null },
    isDeleted: { type: Boolean, default: false },
    deletedFor: [{ type: String, ref: 'User' }], // Array of user IDs who deleted this message
    editedAt: { type: Date, default: null },
    originalText: { type: String, default: '' }, // Store original text if edited
}, { collection: 'messages', timestamps: true });

// Indexes for better query performance
// Indexes for better query performance
messageSchema.index({ from_user_id: 1, to_user_id: 1, createdAt: -1 });
messageSchema.index({ to_user_id: 1, from_user_id: 1, createdAt: -1 }); // Index for reverse query direction
messageSchema.index({ to_user_id: 1, isRead: 1 });
messageSchema.index({ createdAt: -1 });

const Message = mongoose.model('Message', messageSchema, 'messages');

export default Message;
