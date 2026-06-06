# 📱 WhatsApp Masivo — Manual de Usuario

## Tres formas de usar el sistema

| Componente | Descripción | Ideal para... |
|---|---|---|
| **Scripts Node.js** (`whatsapp_masivo/`) | Envío directo desde terminal | Envíos rápidos, pruebas, un solo script |
| **CLI en C++** (`cpp/`) | Menú interactivo con estadísticas, CSV viewer, template engine | Usuarios de terminal que quieren control sin escribir código |
| **Plataforma Web** (`web/`) | API REST + Dashboard con multi-sesión, cola de mensajes, SQLite | Equipos, multi-sesión, integración con otros sistemas |

---

# 1. Scripts Node.js (whatsapp_masivo/)

## 1.1 Instalación rápida

```bash
cd whatsapp_prj
npm install
cd whatsapp_masivo && npm install && cd ..
cp .env.example .env
```

## 1.2 Configurar .env

Editar `.env` con el mensaje y rutas deseadas:

```env
WHATSAPP_MESSAGE=Buenas tardes, {{nombre}}. Queria consultar precio y stock?
CSV_PATH=contactos_moviles.csv
LOG_PATH=envio_moviles.log
SESSION_PATH=./session_moviles
DELAY_MS=4000
MAX_RETRIES=3
HEADLESS=false
```

## 1.3 Preparar contactos (CSV)

Crear un archivo CSV con separador `|` (pipe):

```
teléfono|nombre|dirección
5491161819436|Juan Pérez|Av. Siempreviva 742
5491170379239|María García|Calle falsa 123
5215543210987|Carlos López|
```

El formato del número debe ser: `[código país][número]` sin `+` ni espacios.

Ejemplos por país:
| País | Formato | Ejemplo |
|---|---|---|
| Argentina | `54911xxxxxxxx` | `5491161819436` |
| México | `52155xxxxxxxx` | `5215543210987` |
| España | `346xxxxxxxx` | `34612345678` |
| Colombia | `573xxxxxxxxx` | `573001234567` |

## 1.4 Ejecutar

```bash
# Primera vez: escanear QR
node whatsapp_masivo/enviar_solo_moviles.js

# Una vez vinculado, ya no pide QR
node whatsapp_masivo/enviar_todos.js
```

Al ejecutar:
1. Se abre una ventana de Chrome/Chromium
2. Aparece un código QR en la terminal
3. Abrir WhatsApp en el celular → Dispositivos vinculados → Vincular
4. Escanear el QR
5. El sistema comienza a enviar los mensajes automáticamente

## 1.5 Scripts disponibles

| Script | CSV | Log | Sesión | Uso |
|---|---|---|---|---|
| `enviar.js` | `.env` o `contactos_moviles.csv` | `envio_moviles.log` | `./session_moviles` | Entry point general |
| `enviar_solo_moviles.js` | `contactos_moviles.csv` | `envio_moviles.log` | `./session_moviles` | ✅ Recomendado |
| `enviar_todos.js` | `contactos_todos.csv` | `envio_todos.log` | `./session_moviles` | Toda la lista |
| `enviar_v2.js` | `contactos.csv` | `envio.log` | `./session` | Con timeout 5 min |
| `enviar_final.js` | `contactos.csv` | `envio.log` | `./session` | Con reintentos |
| `enviar_corregido.js` | `contactos.csv` | `envio.log` | Default | Contactos generales |

---

# 2. CLI en C++ (cpp/)

## 2.1 Compilar

```bash
cd cpp
cmake -B build
cmake --build build
```

Requiere: CMake 3.16+, g++ 13+ (o cualquier compilador C++20).

## 2.2 Ejecutar

```bash
./build/whatsapp_cli
```

## 2.3 Menú principal

```
╔══════════════════════════════════════════╗
║   📱 WhatsApp Masivo — C++ CLI          ║
╚══════════════════════════════════════════╝

MENÚ PRINCIPAL
═════════════════
  1. 📤  Ejecutar envío WhatsApp
  2. 📇  Ver contactos (CSV)
  3. 📊  Estadísticas de envíos anteriores
  4. ⚙️   Configuración actual
  5. 📝  Ayuda: plantillas de mensajes
  0. ❌ Salir
```

### Opción 1 — Ejecutar envío
Lista los scripts `enviar_*.js` disponibles en `whatsapp_masivo/`. Seleccionás uno, confirmás, y el CLI lo ejecuta mostrando la salida en tiempo real.

### Opción 2 — Ver contactos (CSV)
Lee el archivo CSV configurado en `.env` (`CSV_PATH`). Muestra una tabla con número, nombre y dirección. Permite buscar contactos por nombre.

### Opción 3 — Estadísticas
Busca archivos `.log` en `whatsapp_masivo/` y muestra:
- Mensajes enviados correctamente
- Números sin WhatsApp
- Errores
- Tiempo total del envío
- Últimas entradas del log

### Opción 4 — Configuración
Muestra todas las variables cargadas desde `.env`. Permite ver una vista previa del mensaje con un contacto de ejemplo.

### Opción 5 — Plantillas
Ayuda sobre los placeholders disponibles para personalizar mensajes.

---

# 3. Plataforma Web (web/)

## 3.1 Instalación

```bash
cd web
npm install
cp .env.example .env
# Editar .env si es necesario
```

## 3.2 Iniciar

```bash
# Desarrollo (con auto-reload)
npm run dev

# Producción
npm start
```

Servidor en `http://localhost:3000`

## 3.3 Dashboard web

Abrir `http://localhost:3000` en el navegador.

### Pantalla principal

**Panel izquierdo:**
- **Sessions**: crear nueva sesión (nombre), lista de sesiones con estado
- **QR Code**: aparece automáticamente al crear una sesión nueva

**Panel derecho:**
- **Send Message**: seleccionar sesión, ingresar número, nombre y mensaje
- **Import Contacts**: pegar CSV (formato `número|nombre|dirección`)
- **Activity Log**: eventos en tiempo real (QR, conexión, resultados de envío)

### Estados de sesión

| Estado | Significado |
|---|---|
| `initializing` | Creando cliente, iniciando Chromium |
| `scanning` | Esperando que escanees el QR |
| `connected` | ✅ Listo para enviar mensajes |
| `auth_failure` | ❌ Error de autenticación (reintentar) |
| `disconnected` | ❌ Sesión perdida (reconectar) |

## 3.4 API REST

Todas las rutas requieren header `x-api-key` (configurado en `.env`).

### Sesiones

```bash
# Crear sesión
curl -X POST http://localhost:3000/api/sessions \
  -H "x-api-key: tu-api-key" \
  -H "Content-Type: application/json" \
  -d '{"name": "Mi Sesión"}'

# Listar sesiones
curl -H "x-api-key: tu-api-key" http://localhost:3000/api/sessions

# Ver estado de una sesión
curl -H "x-api-key: tu-api-key" http://localhost:3000/api/sessions/<id>

# Eliminar sesión
curl -X DELETE -H "x-api-key: tu-api-key" http://localhost:3000/api/sessions/<id>
```

### Contactos

```bash
# Importar un contacto
curl -X POST http://localhost:3000/api/sessions/<id>/contacts \
  -H "x-api-key: tu-api-key" \
  -H "Content-Type: application/json" \
  -d '{"number": "5491161819436", "name": "Juan Pérez"}'

# Importar varios (CSV)
curl -X POST http://localhost:3000/api/sessions/<id>/contacts/bulk \
  -H "x-api-key: tu-api-key" \
  -H "Content-Type: application/json" \
  -d '{"contacts": [{"number": "5491161819436", "name": "Juan"}, {"number": "5491170379239", "name": "María"}]}'

# Listar contactos
curl -H "x-api-key: tu-api-key" http://localhost:3000/api/sessions/<id>/contacts
```

### Mensajes

```bash
# Enviar a un contacto
curl -X POST http://localhost:3000/api/sessions/<id>/send \
  -H "x-api-key: tu-api-key" \
  -H "Content-Type: application/json" \
  -d '{"number": "5491161819436", "name": "Juan", "message": "Hola {{nombre}}"}'

# Enviar a todos los contactos de la sesión
curl -X POST http://localhost:3000/api/sessions/<id>/send/bulk \
  -H "x-api-key: tu-api-key" \
  -H "Content-Type: application/json" \
  -d '{"message": "Hola {{nombre}}"}'

# Enviar con cola (no bloqueante, resultados por WebSocket)
curl -X POST http://localhost:3000/api/sessions/<id>/send/queue \
  -H "x-api-key: tu-api-key" \
  -H "Content-Type: application/json" \
  -d '{"number": "5491161819436", "name": "Juan"}'

# Ver historial de mensajes
curl -H "x-api-key: tu-api-key" http://localhost:3000/api/sessions/<id>/messages

# Estadísticas de envío
curl -H "x-api-key: tu-api-key" http://localhost:3000/api/sessions/<id>/stats
```

## 3.5 WebSocket (eventos en tiempo real)

El dashboard usa Socket.IO. Eventos disponibles:

| Evento | Dirección | Datos |
|---|---|---|
| `qr` | Servidor → Cliente | `{ sessionId, qr }` (código QR) |
| `ready` | Servidor → Cliente | `{ sessionId, phone }` (conectado) |
| `auth_failure` | Servidor → Cliente | `{ sessionId, msg }` (error auth) |
| `disconnected` | Servidor → Cliente | `{ sessionId, reason }` (desconectado) |
| `sessions` | Servidor → Cliente | `[{ id, name, status, phone }]` (lista actualizada) |
| `message_result` | Servidor → Cliente | `{ sessionId, number, name, status, remaining }` |
| `queue_empty` | Servidor → Cliente | `{ sessionId }` (cola terminada) |
| `incoming_message` | Servidor → Cliente | `{ sessionId, from, body }` (mensaje entrante) |
| `join_session` | Cliente → Servidor | `sessionId` (suscribirse a una sesión) |

## 3.6 Docker

```bash
cd web
docker compose up -d
```

Esto construye la imagen e inicia el servicio en el puerto 3000. Los datos (SQLite + sesiones) persisten en `web/data/`.

---

# 4. Script de instalación automática

```bash
./scripts_tools/instalar_dependencias.sh
```

Este script detecta el sistema operativo, instala Node.js si no está presente, instala Chromium, cmake, g++, todas las dependencias npm, compila el CLI en C++, y crea el `.env`.

---

# 5. Solución de problemas

## 5.1 El QR no aparece

```bash
# Asegurarse de que HEADLESS=false en .env
HEADLESS=false
```

Con `HEADLESS=true` el navegador se abre en segundo plano y puede no mostrar el QR correctamente en algunos sistemas.

## 5.2 Error "No se pudo iniciar Chromium"

Instalar dependencias faltantes:

```bash
# Debian/Ubuntu
sudo apt install -y chromium-browser

# O configurar CHROME_PATH en .env apuntando a tu Chrome
CHROME_PATH=/usr/bin/google-chrome
```

## 5.3 Error de autenticación

Borrar la carpeta de sesión y escanear el QR nuevamente:

```bash
rm -rf session_moviles/ .wwebjs_auth/
```

## 5.4 "Number not registered" en todos los contactos

Verificar el formato de los números en el CSV. Deben tener el código de país sin `+`:

- Correcto: `5491161819436`
- Incorrecto: `+5491161819436` , `11-6181-9436`, `549 11 6181 9436`

El separador del CSV debe ser `|` (pipe):

```
teléfono|nombre|dirección
```

## 5.5 Rate limiting

WhatsApp puede bloquear temporalmente la cuenta si se envían muchos mensajes muy rápido.

Recomendaciones:
- `DELAY_MS=5000` (5 segundos entre mensajes)
- No más de ~50 mensajes por hora
- No usar cuenta personal para marketing masivo
- Distribuir los envíos en varias sesiones

## 5.6 La plataforma web no arranca

```bash
# Verificar que el puerto no esté ocupado
lsof -i :3000

# Revisar logs
node src/index.js

# Asegurarse de que .env existe en web/
ls -la web/.env
```

## 5.7 El CLI en C++ no compila

```bash
# Verificar versiones
cmake --version   # Requiere 3.16+
g++ --version     # Requiere C++20

# Limpiar build anterior
rm -rf cpp/build
cmake -B build && cmake --build build
```

---

# 6. Flujo de trabajo recomendado

## Primera vez

```bash
# 1. Instalar todo
./scripts_tools/instalar_dependencias.sh

# 2. Editar configuración
nano .env

# 3. Preparar contactos
nano contactos_moviles.csv

# 4. Vincular WhatsApp (solo la primera vez)
node whatsapp_masivo/enviar_solo_moviles.js
# Escanear el QR con el celular

# 5. A partir de ahora ya está vinculado
```

## Uso diario

```bash
# Con scripts Node.js
node whatsapp_masivo/enviar_solo_moviles.js

# Con CLI en C++
./cpp/build/whatsapp_cli

# Con plataforma web
cd web && npm start
# Abrir http://localhost:3000
```

---

# 7. Variables de entorno (referencia completa)

| Variable | Default | Componente | Descripción |
|---|---|---|---|
| `WHATSAPP_MESSAGE` | `"Buenas tardes..."` | Todos | Plantilla del mensaje |
| `CSV_PATH` | `./contactos_moviles.csv` | Node.js, C++ | Ruta al CSV |
| `LOG_PATH` | `./envio_moviles.log` | Node.js, C++ | Ruta al log |
| `SESSION_PATH` | `./session_moviles` | Node.js | Directorio de sesión |
| `CHROME_PATH` | auto-detect | Todos | Ruta a Chrome/Chromium |
| `HEADLESS` | `false` | Todos | `true` = sin ventana |
| `DELAY_MS` | `4000` | Todos | Pausa entre mensajes (ms) |
| `INITIAL_DELAY_MS` | `5000` | Node.js, Web | Pausa inicial al conectar |
| `MAX_RETRIES` | `2` | Todos | Reintentos por fallo |
| `RETRY_DELAY_MS` | `4000` | Todos | Pausa entre reintentos |
| `TIMEOUT_MINUTES` | `0` | Node.js, Web | Timeout global (0 = sin límite) |
| `PORT` | `3000` | Web | Puerto del servidor web |
| `HOST` | `0.0.0.0` | Web | Interfaz de red |
| `DB_PATH` | `./data/whatsapp.db` | Web | Ruta a SQLite |
| `API_KEY` | `(vacía)` | Web | Clave para API REST |

---

# 8. Seguridad

## Datos sensibles

| Tipo | Archivos | Riesgo |
|---|---|---|
| Contactos | `*.csv` | Nombres, teléfonos, direcciones privadas |
| Sesiones | `.wwebjs_auth/`, `session*`, `web/data/sessions/` | Acceso completo a tu WhatsApp |
| Logs | `*.log` | Registro de envíos con teléfonos |
| Base de datos | `web/data/whatsapp.db` | Historial completo de mensajes |

## Buenas prácticas

- No subir a git ningún archivo con datos personales
- Usar `API_KEY` fuerte en producción (plataforma web)
- No exponer el puerto 3000 a internet sin autenticación
- Rotar sesiones periódicamente
- Mantener actualizadas las dependencias (`npm audit`)

---

# 9. Arquitectura del sistema

```
                    ┌──────────────────────┐
                    │   whatsaApp Web       │
                    │   (navegador)          │
                    └──────────┬───────────┘
                               │ Puppeteer
                    ┌──────────▼───────────┐
                    │  whatsapp-web.js      │
                    │  (Cliente Node.js)    │
                    └──┬──────────────┬────┘
                       │              │
              ┌────────▼──┐    ┌──────▼────────┐
              │ Scripts    │    │ Plataforma    │
              │ Node.js    │    │ Web (Express) │
              │ (CLI)      │    │ + Socket.IO   │
              └─────┬──────┘    └───────┬────────┘
                    │                   │
              ┌─────▼──────┐    ┌──────▼────────┐
              │ CLI C++    │    │ SQLite (DB)    │
              │ (Menú)     │    │ + Queue        │
              └────────────┘    └───────────────┘
```

---

# 10. Referencias

- [whatsapp-web.js docs](https://docs.wwebjs.dev/)
- [Puppeteer docs](https://pptr.dev/)
- [Express docs](https://expressjs.com/)
- [Socket.IO docs](https://socket.io/)
- [better-sqlite3 docs](https://github.com/WiseLibs/better-sqlite3)
