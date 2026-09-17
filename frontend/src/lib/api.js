// In dev this falls back to localhost. In production, Netlify injects
// VITE_API_URL at build time (set in Site settings → Environment variables).
const API = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api`;

export async function fetchTodayEvents() {
  // Computed in the browser, so this is the user's actual local "today" —
  // not the server's, which runs in UTC and would otherwise disagree.
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0).toISOString();
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999).toISOString();
  const params = new URLSearchParams({ timeMin: startOfDay, timeMax: endOfDay });

  const res = await fetch(`${API}/calendar/today?${params}`, { credentials: 'include' });
  if (res.status === 401) return { connected: false, events: [] };
  if (!res.ok) throw new Error('Failed to load calendar events');
  const data = await res.json();
  return { connected: true, events: data.events };
}

// Powers the Calendar tab — unlike fetchTodayEvents, this shows everything
// coming up over the next `days`, not just today. An event you add for next
// week would otherwise never show up anywhere in the UI.
export async function fetchUpcomingEvents(days = 30) {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0).toISOString();
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + days, 23, 59, 59, 999).toISOString();
  const params = new URLSearchParams({ timeMin: startOfDay, timeMax: end });

  const res = await fetch(`${API}/calendar/today?${params}`, { credentials: 'include' });
  if (res.status === 401) return { connected: false, events: [] };
  if (!res.ok) throw new Error('Failed to load calendar events');
  const data = await res.json();
  return { connected: true, events: data.events };
}

export function googleConnectUrl() {
  return `${API}/auth/google`;
}

export async function createEvent({ title, start, end, notes }) {
  const res = await fetch(`${API}/calendar/events`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, start, end, notes }),
  });
  if (!res.ok) throw new Error('Failed to create event');
  return res.json();
}

export async function deleteEvent(eventId) {
  const res = await fetch(`${API}/calendar/events/${eventId}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to delete event');
}

export async function fetchTasks() {
  const res = await fetch(`${API}/tasks`);
  if (!res.ok) throw new Error('Failed to load tasks');
  const data = await res.json();
  return data.tasks;
}

export async function toggleTask(id) {
  const res = await fetch(`${API}/tasks/${id}/toggle`, { method: 'PATCH' });
  if (!res.ok) throw new Error('Failed to toggle task');
  return res.json();
}

export async function addTask(text, dueLabel) {
  const res = await fetch(`${API}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, dueLabel }),
  });
  if (!res.ok) throw new Error('Failed to add task');
  return res.json();
}

export async function deleteTask(id) {
  const res = await fetch(`${API}/tasks/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete task');
}