# 📱 WhatsApp Masivo — Envío Automatizado de Mensajes

Sistema de automatización para el envío de mensajes por WhatsApp utilizando [`whatsapp-web.js`](https://docs.wwebjs.dev/), que controla WhatsApp Web mediante Puppeteer.

> ⚠️ **Aviso**: Uso educativo. La automatización puede violar Términos de Servicio de WhatsApp.

---

## 🧩 ¿Qué hace?

Envía mensajes personalizados a una lista de contactos vía WhatsApp Web. Incluye:

- Autenticación persistente (sin escanear QR cada vez)
- Validación de números (solo envía a números con WhatsApp)
- Logging de cada envío (estado, timestamp)
- Reanudación automática (no reenvía a contactos ya procesados)
- Múltiples versiones del script para distintos casos

---

## 📂 Estructura

```
whatsapp_prj/
├── .gitignore              # Archivos ignorados (sesiones, CSVs, logs)
├── .wwebjs_auth/           # 📛 Sesión WhatsApp (NO subir)
├── .wwebjs_cache/          # 📛 Caché auth (NO subir)
├── LEARNING_SKILL.md       # Guía de aprendizaje
├── README.md               # Este archivo
├── enviar_msj.sh           # Script shell orquestador
├── package.json            # Dependencias
├── prueba.js               # Script de prueba simple
├── test_simple.js          # Otra prueba
│
└── whatsapp_masivo/
    ├── *.csv               # 📛 Contactos (NO subir)
    ├── enviar.js           # Envío v1
    ├── enviar_v2.js        # Envío v2
    ├── enviar_final.js     # Envío v3
    ├── enviar_todos.js     # A toda la lista
    ├── enviar_solo_moviles.js
    ├── enviar_corregido.js # Versión corregida
    ├── session/            # 📛 Sesión (NO subir)
    ├── session_moviles/    # 📛 Sesión móviles (NO subir)
    ├── *.log               # 📛 Logs (NO subir)
    └── node_modules/       # 📛 Dependencias (NO subir)
```

> 📛 = Ignorado por `.gitignore`

---

## 🚀 Cómo usar

### 1. Instalar
```bash
cd whatsapp_prj
npm install
```

### 2. Preparar contactos
Crea un CSV con formato: `nombre,numero,direccion`

### 3. Configurar mensaje
Edita el script `enviar_msj.sh` o los JS en `whatsapp_masivo/`

### 4. Ejecutar
```bash
./enviar_msj.sh
# o
node whatsapp_masivo/enviar.js
```

### 5. Escanear QR
La primera vez aparece un QR en la terminal. Escanéalo con WhatsApp → Dispositivos vinculados.

---

## 📜 Scripts

| Script | Descripción |
|---|---|
| `prueba.js` | Envío de prueba a 1 contacto |
| `whatsapp_masivo/enviar.js` | Envío masivo v1 |
| `whatsapp_masivo/enviar_v2.js` | Envío masivo v2 |
| `whatsapp_masivo/enviar_final.js` | Versión final |
| `whatsapp_masivo/enviar_todos.js` | Enviar a toda la lista |
| `whatsapp_masivo/enviar_solo_moviles.js` | Solo móviles |
| `whatsapp_masivo/enviar_corregido.js` | Versión corregida |
| `enviar_msj.sh` | Script orquestador completo |

---

## 🔐 Seguridad

| Tipo | Archivos | Riesgo |
|---|---|---|
| Contactos | `*.csv` | Nombres, teléfonos y direcciones privadas |
| Sesiones | `.wwebjs_auth/`, `session/` | Acceso completo a tu WhatsApp |
| Logs | `*.log` | Registro de envíos |
| Dependencias | `node_modules/` | Cientos de archivos innecesarios |

El `.gitignore` ya excluye todo esto automáticamente.

---

## 📚 Aprender más

Ver [`LEARNING_SKILL.md`](./LEARNING_SKILL.md) para una guía paso a paso.

---

## ⚖️ Legal

- **Privacidad**: No compartas los CSV de contactos.
- **ToS**: WhatsApp no permite automatización oficialmente.
- **Responsabilidad**: Uso educativo bajo tu propia responsabilidad.

---

## 🐙 Subir a Git

```bash
# Inicializar repo
git init

# Agregar archivos (el .gitignore ya excluye datos sensibles)
git add .

# Verificar qué se va a commitear
git status

# Hacer el primer commit
git commit -m "Initial commit: WhatsApp bulk messaging system"

# Conectar con repositorio remoto (crear en GitHub/GitLab primero)
git remote add origin <url-del-repositorio>

# Subir
git push -u origin main
```

> ⚠️ Antes del primer commit, revisa `git status` para confirmar que NO se están subiendo archivos sensibles (`.wwebjs_auth/`, `session/`, `*.csv`, `*.log`, `node_modules/`).
