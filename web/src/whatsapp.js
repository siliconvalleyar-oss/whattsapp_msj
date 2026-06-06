import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import { v4 as uuid } from 'uuid';
import db from './db.js';
import cfg from './config.js';

const clients = new Map();

function createClient(sessionId, sessionName) {
  const client = new Client({
    authStrategy: new LocalAuth({
      dataPath: `./data/sessions/${sessionId}`,
    }),
    puppeteer: {
      headless: cfg.headless,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
    },
  });

  client.on('qr', (qr) => {
    const io = global.io;
    if (io) {
      io.to(`session:${sessionId}`).emit('qr', { sessionId, qr });
    }
    db.stmts.updateSessionStatus.run('scanning', null, sessionId);
  });

  client.on('ready', async () => {
    const info = client.info;
    const phone = info?.wid?.user || info?.me?.user || '';
    db.stmts.insertSession.run(sessionId, sessionName, 'connected', phone);
    const io = global.io;
    if (io) {
      io.to(`session:${sessionId}`).emit('ready', { sessionId, phone });
      broadcastSessions(io);
    }
  });

  client.on('auth_failure', (msg) => {
    db.stmts.updateSessionStatus.run('auth_failure', null, sessionId);
    const io = global.io;
    if (io) {
      io.to(`session:${sessionId}`).emit('auth_failure', { sessionId, msg });
      broadcastSessions(io);
    }
  });

  client.on('disconnected', (reason) => {
    db.stmts.updateSessionStatus.run('disconnected', null, sessionId);
    clients.delete(sessionId);
    const io = global.io;
    if (io) {
      io.to(`session:${sessionId}`).emit('disconnected', { sessionId, reason });
      broadcastSessions(io);
    }
  });

  client.on('message', async (msg) => {
    if (msg.fromMe) return;
    const io = global.io;
    if (io) {
      io.to(`session:${sessionId}`).emit('incoming_message', {
        sessionId,
        from: msg.from,
        body: msg.body,
        timestamp: msg.timestamp,
      });
    }
  });

  return client;
}

export async function createSession(name) {
  const id = uuid();
  db.stmts.insertSession.run(id, name, 'initializing', null);
  const client = createClient(id, name);
  clients.set(id, client);
  client.initialize();
  return id;
}

export function getClient(sessionId) {
  return clients.get(sessionId) || null;
}

export async function deleteSession(sessionId) {
  const client = clients.get(sessionId);
  if (client) {
    try { await client.destroy(); } catch {}
    clients.delete(sessionId);
  }
  db.stmts.deleteSession.run(sessionId);
}

export async function listSessions() {
  return db.stmts.listSessions.all();
}

export function getSessionStatus(sessionId) {
  const row = db.stmts.getSession.get(sessionId);
  const client = clients.get(sessionId);
  return {
    ...row,
    connected: !!client && (client.info?.wid?.user ? true : false),
  };
}

export function isConnected(sessionId) {
  const client = clients.get(sessionId);
  return !!client && !!client.info?.wid?.user;
}

export function broadcastSessions(io) {
  const sessions = db.stmts.listSessions.all();
  io.emit('sessions', sessions);
}

export async function destroyAll() {
  for (const [id, client] of clients) {
    try { await client.destroy(); } catch {}
  }
  clients.clear();
}
