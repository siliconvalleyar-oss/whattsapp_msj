const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const readline = require('readline');

const MENSAJE = `Buenas tardes. queria consultar precio y stock ?`;

const CSV_PATH = './contactos.csv';

const client = new Client({
    authStrategy: new LocalAuth()
});

client.on('qr', qr => {
    console.log('📲 Escanea este código QR con WhatsApp (Web o App):');
    qrcode.generate(qr, { small: true });
});

client.on('ready', async () => {
    console.log('✅ Bot conectado. Enviando mensajes...');
    await enviarMensajes();
});

async function enviarMensajes() {
    const contactos = [];
    const stream = fs.createReadStream(CSV_PATH);
    const rl = readline.createInterface({ input: stream });

    let isFirstLine = true;
    for await (const line of rl) {
        if (isFirstLine) { isFirstLine = false; continue; } // saltar cabecera
        if (line.trim() === "") continue;
        const partes = line.split('|');
        if (partes.length >= 1) {
            let telefono = partes[0].trim();
            // Limpiar caracteres no numéricos excepto '+'
            telefono = telefono.replace(/[^0-9+]/g, '');
            if (!telefono.startsWith('+')) telefono = '+' + telefono;
            contactos.push({ telefono, nombre: partes[1] || '', direccion: partes[2] || '' });
        }
    }

    console.log(`📤 Se enviará mensaje a ${contactos.length} contactos.`);
    for (let i = 0; i < contactos.length; i++) {
        const c = contactos[i];
        const chatId = `${c.telefono}@c.us`;
        try {
            await client.sendMessage(chatId, MENSAJE);
            console.log(`✅ [${i+1}/${contactos.length}] Enviado a ${c.telefono} (${c.nombre})`);
            // Esperar 3 segundos entre mensajes para evitar bloqueos
            await new Promise(resolve => setTimeout(resolve, 3000));
        } catch (err) {
            console.error(`❌ Error al enviar a ${c.telefono}:`, err.message);
        }
    }
    console.log('🏁 Envío completado.');
    client.destroy();
    process.exit(0);
}

client.initialize();
