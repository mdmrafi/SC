import express from 'express';
import User from '../models/User.js';
import { verifyClerkUser } from '../middleware/auth.js';

const router = express.Router();

// Get current user profile
router.get('/profile', verifyClerkUser, async (req, res) => {
    try {
        const user = await User.findById(req.userId)
            .populate('followers', 'full_name username profile_picture')
            .populate('following', 'full_name username profile_picture')
            .populate('connections', 'full_name username profile_picture');
        
        if (!user) {
            return res.status(404).json({success: false, message: 'User not found'});
        }
        
        return res.status(200).json({success: true, user});
    } catch (error) {
        return res.status(500).json({success: false, message: error.message});
    }
});

// Get user by ID
router.get('/:userId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId)
            .populate('followers', 'full_name username profile_picture')
            .populate('following', 'full_name username profile_picture')
            .populate('connections', 'full_name username profile_picture');
        
        if (!user) {
            return res.status(404).json({success: false, message: 'User not found'});
        }
        
        return res.status(200).json({success: true, user});
    } catch (error) {
        return res.status(500).json({success: false, message: error.message});
    }
});

// Update user profile
router.put('/update', verifyClerkUser, async (req, res) => {
    try {
        const { username, bio, location, department, year, cover_photo } = req.body;
        
        const user = await User.findByIdAndUpdate(
            req.userId,
            {
                username,
                bio,
                location,
                department,
                year,
                cover_photo
            },
            {new: true}
        );
        
        if (!user) {
            return res.status(404).json({success: false, message: 'User not found'});
        }
        
        return res.status(200).json({success: true, message: 'Profile updated', user});
    } catch (error) {
        return res.status(500).json({success: false, message: error.message});
    }
});

// Search users
router.get('/search/:query', async (req, res) => {
    try {
        const users = await User.find({
            $or: [
                { full_name: { $regex: req.params.query, $options: 'i' } },
                { username: { $regex: req.params.query, $options: 'i' } },
                { email: { $regex: req.params.query, $options: 'i' } }
            ]
        }).limit(20);
        
        return res.status(200).json({success: true, users});
    } catch (error) {
        return res.status(500).json({success: false, message: error.message});
    }
});

// Get all users
router.get('/', async (req, res) => {
    try {
        const users = await User.find().limit(50);
        return res.status(200).json({success: true, users});
    } catch (error) {
        return res.status(500).json({success: false, message: error.message});
    }
});

export default router;
