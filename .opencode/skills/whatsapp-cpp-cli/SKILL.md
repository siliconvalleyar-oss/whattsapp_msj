---
name: whatsapp-cpp-cli
description: |
  C++ CLI wrapper for WhatsApp bulk messaging. Use when the user asks about
  the cpp/ directory, the C++ terminal menu, building with CMake, or the
  whatsapp_cli binary. Covers main.cpp, console, csv, config, template,
  runner, and stats modules.
---

# WhatsApp C++ CLI

CLI de terminal interactiva escrita en C++20 que envuelve los scripts Node.js de `whatsapp_masivo/`. Compila con CMake, usa `popen()` para ejecutar scripts Node, parsea CSV, y muestra estadísticas de envío.

## Estructura

```
cpp/
├── CMakeLists.txt
├── README.md
├── build/
└── src/
    ├── main.cpp      # Menú principal, enrutamiento
    ├── console.cpp/h # UI de terminal (colores, menús, input)
    ├── csv.cpp/h     # Lector/filtro de CSV (formato: teléfono|nombre|dirección)
    ├── config.cpp/h  # Carga .env con Config::get() / getInt() / getBool()
    ├── template.cpp/h# Reemplazo de placeholders {{nombre}}, {{numero}}, {{direccion}} y variantes
    ├── runner.cpp/h  # Ejecuta scripts Node con popen(), lista scripts disponibles
    └── stats.cpp/h   # Parseo de logs, estadísticas de envío
```

## Compilar

```bash
cd cpp
cmake -B build
cmake --build build
./build/whatsapp_cli
```

O en un paso: `cmake -B build && cmake --build build && ./build/whatsapp_cli`

## Módulos

### main.cpp
- `projectRoot()` — resuelve la raíz del proyecto desde `__FILE__`
- `menuEnviar()` — lista scripts `enviar_*.js`, confirma y ejecuta con `runNodeScript()`
- `menuContactos()` — lee CSV, imprime tabla, filtra por nombre
- `menuEstadisticas()` — busca `*.log` en `whatsapp_masivo/`, parsea y muestra stats
- `menuConfig()` — muestra variables .env, vista previa de mensaje con template
- `menuPlantillas()` — muestra help de placeholders

### console.cpp
- `clear()`, `pause()`, `input()`, `inputInt()`, `confirm()`
- `menu(title, options)` — menú numerado con opción 0 para salir
- `header()`, `success()`, `info()`, `error()` con emojis y colores ANSI

### csv.cpp
- `readCsv(path)` — lee `teléfono|nombre|dirección`, extrae solo dígitos del teléfono
- `filterByName()` / `filterByPrefix()` — filtros case-insensitive
- `printContacts()` — tabla formateada con `std::setw`

### config.cpp
- `Config` — carga `.env`, expone `get()`, `getInt()`, `getBool()`
- Oculta valores con `PASS` o `SECRET` en el nombre al imprimir

### template.cpp
- `applyTemplate(tpl, contact)` — reemplaza `{{nombre}}`, `{{numero}}`, `{{direccion}}`
- `templateHelp()` — texto de ayuda con placeholders disponibles

### runner.cpp
- `runCommand(cmd)` — `popen()` con captura de stdout/stderr
- `runNodeScript(name)` — `cd whatsapp_masivo/ && node <script>`
- `listAvailableScripts()` — scripts que matchean `enviar_*.js` e incluye `enviar.js`
- `checkNodeAvailable()` — verifica que node exista

### stats.cpp
- `parseLog(path)` — cuenta líneas OK / NO_WA / ERROR, extrae tiempo del RESUMEN
- `printStats()` — tabla de resultados
- `searchLog()` — búsqueda textual en log

## Formato CSV

```
teléfono|nombre|dirección
5491161819436|Juan Pérez|Av. Siempreviva 742
5215543210987|María García|Calle falsa 123
```

## Placeholders en mensajes

```
{{nombre}}    → nombre del contacto
{{Nombre}}    → nombre (capitalizado)
{{numero}}    → teléfono (solo dígitos)
{{Numero}}    → teléfono (capitalizado)
{{telefono}}  → teléfono (variante minúscula)
{{direccion}} → dirección
{{Direccion}} → dirección (capitalizado)
{{dir}}       → dirección (abreviado)
```

Ejemplo: `"Hola {{nombre}}, te escribo para confirmar la entrega en {{direccion}}."`

## Variables de entorno (.env)

| Variable | Default | Descripción |
|---|---|---|
| CSV_PATH | contactos_moviles.csv | Ruta al CSV |
| LOG_PATH | envio.log | Ruta al log |
| SESSION_PATH | ./session_moviles | Ruta a sesión de WhatsApp |
| WHATSAPP_MESSAGE | Buenos días... | Plantilla de mensaje |
| DELAY_MS | 4000 | Delay entre envíos |
| MAX_RETRIES | 2 | Reintentos por fallo |
| RETRY_DELAY_MS | 4000 | Delay entre reintentos |
| HEADLESS | false | Chrome headless o no |
| TIMEOUT_MINUTES | 0 (sin timeout) | Timeout global |
| CHROME_PATH | /opt/google/chrome/google-chrome | Path a Chrome ejecutable |
| INITIAL_DELAY_MS | 5000 | Delay inicial tras conexión |
