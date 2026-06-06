#include "runner.h"
#include <cstdio>
#include <memory>
#include <array>
#include <iostream>
#include <filesystem>
#include <algorithm>

namespace fs = std::filesystem;

RunResult runCommand(const std::string& cmd, const std::vector<std::string>& args) {
    std::string full = cmd;
    for (const auto& a : args) {
        full += " \"" + a + "\"";
    }
    full += " 2>&1";

    RunResult result;
    std::array<char, 128> buffer;
    std::unique_ptr<FILE, decltype(&pclose)> pipe(popen(full.c_str(), "r"), pclose);

    if (!pipe) {
        result.exitCode = -1;
        result.stderr = "Error al ejecutar: " + cmd;
        return result;
    }

    while (fgets(buffer.data(), buffer.size(), pipe.get()) != nullptr) {
        result.stdout += buffer.data();
    }

    result.exitCode = (pclose(pipe.release()) == 0) ? 0 : 1;
    return result;
}

RunResult runNodeScript(const std::string& scriptName, const std::string& envPath) {
    // Buscar el script en whatsapp_masivo/
    fs::path base = fs::path(__FILE__).parent_path().parent_path().parent_path();
    fs::path scriptPath = base / "whatsapp_masivo" / scriptName;

    // Si no existe, probar path absoluto
    if (!fs::exists(scriptPath)) {
        scriptPath = fs::path(scriptName);
        if (!fs::exists(scriptPath)) {
            RunResult r;
            r.exitCode = -1;
            r.stderr = "Script no encontrado: " + scriptName;
            return r;
        }
    }

    // Construir comando: cd al directorio y ejecutar node
    std::string cmd = "cd \"" + scriptPath.parent_path().string()
                    + "\" && node \"" + scriptPath.filename().string() + "\"";

    return runCommand(cmd);
}

bool checkNodeAvailable() {
    auto r = runCommand("node --version");
    return r.exitCode == 0;
}

bool checkScriptExists(const std::string& scriptName) {
    fs::path base = fs::path(__FILE__).parent_path().parent_path().parent_path();
    fs::path scriptPath = base / "whatsapp_masivo" / scriptName;
    return fs::exists(scriptPath);
}

std::vector<std::string> listAvailableScripts() {
    fs::path base = fs::path(__FILE__).parent_path().parent_path().parent_path();
    fs::path dir = base / "whatsapp_masivo";

    std::vector<std::string> scripts;
    if (!fs::exists(dir)) return scripts;

    for (const auto& entry : fs::directory_iterator(dir)) {
        if (entry.path().extension() == ".js" &&
            entry.path().filename().string().rfind("enviar_", 0) == 0) {
            scripts.push_back(entry.path().filename().string());
        }
    }
    // También incluir enviar.js
    if (fs::exists(dir / "enviar.js")) {
        scripts.push_back("enviar.js");
    }

    std::sort(scripts.begin(), scripts.end());
    return scripts;
}
