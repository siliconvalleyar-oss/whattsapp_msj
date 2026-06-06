require('dotenv').config();

const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const readline = require('readline');

const MENSAJE = process.env.WHATSAPP_MESSAGE || 'Buenas tardes. queria consultar precio y stock ?';
const CSV_PATH = process.env.CSV_PATH || './contactos.csv';
const LOG_PATH = process.env.LOG_PATH || './envio.log';
const SESSION_PATH = process.env.SESSION_PATH || './session';
const HEADLESS_ENABLED = process.env.HEADLESS === 'true';
const DELAY_MS = parseInt(process.env.DELAY_MS || '4000', 10);
const INITIAL_DELAY_MS = parseInt(process.env.INITIAL_DELAY_MS || '8000', 10);

function normalizarNumero(raw) {
    let limpio = raw.replace(/[^\d+]/g, '');
    if (!limpio.startsWith('+')) limpio = '+' + limpio;
    return limpio;
}

const puppeteerConfig = {
    headless: HEADLESS_ENABLED,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
};
const chromePath = process.env.CHROME_PATH;
if (chromePath) {
    puppeteerConfig.executablePath = chromePath;
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
    console.log('✅ Conectado. Esperando segundos para estabilizar...');
    await new Promise(r => setTimeout(r, INITIAL_DELAY_MS));
    await enviarMensajes();
});

async function enviarMensajes() {
    const contactos = [];
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

    console.log(`📤 Enviando a ${contactos.length} contactos...\n`);

    for (let i = 0; i < contactos.length; i++) {
        const c = contactos[i];
        const chatId = `${c.numero}@c.us`;
        let intentos = 0;
        let exito = false;

        while (intentos < 2 && !exito) {
            try {
                await client.sendMessage(chatId, MENSAJE);
                console.log(`✅ [${i+1}/${contactos.length}] Enviado a ${c.numero} (${c.nombre})`);
                fs.appendFileSync(LOG_PATH, `${new Date().toISOString()} OK ${c.numero}\n`);
                exito = true;
            } catch (err) {
                intentos++;
                console.log(`⚠️ Intento ${intentos} fallido para ${c.numero}: ${err.message || err}`);
                if (intentos === 2) {
                    console.error(`❌ Error definitivo a ${c.numero}: ${err}`);
                    fs.appendFileSync(LOG_PATH, `${new Date().toISOString()} ERROR ${c.numero}: ${err}\n`);
                } else {
                    await new Promise(r => setTimeout(r, 3000));
                }
            }
        }
        await new Promise(r => setTimeout(r, DELAY_MS));
    }

    console.log('\n🏁 Envío completado.');
    client.destroy();
    process.exit(0);
}

client.initialize();
