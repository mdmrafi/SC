import express from 'express';
import Message from '../models/Message.js';
import User from '../models/User.js';
import { verifyClerkUser } from '../middleware/auth.js';

const router = express.Router();

// Send message
router.post('/send', verifyClerkUser, async (req, res) => {
    try {
        const { to_user_id, text, media_url, message_type } = req.body;
        
        if (!to_user_id) {
            return res.status(400).json({success: false, message: 'Recipient ID is required'});
        }
        
        if (!text && !media_url) {
            return res.status(400).json({success: false, message: 'Message content is required'});
        }

        const message = new Message({
            from_user_id: req.userId,
            to_user_id,
            text,
            media_url,
            message_type: message_type || 'text'
        });

        await message.save();
        
        // Populate sender info
        await message.populate('from_user_id', 'full_name username profile_picture');

        return res.status(201).json({success: true, message: 'Message sent', data: message});
    } catch (error) {
        return res.status(500).json({success: false, message: error.message});
    }
});

// Get conversation between two users
router.get('/conversation/:userId', verifyClerkUser, async (req, res) => {
    try {
        const messages = await Message.find({
            $or: [
                { from_user_id: req.userId, to_user_id: req.params.userId },
                { from_user_id: req.params.userId, to_user_id: req.userId }
            ]
        })
        .sort({ createdAt: 1 })
        .populate('from_user_id', 'full_name username profile_picture')
        .populate('to_user_id', 'full_name username profile_picture');

        return res.status(200).json({success: true, messages});
    } catch (error) {
        return res.status(500).json({success: false, message: error.message});
    }
});

// Get all conversations (latest message from each user)
router.get('/conversations', verifyClerkUser, async (req, res) => {
    try {
        const conversations = await Message.aggregate([
            {
                $match: {
                    $or: [
                        { from_user_id: req.userId },
                        { to_user_id: req.userId }
                    ]
                }
            },
            {
                $sort: { createdAt: -1 }
            },
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
                                { $and: [
                                    { $eq: ['$to_user_id', req.userId] },
                                    { $eq: ['$isRead', false] }
                                ]},
                                1,
                                0
                            ]
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            {
                $unwind: '$user'
            },
            {
                $sort: { 'lastMessage.createdAt': -1 }
            }
        ]);

        return res.status(200).json({success: true, conversations});
    } catch (error) {
        return res.status(500).json({success: false, message: error.message});
    }
});

// Mark message as read
router.put('/mark-read/:messageId', verifyClerkUser, async (req, res) => {
    try {
        const message = await Message.findByIdAndUpdate(
            req.params.messageId,
            {
                isRead: true,
                readAt: new Date()
            },
            {new: true}
        );

        if (!message) {
            return res.status(404).json({success: false, message: 'Message not found'});
        }

        return res.status(200).json({success: true, message});
    } catch (error) {
        return res.status(500).json({success: false, message: error.message});
    }
});

// Delete message
router.delete('/:messageId', verifyClerkUser, async (req, res) => {
    try {
        const message = await Message.findById(req.params.messageId);

        if (!message) {
            return res.status(404).json({success: false, message: 'Message not found'});
        }

        if (message.from_user_id !== req.userId) {
            return res.status(403).json({success: false, message: 'Unauthorized'});
        }

        await Message.findByIdAndDelete(req.params.messageId);

        return res.status(200).json({success: true, message: 'Message deleted'});
    } catch (error) {
        return res.status(500).json({success: false, message: error.message});
    }
});

export default router;
