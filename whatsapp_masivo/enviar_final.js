/**
 * enviar_final.js — Versión con reintentos (while loop).
 * Defaults: CSV=contactos.csv, LOG=envio.log, SESSION=./session
 */
process.env.CSV_PATH = process.env.CSV_PATH || './contactos.csv';
process.env.LOG_PATH = process.env.LOG_PATH || './envio.log';
process.env.SESSION_PATH = process.env.SESSION_PATH || './session';
process.env.INITIAL_DELAY_MS = process.env.INITIAL_DELAY_MS || '8000';
process.env.MAX_RETRIES = process.env.MAX_RETRIES || '2';

const sender = require('./lib/sender');
sender.start();
