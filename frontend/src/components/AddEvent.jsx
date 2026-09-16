import { useState } from 'react';
import { createEvent } from '../lib/api.js';

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export default function AddEvent({ connected, onCreated }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(todayStr());
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('09:30');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  function reset() {
    setTitle('');
    setDate(todayStr());
    setStartTime('09:00');
    setEndTime('09:30');
    setNotes('');
    setError(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) return;

    const start = new Date(`${date}T${startTime}`);
    const end = new Date(`${date}T${endTime}`);
    if (end <= start) {
      setError('End time must be after start time.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await createEvent({ title: title.trim(), start: start.toISOString(), end: end.toISOString(), notes });
      reset();
      setOpen(false);
      onCreated?.();
    } catch (err) {
      console.error(err);
      setError('Could not save that event — try again.');
    } finally {
      setSaving(false);
    }
  }

  if (!connected) {
    return (
      <div style={{ fontSize: 12, color: 'var(--text-faint)', marginBottom: 14 }}>
        Connect Google Calendar to add events.
      </div>
    );
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} style={{
        display: 'flex', alignItems: 'center', gap: 6, background: 'var(--accent)', color: '#04141a',
        border: 'none', borderRadius: 8, padding: '8px 14px', fontSize: 12.5, fontWeight: 600, marginBottom: 14,
      }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#04141a" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
        Add event
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{
      background: 'var(--bg-card)', border: '1px solid var(--border-strong)', borderRadius: 10,
      padding: 14, marginBottom: 14, display: 'flex', flexDirection: 'column', gap: 8,
    }}>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Event title"
        aria-label="Event title"
        autoFocus
        style={{
          background: 'var(--bg-raised)', border: '1px solid var(--border-strong)', borderRadius: 7,
          padding: '8px 10px', color: 'var(--text)', fontSize: 12.5, outline: 'none',
        }}
      />
      <div style={{ display: 'flex', gap: 8 }}>
        <label style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span className="mono" style={{ fontSize: 9.5, color: 'var(--text-faintest)' }}>DATE</span>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{
            background: 'var(--bg-raised)', border: '1px solid var(--border-strong)', borderRadius: 7,
            padding: '7px 8px', color: 'var(--text)', fontSize: 12, outline: 'none',
          }} />
        </label>
        <label style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span className="mono" style={{ fontSize: 9.5, color: 'var(--text-faintest)' }}>START</span>
          <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} style={{
            background: 'var(--bg-raised)', border: '1px solid var(--border-strong)', borderRadius: 7,
            padding: '7px 8px', color: 'var(--text)', fontSize: 12, outline: 'none',
          }} />
        </label>
        <label style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span className="mono" style={{ fontSize: 9.5, color: 'var(--text-faintest)' }}>END</span>
          <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} style={{
            background: 'var(--bg-raised)', border: '1px solid var(--border-strong)', borderRadius: 7,
            padding: '7px 8px', color: 'var(--text)', fontSize: 12, outline: 'none',
          }} />
        </label>
      </div>
      <input
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Notes (optional)"
        aria-label="Notes"
        style={{
          background: 'var(--bg-raised)', border: '1px solid var(--border-strong)', borderRadius: 7,
          padding: '8px 10px', color: 'var(--text)', fontSize: 12.5, outline: 'none',
        }}
      />
      {error && <div style={{ fontSize: 11.5, color: 'var(--red)' }}>{error}</div>}
      <div style={{ display: 'flex', gap: 8, marginTop: 2 }}>
        <button type="submit" disabled={saving || !title.trim()} style={{
          background: 'var(--accent)', color: '#04141a', border: 'none', borderRadius: 7,
          padding: '8px 14px', fontSize: 12.5, fontWeight: 600, flex: 1,
        }}>
          {saving ? 'Saving…' : 'Save event'}
        </button>
        <button type="button" onClick={() => { setOpen(false); reset(); }} style={{
          background: 'transparent', color: 'var(--text-dimmer)', border: '1px solid var(--border-strong)',
          borderRadius: 7, padding: '8px 14px', fontSize: 12.5,
        }}>
          Cancel
        </button>
      </div>
    </form>
  );
}
