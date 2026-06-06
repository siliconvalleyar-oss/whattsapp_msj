# 🖥️ WhatsApp C++ CLI

Interfaz de terminal en C++ para controlar los envíos de WhatsApp.

## 📋 Requisitos

- g++ 13+ (o cualquier compilador C++20)
- CMake 3.16+
- Node.js 18+ (para ejecutar los scripts)
- Los scripts de `whatsapp_masivo/` ya instalados

## 🔧 Compilar

```bash
cd cpp
mkdir -p build && cd build
cmake ..
make
```

O simplemente (más rápido):
```bash
cd cpp/build
cmake .. && make
```

## 🚀 Ejecutar

```bash
./build/whatsapp_cli
```

## 🧩 Funcionalidades

| Opción | Descripción |
|---|---|
| 📤 Ejecutar envío | Elige un script Node.js y lo ejecuta desde C++ |
| 📇 Ver contactos | Lee el CSV, muestra tabla, filtra por nombre |
| 📊 Estadísticas | Parsea logs de envíos anteriores |
| ⚙️ Configuración | Muestra variables del .env y vista previa del mensaje |
| 📝 Plantillas | Ayuda para personalizar mensajes con {{nombre}} etc. |

## 🏗️ Arquitectura

```
whatsapp_prj/
└── cpp/
    ├── CMakeLists.txt
    ├── README.md
    └── src/
        ├── main.cpp      → Menú interactivo
        ├── console.h/cpp → UI: colores, menú, input
        ├── csv.h/cpp     → Leer y filtrar CSV
        ├── config.h/cpp  → Leer .env
        ├── template.h/cpp→ Plantillas {{nombre}}
        ├── runner.h/cpp  → Ejecutar scripts Node.js
        └── stats.h/cpp   → Parsear logs
```

## 📌 Notas

- C++ se encarga de la **orquestación**: leer CSVs, formatear mensajes, elegir scripts, ver estadísticas
- El envío real de WhatsApp lo hace **Node.js** via `whatsapp-web.js` (no se puede controlar WhatsApp directamente desde C++)
- El menú ejecuta los scripts Node.js como subprocesos y captura su salida
