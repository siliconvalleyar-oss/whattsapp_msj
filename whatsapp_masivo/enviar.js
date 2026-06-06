/**
 * enviar.js — Entry point principal.
 * Usa lib/sender para toda la lógica.
 * Configurable vía .env (ver .env.example).
 */
const sender = require('./lib/sender');

sender.start();
