import { pool } from '../db/pool.js';

// Persists the one set of Google OAuth tokens across server restarts.
// This replaces the old in-memory `global.__dayline_session` placeholder.

export async function saveTokens(tokens) {
  await pool.query(
    `INSERT INTO google_auth (id, access_token, refresh_token, expiry_date, updated_at)
     VALUES (1, $1, $2, $3, NOW())
     ON CONFLICT (id) DO UPDATE SET
       access_token = EXCLUDED.access_token,
       -- keep the existing refresh_token if Google didn't send a new one
       refresh_token = COALESCE(EXCLUDED.refresh_token, google_auth.refresh_token),
       expiry_date = EXCLUDED.expiry_date,
       updated_at = NOW()`,
    [tokens.access_token, tokens.refresh_token ?? null, tokens.expiry_date ?? null]
  );
}

export async function loadTokens() {
  const { rows } = await pool.query('SELECT access_token, refresh_token, expiry_date FROM google_auth WHERE id = 1');
  if (rows.length === 0) return null;
  return {
    access_token: rows[0].access_token,
    refresh_token: rows[0].refresh_token,
    expiry_date: Number(rows[0].expiry_date),
  };
}
