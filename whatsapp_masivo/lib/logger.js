const fs = require('fs');

/**
 * Escribe una entrada en el archivo de log con timestamp.
 */
function write(logPath, entry) {
  const line = `${new Date().toISOString()} ${entry}\n`;
  fs.appendFileSync(logPath, line);
}

/**
 * Escribe un resumen final con estadísticas.
 */
function summary(logPath, stats, elapsedSecs) {
  const mins = Math.floor(elapsedSecs / 60);
  const secs = elapsedSecs % 60;
  const line = `=== RESUMEN: ${stats.sent} enviados, ${stats.noWhatsApp} sin WA, ${stats.errors} errores, ${stats.total} total, ${mins}m ${secs}s ===`;
  fs.appendFileSync(logPath, `${new Date().toISOString()} ${line}\n`);
  return line;
}

module.exports = { write, summary };
