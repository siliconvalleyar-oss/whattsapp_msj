#ifndef CONFIG_H
#define CONFIG_H

#include <string>
#include <map>

class Config {
public:
    // Carga .env desde el path dado (por defecto ../.env desde cpp/)
    explicit Config(const std::string& envPath = "");

    // Lee variable. Si no existe, devuelve defaultVal.
    std::string get(const std::string& key, const std::string& defaultVal = "") const;

    // Versiones numéricas
    int getInt(const std::string& key, int defaultVal = 0) const;
    bool getBool(const std::string& key, bool defaultVal = false) const;

    // Muestra todas las variables cargadas
    void print() const;

private:
    std::map<std::string, std::string> vars_;
    void loadFile(const std::string& path);
};

#endif // CONFIG_H
