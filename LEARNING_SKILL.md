# 🧠 Skill: Enviar Mensajes por WhatsApp con Node.js

## Objetivo
Aprender a automatizar el envío de mensajes por WhatsApp usando `whatsapp-web.js` (Puppeteer + WhatsApp Web).

---

## 📦 Requisitos
- Node.js 18+
- npm
- Conexión a internet
- Teléfono con WhatsApp

---

## 🔧 Instalación
```bash
npm init -y
npm install whatsapp-web.js qrcode-terminal
```

---

## 🚀 Flujo básico

### 1. Inicializar el cliente
```javascript
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { headless: false }
});
```

### 2. Escuchar eventos
```javascript
client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('✅ Conectado');
});

client.on('auth_failure', msg => {
    console.error('❌ Falló autenticación:', msg);
});

client.initialize();
```

### 3. Enviar mensaje
```javascript
client.on('ready', async () => {
    const numero = '5491122334455@c.us';
    const numberId = await client.getNumberId(numero);
    if (numberId) {
        await client.sendMessage(numero, 'Hola, mensaje automatizado');
        console.log('✅ Enviado');
    }
    client.destroy();
});
```

---

## 📋 Formato de números
```
[código país][número]@c.us
Ej: 5491161819436@c.us
```

| País | Formato |
|---|---|
| Argentina | `54911xxxxxxxx@c.us` |
| México | `52155xxxxxxxx@c.us` |
| España | `346xxxxxxxx@c.us` |
| Colombia | `573xxxxxxxxx@c.us` |

---

## 🔒 Sesiones

`LocalAuth` guarda la sesión para no escanear QR cada vez.

```javascript
const client = new Client({
    authStrategy: new LocalAuth({ clientId: 'mi-sesion' })
});
```

Los datos se guardan en `.wwebjs_auth/` y `session/`.
**No subir a git** — contienen credenciales.

---

## 📤 Envío masivo

```javascript
for (const c of contactos) {
    const id = await client.getNumberId(c.numero);
    if (id) {
        await client.sendMessage(c.numero, `Hola ${c.nombre}`);
    }
    await new Promise(r => setTimeout(r, 4000)); // delay
}
```

### Buenas prácticas
| Práctica | Motivo |
|---|---|
| Delay 3-5s entre mensajes | Evitar rate limiting |
| Verificar con `getNumberId()` | No enviar a números sin WhatsApp |
| Loguear cada envío | Trazabilidad |
| Archivar contactos enviados | No duplicar |

---

## ⚠️ Consideraciones

### Rate limiting
- No enviar más de ~50 msg/hora
- No usar cuenta personal para marketing masivo

### Legal
- No usar números sin consentimiento
- WhatsApp puede bloquear cuentas automatizadas
- **Uso educativo**: bajo tu responsabilidad

---

## 🐛 Debug
```javascript
const client = new Client({
    puppeteer: {
        headless: false,
        args: ['--no-sandbox']
    }
});

client.on('disconnected', (reason) => {
    console.log('Desconectado:', reason);
});
```

---

## 📚 Referencias
- [whatsapp-web.js docs](https://docs.wwebjs.dev/)
- [Puppeteer docs](https://pptr.dev/)
