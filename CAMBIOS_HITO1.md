# Cambios Hito 1 — Santiago Inteligente

> Registro simple de lo que se cambió para el Hito 1 y por qué. Cada punto es un commit separado.

## 1. Pantalla Explorar renovada
- **Qué:** se quitó el header "Santiago Inteligente / Explorador Urbano" y ahora muestra "Hola, {nombre}" con avatar de usuario. El "?" se cambió por un botón ES/EN (solo cambia la etiqueta, no traduce aún). Se eliminó "Rutas Populares", "Desbloquea Guías Exclusivas" y "Descubre el Barrio Lastarria". En su lugar hay un carrusel horizontal "Lugares disponibles en la app" con 6 lugares (nombre, imagen, categoría, costo).
- **Por qué:** los nombres y datos ahora coinciden con la arquitectura (categoría, costo, duración, horario) y la pantalla queda limpia para el Hito 1.
- **React en simple:** `useState('ES')` guarda el idioma elegido. `overflow-x-auto` + `flex-shrink-0` hacen que las tarjetas se deslicen de lado sin librerías nuevas.
