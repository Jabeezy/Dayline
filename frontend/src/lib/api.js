const API =  `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api`;

export async function fetchTodayEvents() {
  const res = await fetch(`${API}/calendar/today`, { credentials: 'include' });
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
