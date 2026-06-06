const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const readline = require('readline');

const MENSAJE = `Buenas tardes. queria consultar precio y stock ?`;

const CSV_PATH = './contactos.csv';
const LOG_PATH = './envio.log';
const SESSION_DIR = './session';

// Limpia el número
function normalizarNumero(raw) {
    let limpio = raw.replace(/[^\d+]/g, '');
    if (!limpio.startsWith('+')) limpio = '+' + limpio;
    return limpio;
}

const client = new Client({
    authStrategy: new LocalAuth({ dataPath: SESSION_DIR }),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--disable-gpu'
        ]
    }
});

client.on('qr', qr => {
    console.log('📲 Escanea este QR con WhatsApp (código aparece a continuación):');
    qrcode.generate(qr, { small: true });
    console.log('Esperando escaneo...');
});

client.on('authenticated', () => {
    console.log('🔐 Autenticación exitosa. Sesión guardada.');
});

client.on('auth_failure', msg => {
    console.error('❌ Fallo autenticación:', msg);
    process.exit(1);
});

client.on('ready', async () => {
    console.log('✅ Cliente listo. Esperando 10 segundos para estabilizar...');
    await new Promise(r => setTimeout(r, 10000));
    await enviarMensajes();
});

client.on('disconnected', (reason) => {
    console.log('⚠️ Cliente desconectado:', reason);
    process.exit(1);
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

    if (contactos.length === 0) {
        console.log('⚠️ No hay contactos en el CSV.');
        client.destroy();
        process.exit(0);
    }

    console.log(`📤 Se enviarán mensajes a ${contactos.length} contactos.\n`);

    for (let i = 0; i < contactos.length; i++) {
        const c = contactos[i];
        const chatId = `${c.numero}@c.us`;
        let enviado = false;
        for (let intento = 1; intento <= 2; intento++) {
            try {
                await client.sendMessage(chatId, MENSAJE);
                console.log(`✅ [${i+1}/${contactos.length}] Enviado a ${c.numero} (${c.nombre})`);
                fs.appendFileSync(LOG_PATH, `${new Date().toISOString()} OK ${c.numero}\n`);
                enviado = true;
                break;
            } catch (err) {
                console.log(`⚠️ Intento ${intento} fallido para ${c.numero}: ${err.message || err}`);
                if (intento === 2) {
                    console.error(`❌ Error definitivo a ${c.numero}: ${err}`);
                    fs.appendFileSync(LOG_PATH, `${new Date().toISOString()} ERROR ${c.numero}: ${err}\n`);
                } else {
                    await new Promise(r => setTimeout(r, 4000));
                }
            }
        }
        // Pausa entre contactos (incluso si falló)
        await new Promise(r => setTimeout(r, 5000));
    }

    console.log('\n🏁 Envío completado.');
    await client.destroy();
    process.exit(0);
}

// Timeout global: si pasa 5 minutos sin terminar, fuerza salida
setTimeout(() => {
    console.error('⏰ Timeout: el proceso tardó demasiado. Saliendo.');
    process.exit(1);
}, 5 * 60 * 1000);

client.initialize();
