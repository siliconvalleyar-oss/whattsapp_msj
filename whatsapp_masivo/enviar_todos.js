require('dotenv').config();

const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const readline = require('readline');

const MENSAJE = process.env.WHATSAPP_MESSAGE || 'Buenas tardes. queria consultar precio y stock ?';
const CSV_PATH = process.env.CSV_PATH || './contactos_todos.csv';
const LOG_PATH = process.env.LOG_PATH || './envio_todos.log';
const SESSION_PATH = process.env.SESSION_PATH || './session_moviles';
const CHROME_PATH = process.env.CHROME_PATH || '/opt/google/chrome/google-chrome';
const HEADLESS_ENABLED = process.env.HEADLESS === 'true';
const DELAY_MS = parseInt(process.env.DELAY_MS || '4000', 10);
const INITIAL_DELAY_MS = parseInt(process.env.INITIAL_DELAY_MS || '5000', 10);

function normalizarNumero(raw) {
    let limpio = raw.replace(/\D/g, '');
    return limpio;
}

const puppeteerConfig = {
    headless: HEADLESS_ENABLED,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
};
if (CHROME_PATH) {
    puppeteerConfig.executablePath = CHROME_PATH;
}

const client = new Client({
    authStrategy: new LocalAuth({ dataPath: SESSION_PATH }),
    puppeteer: puppeteerConfig
});

client.on('qr', qr => {
    console.log('📲 Escanea este QR con WhatsApp:');
    qrcode.generate(qr, { small: true });
});

client.on('ready', async () => {
    console.log('✅ Conectado. Verificando números...');
    await new Promise(r => setTimeout(r, INITIAL_DELAY_MS));
    await enviarMensajes();
});

async function enviarMensajes() {
    const contactos = [];
    let stats = { enviados: 0, sinWA: 0, errores: 0 };
    const tiempoInicio = Date.now();
    const rl = readline.createInterface({
        input: fs.createReadStream(CSV_PATH)
    });

    let primera = true;
    for await (const linea of rl) {
        if (primera) { primera = false; continue; }
        if (!linea.trim()) continue;
        const partes = linea.split('|');
        if (partes.length < 1) continue;
        let telefonoRaw = partes[0].trim();
        let telefono = normalizarNumero(telefonoRaw);
        contactos.push({
            numero: telefono,
            nombre: partes[1] || '?'
        });
    }

    console.log(`📤 Se enviará mensaje a ${contactos.length} contacto(s).\n`);

    for (let i = 0; i < contactos.length; i++) {
        const c = contactos[i];
        const chatId = `${c.numero}@c.us`;
        try {
            const exists = await client.getNumberId(c.numero);
            if (!exists) {
                stats.sinWA++;
                console.log(`⚠️ [${i+1}/${contactos.length}] ${c.numero} (${c.nombre}) no tiene WhatsApp`);
                fs.appendFileSync(LOG_PATH, `${new Date().toISOString()} NO_WA ${c.numero}\n`);
                continue;
            }
            await client.sendMessage(chatId, MENSAJE);
            stats.enviados++;
            console.log(`✅ [${i+1}/${contactos.length}] Enviado a ${c.numero} (${c.nombre})`);
            fs.appendFileSync(LOG_PATH, `${new Date().toISOString()} OK ${c.numero}\n`);
            await new Promise(r => setTimeout(r, DELAY_MS));
        } catch (err) {
            stats.errores++;
            console.error(`❌ Error con ${c.numero}: ${err.message || err}\n${err.stack || err}`);
            fs.appendFileSync(LOG_PATH, `${new Date().toISOString()} ERROR ${c.numero}: ${err.stack || JSON.stringify(err)}\n`);
        }
    }

    const tiempoFin = Date.now();
    const segundos = Math.round((tiempoFin - tiempoInicio) / 1000);
    const mins = Math.floor(segundos / 60);
    const secs = segundos % 60;

    console.log('\n═══════════════════════════════');
    console.log('🏁 ENVÍO COMPLETADO');
    console.log('═══════════════════════════════');
    console.log(`✅ Enviados:    ${stats.enviados}`);
    console.log(`⚠️ Sin WhatsApp: ${stats.sinWA}`);
    console.log(`❌ Errores:     ${stats.errores}`);
    console.log(`📊 Total:       ${contactos.length}`);
    console.log(`⏱ Tiempo:      ${mins}m ${secs}s`);
    console.log('═══════════════════════════════\n');

    fs.appendFileSync(LOG_PATH, `=== RESUMEN: ${stats.enviados} enviados, ${stats.sinWA} sin WA, ${stats.errores} errores, ${contactos.length} total, ${mins}m ${secs}s ===\n`);

    await client.destroy();
    process.exit(0);
}

client.initialize();
