#include "config.h"
#include <fstream>
#include <sstream>
#include <iostream>
#include <algorithm>
#include <filesystem>

Config::Config(const std::string& envPath) {
    std::string path = envPath;
    if (path.empty()) {
        // Por defecto busca ../.env desde la carpeta cpp/
        path = std::filesystem::path(__FILE__).parent_path().parent_path() / ".." / ".env";
    }
    loadFile(path);
}

void Config::loadFile(const std::string& path) {
    std::ifstream file(path);
    if (!file.is_open()) {
        std::cerr << "⚠️  No se encontró .env en: " << path << "\n";
        std::cerr << "   Se usarán valores por defecto.\n";
        return;
    }

    std::string line;
    while (std::getline(file, line)) {
        if (line.empty() || line[0] == '#') continue;

        auto eq = line.find('=');
        if (eq == std::string::npos) continue;

        std::string key = line.substr(0, eq);
        std::string val = line.substr(eq + 1);

        // Trim
        auto trim = [](std::string& s) {
            s.erase(0, s.find_first_not_of(" \t\r"));
            s.erase(s.find_last_not_of(" \t\r\"") + 1);
        };
        trim(key);
        trim(val);

        if (!key.empty()) {
            vars_[key] = val;
        }
    }
}

std::string Config::get(const std::string& key, const std::string& defaultVal) const {
    auto it = vars_.find(key);
    return (it != vars_.end()) ? it->second : defaultVal;
}

int Config::getInt(const std::string& key, int defaultVal) const {
    auto it = vars_.find(key);
    if (it == vars_.end()) return defaultVal;
    try { return std::stoi(it->second); }
    catch (...) { return defaultVal; }
}

bool Config::getBool(const std::string& key, bool defaultVal) const {
    auto it = vars_.find(key);
    if (it == vars_.end()) return defaultVal;
    std::string v = it->second;
    std::transform(v.begin(), v.end(), v.begin(), ::tolower);
    return (v == "true" || v == "1" || v == "yes");
}

void Config::print() const {
    std::cout << "📋 Configuración cargada:\n";
    for (const auto& [k, v] : vars_) {
        // Ocultar valores sensibles
        if (k.find("PASS") != std::string::npos || k.find("SECRET") != std::string::npos) {
            std::cout << "  " << k << " = ****\n";
        } else {
            std::cout << "  " << k << " = " << v << "\n";
        }
    }
}
