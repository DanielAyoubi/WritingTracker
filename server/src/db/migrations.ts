import db from './connection';

export function runMigrations(): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS participants (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      pseudonym  TEXT UNIQUE NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id               INTEGER PRIMARY KEY AUTOINCREMENT,
      pseudonym        TEXT NOT NULL REFERENCES participants(pseudonym),
      session_date     TEXT NOT NULL,
      duration_minutes INTEGER NOT NULL CHECK(duration_minutes > 0),
      word_count       INTEGER NOT NULL CHECK(word_count >= 0),
      time_of_day      TEXT NOT NULL,
      topic            TEXT NOT NULL,
      logged_at        TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS admin_tokens (
      token_hash TEXT PRIMARY KEY,
      issued_at  TEXT NOT NULL,
      expires_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_sessions_pseudonym ON sessions(pseudonym);
    CREATE INDEX IF NOT EXISTS idx_sessions_session_date ON sessions(session_date);
  `);

  console.log('Database migrations completed.');
}
