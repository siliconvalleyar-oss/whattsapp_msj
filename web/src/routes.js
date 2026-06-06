import { Router } from 'express';
import db from './db.js';
import cfg from './config.js';
import * as whatsapp from './whatsapp.js';
import * as sender from './sender.js';
import * as queue from './queue.js';

const router = Router();

function auth(req, res, next) {
  if (!cfg.apiKey) return next();
  const key = req.headers['x-api-key'];
  if (key !== cfg.apiKey) {
    return res.status(401).json({ error: 'Invalid or missing API key' });
  }
  next();
}

router.use(auth);

// ─── Health ─────────────────────────────────────────────────────
router.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// ─── Sessions ───────────────────────────────────────────────────
router.post('/sessions', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });
    const id = await whatsapp.createSession(name);
    res.status(201).json({ id, name, status: 'initializing' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/sessions', async (req, res) => {
  const sessions = await whatsapp.listSessions();
  res.json(sessions);
});

router.get('/sessions/:id', (req, res) => {
  const status = whatsapp.getSessionStatus(req.params.id);
  if (!status) return res.status(404).json({ error: 'Session not found' });
  res.json(status);
});

router.delete('/sessions/:id', async (req, res) => {
  try {
    await whatsapp.deleteSession(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Contacts ───────────────────────────────────────────────────
router.get('/sessions/:id/contacts', (req, res) => {
  const contacts = db.stmts.getContacts.all(req.params.id);
  res.json(contacts);
});

router.post('/sessions/:id/contacts', (req, res) => {
  const { number, name, address } = req.body;
  if (!number) return res.status(400).json({ error: 'number is required' });
  const info = db.stmts.getSession.get(req.params.id);
  if (!info) return res.status(404).json({ error: 'Session not found' });
  db.stmts.insertContact.run(req.params.id, number.replace(/\D/g, ''), name || '', address || '');
  res.status(201).json({ success: true });
});

router.post('/sessions/:id/contacts/bulk', (req, res) => {
  const { contacts } = req.body;
  if (!Array.isArray(contacts) || contacts.length === 0) {
    return res.status(400).json({ error: 'contacts array required' });
  }
  const insert = db.db.transaction((items) => {
    for (const c of items) {
      db.stmts.insertContact.run(req.params.id, c.number.replace(/\D/g, ''), c.name || '', c.address || '');
    }
  });
  insert(contacts);
  res.status(201).json({ count: contacts.length });
});

router.delete('/sessions/:id/contacts', (req, res) => {
  db.stmts.deleteContactsBySession.run(req.params.id);
  res.json({ success: true });
});

// ─── Messages ───────────────────────────────────────────────────
router.post('/sessions/:id/send', async (req, res) => {
  try {
    const { number, name, message } = req.body;
    if (!number) return res.status(400).json({ error: 'number is required' });
    if (!whatsapp.isConnected(req.params.id)) {
      return res.status(400).json({ error: 'Session not connected' });
    }
    const result = await sender.sendToContact(req.params.id, number, name, message);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/sessions/:id/send/bulk', async (req, res) => {
  try {
    const { message } = req.body;
    if (!whatsapp.isConnected(req.params.id)) {
      return res.status(400).json({ error: 'Session not connected' });
    }
    const result = await sender.sendBulkFromDb(req.params.id, message);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/sessions/:id/send/queue', (req, res) => {
  const { number, name, message } = req.body;
  if (!number) return res.status(400).json({ error: 'number is required' });
  if (!whatsapp.isConnected(req.params.id)) {
    return res.status(400).json({ error: 'Session not connected' });
  }
  const remaining = queue.enqueue(req.params.id, number, name, message);
  res.json({ queued: true, remaining });
});

router.post('/sessions/:id/send/queue/bulk', (req, res) => {
  const { contacts, message } = req.body;
  if (!Array.isArray(contacts) || contacts.length === 0) {
    return res.status(400).json({ error: 'contacts array required' });
  }
  if (!whatsapp.isConnected(req.params.id)) {
    return res.status(400).json({ error: 'Session not connected' });
  }
  const remaining = queue.enqueueMany(req.params.id, contacts, message);
  res.json({ queued: true, total: contacts.length, remaining });
});

router.get('/sessions/:id/queue', (req, res) => {
  res.json({ size: queue.queueSize(req.params.id) });
});

router.delete('/sessions/:id/queue', (req, res) => {
  const cleared = queue.clearQueue(req.params.id);
  res.json({ cleared });
});

router.get('/sessions/:id/messages', (req, res) => {
  const limit = parseInt(req.query.limit || '50', 10);
  const offset = parseInt(req.query.offset || '0', 10);
  const messages = db.stmts.getMessages.all(req.params.id, limit, offset);
  const stats = db.stmts.getMessageStats.all(req.params.id);
  res.json({ messages, stats });
});

router.get('/sessions/:id/stats', (req, res) => {
  const stats = db.stmts.getMessageStats.all(req.params.id);
  res.json(stats);
});

export default router;
