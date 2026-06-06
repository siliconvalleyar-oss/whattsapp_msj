#!/usr/bin/env node
const sender = require('./lib/sender');

const args = process.argv.slice(2);
for (let i = 0; i < args.length; i++) {
  switch (args[i]) {
    case '--csv': case '-c': process.env.CSV_PATH = args[++i]; break;
    case '--message': case '-m': process.env.WHATSAPP_MESSAGE = args[++i]; break;
    case '--log': case '-l': process.env.LOG_PATH = args[++i]; break;
    case '--session': case '-s': process.env.SESSION_PATH = args[++i]; break;
    case '--delay': case '-d': process.env.DELAY_MS = args[++i]; break;
    case '--headless': case '-h': process.env.HEADLESS = 'true'; break;
    case '--visible': process.env.HEADLESS = 'false'; break;
    case '--help':
      console.log(`
  Uso: node whatsapp_masivo/enviar.js [opciones]

  Opciones:
    --csv, -c <path>        Ruta al CSV de contactos
    --message, -m <texto>   Plantilla del mensaje
    --log, -l <path>        Ruta al archivo de log
    --session, -s <path>    Directorio de sesión
    --delay, -d <ms>        Pausa entre mensajes
    --headless, -h          Modo sin ventana del navegador
    --visible               Modo con ventana del navegador
    --help                  Muestra esta ayuda

  Ejemplos:
    node whatsapp_masivo/enviar.js
    node whatsapp_masivo/enviar.js --csv contactos.csv --headless
    node whatsapp_masivo/enviar.js -c lista.csv -m "Hola {{nombre}}" -d 3000
      `);
      process.exit(0);
    default:
      console.error('Opción desconocida:', args[i]);
      console.error('Usá --help para ver las opciones disponibles.');
      process.exit(1);
  }
}

sender.start();
