#include "console.h"
#include <iostream>
#include <sstream>
#include <algorithm>

namespace console {

std::string bold(const std::string& text) {
    return "\033[1m" + text + "\033[0m";
}
std::string green(const std::string& text) {
    return "\033[32m" + text + "\033[0m";
}
std::string yellow(const std::string& text) {
    return "\033[33m" + text + "\033[0m";
}
std::string red(const std::string& text) {
    return "\033[31m" + text + "\033[0m";
}
std::string cyan(const std::string& text) {
    return "\033[36m" + text + "\033[0m";
}

void clear() {
    std::cout << "\033[2J\033[H";
}

void pause() {
    std::cout << "\nPresiona Enter para continuar...";
    std::cin.ignore(10000, '\n');
    std::cin.get();
}

std::string input(const std::string& prompt) {
    std::cout << prompt;
    std::string line;
    std::getline(std::cin, line);
    return line;
}

int inputInt(const std::string& prompt, int min, int max) {
    while (true) {
        std::string line = input(prompt);
        try {
            int val = std::stoi(line);
            if (val >= min && val <= max) return val;
            std::cerr << "  Valor entre " << min << " y " << max << ".\n";
        } catch (...) {
            std::cerr << "  Ingresa un número válido.\n";
        }
    }
}

void error(const std::string& msg) {
    std::cerr << red("❌ ") << msg << "\n";
}

void success(const std::string& msg) {
    std::cout << green("✅ ") << msg << "\n";
}

void info(const std::string& msg) {
    std::cout << cyan("➜ ") << msg << "\n";
}

void header(const std::string& title) {
    std::string border(title.length() + 8, '═');
    std::cout << "\n" << border << "\n";
    std::cout << "   " << bold(cyan(title)) << "\n";
    std::cout << border << "\n\n";
}

int menu(const std::string& title, const std::vector<std::string>& options) {
    clear();
    header(title);

    for (size_t i = 0; i < options.size(); ++i) {
        std::cout << "  " << bold(std::to_string(i + 1)) << ". " << options[i] << "\n";
    }
    std::cout << "  0. " << red("Salir") << "\n\n";

    return inputInt("  Opción: ", 0, (int)options.size());
}

bool confirm(const std::string& prompt) {
    std::string r = input(yellow(prompt + " (s/N): "));
    std::transform(r.begin(), r.end(), r.begin(), ::tolower);
    return (r == "s" || r == "si" || r == "y" || r == "yes");
}

} // namespace console
