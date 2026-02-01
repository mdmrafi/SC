import express from 'express';
import { verifyClerkUser } from '../middleware/auth.js';
import * as messageController from '../controllers/messageController.js';

const router = express.Router();

router.post('/send', verifyClerkUser, messageController.sendMessage);
router.get('/conversation/:userId', verifyClerkUser, messageController.getConversation);
router.get('/conversations', verifyClerkUser, messageController.getConversations);
router.put('/mark-read/:messageId', verifyClerkUser, messageController.markAsRead);
router.put('/mark-conversation-read/:userId', verifyClerkUser, messageController.markConversationAsRead);
router.put('/edit/:messageId', verifyClerkUser, messageController.editMessage);
router.delete('/:messageId', verifyClerkUser, messageController.deleteMessage);
router.delete('/conversation/:userId', verifyClerkUser, messageController.deleteConversation);
router.get('/unread-count', verifyClerkUser, messageController.getUnreadCount);

export default router;
