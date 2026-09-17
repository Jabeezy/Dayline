import { useState, useRef, useEffect } from 'react';
import { askAssistant } from '../lib/api.js';

export default function AskSearch() {
  const [messages, setMessages] = useState([]); // { role: 'user' | 'assistant' | 'error', text }
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function handleSubmit(e) {
    e.preventDefault();
    const question = input.trim();
    if (!question || loading) return;

    setMessages((prev) => [...prev, { role: 'user', text: question }]);
    setInput('');
    setLoading(true);

    try {
      const answer = await askAssistant(question);
      setMessages((prev) => [...prev, { role: 'assistant', text: answer }]);
    } catch (err) {
      // A rate-limit or outage shows a calm, specific message here instead
      // of a raw error or a broken UI — this is the graceful-degradation
      // path we built in from the start rather than bolting on later.
      setMessages((prev) => [...prev, { role: 'error', text: err.message }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '0 32px 24px', minHeight: 0 }}>
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14, paddingBottom: 12 }}>
        {messages.length === 0 && (
          <div style={{ fontSize: 12.5, color: 'var(--text-faint)', maxWidth: 420 }}>
            Ask about your tasks or what's coming up — e.g. "what's on my plate this week" or "do I have anything due today."
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{
              maxWidth: 520,
              background: m.role === 'user' ? 'var(--bg-card-alt)' : m.role === 'error' ? 'rgba(217,100,122,0.1)' : 'var(--bg-card)',
              border: `1px solid ${m.role === 'error' ? 'var(--red)' : 'var(--border-strong)'}`,
              borderRadius: 10, padding: '10px 14px',
              fontSize: 13, lineHeight: 1.55,
              color: m.role === 'error' ? 'var(--red)' : 'var(--text)',
              whiteSpace: 'pre-wrap',
            }}>
              {m.text}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ fontSize: 12, color: 'var(--text-faint)' }}>Thinking…</div>
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSubmit} style={{
        display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-card)',
        border: '1px solid var(--border-strong)', borderRadius: 12, padding: '6px 6px 6px 16px', flexShrink: 0,
      }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Dayline anything about your tasks or calendar…"
          disabled={loading}
          style={{
            flex: 1, background: 'transparent', border: 'none', outline: 'none',
            color: 'var(--text)', fontSize: 13, padding: '8px 0',
          }}
        />
        <button type="submit" disabled={loading || !input.trim()} style={{
          background: 'var(--accent)', border: 'none', borderRadius: 8, width: 34, height: 34,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#04141a" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </button>
      </form>
    </div>
  );
}