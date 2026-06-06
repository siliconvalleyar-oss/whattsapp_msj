/**
 * enviar_v2.js — Versión con reintentos y timeout.
 * Defaults: CSV=contactos.csv, LOG=envio.log, SESSION=./session
 */
process.env.CSV_PATH = process.env.CSV_PATH || './contactos.csv';
process.env.LOG_PATH = process.env.LOG_PATH || './envio.log';
process.env.SESSION_PATH = process.env.SESSION_PATH || './session';
process.env.DELAY_MS = process.env.DELAY_MS || '5000';
process.env.INITIAL_DELAY_MS = process.env.INITIAL_DELAY_MS || '10000';
process.env.TIMEOUT_MINUTES = process.env.TIMEOUT_MINUTES || '5';

const sender = require('./lib/sender');
sender.start();
