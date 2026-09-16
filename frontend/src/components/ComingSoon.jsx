export default function ComingSoon({ title, note }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', padding: '0 32px' }}>
      <div className="display" style={{ fontSize: 20, fontWeight: 700, color: '#F2F6F9', marginBottom: 8 }}>
        {title}
      </div>
      <div style={{ fontSize: 13, color: 'var(--text-dimmer)', maxWidth: 420, lineHeight: 1.6 }}>
        {note}
      </div>
    </div>
  );
}
