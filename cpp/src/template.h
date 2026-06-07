#ifndef TEMPLATE_H
#define TEMPLATE_H

#include <string>
#include "csv.h"

// Reemplaza placeholders ({{nombre}}, {{numero}}, {{direccion}} y variantes) en el mensaje
// con los valores del contacto.
std::string applyTemplate(const std::string& tpl, const Contact& contact);

// Lista los placeholders disponibles como texto de ayuda
std::string templateHelp();

#endif // TEMPLATE_H
