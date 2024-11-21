import express from 'express';
import { 
  streamChat, 
  createConversation,
  getConversations,
  getMessages
} from '../controllers/chatController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.post('/stream', auth, streamChat);
router.post('/conversations', auth, createConversation);
router.get('/conversations', auth, getConversations);
router.get('/conversations/:conversationId/messages', auth, getMessages);

export const chatRoutes = router;