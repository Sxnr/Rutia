# Rutia · App móvil (Expo)

Inicio de la app del **Hito 3**: las pantallas del prototipo web, ahora en React Native con Expo y conectadas a la API real del backend.

| Pantalla | Qué hace | API que usa |
|---|---|---|
| Explorar | Lista de lugares con filtro por categoría y cambio de idioma | `GET /categorias`, `GET /lugares` |
| Crear ruta | Tiempo, presupuesto e intereses, con validación | `POST /rutas/generar` |
| Ruta sugerida | Paradas con traslados y totales; ponerle nombre y guardarla | `POST /rutas` |
| Ruta guardada | Reordenar, quitar paradas, renombrar, marcar visitas y borrar | `GET/PUT/DELETE /rutas/{id}`, visitas |
| Detalle del lugar | Foto con crédito, dirección, horario, duración, entrada y visita | `GET /lugares/{id}`, `POST /usuarios/{id}/visitas` |
| Guardados | Rutas guardadas y lugares visitados | `GET /usuarios/{id}/rutas`, `GET /usuarios/{id}/visitas` |
| Perfil | Iniciar sesión, crear cuenta, idioma y cerrar sesión | `POST /usuarios`, `POST /usuarios/login` |

Todo es bilingüe: los textos de la app están en `src/i18n/` y los de los lugares llegan traducidos desde la API (cabecera `Accept-Language`).

## Requisitos

* **Node.js 22 o superior** (también sirve 20.19.4 o superior).
* **Expo Go** en un celular **Android**, actualizado desde Google Play. El proyecto usa **Expo SDK 57** y Expo Go solo abre proyectos de la versión que soporta.
* **iPhone:** la Expo Go de la App Store no abre proyectos SDK 57. Probarla en iPhone exige una cuenta de Apple Developer (`eas go` y TestFlight); para el curso, usa Android o el navegador.
* El **backend levantado** (ver el [README principal](../README.md)).

## Levantar la app

1. **Levanta el backend para que el celular lo vea.** Desde `backend/`:

   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 8000
   ```

   `--host 0.0.0.0` lo abre a la red local; sin eso solo responde dentro del notebook. Si el celular no conecta, revisa que el firewall del notebook permita el puerto 8000.

2. **Instala y arranca la app.** Desde `mobile/`:

   ```bash
   npm install
   npx expo install --check     # confirma que las versiones calzan con SDK 57
   npx expo start
   ```

3. **Ábrela en el celular Android**, conectado a la **misma red wifi** que el notebook: abre Expo Go y escanea el código QR que muestra la terminal.

La app usa sola la IP del notebook que corre Expo, con el puerto 8000. Si no conecta, por ejemplo en modo túnel o en un emulador, copia `.env.example` como `.env` y escribe ahí la dirección del backend.

**En el navegador:** `npx expo start --web`. Usa `http://localhost:8000/api/v1`, que el backend ya permite por CORS.

## Pruebas

```bash
npm test
```

Prueban, sin celular, la lógica que no depende de la interfaz:

* textos completos en los dos idiomas;
* formatos de montos, duraciones y fechas;
* validaciones de los formularios;
* el cliente HTTP completo contra el backend: registro, generar, guardar y reordenar una ruta, visitas y errores traducidos.

Si el backend no está levantado, las pruebas de la API se saltan.

## Cómo está organizada

Sigue las capas del cliente que describe el Hito 1: **pantallas → estado → cliente HTTP → backend**.

```
mobile/
  src/
    app/              Pantallas (expo-router: cada archivo es una ruta)
      (tabs)/         Explorar, Crear ruta, Guardados y Perfil
      sugerida.js     Ruta sugerida
      rutas/[id].js   Ruta guardada
      lugares/[id].js Detalle del lugar
    estado/           Idioma, sesión y ruta, compartidos entre pantallas (React Context)
    api/              Cliente HTTP: el ÚNICO lugar que hace fetch
    componentes/      Piezas visuales reutilizables
    i18n/             Textos en español e inglés
    utilidades/       Formato, validaciones, fotos y mensajes de error
    tema.js           Colores y medidas del prototipo
    config.js         Dirección del backend
  pruebas/            Pruebas con node:test
  assets/images/      Ícono, ícono adaptativo, pantalla de carga y logo
```

Reglas:

* **Las pantallas no calculan costos ni duraciones.** Todo viene de la API. Al reordenar o quitar paradas, la app envía el cambio y el servidor devuelve los totales recalculados.
* **Solo `src/api/` hace peticiones.** Las pantallas llaman funciones como `api.generarRuta(...)`.
* **Todo texto visible va en `src/i18n/`**, con la misma clave en `es.js` y `en.js`. La prueba de idiomas lo revisa.

## Pendiente para el Hito 3

* **Sesión con token (JWT):** hoy la app guarda el usuario y envía `usuario_id` en cada petición.
* **Pantallas de la Ley 21.719:** corregir nombre, correo e idioma, descargar mis datos y eliminar la cuenta. La API ya las tiene: `PUT` y `DELETE /usuarios/{id}`, `GET /usuarios/{id}/datos`.
* **Reordenar la ruta sugerida antes de guardarla**, con `POST /rutas/recalcular`.
* **Elegir cuántos lugares** (de 2 a 5) al crear la ruta: la API ya recibe `cantidad`.
* **Mapa de la ruta** con las paradas.
* **Uso sin conexión**, al menos para la última ruta guardada.
* **Pruebas en más celulares Android** y ajustes visuales.
* **Publicación** con EAS Build, si se pide.
