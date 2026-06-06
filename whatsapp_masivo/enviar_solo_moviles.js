const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const readline = require('readline');

const MENSAJE = `Buenas tardes. queria consultar precio y stock ?`;

const CSV_PATH = './contactos_moviles.csv';
const LOG_PATH = './envio_moviles.log';

// Normaliza el número: elimina espacios y deja solo dígitos y el '+'
// Luego, para el chatId, se usa el número tal cual (con +) seguido de @c.us
function normalizarNumero(raw) {
    // Elimina todo excepto dígitos
    let limpio = raw.replace(/\D/g, '');
    return limpio;
}

const client = new Client({
    authStrategy: new LocalAuth({ dataPath: './session_moviles' }),
    puppeteer: {
        headless: false,
        executablePath: '/opt/google/chrome/google-chrome',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

client.on('qr', qr => {
    console.log('📲 Escanea este QR con WhatsApp:');
    qrcode.generate(qr, { small: true });
});

client.on('ready', async () => {
    console.log('✅ Conectado. Verificando números...');
    await new Promise(r => setTimeout(r, 5000));
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

    console.log(`📤 Se enviará mensaje a ${contactos.length} contacto(s) móvil(es).\n`);

    for (let i = 0; i < contactos.length; i++) {
        const c = contactos[i];
        const chatId = `${c.numero}@c.us`;
        try {
            // Verify number exists first
            const exists = await client.getNumberId(c.numero);
            if (!exists) {
                console.log(`⚠️ ${c.numero} (${c.nombre}) no tiene WhatsApp`);
                fs.appendFileSync(LOG_PATH, `${new Date().toISOString()} NO_WA ${c.numero}\n`);
                continue;
            }
            await client.sendMessage(chatId, MENSAJE);
            console.log(`✅ [${i+1}/${contactos.length}] Enviado a ${c.numero} (${c.nombre})`);
            fs.appendFileSync(LOG_PATH, `${new Date().toISOString()} OK ${c.numero}\n`);
            await new Promise(r => setTimeout(r, 4000));
        } catch (err) {
            console.error(`❌ Error con ${c.numero}: ${err.message || err}\n${err.stack || err}`);
            fs.appendFileSync(LOG_PATH, `${new Date().toISOString()} ERROR ${c.numero}: ${err.stack || JSON.stringify(err)}\n`);
        }
    }

    console.log('\n🏁 Envío completado.');
    await client.destroy();
    process.exit(0);
}

client.initialize();
