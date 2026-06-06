#!/usr/bin/env bash
# ==============================================================
# cli.sh — Compila y ejecuta el CLI en C++
# Uso: ./scripts_tools/cli.sh
# ==============================================================
set -euo pipefail
cd "$(dirname "$0")/.."

BOLD='\033[1m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; CYAN='\033[0;36m'; NC='\033[0m'
log()   { echo -e "${GREEN}✅${NC} $1"; }
warn()  { echo -e "${YELLOW}⚠️${NC} $1"; }
error() { echo -e "${RED}❌${NC} $1"; }

# Verificar herramientas necesarias
if ! command -v cmake &>/dev/null; then error "cmake no instalado."; exit 1; fi
if ! command -v g++ &>/dev/null && ! command -v clang++ &>/dev/null; then error "No se encontró compilador C++."; exit 1; fi

# Compilar si hace falta (si el binario no existe o el código fuente cambió)
BINARY="cpp/build/whatsapp_cli"
if [ ! -f "$BINARY" ]; then
  log "Compilando CLI en C++..."
  (cd cpp && cmake -B build && cmake --build build)
fi

log "Ejecutando CLI..."
echo ""
"$BINARY"
