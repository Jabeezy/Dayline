import { useState } from 'react';
import { createEvent } from '../lib/api.js';

export default function QuickCapture({ connected, onCaptured }) {
  const [value, setValue] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!value.trim() || !connected) return;

    // MVP behavior: treat the text as a 30-min event starting now.
    // Later this is where you'd hand the raw text to the Claude API
    // (Phase 3) to parse "remind me Friday at 2pm" into real start/end times.
    setSaving(true);
    const start = new Date();
    const end = new Date(start.getTime() + 30 * 60 * 1000);
    try {
      await createEvent({ title: value.trim(), start: start.toISOString(), end: end.toISOString() });
      setValue('');
      onCaptured?.();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-dim)', marginBottom: 10 }}>QUICK CAPTURE</div>
      <form onSubmit={handleSubmit} style={{
        display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-card)',
        border: '1px solid var(--border-strong)', borderRadius: 10, padding: '6px 6px 6px 14px',
      }}>
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={connected ? 'Type a note, deadline, or "remind me…"' : 'Connect Google Calendar to enable capture'}
          disabled={!connected || saving}
          aria-label="Quick capture"
          style={{
            flex: 1, background: 'transparent', border: 'none', outline: 'none',
            color: 'var(--text)', fontSize: 12, fontFamily: 'JetBrains Mono, monospace', padding: '6px 0',
          }}
        />
        <button type="submit" disabled={!connected || saving} style={{
          background: connected ? 'var(--accent)' : 'var(--border)', color: '#04141a', border: 'none',
          borderRadius: 7, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#04141a" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </button>
      </form>
    </div>
  );
}
