#!/usr/bin/env bash
# ==============================================================
# setup.sh — Instalación completa del proyecto
# Uso: ./scripts_tools/setup.sh
# ==============================================================
set -euo pipefail
cd "$(dirname "$0")/.."

BOLD='\033[1m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; CYAN='\033[0;36m'; NC='\033[0m'
log()   { echo -e "${GREEN}✅${NC} $1"; }
warn()  { echo -e "${YELLOW}⚠️${NC} $1"; }
error() { echo -e "${RED}❌${NC} $1"; }
info()  { echo -e "${CYAN}➜${NC} $1"; }

clear
echo -e "${BOLD}${CYAN}"
echo "╔══════════════════════════════════════════╗"
echo "║   📱 WhatsApp Masivo — Setup            ║"
echo "╚══════════════════════════════════════════╝"
echo -e "${NC}\n"

# ─── Node.js ────────────────────────────────────────────────
info "Verificando Node.js..."
if ! command -v node &>/dev/null; then
  error "Node.js no instalado. Ejecutá: bash scripts_tools/instalar_dependencias.sh"
  exit 1
fi
log "$(node -v)"

# ─── Dependencias npm raíz ──────────────────────────────────
info "Instalando dependencias npm..."
(cd whatsapp_masivo 2>/dev/null && npm install --silent --no-fund --no-audit) || true
npm install --silent --no-fund --no-audit
log "Dependencias instaladas"

# ─── Dependencias web ───────────────────────────────────────
if [ -f web/package.json ]; then
  info "Instalando dependencias de web/..."
  (cd web && npm install --silent --no-fund --no-audit) || true
fi

# ─── .env ───────────────────────────────────────────────────
if [ ! -f .env ]; then
  info "Creando .env desde .env.example..."
  cp .env.example .env
  warn "EDITAR .env con tus valores (mensaje, rutas, etc.)"
else
  log ".env ya existe"
fi

# ─── Compilar C++ ───────────────────────────────────────────
if command -v cmake &>/dev/null && [ -f cpp/CMakeLists.txt ]; then
  info "Compilando CLI en C++..."
  (cd cpp && cmake -B build -q && cmake --build build --quiet 2>/dev/null) && {
    log "CLI compilado: cpp/build/whatsapp_cli"
  } || warn "No se pudo compilar cpp/ (opcional)"
fi

# ─── Resumen ────────────────────────────────────────────────
echo ""
echo -e "${BOLD}${GREEN}══════════════════════════════════════════${NC}"
echo -e "${BOLD}${GREEN}  ✅ Setup completado${NC}"
echo -e "${BOLD}${GREEN}══════════════════════════════════════════${NC}"
echo ""
echo "  Comandos disponibles:"
echo "    ./scripts_tools/enviar.sh        Enviar mensajes"
echo "    ./scripts_tools/web.sh           Plataforma web"
echo "    ./scripts_tools/cli.sh           CLI interactivo"
echo "    ./scripts_tools/setup.sh         Este setup"
echo ""
echo "  📌 Primera vez: ejecutá enviar.sh y escaneá el QR"
echo ""
