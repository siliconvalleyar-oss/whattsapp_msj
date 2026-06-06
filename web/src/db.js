import Database from 'better-sqlite3';
import { mkdirSync } from 'fs';
import { dirname } from 'path';
import cfg from './config.js';

mkdirSync(dirname(cfg.dbPath), { recursive: true });

const db = new Database(cfg.dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    status TEXT DEFAULT 'disconnected',
    phone TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    number TEXT NOT NULL,
    name TEXT DEFAULT '',
    address TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    contact_number TEXT NOT NULL,
    contact_name TEXT DEFAULT '',
    message TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    attempts INTEGER DEFAULT 0,
    error TEXT,
    sent_at TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_messages_session ON messages(session_id);
  CREATE INDEX IF NOT EXISTS idx_messages_status ON messages(status);
  CREATE INDEX IF NOT EXISTS idx_contacts_session ON contacts(session_id);
`);

const stmts = {
  // Sessions
  insertSession: db.prepare('INSERT OR REPLACE INTO sessions (id, name, status, phone, updated_at) VALUES (?, ?, ?, ?, datetime(\'now\'))'),
  getSession: db.prepare('SELECT * FROM sessions WHERE id = ?'),
  listSessions: db.prepare('SELECT * FROM sessions ORDER BY created_at DESC'),
  updateSessionStatus: db.prepare('UPDATE sessions SET status = ?, phone = ?, updated_at = datetime(\'now\') WHERE id = ?'),
  deleteSession: db.prepare('DELETE FROM sessions WHERE id = ?'),

  // Contacts
  insertContact: db.prepare('INSERT OR IGNORE INTO contacts (session_id, number, name, address) VALUES (?, ?, ?, ?)'),
  getContacts: db.prepare('SELECT * FROM contacts WHERE session_id = ? ORDER BY name'),
  deleteContactsBySession: db.prepare('DELETE FROM contacts WHERE session_id = ?'),

  // Messages
  insertMessage: db.prepare('INSERT INTO messages (session_id, contact_number, contact_name, message, status) VALUES (?, ?, ?, ?, ?)'),
  updateMessageStatus: db.prepare('UPDATE messages SET status = ?, attempts = attempts + 1, error = ?, sent_at = CASE WHEN ? = 1 THEN datetime(\'now\') ELSE NULL END WHERE id = ?'),
  getMessages: db.prepare('SELECT * FROM messages WHERE session_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?'),
  getMessageStats: db.prepare('SELECT status, COUNT(*) as count FROM messages WHERE session_id = ? GROUP BY status'),
  getPendingMessages: db.prepare('SELECT * FROM messages WHERE session_id = ? AND status = \'pending\' ORDER BY created_at ASC'),
};

export default { db, stmts };
