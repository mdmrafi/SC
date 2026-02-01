import express from 'express';
import { verifyClerkUser } from '../middleware/auth.js';
import * as storyController from '../controllers/storyController.js';

const router = express.Router();

router.post('/create', verifyClerkUser, storyController.createStory);
router.get('/connections', verifyClerkUser, storyController.getConnectionStories);
router.post('/:storyId/view', verifyClerkUser, storyController.viewStory);
router.delete('/:storyId', verifyClerkUser, storyController.deleteStory);

export default router;
