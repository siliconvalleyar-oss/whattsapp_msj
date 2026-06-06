#ifndef STATS_H
#define STATS_H

#include <string>
#include <vector>

struct SendStats {
    int sent = 0;
    int noWhatsApp = 0;
    int errors = 0;
    int total = 0;
    int elapsedSecs = 0;
    std::vector<std::string> recentLogs; // últimas entradas
};

// Parsea un archivo de log y devuelve estadísticas
SendStats parseLog(const std::string& logPath, int maxRecentLines = 10);

// Muestra estadísticas en pantalla
void printStats(const SendStats& stats);

// Busca en el log líneas que contengan cierto texto
std::vector<std::string> searchLog(const std::string& logPath, const std::string& query);

#endif // STATS_H
