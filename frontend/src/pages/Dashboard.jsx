import { useEffect, useState, useCallback } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import Agenda from '../components/Agenda.jsx';
import Tasks from '../components/Tasks.jsx';
import QuickCapture from '../components/QuickCapture.jsx';
import AddEvent from '../components/AddEvent.jsx';
import AskSearch from '../components/AskSearch.jsx';
import ComingSoon from '../components/ComingSoon.jsx';
import { fetchTodayEvents, fetchUpcomingEvents, googleConnectUrl } from '../lib/api.js';

const today = new Date().toLocaleDateString(undefined, {
  weekday: 'long', month: 'long', day: 'numeric',
}).toUpperCase();

export default function Dashboard() {
  const [activeView, setActiveView] = useState('today');
  const [connected, setConnected] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Today's agenda (used on the Today tab) and the wider upcoming list
  // (used on the Calendar tab) are genuinely different queries — kept
  // as separate state so adding an event for next week doesn't wrongly
  // appear to vanish just because it's not part of "today."
  const [todayEvents, setTodayEvents] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [todayData, upcomingData] = await Promise.all([
        fetchTodayEvents(),
        fetchUpcomingEvents(30),
      ]);
      setConnected(todayData.connected);
      setTodayEvents(todayData.events);
      setUpcomingEvents(upcomingData.events);
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
      <Sidebar activeView={activeView} onNavigate={setActiveView} open={menuOpen} onClose={() => setMenuOpen(false)} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <div className="dl-header" style={{ padding: '26px 32px 18px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              className="dl-menu-btn"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              style={{
                background: 'var(--bg-card-alt)', border: '1px solid var(--border-strong)', borderRadius: 8,
                width: 36, height: 36, alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text)" strokeWidth="2" strokeLinecap="round">
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div>
              <div className="mono" style={{ fontSize: 11, color: 'var(--text-faint)', marginBottom: 4 }}>{today}</div>
              <div className="display dl-greeting" style={{ fontSize: 24, fontWeight: 700, color: '#F2F6F9' }}>Good morning, Nick</div>
            </div>
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
          <div className="dl-columns dl-content-pad" style={{ flex: 1, display: 'flex', gap: 20, padding: '0 32px 24px', minHeight: 0, overflowY: 'auto' }}>
            <Agenda connected={connected} events={todayEvents} onConnect={handleConnect} onDeleted={load} loading={loading} />
            <Tasks />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>
              <QuickCapture connected={connected} onCaptured={load} />
              <AddEvent connected={connected} onCreated={load} />
            </div>
          </div>
        )}

        {activeView === 'tasks' && (
          <div className="dl-content-pad" style={{ flex: 1, display: 'flex', padding: '0 32px 24px', minHeight: 0, overflowY: 'auto' }}>
            <div style={{ width: '100%', maxWidth: 480 }}>
              <Tasks />
            </div>
          </div>
        )}

        {activeView === 'calendar' && (
          <div className="dl-content-pad" style={{ flex: 1, display: 'flex', padding: '0 32px 24px', minHeight: 0, overflowY: 'auto' }}>
            <div style={{ width: '100%', maxWidth: 480, display: 'flex', flexDirection: 'column' }}>
              <AddEvent connected={connected} onCreated={load} />
              <Agenda
                connected={connected}
                events={upcomingEvents}
                onConnect={handleConnect}
                onDeleted={load}
                loading={loading}
                showDates
                emptyLabel="Nothing coming up in the next 30 days."
              />
            </div>
          </div>
        )}

        {activeView === 'ask' && <AskSearch />}

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