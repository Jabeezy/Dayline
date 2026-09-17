import { Router } from 'express';
import { askAssistant, AssistantUnavailableError } from '../services/assistant.js';

export const assistantRouter = Router();

assistantRouter.post('/ask', async (req, res) => {
  const { question } = req.body;
  if (!question?.trim()) {
    return res.status(400).json({ error: 'question is required' });
  }

  try {
    const answer = await askAssistant(question.trim());
    res.json({ answer });
  } catch (err) {
    if (err instanceof AssistantUnavailableError) {
      console.warn('Assistant temporarily rate-limited:', err.message);
      return res.status(503).json({ error: 'Assistant is temporarily busy — try again in a moment.' });
    }
    console.error('Assistant request failed:', err);
    res.status(500).json({ error: 'Could not get a response from the assistant.' });
  }
});