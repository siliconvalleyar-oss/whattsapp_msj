/**
 * enviar_solo_moviles.js — Envía a contactos móviles.
 * Script original que funcionó. Ahora es un wrapper de lib/sender.
 * Defaults: CSV=contactos_moviles.csv, LOG=envio_moviles.log, SESSION=./session_moviles
 */

// Forzar defaults específicos de este script (preceden a .env)
process.env.CSV_PATH = process.env.CSV_PATH || './contactos_moviles.csv';
process.env.LOG_PATH = process.env.LOG_PATH || './envio_moviles.log';
process.env.SESSION_PATH = process.env.SESSION_PATH || './session_moviles';

const sender = require('./lib/sender');
sender.start();
