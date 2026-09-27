# Guía de cambios manuales — Hito 1 (para hacer a mano en el editor)

> Estos cambios los hace el equipo a mano para aprender a moverse en el código. Todo ocurre en un solo archivo: `src/App.jsx` (el componente `App`, que es la pantalla completa del prototipo). Usa `Ctrl+Shift+F` para buscar cada texto tal cual aparece aquí.

## 0. Checklist: ya está hecho, no repetir
- Busca `Mi checklist de visita`.
- Verás que ese bloque ya no existe en la pantalla Ruta sugerida: se eliminó en el Bloque 1. No borres nada más por ese punto.

## 1. Detalle del lugar: simplificar la ficha

### 1a. Línea de horario/precio bajo el nombre
- **Busca:** `{poiFicha.horario} • {poiFicha.costoLabel}`
- **Qué hace ese bloque:** es el `<p>` bajo el `<h1>{poiFicha.nombre}</h1>` dentro de la cabecera con foto. Muestra horario y precio juntos.
- **Qué borrar:** solo esa línea `<p className="text-white/90 text-xs mt-1">...</p>`.
- **Por qué:** en el Hito 1 el horario, el costo y la duración ya se muestran en tarjetas separadas más abajo; repetirlos arriba recarga la ficha y promete un resumen que aún no diseñamos.

### 1b. Recuadro amarillo de consejo
- **Busca:** `bg-[#FFFBEB] border border-[#FDE68A]`
- **Qué hace ese bloque:** es el recuadro amarillo con el ícono `💡` y el texto `{getDatoAmigable(poiFicha.id).tip}`. Muestra un consejo tipo "Entrada liberada".
- **Qué borrar:** todo el `<div className="bg-[#FFFBEB] ...">...</div>` completo (desde esa línea hasta su `</div>` de cierre).
- **Por qué:** esos consejos son contenido editorial que el equipo aún no verifica; en el Hito 1 solo mostramos datos del esquema `pois` (categoría, costo, duración, horario).

### 1c. Sección "Deja tu reseña"
- **Busca:** `{/* Reseña con estrellas */}`
- **Qué hace ese bloque:** todo lo que sigue hasta antes del botón `Volver al inicio`: las 5 estrellas (`Deja tu reseña`), el `textarea` de comentario, el botón `Enviar reseña` y la lista `Reseñas (...)`. Guarda reseñas en memoria con `reviews` y `handleEnviarResena`.
- **Qué borrar:** desde la línea `{/* Reseña con estrellas */}` hasta el `</div>` que cierra esa tarjeta (justo antes de `<button onClick={()=> setPantalla('HOME')}>Volver al inicio</button>`). No toques el botón Volver.
- **Por qué:** las reseñas son funcionalidad del Hito 3 (requieren usuarios y base de datos real). En el Hito 1 solo prometemos generar, guardar y visitar.

## 2. Perfil: limpiar y agregar botones visuales

### 2a. Datos que se eliminan
Trabaja dentro del bloque que empieza en `{/* PERFIL */}`. Busca y borra cada pieza por separado:

| Busca este texto | Qué hace el bloque | Por qué se elimina |
|---|---|---|
| `{perfil.correo}` | Muestra el correo junto al nombre en la tarjeta de perfil | En el Hito 1 no prometemos cuenta real ni login; el correo visible sugiere que sí |
| `Explorador nivel 3` | Texto de nivel y rutas completadas bajo el nombre | Los niveles y gamificación no están en el alcance del Hito 1 |
| `Presupuesto favorito` | Tarjeta que repite el presupuesto del formulario | Duplica datos y usa campos fuera del esquema `pois` para un perfil |
| `Tiempo medio` | Tarjeta que repite el tiempo del formulario | Igual que el anterior |
| `Tu progreso` | Barra de avance con `rutaGuardada ? "75%" : "30%"` | El progreso con porcentajes inventados promete seguimiento que aún no existe |

- **Cómo borrar sin romper:** borra cada `<p>` o `<div>` completo indicado, no solo el texto. Si borras solo el texto y dejas etiquetas vacías, la tarjeta queda con huecos.

### 2b. Tres botones nuevos solo visuales
- **Busca:** `Editar mis datos` (el `<button ...>Editar mis datos</button>` dentro de la tarjeta blanca de perfil).
- **Qué hace ese bloque:** es el botón azul principal de la tarjeta; sirve de referencia de estilo.
- **Qué hacer:** debajo de ese botón, copia y pega tres veces la misma línea `<button>` cambiando solo el texto a `Ayuda y contacto`, `Términos y condiciones` y `Política y privacidad`. No les agregues `onClick`: son solo visuales en el Hito 1.
- **Por qué solo visuales:** esas secciones (ayuda legal, términos) se diseñan en el Hito 2; ahora solo reservamos el espacio para que el prototipo se vea completo.

## Verificación final
1. Guarda `src/App.jsx` y corre `npm run build` (debe decir `✓ built` sin errores).
2. Revisa las pantallas: Detalle del lugar sin línea horario/precio, sin recuadro amarillo y sin reseña; Perfil sin correo/nivel/presupuesto/tiempo/progreso y con los 3 botones nuevos.
3. Haz un commit por persona con lo que hiciste a mano.
