#include "template.h"
#include <sstream>

std::string applyTemplate(const std::string& tpl, const Contact& contact) {
    std::string result = tpl;

    auto replace = [&](const std::string& from, const std::string& to) {
        size_t pos = 0;
        while ((pos = result.find(from, pos)) != std::string::npos) {
            result.replace(pos, from.length(), to);
            pos += to.length();
        }
    };

    replace("{{nombre}}", contact.name);
    replace("{{Nombre}}", contact.name);
    replace("{{numero}}", contact.number);
    replace("{{Numero}}", contact.number);
    replace("{{telefono}}", contact.number);
    replace("{{Telefono}}", contact.number);
    replace("{{direccion}}", contact.address);
    replace("{{Direccion}}", contact.address);
    replace("{{dir}}", contact.address);

    return result;
}

std::string templateHelp() {
    std::ostringstream oss;
    oss << "Placeholders disponibles:\n"
        << "  {{nombre}}    - Nombre del contacto\n"
        << "  {{Nombre}}    - Nombre (capitalizado)\n"
        << "  {{numero}}    - Teléfono\n"
        << "  {{Numero}}    - Teléfono (capitalizado)\n"
        << "  {{telefono}}  - Teléfono (variante)\n"
        << "  {{Telefono}}  - Teléfono (capitalizado)\n"
        << "  {{direccion}} - Dirección\n"
        << "  {{Direccion}} - Dirección (capitalizado)\n"
        << "  {{dir}}       - Dirección (abreviado)\n"
        << "\n"
        << "Ejemplo:\n"
        << "  \"Hola {{nombre}}, te escribo para confirmar la entrega en {{direccion}}.\"\n";
    return oss.str();
}
