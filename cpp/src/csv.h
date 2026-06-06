#ifndef CSV_H
#define CSV_H

#include <string>
#include <vector>

struct Contact {
    std::string number;  // Teléfono (solo dígitos)
    std::string name;    // Nombre
    std::string address; // Dirección

    // Para mostrar en pantalla
    std::string display() const;
};

// Lee un archivo CSV con formato: teléfono|nombre|dirección
// Devuelve vector de Contact. Lanza excepción si hay error.
std::vector<Contact> readCsv(const std::string& path);

// Filtra contactos por nombre (case-insensitive, contiene)
std::vector<Contact> filterByName(const std::vector<Contact>& contacts, const std::string& query);

// Filtra contactos que comienzan con cierto prefijo de número
std::vector<Contact> filterByPrefix(const std::vector<Contact>& contacts, const std::string& prefix);

// Muestra una tabla de contactos en la terminal
void printContacts(const std::vector<Contact>& contacts, size_t maxRows = 20);

#endif // CSV_H
