#!/bin/bash

# ==============================================
# Script: enviar_moviles.sh
# Descripción: Envía mensaje a TODOS los números de la lista
# ==============================================

PROYECTO_DIR="$HOME/whatsapp_masivo"
SCRIPT_NODE="$PROYECTO_DIR/enviar_todos.js"
MENSAJE="Buenas tardes. queria consultar si venden valvula canister para chevrolet onix 2016
el numero GM es 28289916
precio y stock ?"

# Lista original con todos los números (se filtrarán después)
DATOS_COMPLETOS=$(cat <<'EOF'
+541173632534|Chevrolet Constituyentes|Av. de los Constituyentes 5480, CABA
+541148576610|Chevroletotal|Montenegro 51, CABA
+541145673057|San Agustín Repuestos|Av. Lope de Vega 2007, CABA
+541148548240|CHEVCAR - Repuestos Chevrolet|Av. Juan Bautista Justo 3300, CABA
+541148580988|Chevroparts|Av. Warnes 1077, CABA
+541140513709|Repuestos Chevrolet (Balbín)|Av. Dr. Ricardo Balbín 3317, CABA
+541146870127|CHEVROLET ALBERDI|Av. Juan Bautista Alberdi 7241, CABA
+548101228300|Grupo Mansilla Distribuidor Oficial|Batalla del Pari 524, CABA
+548102225678|Automóviles San Jorge Concesionario Oficial|Av. Rivadavia 11065, CABA
+541133523885|DARWIN REPUESTOS|Av. Warnes 1102, CABA
+541128242516|Chevro Tigre|Sáenz Peña 1043, Tigre, Prov. de Buenos Aires
+541147625970|Autopartes Llopart|Juan José Castelli y Amancio Alcorta, Villa Adelina, Prov. de Buenos Aires
+541126654901|Montagna Repuestos - Chevrolet/Volkswagen|Presidente Perón 6080, San Martín, Prov. de Buenos Aires
+541158934988|REPUESTOS J.R.|Av. Bartolomé Mitre 3279, Munro, Prov. de Buenos Aires
+541147978081|REPUESTOS JAVIER|Carlos Francisco Melo 1922, Florida, Prov. de Buenos Aires
+541147231234|Salaverri Repuestos|Juan B. Justo 1512, Beccar, Prov. de Buenos Aires
+5491161819436|KM Repuestos|Virrey Olaguer y Feliú 5152, Munro, Prov. de Buenos Aires
+5475005518|Repuestos HP|Av. Andrés Rolón 765, San Isidro, Prov. de Buenos Aires
+541147555426|Bs Repuestos Accesorios|Av. Pres. Juan Domingo Perón 3759, San Martín, Prov. de Buenos Aires
+541147568356|MANOLO REPUESTOS|Eduardo Sívori 5009, Munro, Prov. de Buenos Aires
+541144946628|JS Repuestos - Repuestos Chevrolet ACDelco|La Rioja 61, Quilmes, Prov. de Buenos Aires
+541140401879|Mc Repuestos Chevrolet|Av. San Martín 2476, Lanús, Prov. de Buenos Aires
+541136313972|CHEVROTEC|Cno. Gral. Belgrano 2024, Avellaneda, Prov. de Buenos Aires
+541167331010|CHEVROSUR|Av. Hipólito Yrigoyen 6819, Lanús/Banfield, Prov. de Buenos Aires
+541124047476|Chevrano Repuestos|Av. San Martín 1629, Lanús, Prov. de Buenos Aires
+5491120252485|Repuestos Gt|Av. Mitre 1550 esquina Lugones, Quilmes, Prov. de Buenos Aires
+541148749859|DG REPUESTOS CHEVROLET|Av. Manuel Belgrano 2589, Sarandí, Prov. de Buenos Aires
+5491170379239|Mundo Chevrolet|Av. 12 de Octubre 979, Quilmes, Prov. de Buenos Aires
+541153657199|Del Sur Autos S.A. Avellaneda (Concesionario Oficial)|Av. Bartolomé Mitre 2490, Sarandí, Prov. de Buenos Aires
+541141156788|Chevroford Repuestos|Av. Sta. Fe 2150, Piñeyro (Avellaneda), Prov. de Buenos Aires
EOF
)

TODOS=$(echo "$DATOS_COMPLETOS")

echo "📋 Total de números en la lista:"
echo "$TODOS" | wc -l
echo "$TODOS"

# Crear CSV con todos los números
mkdir -p "$PROYECTO_DIR"
echo "WHATSAPP|NOMBRE|DIRECCION" > "$PROYECTO_DIR/contactos_todos.csv"
echo "$TODOS" >> "$PROYECTO_DIR/contactos_todos.csv"

# Excluir números ya enviados (de CUALQUIER log anterior)
LOG_EXISTENTE="$PROYECTO_DIR/envio_todos.log"
LOG_ANTERIOR="$PROYECTO_DIR/envio_moviles.log"
for log in "$LOG_EXISTENTE" "$LOG_ANTERIOR"; do
    if [ -f "$log" ] && [ -s "$log" ]; then
        echo "📋 Revisando $log..."
        for num in $(grep " OK " "$log" | awk '{print $NF}'); do
            echo "   Excluyendo $num (ya enviado)"
            grep -v "$num|" "$PROYECTO_DIR/contactos_todos.csv" > "$PROYECTO_DIR/contactos_todos.tmp" && mv "$PROYECTO_DIR/contactos_todos.tmp" "$PROYECTO_DIR/contactos_todos.csv"
        done
    fi
done
echo "   Lista filtrada. Pendientes: $(tail -n +2 "$PROYECTO_DIR/contactos_todos.csv" | wc -l) contacto(s)"

# Crear script Node.js con el formato correcto
cat > "$SCRIPT_NODE" <<'EOF'
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const readline = require('readline');

const MENSAJE = `Buenas tardes. queria consultar si venden valvula canister para chevrolet onix 2016
el numero GM es 28289916
precio y stock ?`;

const CSV_PATH = './contactos_todos.csv';
const LOG_PATH = './envio_todos.log';

// Normaliza el número: elimina espacios y deja solo dígitos y el '+'
// Luego, para el chatId, se usa el número tal cual (con +) seguido de @c.us
function normalizarNumero(raw) {
    // Elimina todo excepto dígitos
    let limpio = raw.replace(/\D/g, '');
    return limpio;
}

const client = new Client({
    authStrategy: new LocalAuth({ dataPath: './session_moviles' }),
    puppeteer: {
        headless: false,
        executablePath: '/opt/google/chrome/google-chrome',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

client.on('qr', qr => {
    console.log('📲 Escanea este QR con WhatsApp:');
    qrcode.generate(qr, { small: true });
});

client.on('ready', async () => {
    console.log('✅ Conectado. Verificando números...');
    await new Promise(r => setTimeout(r, 5000));
    await enviarMensajes();
});

async function enviarMensajes() {
    const contactos = [];
    let stats = { enviados: 0, sinWA: 0, errores: 0 };
    const tiempoInicio = Date.now();
    const rl = readline.createInterface({
        input: fs.createReadStream(CSV_PATH)
    });

    let primera = true;
    for await (const linea of rl) {
        if (primera) { primera = false; continue; }
        if (!linea.trim()) continue;
        const partes = linea.split('|');
        if (partes.length < 1) continue;
        let telefonoRaw = partes[0].trim();
        let telefono = normalizarNumero(telefonoRaw);
        contactos.push({
            numero: telefono,
            nombre: partes[1] || '?'
        });
    }

    console.log(`📤 Se enviará mensaje a ${contactos.length} contacto(s).\n`);

    for (let i = 0; i < contactos.length; i++) {
        const c = contactos[i];
        const chatId = `${c.numero}@c.us`;
        try {
            // Verify number exists first
            const exists = await client.getNumberId(c.numero);
            if (!exists) {
                stats.sinWA++;
                console.log(`⚠️ [${i+1}/${contactos.length}] ${c.numero} (${c.nombre}) no tiene WhatsApp`);
                fs.appendFileSync(LOG_PATH, `${new Date().toISOString()} NO_WA ${c.numero}\n`);
                continue;
            }
            await client.sendMessage(chatId, MENSAJE);
            stats.enviados++;
            console.log(`✅ [${i+1}/${contactos.length}] Enviado a ${c.numero} (${c.nombre})`);
            fs.appendFileSync(LOG_PATH, `${new Date().toISOString()} OK ${c.numero}\n`);
            await new Promise(r => setTimeout(r, 4000));
        } catch (err) {
            stats.errores++;
            console.error(`❌ Error con ${c.numero}: ${err.message || err}\n${err.stack || err}`);
            fs.appendFileSync(LOG_PATH, `${new Date().toISOString()} ERROR ${c.numero}: ${err.stack || JSON.stringify(err)}\n`);
        }
    }

    const tiempoFin = Date.now();
    const segundos = Math.round((tiempoFin - tiempoInicio) / 1000);
    const mins = Math.floor(segundos / 60);
    const secs = segundos % 60;
    
    console.log('\n═══════════════════════════════');
    console.log('🏁 ENVÍO COMPLETADO');
    console.log('═══════════════════════════════');
    console.log(`✅ Enviados:    ${stats.enviados}`);
    console.log(`⚠️ Sin WhatsApp: ${stats.sinWA}`);
    console.log(`❌ Errores:     ${stats.errores}`);
    console.log(`📊 Total:       ${contactos.length}`);
    console.log(`⏱ Tiempo:      ${mins}m ${secs}s`);
    console.log('═══════════════════════════════\n');
    
    fs.appendFileSync(LOG_PATH, `=== RESUMEN: ${stats.enviados} enviados, ${stats.sinWA} sin WA, ${stats.errores} errores, ${contactos.length} total, ${mins}m ${secs}s ===\n`);
    
    await client.destroy();
    process.exit(0);
}

client.initialize();
EOF

# Instalar dependencias si no existen
cd "$PROYECTO_DIR"
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias (solo primera vez)..."
    npm init -y > /dev/null
    npm install whatsapp-web.js qrcode-terminal
fi

# Ejecutar el envío
echo "🚀 Iniciando envío a TODOS los números..."
node "$SCRIPT_NODE"
