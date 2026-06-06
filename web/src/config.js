import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

config({ path: resolve(__dirname, '..', '.env') });

export default {
  port: parseInt(process.env.PORT || '3000', 10),
  host: process.env.HOST || '0.0.0.0',
  dbPath: process.env.DB_PATH || './data/whatsapp.db',
  defaultMessage: process.env.DEFAULT_MESSAGE || 'Buenas tardes, {{nombre}}. Queria consultar precio y stock?',
  delayMs: parseInt(process.env.DELAY_MS || '4000', 10),
  maxRetries: parseInt(process.env.MAX_RETRIES || '3', 10),
  retryDelayMs: parseInt(process.env.RETRY_DELAY_MS || '5000', 10),
  sessionTimeoutMinutes: parseInt(process.env.SESSION_TIMEOUT_MINUTES || '30', 10),
  headless: process.env.HEADLESS !== 'false',
  apiKey: process.env.API_KEY || '',
};
