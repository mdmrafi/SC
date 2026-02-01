import Message from '../models/Message.js';
import User from '../models/User.js';

export const sendMessage = async (req, res) => {
  try {
    const { to_user_id, text, media_url, message_type } = req.body;

    console.log('📨 Send message request:', { to_user_id, text: text?.substring(0, 50), media_url: media_url?.substring(0, 50), message_type });

    if (!to_user_id) return res.status(400).json({ success: false, message: 'Recipient ID is required' });
    if (!text && !media_url) return res.status(400).json({ success: false, message: 'Message content is required' });

    // Verify recipient exists
    const recipient = await User.findById(to_user_id);
    if (!recipient) return res.status(404).json({ success: false, message: 'Recipient not found' });

    const message = new Message({
      from_user_id: req.userId,
      to_user_id,
      text,
      media_url,
      message_type: message_type || 'text',
      status: 'sent'
    });

    console.log('💾 Saving message...');
    await message.save();
    console.log('✅ Message saved');

    await message.populate('from_user_id', 'full_name username profile_picture');
    await message.populate('to_user_id', 'full_name username profile_picture');

    // Emit socket event for real-time delivery
    if (req.app.get('io')) {
      const io = req.app.get('io');
      const activeUsers = req.app.get('activeUsers') || new Map();
      const recipientSocketId = activeUsers.get(to_user_id);

      if (recipientSocketId) {
        // Update status to delivered if recipient is online
        message.status = 'delivered';
        await message.save();
        io.to(recipientSocketId).emit('message-received', message);
      }
    }

    return res.status(201).json({ success: true, message: 'Message sent', data: message });
  } catch (error) {
    console.error('❌ Send message error:', error);
    console.error('❌ Error stack:', error.stack);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getConversation = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 30 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const messages = await Message.find({
      $or: [
        { from_user_id: req.userId, to_user_id: userId, isDeleted: false },
        { from_user_id: userId, to_user_id: req.userId, isDeleted: false }
      ],
      deletedFor: { $ne: req.userId }
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean(); // Use lean for performance

    // Fetch users manually to avoid N+1 populate overhead
    const [currentUser, otherUser] = await Promise.all([
      User.findById(req.userId).select('full_name username profile_picture').lean(),
      User.findById(userId).select('full_name username profile_picture').lean()
    ]);

    // Map users to messages
    const populatedMessages = messages.map(msg => ({
      ...msg,
      from_user_id: msg.from_user_id.toString() === req.userId ? currentUser : otherUser,
      to_user_id: msg.to_user_id.toString() === req.userId ? currentUser : otherUser
    }));

    // Reverse to show oldest first
    populatedMessages.reverse();

    return res.status(200).json({
      success: true,
      messages: populatedMessages,
      page: parseInt(page),
      hasMore: messages.length === parseInt(limit)
    });
  } catch (error) {
    console.error('Get conversation error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getConversations = async (req, res) => {
  try {
    // Get all unique conversation partners
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { from_user_id: req.userId },
            { to_user_id: req.userId }
          ],
          isDeleted: false,
          deletedFor: { $ne: req.userId }
        }
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$from_user_id', req.userId] },
              '$to_user_id',
              '$from_user_id'
            ]
          },
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$to_user_id', req.userId] },
                    { $eq: ['$isRead', false] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      },
      { $sort: { 'lastMessage.createdAt': -1 } }
    ]);

    // Populate user details
    // Populate user details efficiently
    const partnerIds = conversations.map(c => c._id);
    const users = await User.find({ _id: { $in: partnerIds } }).select('full_name username profile_picture bio lastSeen');

    const userMap = new Map(users.map(u => [u._id.toString(), u]));

    const populatedConversations = conversations.map(conv => {
      return {
        ...conv,
        user: userMap.get(conv._id.toString()) || null
      };
    });

    return res.status(200).json({ success: true, conversations: populatedConversations });
  } catch (error) {
    console.error('Get conversations error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);
    if (!message) return res.status(404).json({ success: false, message: 'Message not found' });

    // Only recipient can mark as read
    if (message.to_user_id !== req.userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    message.isRead = true;
    message.readAt = new Date();
    message.status = 'read';
    await message.save();

    // Emit socket event to sender
    if (req.app.get('io')) {
      const io = req.app.get('io');
      const activeUsers = req.app.get('activeUsers') || new Map();
      const senderSocketId = activeUsers.get(message.from_user_id);

      if (senderSocketId) {
        io.to(senderSocketId).emit('message-read-notification', {
          messageId: message._id,
          readAt: message.readAt
        });
      }
    }

    return res.status(200).json({ success: true, message });
  } catch (error) {
    console.error('Mark as read error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const markConversationAsRead = async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await Message.updateMany(
      {
        from_user_id: userId,
        to_user_id: req.userId,
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

    // Emit socket event to sender
    if (req.app.get('io')) {
      const io = req.app.get('io');
      const activeUsers = req.app.get('activeUsers') || new Map();
      const senderSocketId = activeUsers.get(userId);

      if (senderSocketId) {
        io.to(senderSocketId).emit('conversation-read', {
          userId: req.userId,
          readAt: new Date()
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Conversation marked as read',
      count: result.modifiedCount
    });
  } catch (error) {
    console.error('Mark conversation as read error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);
    if (!message) return res.status(404).json({ success: false, message: 'Message not found' });

    // Only sender can delete
    if (message.from_user_id !== req.userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    // Soft delete - add user to deletedFor array
    if (!message.deletedFor.includes(req.userId)) {
      message.deletedFor.push(req.userId);
    }

    // If both users deleted, mark as fully deleted
    if (message.deletedFor.length >= 2) {
      message.isDeleted = true;
    }

    await message.save();

    return res.status(200).json({ success: true, message: 'Message deleted' });
  } catch (error) {
    console.error('Delete message error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteConversation = async (req, res) => {
  try {
    const { userId } = req.params;

    // Soft delete all messages in conversation for this user
    const result = await Message.updateMany(
      {
        $or: [
          { from_user_id: req.userId, to_user_id: userId },
          { from_user_id: userId, to_user_id: req.userId }
        ],
        deletedFor: { $ne: req.userId }
      },
      {
        $addToSet: { deletedFor: req.userId }
      }
    );

    return res.status(200).json({
      success: true,
      message: 'Conversation deleted',
      count: result.modifiedCount
    });
  } catch (error) {
    console.error('Delete conversation error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const editMessage = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim() === '') {
      return res.status(400).json({ success: false, message: 'Message text is required' });
    }

    const message = await Message.findById(req.params.messageId);
    if (!message) return res.status(404).json({ success: false, message: 'Message not found' });

    // Only sender can edit
    if (message.from_user_id !== req.userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    // Can't edit image messages
    if (message.message_type === 'image') {
      return res.status(400).json({ success: false, message: 'Cannot edit image messages' });
    }

    // Store original text if not already stored
    if (!message.originalText) {
      message.originalText = message.text;
    }

    message.text = text;
    message.editedAt = new Date();
    await message.save();

    await message.populate('from_user_id', 'full_name username profile_picture');
    await message.populate('to_user_id', 'full_name username profile_picture');

    // Emit socket event
    if (req.app.get('io')) {
      const io = req.app.get('io');
      const activeUsers = req.app.get('activeUsers') || new Map();
      const recipientSocketId = activeUsers.get(message.to_user_id);

      if (recipientSocketId) {
        io.to(recipientSocketId).emit('message-edited', message);
      }
    }

    return res.status(200).json({ success: true, message, data: message });
  } catch (error) {
    console.error('Edit message error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getUnreadCount = async (req, res) => {
  try {
    const count = await Message.countDocuments({
      to_user_id: req.userId,
      isRead: false
    });

    return res.status(200).json({ success: true, count });
  } catch (error) {
    console.error('Get unread count error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export default {
  sendMessage,
  getConversation,
  getConversations,
  markAsRead,
  markConversationAsRead,
  deleteMessage,
  deleteConversation,
  editMessage,
  getUnreadCount
};
