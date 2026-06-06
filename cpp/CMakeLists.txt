cmake_minimum_required(VERSION 3.16)
project(whatsapp_cpp VERSION 1.0.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# ─── Fuentes ───
file(GLOB SOURCES src/*.cpp)

# ─── Ejecutable ───
add_executable(whatsapp_cli ${SOURCES})

# ─── Instalación ───
install(TARGETS whatsapp_cli DESTINATION bin)

# ─── Objetivo: compilar con un solo comando ───
add_custom_target(build
    COMMAND ${CMAKE_COMMAND} --build .
    WORKING_DIRECTORY ${CMAKE_BINARY_DIR}
)
