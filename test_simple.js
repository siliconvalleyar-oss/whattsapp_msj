const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { headless: false }  // Modo visible para depurar
});

client.on('qr', qr => qrcode.generate(qr, {small: true}));
client.on('ready', async () => {
    console.log('Listo');
    const numero = '5491161819436'; // Sin '+', solo dígitos
    const chatId = `${numero}@c.us`;
    try {
        await client.sendMessage(chatId, 'Hola, prueba');
        console.log('Enviado');
    } catch(e) { console.error(e); }
    await client.destroy();
});
client.initialize();

