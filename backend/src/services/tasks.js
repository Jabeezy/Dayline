import { pool } from '../db/pool.js';

export async function listTasks() {
  const { rows } = await pool.query(
    'SELECT id, text, done, due_label AS "dueLabel" FROM tasks ORDER BY created_at ASC'
  );
  return rows;
}

export async function createTask({ text, dueLabel }) {
  const { rows } = await pool.query(
    `INSERT INTO tasks (text, due_label) VALUES ($1, $2)
     RETURNING id, text, done, due_label AS "dueLabel"`,
    [text, dueLabel ?? null]
  );
  return rows[0];
}

export async function toggleTask(id) {
  const { rows } = await pool.query(
    `UPDATE tasks SET done = NOT done, updated_at = NOW() WHERE id = $1
     RETURNING id, text, done, due_label AS "dueLabel"`,
    [id]
  );
  return rows[0];
}

export async function deleteTask(id) {
  await pool.query('DELETE FROM tasks WHERE id = $1', [id]);
}
