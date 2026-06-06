#!/usr/bin/env bash
# ==============================================================
# enviar.sh — Envía mensajes de WhatsApp desde terminal
# Uso: ./scripts_tools/enviar.sh [opciones]
# ==============================================================
set -euo pipefail
cd "$(dirname "$0")/.."

BOLD='\033[1m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; CYAN='\033[0;36m'; NC='\033[0m'
log()   { echo -e "${GREEN}✅${NC} $1"; }
warn()  { echo -e "${YELLOW}⚠️${NC} $1"; }
error() { echo -e "${RED}❌${NC} $1"; }

# Verificar que node y las dependencias existen
if ! command -v node &>/dev/null; then error "Node.js no instalado. Ejecutá: bash scripts_tools/instalar_dependencias.sh"; exit 1; fi
if [ ! -d node_modules ]; then warn "Faltan dependencias. Instalando..."; npm install --silent; fi

# Pasamos todos los argumentos directamente al script Node
node whatsapp_masivo/enviar.js "$@"
