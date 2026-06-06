#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

# ──────────────────────────────────────────────
# setup.sh — Instalación y configuración
# WhatsApp Masivo — desde cero
# ──────────────────────────────────────────────

BOLD='\033[1m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

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

# ─── 1. Verificar Node.js ─────────────────────────────────────

info "Verificando Node.js..."
if ! command -v node &>/dev/null; then
    error "Node.js no está instalado."
    echo "  Instalalo desde https://nodejs.org/ (versión 18+ recomendada)"
    echo "  O con el gestor de paquetes de tu sistema:"
    echo "    apt install nodejs npm      (Debian/Ubuntu)"
    echo "    brew install node           (macOS)"
    exit 1
fi

NODE_VER=$(node -v | sed 's/v//' | cut -d. -f1)
echo "  Versión: $(node -v)"
if [ "$NODE_VER" -lt 18 ]; then
    warn "Se recomienda Node.js 18+. Considerá actualizar."
fi
log "Node.js ok"

# ─── 2. Instalar dependencias raíz ────────────────────────────

echo ""
info "Instalando dependencias del proyecto raíz..."
if ! npm install --silent --no-fund --no-audit; then
    error "Falló la instalación de dependencias raíz."
    exit 1
fi
log "Dependencias raíz instaladas"

# ─── 3. Instalar dependencias de whatsapp_masivo ─────────────

info "Instalando dependencias de whatsapp_masivo/..."
if ! (cd whatsapp_masivo && npm install --silent --no-fund --no-audit); then
    error "Falló la instalación de dependencias de whatsapp_masivo."
    exit 1
fi
log "Dependencias de whatsapp_masivo instaladas"

# ─── 4. Crear .env si no existe ───────────────────────────────

echo ""
if [ ! -f .env ]; then
    info "Creando .env desde .env.example..."
    cp .env.example .env
    warn "Archivo .env creado con valores por defecto."
    warn "EDITALO para configurar tu mensaje y rutas:"
    echo "  nano .env"
else
    log ".env ya existe, se conserva"
fi

# ─── 5. Resumen final ──────────────────────────────────────────

echo ""
echo -e "${BOLD}${GREEN}══════════════════════════════════════════"
echo "  ✅ Setup completado"
echo -e "══════════════════════════════════════════${NC}"
echo ""
echo "  📁 Proyecto listo en: $(pwd)"
echo ""
echo "  ${BOLD}Próximos pasos:${NC}"
echo ""
echo "  1. Editar .env con tu mensaje y rutas:"
echo "     nano .env"
echo ""
echo "  2. Crear archivo CSV de contactos:"
echo "     nano contactos_moviles.csv"
echo "     Formato: teléfono|nombre|dirección"
echo "     Ejemplo:"
echo "       teléfono|nombre|dirección"
echo "       5491120252485|Juan Pérez|Av. Siempreviva 742"
echo ""
echo "  3. Ejecutar el envío:"
echo "     node whatsapp_masivo/enviar.js"
echo "     # o un wrapper específico:"
echo "     node whatsapp_masivo/enviar_solo_moviles.js"
echo ""
echo "  📌 La primera vez aparecerá un QR para vincular WhatsApp."
echo ""
