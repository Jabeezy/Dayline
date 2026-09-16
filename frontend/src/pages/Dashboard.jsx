import { useEffect, useState, useCallback } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import Agenda from '../components/Agenda.jsx';
import Tasks from '../components/Tasks.jsx';
import QuickCapture from '../components/QuickCapture.jsx';
import AddEvent from '../components/AddEvent.jsx';
import ComingSoon from '../components/ComingSoon.jsx';
import { fetchTodayEvents, googleConnectUrl } from '../lib/api.js';

const today = new Date().toLocaleDateString(undefined, {
  weekday: 'long', month: 'long', day: 'numeric',
}).toUpperCase();

export default function Dashboard() {
  const [activeView, setActiveView] = useState('today');
  const [connected, setConnected] = useState(false);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchTodayEvents();
      setConnected(data.connected);
      setEvents(data.events);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  function handleConnect() {
    window.location.href = googleConnectUrl();
  }

  return (
    <div style={{ width: '100%', height: '100vh', background: 'var(--bg)', display: 'flex', overflow: 'hidden' }}>
      <Sidebar activeView={activeView} onNavigate={setActiveView} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <div style={{ padding: '26px 32px 18px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div>
            <div className="mono" style={{ fontSize: 11, color: 'var(--text-faint)', marginBottom: 4 }}>{today}</div>
            <div className="display" style={{ fontSize: 24, fontWeight: 700, color: '#F2F6F9' }}>Good morning, Nick</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px',
              background: 'var(--bg-card-alt)', border: '1px solid var(--border-strong)', borderRadius: 999,
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={connected ? 'var(--green)' : 'var(--text-faintest)'} strokeWidth="2.5">
                <path d="M20 6 9 17l-5-5" />
              </svg>
              <span className="mono" style={{ fontSize: 10.5, color: 'var(--text-dimmer)' }}>
                {connected ? 'Google Cal synced' : 'Google Cal not connected'}
              </span>
            </div>
          </div>
        </div>

        {activeView === 'today' && (
          <div style={{ flex: 1, display: 'flex', gap: 20, padding: '0 32px 24px', minHeight: 0 }}>
            <Agenda connected={connected} events={events} onConnect={handleConnect} onDeleted={load} loading={loading} />
            <Tasks />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>
              <QuickCapture connected={connected} onCaptured={load} />
              <AddEvent connected={connected} onCreated={load} />
            </div>
          </div>
        )}

        {activeView === 'tasks' && (
          <div style={{ flex: 1, display: 'flex', padding: '0 32px 24px', minHeight: 0 }}>
            <div style={{ width: '100%', maxWidth: 480 }}>
              <Tasks />
            </div>
          </div>
        )}

        {activeView === 'calendar' && (
          <div style={{ flex: 1, display: 'flex', padding: '0 32px 24px', minHeight: 0 }}>
            <div style={{ width: '100%', maxWidth: 480, display: 'flex', flexDirection: 'column' }}>
              <AddEvent connected={connected} onCreated={load} />
              <Agenda connected={connected} events={events} onConnect={handleConnect} onDeleted={load} loading={loading} />
            </div>
          </div>
        )}

        {activeView === 'ask' && (
          <ComingSoon
            title="Ask / Search"
            note="This is Phase 3 — the Claude API assistant layer that lets you ask Dayline questions across your calendar, tasks, and notes. Not wired up yet."
          />
        )}

        {activeView === 'health' && (
          <ComingSoon
            title="Health"
            note="A filtered view of just your health-tagged calendar events and reminders. Once event tagging/categories exist, this becomes a real filter on the same data — not a separate system."
          />
        )}

        {activeView === 'vault' && (
          <ComingSoon
            title="Vault"
            note="Dayline won't store credentials directly — this tab will link out to your connected password manager (e.g. Bitwarden) rather than build its own vault."
          />
        )}
      </div>
    </div>
  );
}
