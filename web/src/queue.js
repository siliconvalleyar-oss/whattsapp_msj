import { sendToContact } from './sender.js';
import db from './db.js';
import cfg from './config.js';

const queues = new Map();

function getQueue(sessionId) {
  if (!queues.has(sessionId)) {
    queues.set(sessionId, []);
  }
  return queues.get(sessionId);
}

export function enqueue(sessionId, contactNumber, contactName, customMessage) {
  const q = getQueue(sessionId);
  const task = { contactNumber, contactName, customMessage };
  q.push(task);
  processQueue(sessionId);
  return q.length;
}

export function enqueueMany(sessionId, contacts, customMessage) {
  const q = getQueue(sessionId);
  for (const c of contacts) {
    q.push({ contactNumber: c.number, contactName: c.name, customMessage });
  }
  processQueue(sessionId);
  return q.length;
}

let processing = new Set();

async function processQueue(sessionId) {
  if (processing.has(sessionId)) return;
  processing.add(sessionId);

  const q = getQueue(sessionId);
  const io = global.io;

  while (q.length > 0) {
    const task = q.shift();
    const result = await sendToContact(sessionId, task.contactNumber, task.contactName, task.customMessage);

    if (io) {
      io.to(`session:${sessionId}`).emit('message_result', {
        sessionId,
        ...result,
        remaining: q.length,
      });
    }

    if (q.length > 0) {
      await new Promise((r) => setTimeout(r, cfg.delayMs));
    }
  }

  processing.delete(sessionId);

  if (io) {
    io.to(`session:${sessionId}`).emit('queue_empty', { sessionId });
  }
}

export function queueSize(sessionId) {
  return getQueue(sessionId).length;
}

export function clearQueue(sessionId) {
  const q = getQueue(sessionId);
  const len = q.length;
  q.length = 0;
  return len;
}
