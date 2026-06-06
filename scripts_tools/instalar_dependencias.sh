#!/usr/bin/env bash
# =============================================================================
# ╔═══════════════════════════════════════════════════════════════════════════╗
# ║   instalar_dependencias.sh                                              ║
# ║   Instalación completa de dependencias del proyecto                     ║
# ║   WhatsApp Masivo — C++ CLI + Web Platform + Scripts Node              ║
# ╚═══════════════════════════════════════════════════════════════════════════╝
# =============================================================================
# Este script instala TODO lo necesario para correr el proyecto desde cero:
#   - Node.js y npm (si no están presentes)
#   - Chromium (para Puppeteer / whatsapp-web.js)
#   - CMake y g++ (para compilar el CLI en C++)
#   - Dependencias npm del proyecto raíz, whatsapp_masivo/ y web/
#   - Archivo .env si no existe
#
# Uso:
#   chmod +x instalar_dependencias.sh
#   ./instalar_dependencias.sh
#
# Se puede ejecutar varias veces sin romper nada (es idempotente).
# =============================================================================

# ─── Configuración de seguridad ──────────────────────────────────────────────
# Detiene el script ante cualquier error, variables indefinidas, y tuberías rotas.
set -euo pipefail

# ─── Colores ANSI para mensajes en terminal ──────────────────────────────────
# Se usan códigos de escape para dar color a la salida del script.
BOLD='\033[1m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'  # "No Color" — resetea el formato

# ─── Funciones auxiliares de mensajes ───────────────────────────────────────
# Cada función imprime un emoji + texto con color, para mantener consistencia.
log()   { echo -e "${GREEN}✅${NC} $1"; }
warn()  { echo -e "${YELLOW}⚠️${NC} $1"; }
error() { echo -e "${RED}❌${NC} $1"; }
info()  { echo -e "${CYAN}➜${NC} $1"; }

# ─── Banner de inicio ────────────────────────────────────────────────────────
clear
echo -e "${BOLD}${CYAN}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║   📦 Instalación de dependencias                           ║"
echo "║   WhatsApp Masivo — C++ CLI + Web Platform + Node.js       ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}\n"

# =============================================================================
# PASO 1: Verificar / instalar Node.js y npm
# =============================================================================
# Node.js es necesario para los scripts de WhatsApp (whatsapp-web.js) y para
# la plataforma web (Express, Socket.IO). Versión mínima recomendada: 18.
# =============================================================================

info "Paso 1/6: Verificando Node.js..."

if command -v node &>/dev/null; then
    # Node.js ya está instalado, mostramos la versión.
    NODE_VER=$(node -v | sed 's/v//' | cut -d. -f1)
    echo "  Versión detectada: $(node -v)"
    if [ "$NODE_VER" -lt 18 ]; then
        warn "Versión muy antigua (menor a 18). Se recomienda actualizar."
        warn "  Ejecutar: npm install -g n && n 22"
    else
        log "Node.js ok (versión $NODE_VER)"
    fi
else
    # Node.js no está instalado. Lo instalamos automáticamente.
    warn "Node.js no está instalado. Instalando versión 22..."

    # Detectamos el sistema operativo para usar el instalador correcto.
    if [ -f /etc/debian_version ]; then
        # Debian / Ubuntu — usamos el repo oficial de NodeSource.
        info "  Sistema Debian/Ubuntu detectado, agregando repo NodeSource..."
        curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
        apt-get install -y nodejs
    elif [ -f /etc/redhat-release ]; then
        # CentOS / RHEL / Fedora — usamos el repo de NodeSource.
        info "  Sistema RedHat detectado, agregando repo NodeSource..."
        curl -fsSL https://rpm.nodesource.com/setup_22.x | bash -
        dnf install -y nodejs
    elif command -v brew &>/dev/null; then
        # macOS con Homebrew.
        info "  macOS detectado, instalando con Homebrew..."
        brew install node@22
    else
        # Si no podemos detectar el sistema, damos instrucciones manuales.
        error "No se pudo instalar Node.js automáticamente."
        echo "  Instalalo manualmente desde: https://nodejs.org/"
        echo "  O con el gestor de paquetes de tu sistema:"
        echo "    apt install nodejs npm         (Debian/Ubuntu)"
        echo "    dnf install nodejs             (Fedora)"
        echo "    brew install node              (macOS)"
        echo "    pkg install node               (FreeBSD)"
        exit 1
    fi
    log "Node.js instalado: $(node -v)"
fi

# Verificamos que npm también esté disponible (normalmente viene con Node.js).
if ! command -v npm &>/dev/null; then
    error "npm no está disponible. Instalalo manualmente."
    exit 1
fi
echo "  npm versión: $(npm -v)"

# =============================================================================
# PASO 2: Instalar dependencias del sistema (Chromium, compiladores, etc.)
# =============================================================================
# - Chromium: lo necesita Puppeteer (whatsapp-web.js) para abrir WhatsApp Web.
# - cmake / g++: necesarios para compilar el CLI en C++ (cpp/).
# - build-essential / python3: algunos paquetes npm nativos los requieren.
# =============================================================================

echo ""
info "Paso 2/6: Dependencias del sistema (Chromium, compiladores)..."

# Función para instalar paquetes según el gestor de paquetes disponible.
install_system_deps() {
    if command -v apt-get &>/dev/null; then
        # Debian / Ubuntu / derivados
        info "  Detectedo apt-get (Debian/Ubuntu)"
        apt-get update -qq
        apt-get install -y -qq \
            chromium \
            chromium-sandbox \
            cmake \
            g++ \
            build-essential \
            python3 \
            ca-certificates \
            curl \
            gnupg
    elif command -v dnf &>/dev/null; then
        # Fedora / RHEL / CentOS
        info "  Detectado dnf (Fedora/RHEL)"
        dnf install -y \
            chromium \
            cmake \
            gcc-c++ \
            make \
            python3 \
            curl
    elif command -v pacman &>/dev/null; then
        # Arch Linux
        info "  Detectado pacman (Arch)"
        pacman -Sy --noconfirm \
            chromium \
            cmake \
            gcc \
            make \
            python3
    elif command -v brew &>/dev/null; then
        # macOS
        info "  Detectado Homebrew (macOS)"
        brew install \
            chromium --no-sandbox \
            cmake \
            gcc \
            make
    else
        warn "No se detectó un gestor de paquetes conocido."
        warn "Instalá manualmente: Chromium, cmake, g++, make, python3"
    fi
    log "Dependencias del sistema instaladas"
}

install_system_deps 2>&1 | tail -5

# =============================================================================
# PASO 3: Instalar dependencias npm del proyecto raíz
# =============================================================================
# El proyecto raíz tiene un package.json con dependencias compartidas.
# =============================================================================

echo ""
info "Paso 3/6: Instalando dependencias npm (raíz)..."
cd "$(dirname "$0")/.."  # Nos movemos a la raíz del proyecto.

if [ -f package.json ]; then
    npm install --silent --no-fund --no-audit 2>&1 | tail -3 || {
        error "Falló npm install en la raíz."
        exit 1
    }
    log "Dependencias raíz instaladas"
else
    warn "No se encontró package.json en la raíz, se omite."
fi

# =============================================================================
# PASO 4: Instalar dependencias npm de whatsapp_masivo/
# =============================================================================
# Los scripts de envío (enviar_todos.js, enviar_solo_moviles.js, etc.) viven
# en whatsapp_masivo/ y tienen su propio package.json.
# =============================================================================

echo ""
info "Paso 4/6: Instalando dependencias de whatsapp_masivo/..."

if [ -f whatsapp_masivo/package.json ]; then
    (cd whatsapp_masivo && npm install --silent --no-fund --no-audit 2>&1 | tail -3) || {
        error "Falló npm install en whatsapp_masivo/"
        exit 1
    }
    log "Dependencias de whatsapp_masivo instaladas"
else
    info "No hay package.json en whatsapp_masivo/ — se asume que usa las de la raíz."
fi

# =============================================================================
# PASO 5: Instalar dependencias npm de web/ (plataforma web)
# =============================================================================
# La plataforma web (Express + Socket.IO + SQLite) tiene su propio package.json
# dentro de web/. Incluye whatsapp-web.js, better-sqlite3, socket.io, etc.
# =============================================================================

echo ""
info "Paso 5/6: Instalando dependencias de web/ (plataforma web)..."

if [ -f web/package.json ]; then
    (cd web && npm install --silent --no-fund --no-audit 2>&1 | tail -3) || {
        error "Falló npm install en web/"
        exit 1
    }
    log "Dependencias de web/ instaladas"
else
    info "No se encontró web/package.json, se omite."
fi

# =============================================================================
# PASO 6: Compilar el CLI en C++ (si existe)
# =============================================================================
# El CLI en C++ (cpp/) se compila con CMake. Si no está presente, se saltea.
# =============================================================================

echo ""
info "Paso 6/6: Compilando CLI en C++ (cpp/)..."

if [ -f cpp/CMakeLists.txt ]; then
    if command -v cmake &>/dev/null; then
        (cd cpp && cmake -B build && cmake --build build 2>&1 | tail -5) && {
            log "CLI compilado: cpp/build/whatsapp_cli"
        } || {
            warn "Falló la compilación del CLI en C++. Revisá los errores arriba."
        }
    else
        warn "cmake no está instalado. No se puede compilar cpp/."
        warn "  Instalalo con: apt install cmake g++  (Linux)"
        warn "  O: brew install cmake                 (macOS)"
    fi
else
    info "No se encontró cpp/CMakeLists.txt, se omite."
fi

# =============================================================================
# PASO FINAL: Crear .env si no existe
# =============================================================================
# El archivo .env contiene las variables de configuración (mensaje, rutas, etc.).
# Si ya existe, lo respetamos para no pisar cambios del usuario.
# =============================================================================

echo ""
info "Creando .env desde .env.example (si no existe)..."

if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        cp .env.example .env
        log ".env creado desde .env.example"
        warn "EDITALO para personalizar:"
        echo "  nano .env"
        echo ""
        echo "  Variables principales:"
        echo "    WHATSAPP_MESSAGE  — Plantilla del mensaje a enviar"
        echo "    CSV_PATH          — Ruta al archivo de contactos"
        echo "    LOG_PATH          — Ruta al archivo de log"
        echo "    SESSION_PATH      — Ruta para guardar la sesión de WhatsApp"
    else
        warn "No hay .env.example, creando .env mínimo..."
        cat > .env << 'EOF'
# Configuración de WhatsApp Masivo
WHATSAPP_MESSAGE=Buenas tardes, {{nombre}}. Queria consultar precio y stock?
CSV_PATH=contactos_moviles.csv
LOG_PATH=envio.log
SESSION_PATH=./session_moviles
DELAY_MS=4000
MAX_RETRIES=3
HEADLESS=true
EOF
        log ".env mínimo creado"
    fi
else
    log ".env ya existe, se conserva"
fi

# =============================================================================
# RESUMEN FINAL
# =============================================================================
echo ""
echo -e "${BOLD}${GREEN}══════════════════════════════════════════════════════════════${NC}"
echo -e "${BOLD}${GREEN}  ✅ Instalación completada${NC}"
echo -e "${BOLD}${GREEN}══════════════════════════════════════════════════════════════${NC}"
echo ""
echo "  📁 Proyecto: $(pwd)"
echo "  🟢 Node.js:  $(node -v)"
echo "  📦 npm:      $(npm -v)"
echo ""

# Mostramos rutas de los ejecutables si existen.
echo "  Ejecutables disponibles:"
echo ""
if [ -f cpp/build/whatsapp_cli ]; then
    echo "    🖥️  CLI C++:      cpp/build/whatsapp_cli"
fi
if [ -f web/src/index.js ]; then
    echo "    🌐 Web platform: cd web && npm start"
    echo "                     → http://localhost:3000"
fi
echo "    📱 Envío Node:   node whatsapp_masivo/enviar_todos.js"
echo ""

echo -e "${BOLD}Próximos pasos recomendados:${NC}"
echo ""
echo "  1. Editar .env con tu mensaje y configuración:"
echo "     nano .env"
echo ""
echo "  2. Agregar contactos en un archivo CSV:"
echo "     Formato: teléfono|nombre|dirección"
echo "     Ejemplo:"
echo "       5491120252485|Juan Pérez|Av. Siempreviva 742"
echo ""
echo "  3. Primera vez — escanear QR:"
echo "     Ejecutá cualquier script de envío y escaneá el QR"
echo "     con WhatsApp → Vincular dispositivo."
echo ""
echo "  4. Envíos siguientes — ya no pide QR (sesión guardada)."
echo ""
echo -e "${BOLD}${CYAN}¡Listo! El proyecto está instalado y listo para usar.${NC}"
echo ""
