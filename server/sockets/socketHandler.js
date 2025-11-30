import Message from '../models/Message.js';
import User from '../models/User.js';

// Store active users
const activeUsers = new Map();

export const setupSocketIO = (io) => {
    io.on('connection', (socket) => {
        console.log('New user connected:', socket.id);

        // User joins
        socket.on('user-join', (userId) => {
            activeUsers.set(userId, socket.id);
            io.emit('user-status-changed', {
                userId,
                status: 'online',
                activeUsers: Array.from(activeUsers.keys())
            });
        });

        // User typing
        socket.on('user-typing', (data) => {
            const recipientSocketId = activeUsers.get(data.to_user_id);
            if (recipientSocketId) {
                io.to(recipientSocketId).emit('user-typing', {
                    from_user_id: data.from_user_id,
                    to_user_id: data.to_user_id
                });
            }
        });

        // Send message
        socket.on('send-message', async (data) => {
            try {
                const message = new Message({
                    from_user_id: data.from_user_id,
                    to_user_id: data.to_user_id,
                    text: data.text,
                    media_url: data.media_url,
                    message_type: data.message_type || 'text'
                });

                await message.save();
                await message.populate('from_user_id', 'full_name username profile_picture');

                // Send to recipient if online
                const recipientSocketId = activeUsers.get(data.to_user_id);
                if (recipientSocketId) {
                    io.to(recipientSocketId).emit('message-received', message);
                }

                // Send confirmation to sender
                socket.emit('message-sent', message);
            } catch (error) {
                socket.emit('message-error', { message: error.message });
            }
        });

        // Mark message as read
        socket.on('message-read', async (messageId) => {
            try {
                const message = await Message.findByIdAndUpdate(
                    messageId,
                    {
                        isRead: true,
                        readAt: new Date()
                    },
                    {new: true}
                );

                // Notify sender
                const senderSocketId = activeUsers.get(message.from_user_id);
                if (senderSocketId) {
                    io.to(senderSocketId).emit('message-read-notification', {
                        messageId,
                        readAt: message.readAt
                    });
                }
            } catch (error) {
                socket.emit('error', { message: error.message });
            }
        });

        // User status changes
        socket.on('user-status', async (data) => {
            try {
                await User.findByIdAndUpdate(data.userId, {
                    lastSeen: new Date()
                });

                io.emit('user-status-changed', {
                    userId: data.userId,
                    status: data.status,
                    lastSeen: new Date()
                });
            } catch (error) {
                console.log(error);
            }
        });

        // Disconnect
        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
            
            // Find and remove the user
            for (let [userId, socketId] of activeUsers.entries()) {
                if (socketId === socket.id) {
                    activeUsers.delete(userId);
                    io.emit('user-status-changed', {
                        userId,
                        status: 'offline',
                        activeUsers: Array.from(activeUsers.keys())
                    });
                    break;
                }
            }
        });

        // Handle errors
        socket.on('error', (error) => {
            console.error('Socket error:', error);
        });
    });
};

export { activeUsers };
