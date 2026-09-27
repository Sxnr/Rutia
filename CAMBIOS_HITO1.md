# Cambios Hito 1 — Santiago Inteligente

> Registro simple de lo que se cambió para el Hito 1 y por qué. Cada punto es un commit separado.

## 1. Pantalla Explorar renovada
- **Qué:** se quitó el header "Santiago Inteligente / Explorador Urbano" y ahora muestra "Hola, {nombre}" con avatar de usuario. El "?" se cambió por un botón ES/EN (solo cambia la etiqueta, no traduce aún). Se eliminó "Rutas Populares", "Desbloquea Guías Exclusivas" y "Descubre el Barrio Lastarria". En su lugar hay un carrusel horizontal "Lugares disponibles en la app" con 6 lugares (nombre, imagen, categoría, costo).
- **Por qué:** los nombres y datos ahora coinciden con la arquitectura (categoría, costo, duración, horario) y la pantalla queda limpia para el Hito 1.
- **React en simple:** `useState('ES')` guarda el idioma elegido. `overflow-x-auto` + `flex-shrink-0` hacen que las tarjetas se deslicen de lado sin librerías nuevas.

## 2. Pantalla Ruta sugerida limpia
- **Qué:** la insignia ahora muestra solo tiempo y costo (se quitó la distancia a pie). El título de la ruta se puede tocar para editarlo (se abre un input y se guarda). Se eliminó el texto pequeño bajo el título (horario/precio), el bloque "Mi checklist de visita" y el bloque "Mapa en vivo". La pantalla de formulario ahora se llama "Preferencias" y el detalle se titula "Detalle del lugar". El endpoint se nombra `POST /api/v1/routes/generate` según la arquitectura.
- **Por qué:** menos datos = menos confusión, y solo mostramos categoría, costo, duración y horario como pide la colección `pois`.
- **React en simple:** `tituloEditando` (booleano con `useState`) decide si ves el título o el input. `setItinerario({...itinerario, titulo})` actualiza el nombre en el estado global para que se vea en todas las pantallas.

## 3. Itinerario sin distancia y reordenable
- **Qué:** en cada tarjeta de lugar se quitó la distancia a pie y la duración junto al horario (ahora solo se ve el rango horario, ej. "10:30 - 11:30"). Cada tarjeta tiene botones ↑ y ↓ para subir o bajar el lugar en la lista, tanto en Ruta sugerida como en Rutas guardadas.
- **Por qué:** la colección `pois` solo define categoría, costo, duración y horario; la distancia no está en el esquema. El orden lo elige el usuario.
- **React en simple:** elegí botones subir/bajar en vez de drag-and-drop porque no hay librería de arrastre instalada y los botones funcionan bien en móvil y con teclado. `reordenarParadas(origen, destino)` copia la lista, saca el lugar con `splice` y lo inserta en la nueva posición.
