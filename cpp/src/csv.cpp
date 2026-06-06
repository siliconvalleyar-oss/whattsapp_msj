#include "csv.h"
#include <fstream>
#include <sstream>
#include <iostream>
#include <iomanip>
#include <algorithm>

std::string Contact::display() const {
    if (!address.empty())
        return name + " (" + number + ", " + address + ")";
    return name + " (" + number + ")";
}

std::vector<Contact> readCsv(const std::string& path) {
    std::vector<Contact> contacts;
    std::ifstream file(path);

    if (!file.is_open()) {
        throw std::runtime_error("No se pudo abrir: " + path);
    }

    std::string line;
    bool first = true;

    while (std::getline(file, line)) {
        if (first) { first = false; continue; } // saltar cabecera
        if (line.empty()) continue;

        std::istringstream ss(line);
        std::string part;
        std::vector<std::string> parts;

        while (std::getline(ss, part, '|')) {
            // trim espacios
            part.erase(0, part.find_first_not_of(" \t\r"));
            part.erase(part.find_last_not_of(" \t\r") + 1);
            parts.push_back(part);
        }

        if (parts.empty()) continue;

        Contact c;
        // Número: eliminar todo excepto dígitos
        for (char ch : parts[0]) {
            if (std::isdigit(ch)) c.number += ch;
        }
        c.name = (parts.size() > 1) ? parts[1] : "?";
        c.address = (parts.size() > 2) ? parts[2] : "";

        if (!c.number.empty()) {
            contacts.push_back(c);
        }
    }

    return contacts;
}

std::vector<Contact> filterByName(const std::vector<Contact>& contacts, const std::string& query) {
    std::vector<Contact> result;
    std::string q = query;
    std::transform(q.begin(), q.end(), q.begin(), ::tolower);

    for (const auto& c : contacts) {
        std::string n = c.name;
        std::transform(n.begin(), n.end(), n.begin(), ::tolower);
        if (n.find(q) != std::string::npos) {
            result.push_back(c);
        }
    }
    return result;
}

std::vector<Contact> filterByPrefix(const std::vector<Contact>& contacts, const std::string& prefix) {
    std::vector<Contact> result;
    for (const auto& c : contacts) {
        if (c.number.rfind(prefix, 0) == 0) {
            result.push_back(c);
        }
    }
    return result;
}

void printContacts(const std::vector<Contact>& contacts, size_t maxRows) {
    if (contacts.empty()) {
        std::cout << "  (sin contactos)\n";
        return;
    }

    size_t n = std::min(contacts.size(), maxRows);
    std::cout << "  " << std::left
              << std::setw(5) << "#"
              << std::setw(18) << "Teléfono"
              << std::setw(25) << "Nombre"
              << "Dirección\n";
    std::cout << "  " << std::string(65, '-') << "\n";

    for (size_t i = 0; i < n; ++i) {
        const auto& c = contacts[i];
        std::cout << "  " << std::left
                  << std::setw(5) << (i + 1)
                  << std::setw(18) << c.number
                  << std::setw(25) << (c.name.length() > 24 ? c.name.substr(0, 23) + "…" : c.name)
                  << (c.address.length() > 30 ? c.address.substr(0, 29) + "…" : c.address)
                  << "\n";
    }

    if (contacts.size() > maxRows) {
        std::cout << "  ... y " << (contacts.size() - maxRows) << " más\n";
    }
    std::cout << "  Total: " << contacts.size() << " contactos\n";
}
