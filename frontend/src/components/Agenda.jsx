import { useState } from 'react';
import { deleteEvent } from '../lib/api.js';

function formatTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d)) return iso; // all-day events come through as plain dates
  return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }).toLowerCase().replace(' ', '');
}

export default function Agenda({ connected, events, onConnect, onDeleted, loading }) {
  const [deletingId, setDeletingId] = useState(null);

  async function handleDelete(id) {
    setDeletingId(id);
    try {
      await deleteEvent(id);
      onDeleted?.();
    } catch (err) {
      console.error('Failed to delete event:', err);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div style={{ width: 320, flexShrink: 0, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-dim)', marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        AGENDA
        <span className="mono" style={{ fontSize: 10, color: 'var(--text-faintest)', fontWeight: 400 }}>
          {connected ? `${events.length} EVENTS` : 'NOT CONNECTED'}
        </span>
      </div>

      {!connected && !loading && (
        <div style={{
          background: 'var(--bg-card)', border: '1px dashed var(--border-strong)', borderRadius: 10,
          padding: '18px 14px', display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-start',
        }}>
          <div style={{ fontSize: 12, color: 'var(--text-dimmer)', lineHeight: 1.5 }}>
            Connect Google Calendar to see today's real agenda here.
          </div>
          <button onClick={onConnect} style={{
            background: 'var(--accent)', color: '#04141a', border: 'none', borderRadius: 8,
            padding: '8px 14px', fontSize: 12.5, fontWeight: 600,
          }}>
            Connect Google Calendar
          </button>
        </div>
      )}

      {loading && <div style={{ fontSize: 12, color: 'var(--text-faint)' }}>Loading events…</div>}

      {connected && !loading && (
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {events.length === 0 && (
            <div style={{ fontSize: 12, color: 'var(--text-faint)' }}>Nothing on the calendar today.</div>
          )}
          {events.map((ev) => (
            <div key={ev.id} style={{ display: 'flex', gap: 10, opacity: deletingId === ev.id ? 0.4 : 1 }}>
              <div className="mono" style={{ fontSize: 11, color: 'var(--text-faintest)', width: 44, flexShrink: 0, paddingTop: 10 }}>
                {formatTime(ev.start)}
              </div>
              <div style={{
                flex: 1, background: 'var(--bg-card-alt)', borderLeft: '3px solid var(--accent)',
                borderRadius: '0 8px 8px 0', padding: '9px 12px',
                display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8,
              }}>
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 500, color: '#F2F6F9' }}>{ev.title}</div>
                  {ev.location && (
                    <div className="mono" style={{ fontSize: 10, color: 'var(--text-faint)', marginTop: 2 }}>{ev.location}</div>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(ev.id)}
                  disabled={deletingId === ev.id}
                  aria-label={`Delete ${ev.title}`}
                  style={{
                    background: 'transparent', border: 'none', color: 'var(--text-faintest)',
                    padding: 2, flexShrink: 0, display: 'flex',
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
