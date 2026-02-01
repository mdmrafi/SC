import express from 'express';
import ConnectionRequest from '../models/ConnectionRequest.js';
import User from '../models/User.js';
import { verifyClerkUser } from '../middleware/auth.js';

const router = express.Router();

// Send connection request
router.post('/send-request', verifyClerkUser, async (req, res) => {
    try {
        const { to_user_id, message } = req.body;

        if (!to_user_id) {
            return res.status(400).json({ success: false, message: 'Recipient ID is required' });
        }

        if (req.userId === to_user_id) {
            return res.status(400).json({ success: false, message: 'Cannot send request to yourself' });
        }

        // Check if users are already connected
        const user = await User.findById(req.userId);
        if (user.connections.includes(to_user_id)) {
            return res.status(400).json({ success: false, message: 'Already connected' });
        }

        // Check for existing pending request
        const existingRequest = await ConnectionRequest.findOne({
            from_user_id: req.userId,
            to_user_id,
            status: 'pending'
        });

        if (existingRequest) {
            return res.status(400).json({ success: false, message: 'Request already sent' });
        }

        const connectionRequest = new ConnectionRequest({
            from_user_id: req.userId,
            to_user_id,
            message
        });

        await connectionRequest.save();
        await connectionRequest.populate('from_user_id', 'full_name username profile_picture');
        await connectionRequest.populate('to_user_id', 'full_name username profile_picture');

        return res.status(201).json({ success: true, message: 'Connection request sent', data: connectionRequest });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
});

// Get pending requests for current user
router.get('/pending-requests', verifyClerkUser, async (req, res) => {
    try {
        const requests = await ConnectionRequest.find({
            to_user_id: req.userId,
            status: 'pending'
        })
            .populate('from_user_id', 'full_name username profile_picture bio')
            .sort({ createdAt: -1 });

        return res.status(200).json({ success: true, requests });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
});

// Get sent requests
router.get('/sent-requests', verifyClerkUser, async (req, res) => {
    try {
        const requests = await ConnectionRequest.find({
            from_user_id: req.userId,
            status: 'pending'
        })
            .populate('to_user_id', 'full_name username profile_picture bio')
            .sort({ createdAt: -1 });

        return res.status(200).json({ success: true, requests });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
});

// Accept connection request
router.post('/accept-request/:requestId', verifyClerkUser, async (req, res) => {
    try {
        const request = await ConnectionRequest.findById(req.params.requestId);

        if (!request) {
            return res.status(404).json({ success: false, message: 'Request not found' });
        }

        if (request.to_user_id !== req.userId) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        // Update request status
        request.status = 'accepted';
        await request.save();

        // Add each other to connections
        await User.findByIdAndUpdate(req.userId, { $addToSet: { connections: request.from_user_id } });
        await User.findByIdAndUpdate(request.from_user_id, { $addToSet: { connections: req.userId } });

        await request.populate('from_user_id', 'full_name username profile_picture');
        await request.populate('to_user_id', 'full_name username profile_picture');

        return res.status(200).json({ success: true, message: 'Connection request accepted', data: request });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
});

// Decline connection request
router.post('/decline-request/:requestId', verifyClerkUser, async (req, res) => {
    try {
        const request = await ConnectionRequest.findById(req.params.requestId);

        if (!request) {
            return res.status(404).json({ success: false, message: 'Request not found' });
        }

        if (request.to_user_id !== req.userId) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        request.status = 'declined';
        await request.save();

        await request.populate('from_user_id', 'full_name username profile_picture');
        await request.populate('to_user_id', 'full_name username profile_picture');

        return res.status(200).json({ success: true, message: 'Connection request declined', data: request });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
});

// Cancel sent request
router.delete('/cancel-request/:requestId', verifyClerkUser, async (req, res) => {
    try {
        const request = await ConnectionRequest.findById(req.params.requestId);

        if (!request) {
            return res.status(404).json({ success: false, message: 'Request not found' });
        }

        if (request.from_user_id !== req.userId) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        await ConnectionRequest.findByIdAndDelete(req.params.requestId);

        return res.status(200).json({ success: true, message: 'Request cancelled' });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
});

// Get user connections
router.get('/:userId/connections', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId)
            .populate('connections', 'full_name username profile_picture bio');

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        return res.status(200).json({ success: true, connections: user.connections });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
});

// Get pending connection count
router.get('/pending-count', verifyClerkUser, async (req, res) => {
    try {
        const count = await ConnectionRequest.countDocuments({
            to_user_id: req.userId,
            status: 'pending'
        });

        return res.status(200).json({ success: true, count });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
