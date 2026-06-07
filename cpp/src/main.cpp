#include <iostream>
#include <filesystem>

#include "console.h"
#include "csv.h"
#include "config.h"
#include "template.h"
#include "runner.h"
#include "stats.h"

namespace fs = std::filesystem;

// ─── Rutas relativas al proyecto ───────────────────────────────

fs::path projectRoot() {
    return fs::path(__FILE__).parent_path().parent_path().parent_path();
}

std::string csvPath(const std::string& name) {
    return (projectRoot() / "whatsapp_masivo" / name).string();
}

std::string scriptPath(const std::string& name) {
    return (projectRoot() / "whatsapp_masivo" / name).string();
}

std::string logPath(const std::string& name) {
    return (projectRoot() / "whatsapp_masivo" / name).string();
}

// ─── Menú principal ─────────────────────────────────────────────

void menuEnviar(const Config& cfg) {
    std::vector<std::string> scripts = listAvailableScripts();
    if (scripts.empty()) {
        console::error("No se encontraron scripts en whatsapp_masivo/");
        console::pause();
        return;
    }

    console::clear();
    console::header("📤 EJECUTAR ENVÍO");

    for (size_t i = 0; i < scripts.size(); ++i) {
        std::cout << "  " << console::bold(std::to_string(i + 1)) << ". " << scripts[i] << "\n";
    }
    std::cout << "\n";

    int opt = console::inputInt("  Selecciona script (0 = volver): ", 0, (int)scripts.size());
    if (opt == 0) return;

    std::string script = scripts[opt - 1];

    // Confirmación
    if (!console::confirm("¿Ejecutar " + script + "?")) return;

    console::info("Ejecutando " + script + "...");
    console::info("(Esto abrirá Chrome y mostrará QR si no hay sesión)");
    console::info("Esperá a que termine para ver el resultado.");

    auto result = runNodeScript(script);

    if (result.exitCode == 0) {
        console::success("Script ejecutado correctamente");
    } else {
        console::error("El script falló (exit code: " + std::to_string(result.exitCode) + ")");
    }

    std::cout << "\n" << result.stdout << "\n";
    if (!result.stderr.empty()) {
        std::cerr << result.stderr << "\n";
    }

    console::pause();
}

void menuContactos(const Config& cfg) {
    std::string cpath = cfg.get("CSV_PATH", "contactos_moviles.csv");
    fs::path fullPath = projectRoot() / "whatsapp_masivo" / cpath;

    if (!fs::exists(fullPath)) {
        fullPath = projectRoot() / cpath;
    }

    console::clear();
    console::header("📇 CONTACTOS");

    std::cout << "  CSV: " << fullPath.string() << "\n\n";

    try {
        auto contacts = readCsv(fullPath.string());
        printContacts(contacts);

        std::cout << "\n";
        if (console::confirm("¿Buscar por nombre?")) {
            std::string q = console::input("  Buscar: ");
            auto filtered = filterByName(contacts, q);
            console::success(std::to_string(filtered.size()) + " coincidencias");
            printContacts(filtered);
        }
    } catch (const std::exception& e) {
        console::error(e.what());
    }

    console::pause();
}

void menuEstadisticas(const Config& cfg) {
    console::clear();
    console::header("📊 ESTADÍSTICAS");

    // Buscar logs en whatsapp_masivo/
    std::string masivoPath = (projectRoot() / "whatsapp_masivo").string();

    std::vector<std::string> logs;
    try {
        for (const auto& e : fs::directory_iterator(masivoPath)) {
            if (e.path().extension() == ".log") {
                logs.push_back(e.path().filename().string());
            }
        }
    } catch (...) {}

    if (logs.empty()) {
        console::info("No se encontraron archivos .log en whatsapp_masivo/");
        console::pause();
        return;
    }

    std::cout << "  Logs disponibles:\n";
    for (size_t i = 0; i < logs.size(); ++i) {
        std::cout << "  " << console::bold(std::to_string(i + 1)) << ". " << logs[i] << "\n";
    }
    std::cout << "\n";

    int opt = console::inputInt("  Selecciona log (0 = volver): ", 0, (int)logs.size());
    if (opt == 0) return;

    std::string logFile = logPath(logs[opt - 1]);
    auto stats = parseLog(logFile);
    printStats(stats);

    console::pause();
}

void menuConfig(Config& cfg) {
    console::clear();
    console::header("⚙️ CONFIGURACIÓN");
    cfg.print();
    std::cout << "\n";

    if (console::confirm("¿Vista previa del mensaje personalizado?")) {
        std::string msg = cfg.get("WHATSAPP_MESSAGE", "Buenas tardes. queria consultar precio y stock ?");

        // Buscar CSV para tomar un contacto de ejemplo
        std::string cpath = cfg.get("CSV_PATH", "contactos_moviles.csv");
        fs::path fullPath = projectRoot() / "whatsapp_masivo" / cpath;

        try {
            auto contacts = readCsv(fullPath.string());
            if (!contacts.empty()) {
                std::cout << "\n  Mensaje para " << contacts[0].name << ":\n";
                std::cout << "  " << console::bold(applyTemplate(msg, contacts[0])) << "\n";
            }
        } catch (...) {
            std::cout << "  " << console::bold(msg) << "\n";
        }
    }

    console::pause();
}

void menuPlantillas() {
    console::clear();
    console::header("📝 PLANTILLAS DE MENSAJE");
    std::cout << templateHelp() << "\n";
    console::pause();
}

// ─── Main ────────────────────────────────────────────────────────

int main() {
    if (!checkNodeAvailable()) {
        console::error("Node.js no está disponible. Instalalo primero.");
        return 1;
    }
    console::success("Node.js " + runCommand("node --version").stdout);

    Config cfg;
    std::cout << "\n";

    while (true) {
        int opt = console::menu(
            "📱 WhatsApp Masivo — MENÚ PRINCIPAL",
            {
                "📤  Ejecutar envío WhatsApp",
                "📇  Ver contactos (CSV)",
                "📊  Estadísticas de envíos anteriores",
                "⚙️   Configuración actual",
                "📝  Ayuda: plantillas de mensajes",
            }
        );

        switch (opt) {
            case 1: menuEnviar(cfg); break;
            case 2: menuContactos(cfg); break;
            case 3: menuEstadisticas(cfg); break;
            case 4: menuConfig(cfg); break;
            case 5: menuPlantillas(); break;
            case 0:
                console::success("¡Hasta luego!");
                return 0;
            default: break;
        }
    }
}
