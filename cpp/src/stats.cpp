#include "stats.h"
#include <fstream>
#include <iostream>
#include <regex>
#include <iomanip>

SendStats parseLog(const std::string& logPath, int maxRecentLines) {
    SendStats stats;
    std::ifstream file(logPath);
    if (!file.is_open()) {
        std::cerr << "⚠️  No se pudo abrir el log: " << logPath << "\n";
        return stats;
    }

    std::string line;
    std::vector<std::string> allLines;

    while (std::getline(file, line)) {
        if (line.empty()) continue;
        allLines.push_back(line);

        if (line.find("OK ") != std::string::npos) stats.sent++;
        else if (line.find("NO_WA") != std::string::npos) stats.noWhatsApp++;
        else if (line.find("ERROR") != std::string::npos) stats.errors++;
        else if (line.find("RESUMEN") != std::string::npos) {
            stats.total++;
            // Extraer segundos del resumen
            std::smatch m;
            if (std::regex_search(line, m, std::regex(R"((\d+)m\s*(\d+)s)"))) {
                int mins = std::stoi(m[1]);
                int secs = std::stoi(m[2]);
                stats.elapsedSecs = mins * 60 + secs;
            }
        }
    }

    // Últimas líneas
    int start = std::max(0, (int)allLines.size() - maxRecentLines);
    for (int i = start; i < (int)allLines.size(); ++i) {
        stats.recentLogs.push_back(allLines[i]);
    }

    return stats;
}

void printStats(const SendStats& stats) {
    std::cout << "\n═══════════════════════════════\n";
    std::cout << "📊 ESTADÍSTICAS DE ENVÍO\n";
    std::cout << "═══════════════════════════════\n";
    std::cout << "✅ Enviados:    " << stats.sent << "\n";
    std::cout << "⚠️  Sin WhatsApp: " << stats.noWhatsApp << "\n";
    std::cout << "❌ Errores:     " << stats.errors << "\n";
    std::cout << "📊 Total:       " << (stats.sent + stats.noWhatsApp + stats.errors) << "\n";
    if (stats.elapsedSecs > 0) {
        std::cout << "⏱  Tiempo:      " << (stats.elapsedSecs / 60) << "m "
                  << (stats.elapsedSecs % 60) << "s\n";
    }
    std::cout << "═══════════════════════════════\n";

    if (!stats.recentLogs.empty()) {
        std::cout << "\n📋 Últimas entradas del log:\n";
        for (const auto& l : stats.recentLogs) {
            std::cout << "  " << l << "\n";
        }
    }
}

std::vector<std::string> searchLog(const std::string& logPath, const std::string& query) {
    std::vector<std::string> results;
    std::ifstream file(logPath);
    if (!file.is_open()) return results;

    std::string line;
    while (std::getline(file, line)) {
        if (line.find(query) != std::string::npos) {
            results.push_back(line);
        }
    }
    return results;
}
