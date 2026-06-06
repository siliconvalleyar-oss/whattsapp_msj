const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const readline = require('readline');

const MENSAJE = `Buenas tardes. queria consultar precio y stock ?`;

const CSV_PATH = './contactos.csv';
const LOG_PATH = './envio.log';

// Función para formatear número: elimina todo excepto dígitos y luego agrega el código de país
function formatearNumero(numeroRaw) {
    // Eliminar espacios, guiones, paréntesis y el signo '+' inicial (lo volveremos a poner)
    let limpio = numeroRaw.replace(/[^\d+]/g, '');
    // Si tiene '+' al inicio, lo respetamos, si no, se lo agregamos
    if (!limpio.startsWith('+')) {
        // Si el número no tiene código de país, asumimos que es Argentina (54)
        // pero nuestros números ya tienen el código, solo falta asegurar el '+'
        limpio = '+' + limpio;
    }
    // Verificar que tenga al menos 10 dígitos después del código
    return limpio;
}

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { headless: true, args: ['--no-sandbox'] }
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
    console.log('Esperando 5 segundos para estabilizar la sesión...');
    await new Promise(resolve => setTimeout(resolve, 5000));
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
            // Verificar si el número es válido para WhatsApp antes de enviar
            const numberDetails = await client.getNumberId(c.telefono);
            if (!numberDetails) {
                console.log(`❌ Número no registrado en WhatsApp: ${c.telefono} (${c.nombre})`);
                continue;
            }
            await client.sendMessage(chatId, MENSAJE);
            console.log(`✅ [${i+1}/${contactos.length}] Enviado a ${c.telefono} (${c.nombre})`);
            // Log en archivo
            fs.appendFileSync(LOG_PATH, `${new Date().toISOString()} - Enviado a ${c.telefono} ${c.nombre}\n`);
            // Espera entre mensajes
            await new Promise(resolve => setTimeout(resolve, 4000));
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
