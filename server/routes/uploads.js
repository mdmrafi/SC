import express from 'express';
import { verifyClerkUser } from '../middleware/auth.js';
import upload from '../utils/multer.js';
import * as uploadController from '../controllers/uploadController.js';

const router = express.Router();

// Upload profile picture: field name should be 'image'
router.post('/users/profile-picture', verifyClerkUser, upload.single('image'), uploadController.uploadProfilePicture);

// Upload post image: returns uploaded image URL
router.post('/posts/image', verifyClerkUser, upload.single('image'), uploadController.uploadPostImage);

// Upload story image: returns uploaded image URL
router.post('/stories/image', verifyClerkUser, upload.single('image'), uploadController.uploadStoryImage);

// Upload message media (image/video)
router.post('/messages/media', verifyClerkUser, upload.single('file'), uploadController.uploadMessageMedia);

export default router;
