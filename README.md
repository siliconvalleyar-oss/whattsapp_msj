# 📱 WhatsApp Masivo — Envío Automatizado de Mensajes

Sistema de automatización para el envío de mensajes por WhatsApp utilizando [`whatsapp-web.js`](https://docs.wwebjs.dev/), que controla WhatsApp Web mediante Puppeteer.

> ⚠️ **Aviso**: Uso educativo. La automatización puede violar Términos de Servicio de WhatsApp.

---

## 🧩 ¿Qué hace?

Envía mensajes personalizados a una lista de contactos vía WhatsApp Web. Incluye:

- Autenticación persistente (sin escanear QR cada vez)
- Validación de números (solo envía a números con WhatsApp)
- Logging de cada envío (estado, timestamp)
- Reintentos automáticos en caso de error
- Pausa configurable entre mensajes
- Timeout global configurable

---

## 📂 Estructura

```
whatsapp_prj/
├── .env.example            # Template de configuración (copiar a .env)
├── .gitignore              # Archivos ignorados (sesiones, CSVs, logs)
├── .wwebjs_auth/           # 📛 Sesión WhatsApp (NO subir)
├── .wwebjs_cache/          # 📛 Caché auth (NO subir)
├── LEARNING_SKILL.md       # Guía de aprendizaje
├── README.md               # Este archivo
├── package.json            # Dependencias
├── prueba.js               # Script de prueba simple
├── test_simple.js          # Otra prueba
│
└── whatsapp_masivo/
    ├── lib/                    # 📁 Módulos reutilizables
    │   ├── config.js           #   Config desde .env
    │   ├── phone.js            #   Normalización de números
    │   ├── logger.js           #   Logging a archivo
    │   └── sender.js           #   Núcleo: cliente, envío, reintentos
    ├── enviar.js               # Entry point principal
    ├── enviar_solo_moviles.js  # Solo móviles ✅ (el que funcionó)
    ├── enviar_todos.js         # Toda la lista
    ├── enviar_v2.js            # Con timeout de 5 min
    ├── enviar_final.js         # Con reintentos
    ├── enviar_corregido.js     # Contactos generales
    ├── session/                # 📛 Sesión (NO subir)
    ├── session_moviles/        # 📛 Sesión móviles (NO subir)
    ├── *.csv                   # 📛 Contactos (NO subir)
    ├── *.log                   # 📛 Logs (NO subir)
    └── node_modules/           # 📛 Dependencias (NO subir)
```

> 📛 = Ignorado por `.gitignore`

---

## 🚀 Cómo usar

### 1. Clonar e instalar
```bash
cd whatsapp_prj
npm install
cd whatsapp_masivo && npm install && cd ..
```

### 2. Configurar variables de entorno
```bash
cp .env.example .env
# Editar .env con el mensaje, rutas, sesión, etc.
```

### 3. Preparar contactos
Crea un archivo CSV con formato `teléfono|nombre|dirección`.
El separador es `|` (pipe). Sin espacios alrededor.

Ejemplo:
```
teléfono|nombre|dirección
5491120252485|Juan Pérez|Av. Siempreviva 742
5491170379239|María García|
```

### 4. Ejecutar
```bash
node whatsapp_masivo/enviar.js
# o elegir un wrapper específico:
node whatsapp_masivo/enviar_solo_moviles.js
node whatsapp_masivo/enviar_todos.js
```

### 5. Escanear QR
La primera vez aparece un código QR en la terminal.
Abrí WhatsApp en tu celular → Dispositivos vinculados → Vincular un dispositivo.
La sesión se guarda para no pedir QR nuevamente.

---

## 📜 Scripts disponibles

Todos los scripts son **wrappers delgados** (~10 líneas) que usan los módulos compartidos en `lib/`.

| Script | CSV por defecto | Log | Sesión | Particularidad |
|---|---|---|---|---|
| `enviar.js` | `.env` o `contactos_moviles.csv` | `envio_moviles.log` | `./session_moviles` | Entry point principal |
| `enviar_solo_moviles.js` | `contactos_moviles.csv` | `envio_moviles.log` | `./session_moviles` | ✅ El que funcionó |
| `enviar_todos.js` | `contactos_todos.csv` | `envio_todos.log` | `./session_moviles` | Toda la lista |
| `enviar_v2.js` | `contactos.csv` | `envio.log` | `./session` | Timeout 5 min |
| `enviar_final.js` | `contactos.csv` | `envio.log` | `./session` | Reintentos |
| `enviar_corregido.js` | `contactos.csv` | `envio.log` | Default | Contactos generales |

---

## ⚙️ Variables de entorno

Ver [`.env.example`](./.env.example) para la lista completa.

| Variable | Default | Descripción |
|---|---|---|
| `WHATSAPP_MESSAGE` | `"Buenas tardes..."` | Texto del mensaje |
| `CSV_PATH` | `./contactos_moviles.csv` | Ruta al CSV de contactos |
| `LOG_PATH` | `./envio_moviles.log` | Ruta al archivo de log |
| `SESSION_PATH` | `./session_moviles` | Directorio de sesión |
| `CHROME_PATH` | `/opt/google/chrome/...` | Ejecutable de Chrome |
| `HEADLESS` | `false` | `true` = sin ventana del navegador |
| `DELAY_MS` | `4000` | Pausa entre mensajes (ms) |
| `INITIAL_DELAY_MS` | `5000` | Pausa inicial al conectar (ms) |
| `MAX_RETRIES` | `2` | Reintentos por mensaje fallido |
| `RETRY_DELAY_MS` | `4000` | Pausa entre reintentos (ms) |
| `TIMEOUT_MINUTES` | `0` | Timeout global (0 = sin timeout) |

---

## 🏗️ Arquitectura

```
enviar.js (wrapper ~5 líneas)
    └── lib/sender.js  (núcleo reutilizable)
            ├── lib/config.js   ← Config desde .env
            ├── lib/phone.js    ← Normalización telefónica
            └── lib/logger.js   ← Logging a archivo
```

- Cada wrapper solo establece defaults específicos y llama a `sender.start()`
- El núcleo (`sender.js`) maneja cliente, lectura CSV, envío con reintentos, logging y timeout
- Agregar un nuevo caso de uso = crear un wrapper de 5 líneas

---

## 📚 Aprender más

Ver [`LEARNING_SKILL.md`](./LEARNING_SKILL.md) para una guía paso a paso sobre cómo funciona `whatsapp-web.js`.

---

## 🔐 Seguridad

| Tipo | Archivos | Riesgo |
|---|---|---|
| Contactos | `*.csv` | Nombres, teléfonos y direcciones privadas |
| Sesiones | `.wwebjs_auth/`, `session/` | Acceso completo a tu WhatsApp |
| Logs | `*.log` | Registro de envíos (teléfonos, estados) |
| Dependencias | `node_modules/` | Cientos de archivos innecesarios en el repo |

El `.gitignore` ya excluye todo esto automáticamente.

---

## ⚖️ Legal

- **Privacidad**: No compartas los CSV de contactos.
- **ToS**: WhatsApp no permite automatización oficialmente.
- **Responsabilidad**: Uso educativo bajo tu propia responsabilidad.

---

## 🐙 Subir a Git

```bash
# Verificar que no se suben datos sensibles
git status

# Agregar y commitear
git add .
git commit -m "Descripción de los cambios"

# Subir al remoto
git push origin main
```

> ⚠️ Antes de commitear, revisá `git status` para confirmar que NO se están subiendo archivos sensibles (`.wwebjs_auth/`, `session/`, `*.csv`, `*.log`, `node_modules/`).
