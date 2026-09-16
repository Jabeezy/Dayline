import { google } from 'googleapis';

// One OAuth2 client, reused for the auth-code exchange and for authenticated calls.
function buildOAuthClient() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
}

// Step 1: send the user here to grant Dayline calendar access.
export function getAuthUrl() {
  const oauth2Client = buildOAuthClient();
  return oauth2Client.generateAuthUrl({
    access_type: 'offline', // gives us a refresh_token, not just a short-lived access_token
    prompt: 'consent',      // forces Google to re-issue the refresh_token every time (useful in dev)
    scope: [
      'https://www.googleapis.com/auth/calendar.readonly',
      'https://www.googleapis.com/auth/calendar.events',
    ],
  });
}

// Step 2: Google redirects back to /api/auth/google/callback?code=...
// Exchange that one-time code for tokens we can store.
export async function exchangeCodeForTokens(code) {
  const oauth2Client = buildOAuthClient();
  const { tokens } = await oauth2Client.getToken(code);
  return tokens; // { access_token, refresh_token, expiry_date, ... }
}

// Step 3: for any authenticated request, rebuild a client from stored tokens.
function clientFromTokens(tokens) {
  const oauth2Client = buildOAuthClient();
  oauth2Client.setCredentials(tokens);
  return oauth2Client;
}

// Pull today's events (or any date range) for the dashboard's Agenda column.
export async function listEvents(tokens, { timeMin, timeMax } = {}) {
  const auth = clientFromTokens(tokens);
  const calendar = google.calendar({ version: 'v3', auth });

  const now = new Date();
  const startOfDay = timeMin ?? new Date(now.setHours(0, 0, 0, 0)).toISOString();
  const endOfDay = timeMax ?? new Date(now.setHours(23, 59, 59, 999)).toISOString();

  const res = await calendar.events.list({
    calendarId: 'primary',
    timeMin: startOfDay,
    timeMax: endOfDay,
    singleEvents: true,
    orderBy: 'startTime',
  });

  return res.data.items.map((event) => ({
    id: event.id,
    title: event.summary ?? '(no title)',
    start: event.start?.dateTime ?? event.start?.date,
    end: event.end?.dateTime ?? event.end?.date,
    location: event.location ?? null,
  }));
}

// Used by Quick Capture ("remind me to renew the SSL cert Friday 2pm") to
// write straight back to the user's real Google Calendar.
export async function createEvent(tokens, { title, start, end, notes }) {
  const auth = clientFromTokens(tokens);
  const calendar = google.calendar({ version: 'v3', auth });

  const res = await calendar.events.insert({
    calendarId: 'primary',
    requestBody: {
      summary: title,
      description: notes,
      start: { dateTime: start },
      end: { dateTime: end },
    },
  });

  return res.data;
}

// Powers the delete button on each Agenda card.
export async function deleteEvent(tokens, eventId) {
  const auth = clientFromTokens(tokens);
  const calendar = google.calendar({ version: 'v3', auth });
  await calendar.events.delete({ calendarId: 'primary', eventId });
}
