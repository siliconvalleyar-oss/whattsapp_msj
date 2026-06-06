const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const readline = require('readline');

const MENSAJE = `Buenas tardes. queria consultar precio y stock ?`;

const CSV_PATH = './contactos.csv';
const LOG_PATH = './envio.log';

// Limpia el número: deja solo dígitos y el signo '+'
function normalizarNumero(raw) {
    let limpio = raw.replace(/[^\d+]/g, '');
    if (!limpio.startsWith('+')) limpio = '+' + limpio;
    return limpio;
}

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

client.on('qr', qr => {
    console.log('📲 Escanea este QR con WhatsApp:');
    qrcode.generate(qr, { small: true });
});

client.on('ready', async () => {
    console.log('✅ Conectado. Esperando 8 segundos para estabilizar...');
    await new Promise(r => setTimeout(r, 8000));
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
        await new Promise(r => setTimeout(r, 4000)); // pausa entre contactos
    }

    console.log('\n🏁 Envío completado.');
    client.destroy();
    process.exit(0);
}

client.initialize();
