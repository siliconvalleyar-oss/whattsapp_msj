#ifndef RUNNER_H
#define RUNNER_H

#include <string>
#include <vector>

struct RunResult {
    int exitCode;
    std::string stdout;
    std::string stderr;
};

// Ejecuta un comando y captura salida
RunResult runCommand(const std::string& cmd, const std::vector<std::string>& args = {});

// Ejecuta node script desde whatsapp_masivo/ con argumentos
RunResult runNodeScript(const std::string& scriptName, const std::string& envPath = "");

// Verifica que Node.js esté disponible
bool checkNodeAvailable();

// Verifica que un script exista
bool checkScriptExists(const std::string& scriptName);

// Lista los scripts disponibles en whatsapp_masivo/
std::vector<std::string> listAvailableScripts();

#endif // RUNNER_H
