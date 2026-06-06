require('dotenv').config();

const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const readline = require('readline');

const MENSAJE = process.env.WHATSAPP_MESSAGE || 'Buenas tardes. queria consultar precio y stock ?';
const CSV_PATH = process.env.CSV_PATH || './contactos.csv';
const LOG_PATH = process.env.LOG_PATH || './envio.log';
const HEADLESS_ENABLED = process.env.HEADLESS === 'true';
const DELAY_MS = parseInt(process.env.DELAY_MS || '4000', 10);
const INITIAL_DELAY_MS = parseInt(process.env.INITIAL_DELAY_MS || '5000', 10);

function formatearNumero(numeroRaw) {
    let limpio = numeroRaw.replace(/[^\d+]/g, '');
    if (!limpio.startsWith('+')) {
        limpio = '+' + limpio;
    }
    return limpio;
}

const puppeteerConfig = {
    headless: HEADLESS_ENABLED,
    args: ['--no-sandbox']
};
const chromePath = process.env.CHROME_PATH;
if (chromePath) {
    puppeteerConfig.executablePath = chromePath;
}

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: puppeteerConfig
});

client.on('qr', qr => {
    console.log('📲 Escanea este código QR con WhatsApp (Web o App):');
    qrcode.generate(qr, { small: true });
    console.log('Esperando escaneo...');
});

client.on('authenticated', () => {
    console.log('🔐 Autenticación exitosa.');
});

client.on('ready', async () => {
    console.log('✅ Bot conectado y listo.');
    console.log('Esperando segundos para estabilizar la sesión...');
    await new Promise(resolve => setTimeout(resolve, INITIAL_DELAY_MS));
    await enviarMensajes();
});

async function enviarMensajes() {
    const contactos = [];
    const fileStream = fs.createReadStream(CSV_PATH);
    const rl = readline.createInterface({ input: fileStream });

    let isFirstLine = true;
    for await (const line of rl) {
        if (isFirstLine) { isFirstLine = false; continue; }
        if (!line.trim()) continue;
        const partes = line.split('|');
        if (partes.length < 1) continue;
        let rawNum = partes[0].trim();
        let telefono = formatearNumero(rawNum);
        if (!telefono || telefono === '+') {
            console.log(`⚠️ Número inválido (omitido): ${rawNum}`);
            continue;
        }
        contactos.push({
            telefono: telefono,
            nombre: partes[1] || '',
            direccion: partes[2] || '',
            raw: rawNum
        });
    }

    if (contactos.length === 0) {
        console.log('❌ No hay contactos válidos para enviar.');
        client.destroy();
        process.exit(1);
    }

    console.log(`📤 Se enviará mensaje a ${contactos.length} contactos.\n`);

    for (let i = 0; i < contactos.length; i++) {
        const c = contactos[i];
        const chatId = `${c.telefono}@c.us`;
        try {
            const numberDetails = await client.getNumberId(c.telefono);
            if (!numberDetails) {
                console.log(`❌ Número no registrado en WhatsApp: ${c.telefono} (${c.nombre})`);
                continue;
            }
            await client.sendMessage(chatId, MENSAJE);
            console.log(`✅ [${i+1}/${contactos.length}] Enviado a ${c.telefono} (${c.nombre})`);
            fs.appendFileSync(LOG_PATH, `${new Date().toISOString()} - Enviado a ${c.telefono} ${c.nombre}\n`);
            await new Promise(resolve => setTimeout(resolve, DELAY_MS));
        } catch (err) {
            console.error(`❌ Error enviando a ${c.telefono} (${c.nombre}): ${err.message || err}`);
            fs.appendFileSync(LOG_PATH, `${new Date().toISOString()} - ERROR ${c.telefono}: ${err.message || err}\n`);
        }
    }
    console.log('\n🏁 Envío completado.');
    client.destroy();
    process.exit(0);
}

client.initialize();
