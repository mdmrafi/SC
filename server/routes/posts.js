import express from 'express';
import { verifyClerkUser } from '../middleware/auth.js';
import * as postController from '../controllers/postController.js';

const router = express.Router();

router.post('/create', verifyClerkUser, postController.createPost);
router.get('/feed', verifyClerkUser, postController.getFeed);
router.get('/user/:userId', postController.getUserPosts);
router.get('/:postId', postController.getPost);
router.post('/:postId/like', verifyClerkUser, postController.likePost);
router.post('/:postId/comment', verifyClerkUser, postController.addComment);
router.delete('/:postId/comment/:commentIndex', verifyClerkUser, postController.deleteComment);
router.delete('/:postId', verifyClerkUser, postController.deletePost);

export default router;
