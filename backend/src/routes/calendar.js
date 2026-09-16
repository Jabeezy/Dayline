import { Router } from 'express';
import { listEvents, createEvent, deleteEvent } from '../services/googleCalendar.js';
import { loadTokens } from '../services/tokenStore.js';

export const calendarRouter = Router();

// Powers the Agenda column on the Dashboard.
calendarRouter.get('/today', async (req, res) => {
  const tokens = await loadTokens();
  if (!tokens) return res.status(401).json({ error: 'Google Calendar not connected' });

  try {
    const events = await listEvents(tokens);
    res.json({ events });
  } catch (err) {
    console.error('Failed to fetch events:', err);
    res.status(500).json({ error: 'Could not fetch calendar events' });
  }
});

// Powers Quick Capture writing an event back to the real calendar.
calendarRouter.post('/events', async (req, res) => {
  const tokens = await loadTokens();
  if (!tokens) return res.status(401).json({ error: 'Google Calendar not connected' });

  const { title, start, end, notes } = req.body;
  if (!title || !start || !end) {
    return res.status(400).json({ error: 'title, start, and end are required' });
  }

  try {
    const event = await createEvent(tokens, { title, start, end, notes });
    res.status(201).json({ event });
  } catch (err) {
    console.error('Failed to create event:', err);
    res.status(500).json({ error: 'Could not create calendar event' });
  }
});

// Powers the delete (x) button on each Agenda card.
calendarRouter.delete('/events/:eventId', async (req, res) => {
  const tokens = await loadTokens();
  if (!tokens) return res.status(401).json({ error: 'Google Calendar not connected' });

  try {
    await deleteEvent(tokens, req.params.eventId);
    res.status(204).end();
  } catch (err) {
    console.error('Failed to delete event:', err);
    res.status(500).json({ error: 'Could not delete calendar event' });
  }
});
