/**
 * enviar_todos.js — Envía a TODOS los contactos.
 * Defaults: CSV=contactos_todos.csv, LOG=envio_todos.log, SESSION=./session_moviles
 */
process.env.CSV_PATH = process.env.CSV_PATH || './contactos_todos.csv';
process.env.LOG_PATH = process.env.LOG_PATH || './envio_todos.log';
process.env.SESSION_PATH = process.env.SESSION_PATH || './session_moviles';

const sender = require('./lib/sender');
sender.start();
