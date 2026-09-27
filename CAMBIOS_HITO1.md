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

## 4. Agregar lugar propio al itinerario
- **Qué:** cuarto bloque en Ruta sugerida: un selector con 3 lugares extra (Mercado Central, Sky Costanera, Cerro San Cristóbal) y botón Agregar. El lugar elegido se suma al final del itinerario y se recalculan tiempo y costo.
- **Por qué:** el usuario puede personalizar la ruta generada por `POST /api/v1/routes/generate` sin volver al formulario.
- **React en simple:** `lugarExtraId` (con `useState`) guarda lo elegido en el selector. `setItinerario({...itinerario, paradas: nuevas})` crea una lista nueva con el lugar agregado para que React la muestre.

## 5. Pantalla Guardados con dos secciones
- **Qué:** la tab "Mis Rutas" ahora se llama "Guardados" con ícono de marcador (bookmark). Dentro hay dos pestañas: "Rutas guardadas" (lo que ya existía, ahora sin distancia a pie) y "Lugares visitados" (nueva, con 3 lugares de ejemplo: nombre, imagen, categoría, costo, horario y duración).
- **Por qué:** así coincide con el diagrama de información que pide "Guardados", "Rutas guardadas" y "Lugares visitados" por separado.
- **React en simple:** `guardadosTab` (con `useState`, vale 'rutas' o 'visitados') decide qué sección se muestra. Es como un interruptor: solo una visible a la vez.

## 6. Perfil con Editar datos funcional
- **Qué:** el botón "Editar mis datos" abre la vista "Editar datos" con formulario de nombre y correo. Al pulsar "Guardar datos" se guarda y el header de Explorar ("Hola, {nombre}") también se actualiza porque usa el mismo dato.
- **Por qué:** coincide con el diagrama ("Editar datos" dentro de Perfil) y los datos quedan en el estado, no solo escritos en la pantalla.
- **React en simple:** `perfil` (con `useState`, un objeto `{nombre, correo}`) es la cajita compartida. `setPerfil({...perfil, nombre})` cambia solo el nombre sin borrar el correo.
