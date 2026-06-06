#!/usr/bin/env bash
# ==============================================================
# web.sh — Inicia la plataforma web (Express + WhatsApp multi-sesión)
# Uso: ./scripts_tools/web.sh
# ==============================================================
set -euo pipefail
cd "$(dirname "$0")/.."

BOLD='\033[1m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; CYAN='\033[0;36m'; NC='\033[0m'
log()   { echo -e "${GREEN}✅${NC} $1"; }
warn()  { echo -e "${YELLOW}⚠️${NC} $1"; }
error() { echo -e "${RED}❌${NC} $1"; }

if ! command -v node &>/dev/null; then error "Node.js no instalado."; exit 1; fi

# Instalar dependencias de web/ si falta
if [ ! -f web/node_modules/.package-lock.json ]; then
  warn "Instalando dependencias de web/..."
  (cd web && npm install --silent)
fi

log "Iniciando servidor web en http://localhost:${PORT:-3000}"
echo ""
cd web && npm start
