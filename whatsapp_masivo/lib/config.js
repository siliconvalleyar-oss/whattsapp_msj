require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const config = {
  // Mensaje a enviar
  message: process.env.WHATSAPP_MESSAGE || 'Buenas tardes. queria consultar precio y stock ?',

  // Rutas de archivos
  csvPath: process.env.CSV_PATH || './contactos_moviles.csv',
  logPath: process.env.LOG_PATH || './envio_moviles.log',
  sessionPath: process.env.SESSION_PATH || './session_moviles',

  // Navegador (Puppeteer)
  chromePath: process.env.CHROME_PATH || '/opt/google/chrome/google-chrome',
  headless: process.env.HEADLESS === 'true',

  // Temporización
  delayMs: parseInt(process.env.DELAY_MS || '4000', 10),
  initialDelayMs: parseInt(process.env.INITIAL_DELAY_MS || '5000', 10),

  // Opcional: reintentos
  maxRetries: parseInt(process.env.MAX_RETRIES || '2', 10),
  retryDelayMs: parseInt(process.env.RETRY_DELAY_MS || '4000', 10),

  // Opcional: timeout global (minutos)
  timeoutMinutes: parseInt(process.env.TIMEOUT_MINUTES || '0', 10),
};

module.exports = config;
