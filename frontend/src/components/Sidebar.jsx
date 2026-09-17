const navItems = [
  { key: 'ask', label: 'Ask / Search' },
  { key: 'today', label: 'Today' },
  { key: 'tasks', label: 'Tasks' },
  { key: 'calendar', label: 'Calendar' },
  { key: 'health', label: 'Health' },
  { key: 'vault', label: 'Vault', external: true },
];

export default function Sidebar({ activeView, onNavigate, open, onClose }) {
  function handleNavigate(key) {
    onNavigate(key);
    onClose?.(); // closes the mobile drawer after picking a tab
  }

  return (
    <>
      <div className={`dl-overlay${open ? ' open' : ''}`} onClick={onClose} />
      <div className={`dl-sidebar${open ? ' open' : ''}`} style={{
        width: 224, flexShrink: 0, height: '100%', background: 'var(--bg-raised)',
        borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column',
      }}>
        <div style={{
          padding: '22px 20px 18px', borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8,
            background: 'linear-gradient(135deg, var(--accent), #0E7A8C)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#04141a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.5M9.5 2A2.5 2.5 0 0 0 7 4.5v15a2.5 2.5 0 0 0 4.96.5M9.5 2h5M12 4.5h5.5a2.5 2.5 0 0 1 0 5H12M12 9.5h6.5a2.5 2.5 0 0 1 0 5H12M12 14.5h5.5a2.5 2.5 0 0 1 0 5H12"/>
            </svg>
          </div>
          <div>
            <div className="display" style={{ fontSize: 15, fontWeight: 700, color: '#F2F6F9' }}>Dayline</div>
            <div className="mono" style={{ fontSize: 10, color: 'var(--text-faint)' }}>YOUR ASSISTANT</div>
          </div>
        </div>

        <nav style={{ padding: '16px 14px 4px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {navItems.map((item) => {
            const isActive = activeView === item.key;
            return (
              <button
                key={item.key}
                onClick={() => handleNavigate(item.key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '9px 11px', borderRadius: 7,
                  background: isActive ? 'var(--bg-card-alt)' : 'transparent',
                  border: isActive ? '1px solid var(--border-strong)' : '1px solid transparent',
                  fontSize: 13, color: isActive ? '#F2F6F9' : 'var(--text-dim)',
                  fontWeight: isActive ? 500 : 400, cursor: 'pointer', width: '100%', textAlign: 'left',
                }}
              >
                <span>{item.label}</span>
                {item.external && (
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--text-faintest)" strokeWidth="2" style={{ marginLeft: 'auto' }}>
                    <path d="M7 17 17 7M7 7h10v10"/>
                  </svg>
                )}
              </button>
            );
          })}
        </nav>

        <div style={{ flex: 1 }} />

        <div style={{ padding: '14px 16px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{ width: 26, height: 26, borderRadius: 6, background: 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="mono" style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 600 }}>NS</span>
          </div>
          <span style={{ fontSize: 12, color: 'var(--text-dimmer)' }}>Nick Stanley</span>
        </div>
      </div>
    </>
  );
}