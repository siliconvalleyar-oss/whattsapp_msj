const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const readline = require('readline');

const config = require('./config');
const phone = require('./phone');
const logger = require('./logger');

// ─── Cliente WhatsApp ──────────────────────────────────────────

function createClient(sessionPath) {
  const puppeteerConfig = {
    headless: config.headless,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  };
  if (config.chromePath) {
    puppeteerConfig.executablePath = config.chromePath;
  }

  return new Client({
    authStrategy: new LocalAuth({
      dataPath: sessionPath || config.sessionPath,
    }),
    puppeteer: puppeteerConfig,
  });
}

// ─── Lectura de CSV ───────────────────────────────────────────

async function readContacts(csvPath, { normalizeFn = phone.normalize } = {}) {
  const contacts = [];
  const rl = readline.createInterface({
    input: fs.createReadStream(csvPath || config.csvPath),
  });

  let first = true;
  for await (const line of rl) {
    if (first) {
      first = false;
      continue;
    }
    if (!line.trim()) continue;

    const parts = line.split('|');
    if (parts.length < 1) continue;

    contacts.push({
      number: normalizeFn(parts[0].trim()),
      name: parts[1]?.trim() || '?',
      address: parts[2]?.trim() || '',
    });
  }

  return contacts;
}

// ─── Envío individual con reintentos ───────────────────────────

async function sendToContact(client, contact, customMessage) {
  const message = customMessage || config.message;
  const chatId = `${contact.number}@c.us`;

  // Verificar que el número existe en WhatsApp
  const registeredId = await client.getNumberId(contact.number);
  if (!registeredId) {
    return { status: 'no_whatsapp', contact };
  }

  // Enviar mensaje con reintentos
  const maxRetries = config.maxRetries;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await client.sendMessage(chatId, message);
      return { status: 'sent', contact, attempts: attempt };
    } catch (err) {
      if (attempt < maxRetries) {
        console.log(`   ↻ Reintento ${attempt}/${maxRetries} para ${contact.number}...`);
        await new Promise((r) => setTimeout(r, config.retryDelayMs));
      } else {
        throw err; // Último intento falló, propagar error
      }
    }
  }
}

// ─── Bucle de envío ─────────────────────────────────────────────

async function run(client, contacts, { logPath, message, delayMs } = {}) {
  const lp = logPath || config.logPath;
  const stats = { sent: 0, noWhatsApp: 0, errors: 0, total: contacts.length };
  const startTime = Date.now();

  console.log(`📤 Se enviará mensaje a ${contacts.length} contacto(s).\n`);

  for (let i = 0; i < contacts.length; i++) {
    const c = contacts[i];
    try {
      const result = await sendToContact(client, c, message);

      if (result.status === 'no_whatsapp') {
        stats.noWhatsApp++;
        console.log(`⚠️ [${i + 1}/${contacts.length}] ${c.number} (${c.name}) no tiene WhatsApp`);
        logger.write(lp, `NO_WA ${c.number} ${c.name}`);
      } else {
        stats.sent++;
        const retries = result.attempts > 1 ? ` (${result.attempts} intentos)` : '';
        console.log(`✅ [${i + 1}/${contacts.length}] Enviado a ${c.number} (${c.name})${retries}`);
        logger.write(lp, `OK ${c.number} ${c.name}`);
        await new Promise((r) => setTimeout(r, delayMs || config.delayMs));
      }
    } catch (err) {
      stats.errors++;
      console.error(`❌ Error con ${c.number} (${c.name}): ${err.message || err}`);
      logger.write(lp, `ERROR ${c.number} ${c.name}: ${err.message || err}`);
    }
  }

  // Resumen final
  const elapsed = Math.round((Date.now() - startTime) / 1000);
  logger.summary(lp, stats, elapsed);
  console.log(`\n═══════════════════════════════`);
  console.log(`🏁 ENVÍO COMPLETADO`);
  console.log(`✅ Enviados:    ${stats.sent}`);
  console.log(`⚠️ Sin WhatsApp: ${stats.noWhatsApp}`);
  console.log(`❌ Errores:     ${stats.errors}`);
  console.log(`📊 Total:       ${stats.total}`);
  console.log(`⏱ Tiempo:      ${Math.floor(elapsed / 60)}m ${elapsed % 60}s`);
  console.log(`═══════════════════════════════\n`);

  return stats;
}

// ─── Setup de eventos QR / ready ───────────────────────────────

function setupEvents(client, onReady) {
  client.on('qr', (qr) => {
    console.log('📲 Escanea este QR con WhatsApp:');
    qrcode.generate(qr, { small: true });
  });

  client.on('ready', async () => {
    console.log('✅ Conectado. Verificando números...');
    await new Promise((r) => setTimeout(r, config.initialDelayMs));
    await onReady();
  });

  client.on('auth_failure', (msg) => {
    console.error('❌ Fallo de autenticación:', msg);
    process.exit(1);
  });

  return client;
}

// ─── Inicialización completa (entry point único) ───────────────

async function start({ onComplete } = {}) {
  const client = createClient();

  // Timeout global desde config
  if (config.timeoutMinutes > 0) {
    setTimeout(() => {
      console.error(`⏰ Timeout: el proceso tardó más de ${config.timeoutMinutes} min. Saliendo.`);
      process.exit(1);
    }, config.timeoutMinutes * 60 * 1000);
  }

  setupEvents(client, async () => {
    try {
      const contacts = await readContacts();
      await run(client, contacts);
    } finally {
      await client.destroy();
      if (onComplete) onComplete();
      process.exit(0);
    }
  });

  client.initialize();
}

module.exports = {
  createClient,
  readContacts,
  sendToContact,
  run,
  setupEvents,
  start,
};
