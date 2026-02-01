import express from 'express';
import { verifyClerkUser } from '../middleware/auth.js';
import * as userController from '../controllers/userController.js';

const router = express.Router();

// Routes mapped to controller
router.get('/profile', verifyClerkUser, userController.getProfile);
router.get('/:userId', userController.getUserById);
router.put('/update', verifyClerkUser, userController.updateProfile);
router.get('/search/:query', userController.searchUsers);
router.get('/', userController.getAllUsers);
router.put('/follow/:id', verifyClerkUser, userController.followUser);
router.put('/unfollow/:id', verifyClerkUser, userController.unfollowUser);

export default router;
