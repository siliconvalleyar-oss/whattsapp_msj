import { getClient } from './whatsapp.js';
import db from './db.js';
import cfg from './config.js';

function applyTemplate(tpl, contact) {
  return tpl
    .replace(/\{\{nombre\}\}/g, contact.name || '')
    .replace(/\{\{numero\}\}/g, contact.number || '')
    .replace(/\{\{direccion\}\}/g, contact.address || '');
}

function normalizeNumber(raw) {
  return raw.replace(/\D/g, '');
}

export async function sendToContact(sessionId, contactNumber, contactName, customMessage) {
  const client = getClient(sessionId);
  if (!client) return { status: 'error', error: 'Session not connected' };

  const number = normalizeNumber(contactNumber);
  const message = customMessage || cfg.defaultMessage;

  const msgId = db.stmts.insertMessage.run(sessionId, number, contactName || '?', message, 'pending').lastInsertRowid;

  const chatId = `${number}@c.us`;

  try {
    const registeredId = await client.getNumberId(number);
    if (!registeredId) {
      db.stmts.updateMessageStatus.run('no_whatsapp', null, 0, msgId);
      return { status: 'no_whatsapp', number, name: contactName };
    }

    const personalized = applyTemplate(message, { name: contactName || '', number, address: '' });
    await client.sendMessage(chatId, personalized);

    db.stmts.updateMessageStatus.run('sent', null, 1, msgId);
    return { status: 'sent', number, name: contactName };
  } catch (err) {
    db.stmts.updateMessageStatus.run('failed', err.message || String(err), 0, msgId);
    return { status: 'error', error: err.message, number, name: contactName };
  }
}

export async function sendToMany(sessionId, contacts, customMessage) {
  const results = [];
  for (let i = 0; i < contacts.length; i++) {
    const c = contacts[i];
    const result = await sendToContact(sessionId, c.number, c.name, customMessage);
    results.push(result);
    if (i < contacts.length - 1) {
      await new Promise((r) => setTimeout(r, cfg.delayMs));
    }
  }
  return results;
}

export async function sendBulkFromDb(sessionId, customMessage) {
  const contacts = db.stmts.getContacts.all(sessionId);
  if (contacts.length === 0) return { error: 'No contacts for this session' };
  const results = await sendToMany(sessionId, contacts, customMessage);
  const stats = { sent: 0, noWhatsApp: 0, errors: 0, total: results.length };
  for (const r of results) {
    if (r.status === 'sent') stats.sent++;
    else if (r.status === 'no_whatsapp') stats.noWhatsApp++;
    else stats.errors++;
  }
  return { stats, results };
}
