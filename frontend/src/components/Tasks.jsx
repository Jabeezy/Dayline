import { useEffect, useState } from 'react';
import { fetchTasks, toggleTask as toggleTaskApi, deleteTask as deleteTaskApi, addTask } from '../lib/api.js';

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newText, setNewText] = useState('');
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTasks().then(setTasks).catch((err) => {
      console.error(err);
      setError('Could not load tasks — is the backend running and DATABASE_URL set?');
    }).finally(() => setLoading(false));
  }, []);

  async function toggle(id) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
    try {
      await toggleTaskApi(id);
    } catch (err) {
      console.error('Failed to save task toggle, reverting:', err);
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
    }
  }

  async function remove(id) {
    const prev = tasks;
    setTasks((p) => p.filter((t) => t.id !== id));
    try {
      await deleteTaskApi(id);
    } catch (err) {
      console.error('Failed to delete task, reverting:', err);
      setTasks(prev);
    }
  }

  async function handleAdd(e) {
    e.preventDefault();
    const text = newText.trim();
    if (!text) return;
    setAdding(true);
    setError(null);
    try {
      const { task } = await addTask(text);
      setTasks((prev) => [...prev, task]);
      setNewText('');
    } catch (err) {
      console.error('Failed to add task:', err);
      setError('Could not save that task — check the backend terminal for the actual error.');
    } finally {
      setAdding(false);
    }
  }

  const doneCount = tasks.filter((t) => t.done).length;

  return (
    <div style={{ width: 340, flexShrink: 0, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-dim)', marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        TODAY'S TASKS
        <span className="mono" style={{ fontSize: 10, color: 'var(--text-faintest)', fontWeight: 400 }}>
          {loading ? '…' : `${doneCount} OF ${tasks.length}`}
        </span>
      </div>

      <form onSubmit={handleAdd} style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
        <input
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          placeholder="Add a task…"
          aria-label="New task"
          disabled={adding}
          style={{
            flex: 1, background: 'var(--bg-card)', border: '1px solid var(--border-strong)', borderRadius: 8,
            padding: '8px 10px', color: 'var(--text)', fontSize: 12.5, outline: 'none',
          }}
        />
        <button type="submit" disabled={adding || !newText.trim()} style={{
          background: 'var(--accent)', color: '#04141a', border: 'none', borderRadius: 8,
          width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#04141a" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
        </button>
      </form>

      {error && (
        <div style={{ fontSize: 11.5, color: 'var(--red)', marginBottom: 10 }}>{error}</div>
      )}

      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 7 }}>
        {!loading && tasks.length === 0 && (
          <div style={{ fontSize: 12, color: 'var(--text-faint)' }}>No tasks yet — add one from the backend or seed the table.</div>
        )}
        {tasks.map((t) => (
          <div
            key={t.id}
            style={{
              display: 'flex', alignItems: 'center', gap: 10, background: 'var(--bg-card)',
              border: '1px solid var(--border-strong)', borderRadius: 8, padding: '10px 12px',
            }}
          >
            <button
              onClick={() => toggle(t.id)}
              aria-label={t.done ? `Mark "${t.text}" not done` : `Mark "${t.text}" done`}
              style={{
                width: 16, height: 16, borderRadius: 4, flexShrink: 0, padding: 0, background: 'transparent',
                border: `1.5px solid ${t.done ? 'var(--green)' : 'var(--text-faintest)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              {t.done && (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="var(--green)" stroke="#04141a" strokeWidth="3">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              )}
            </button>
            <span style={{
              fontSize: 12.5, color: t.done ? 'var(--text-faint)' : 'var(--text)',
              textDecoration: t.done ? 'line-through' : 'none', flex: 1,
            }}>
              {t.text}
            </span>
            {t.dueLabel && !t.done && (
              <span className="mono" style={{ fontSize: 10, color: 'var(--amber)' }}>{t.dueLabel}</span>
            )}
            <button
              onClick={() => remove(t.id)}
              aria-label={`Delete "${t.text}"`}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-faintest)', padding: 2, display: 'flex' }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
