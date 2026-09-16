import { Router } from 'express';
import { getAuthUrl, exchangeCodeForTokens } from '../services/googleCalendar.js';
import { saveTokens } from '../services/tokenStore.js';

export const authRouter = Router();

// Frontend hits this to kick off the "Connect Google Calendar" button.
authRouter.get('/google', (req, res) => {
  res.redirect(getAuthUrl());
});

// Google redirects here after the user grants access.
authRouter.get('/google/callback', async (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(400).send('Missing auth code');

  try {
    const tokens = await exchangeCodeForTokens(code);
    await saveTokens(tokens); // persisted in Postgres — survives server restarts now
    res.redirect(`${process.env.FRONTEND_URL}?connected=google`);
  } catch (err) {
    console.error('Google OAuth exchange failed:', err);
    res.status(500).send('Auth failed');
  }
});
