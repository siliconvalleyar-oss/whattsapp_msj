/**
 * Normaliza un número de teléfono: elimina todo excepto dígitos.
 * Ej: '+54 9 11 6181-9436' -> '5491161819436'
 */
function normalize(raw) {
  return raw.replace(/\D/g, '');
}

/**
 * Normaliza y agrega '+' si no tiene prefijo internacional.
 * Útil para scripts que usan formato +XXXXXXXXXX.
 */
function normalizeWithPlus(raw) {
  let clean = raw.replace(/[^\d+]/g, '');
  if (!clean.startsWith('+')) {
    clean = '+' + clean;
  }
  return clean;
}

/**
 * Valida que un número tenga al menos 10 dígitos.
 */
function isValid(number) {
  const digits = number.replace(/\D/g, '');
  return digits.length >= 10;
}

module.exports = { normalize, normalizeWithPlus, isValid };
