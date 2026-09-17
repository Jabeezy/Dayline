import { listTasks } from './tasks.js';
import { listEvents } from './googleCalendar.js';
import { loadTokens } from './tokenStore.js';

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Builds a short, current snapshot of the user's real data so the assistant
// answers from what's actually in Dayline, not a generic guess.
async function buildContext() {
  const tasks = await listTasks();
  const taskLines = tasks.length
    ? tasks.map((t) => `- [${t.done ? 'x' : ' '}] ${t.text}${t.dueLabel ? ` (${t.dueLabel})` : ''}`).join('\n')
    : '(no tasks yet)';

  let eventLines = '(calendar not connected)';
  const tokens = await loadTokens();
  if (tokens) {
    const now = new Date();
    const timeMin = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0).toISOString();
    const timeMax = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 14, 23, 59, 59).toISOString();
    try {
      const events = await listEvents(tokens, { timeMin, timeMax });
      eventLines = events.length
        ? events.map((e) => `- ${e.title} — ${e.start}${e.location ? ` @ ${e.location}` : ''}`).join('\n')
        : '(nothing on the calendar in the next 14 days)';
    } catch {
      eventLines = '(could not load calendar right now)';
    }
  }

  return `Today's tasks:\n${taskLines}\n\nUpcoming events (next 14 days):\n${eventLines}`;
}

// Distinguishes "Groq is rate-limiting us" from any other failure, so the
// frontend can show something more useful than a generic error.
class AssistantUnavailableError extends Error {}

export async function askAssistant(question) {
  if (!process.env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is not set on the server');
  }

  const context = await buildContext();

  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `You are Dayline, a personal assistant. Answer briefly and directly using the user's real tasks and calendar below. If the answer isn't in this data, say so plainly rather than guessing.\n\n${context}`,
        },
        { role: 'user', content: question },
      ],
      temperature: 0.4,
      max_tokens: 500,
    }),
  });

  if (res.status === 429) {
    throw new AssistantUnavailableError('Rate limited — try again in a moment');
  }
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Groq request failed (${res.status}): ${body}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? '(no response)';
}

export { AssistantUnavailableError };