import { Router } from 'express';
import { chatbotService } from '../services/chatbotService';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

router.post('/ask', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { message, history } = req.body;
    if (!message?.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }
    const result = await chatbotService.ask(message, history || []);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
