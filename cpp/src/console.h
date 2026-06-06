#ifndef CONSOLE_H
#define CONSOLE_H

#include <string>
#include <vector>

namespace console {

// Colores ANSI
std::string bold(const std::string& text);
std::string green(const std::string& text);
std::string yellow(const std::string& text);
std::string red(const std::string& text);
std::string cyan(const std::string& text);

// Limpia pantalla
void clear();

// Pausa y espera Enter
void pause();

// Lee una línea del usuario
std::string input(const std::string& prompt);

// Lee un número entero (con validación)
int inputInt(const std::string& prompt, int min = 0, int max = 1000);

// Muestra un mensaje de error
void error(const std::string& msg);

// Muestra un mensaje de éxito
void success(const std::string& msg);

// Muestra un mensaje informativo
void info(const std::string& msg);

// Muestra un banner/header
void header(const std::string& title);

// Muestra un menú y devuelve la opción seleccionada
int menu(const std::string& title, const std::vector<std::string>& options);

// Confirmación sí/no
bool confirm(const std::string& prompt);

} // namespace console

#endif // CONSOLE_H
