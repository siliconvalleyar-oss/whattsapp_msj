const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { headless: false }
});

client.on('qr', qr => qrcode.generate(qr, {small: true}));

client.on('ready', async () => {
    console.log('Ready');
    const num = '5491161819436';
    const id = `${num}@c.us`;
    try {
        const exists = await client.getNumberId(num);
        if (exists) {
            await client.sendMessage(id, 'Prueba de correccion');
            console.log('Mensaje enviado correctamente');
        } else {
            console.log('No tiene WhatsApp');
        }
    } catch(e) {
        console.error(e);
    }
    await client.destroy();
});

client.initialize();
