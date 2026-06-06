/**
 * enviar_corregido.js — Versión con formato +54 y validación.
 * Defaults: CSV=contactos.csv, LOG=envio.log
 */
process.env.CSV_PATH = process.env.CSV_PATH || './contactos.csv';
process.env.LOG_PATH = process.env.LOG_PATH || './envio.log';

const sender = require('./lib/sender');
sender.start();
