import Message from '../models/Message.js';
import User from '../models/User.js';

// Store active users
const activeUsers = new Map();

// Store typing timeouts
const typingTimeouts = new Map();

export const setupSocketIO = (io) => {
    io.on('connection', (socket) => {
        console.log('New user connected:', socket.id);

        // User joins
        socket.on('user-join', async (userId) => {
            try {
                activeUsers.set(userId, socket.id);

                // Update user's lastSeen
                await User.findByIdAndUpdate(userId, { lastSeen: new Date() });

                io.emit('user-status-changed', {
                    userId,
                    status: 'online',
                    activeUsers: Array.from(activeUsers.keys())
                });

                console.log(`User ${userId} joined. Active users: ${activeUsers.size}`);
            } catch (error) {
                console.error('User join error:', error);
                socket.emit('error', { message: 'Failed to join' });
            }
        });

        // User typing
        socket.on('user-typing', (data) => {
            try {
                const recipientSocketId = activeUsers.get(data.to_user_id);
                if (recipientSocketId) {
                    io.to(recipientSocketId).emit('user-typing', {
                        from_user_id: data.from_user_id,
                        to_user_id: data.to_user_id,
                        isTyping: true
                    });

                    // Clear existing timeout
                    const timeoutKey = `${data.from_user_id}-${data.to_user_id}`;
                    if (typingTimeouts.has(timeoutKey)) {
                        clearTimeout(typingTimeouts.get(timeoutKey));
                    }

                    // Set new timeout to stop typing after 3 seconds
                    const timeout = setTimeout(() => {
                        if (recipientSocketId) {
                            io.to(recipientSocketId).emit('user-typing', {
                                from_user_id: data.from_user_id,
                                to_user_id: data.to_user_id,
                                isTyping: false
                            });
                        }
                        typingTimeouts.delete(timeoutKey);
                    }, 3000);

                    typingTimeouts.set(timeoutKey, timeout);
                }
            } catch (error) {
                console.error('Typing indicator error:', error);
            }
        });

        // Send message via socket
        socket.on('send-message', async (data) => {
            try {
                const message = new Message({
                    from_user_id: data.from_user_id,
                    to_user_id: data.to_user_id,
                    text: data.text,
                    media_url: data.media_url,
                    message_type: data.message_type || 'text',
                    status: 'sent'
                });

                await message.save();
                await message.populate('from_user_id', 'full_name username profile_picture');
                await message.populate('to_user_id', 'full_name username profile_picture');

                // Check if recipient is online
                const recipientSocketId = activeUsers.get(data.to_user_id);
                if (recipientSocketId) {
                    // Update status to delivered
                    message.status = 'delivered';
                    await message.save();

                    // Send to recipient
                    io.to(recipientSocketId).emit('message-received', message);
                }

                // Send confirmation to sender
                socket.emit('message-sent', message);
            } catch (error) {
                console.error('Send message error:', error);
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
                        readAt: new Date(),
                        status: 'read'
                    },
                    { new: true }
                );

                if (!message) {
                    socket.emit('error', { message: 'Message not found' });
                    return;
                }

                // Notify sender
                const senderSocketId = activeUsers.get(message.from_user_id);
                if (senderSocketId) {
                    io.to(senderSocketId).emit('message-read-notification', {
                        messageId,
                        readAt: message.readAt
                    });
                }
            } catch (error) {
                console.error('Mark as read error:', error);
                socket.emit('error', { message: error.message });
            }
        });

        // Mark conversation as read
        socket.on('conversation-read', async (data) => {
            try {
                const { userId } = data; // The user whose messages we're marking as read

                await Message.updateMany(
                    {
                        from_user_id: userId,
                        to_user_id: data.currentUserId,
                        isRead: false
                    },
                    {
                        $set: {
                            isRead: true,
                            readAt: new Date(),
                            status: 'read'
                        }
                    }
                );

                // Notify the sender
                const senderSocketId = activeUsers.get(userId);
                if (senderSocketId) {
                    io.to(senderSocketId).emit('conversation-read', {
                        userId: data.currentUserId,
                        readAt: new Date()
                    });
                }
            } catch (error) {
                console.error('Mark conversation as read error:', error);
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
                console.error('User status error:', error);
            }
        });

        // Disconnect
        socket.on('disconnect', async () => {
            console.log('User disconnected:', socket.id);

            // Find and remove the user
            for (let [userId, socketId] of activeUsers.entries()) {
                if (socketId === socket.id) {
                    activeUsers.delete(userId);

                    // Update lastSeen in database
                    try {
                        await User.findByIdAndUpdate(userId, {
                            lastSeen: new Date()
                        });
                    } catch (error) {
                        console.error('Update lastSeen error:', error);
                    }

                    io.emit('user-status-changed', {
                        userId,
                        status: 'offline',
                        lastSeen: new Date(),
                        activeUsers: Array.from(activeUsers.keys())
                    });

                    // Clear any typing timeouts for this user
                    for (let [key, timeout] of typingTimeouts.entries()) {
                        if (key.startsWith(userId)) {
                            clearTimeout(timeout);
                            typingTimeouts.delete(key);
                        }
                    }

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
