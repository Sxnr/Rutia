# Rutia 🇨🇱

> Para el turista de larga distancia al que le cuesta decidir qué visitar en Santiago entre tantas alternativas, Rutia entrega en segundos una ruta con pocos lugares, elegidos según su tiempo, presupuesto e intereses.

## 👥 Integrantes

* **Francisco Carrera** - [@Sxnr](https://github.com/Sxnr)
* **Gerzon Toro** - [@gerzontoro](https://github.com/gerzontoro)

## 🧱 Stack

Decisión firmada en la [Propuesta del Hito 1](./docs/hito-1/propuesta.pdf), sección 6.

| Capa | Tecnología | Estado |
|---|---|---|
| Backend (API) | Python + FastAPI + SQLAlchemy | ✅ Hito 2 · carpeta [`backend/`](./backend) |
| Base de datos | PostgreSQL (alojado en Supabase) | ✅ Hito 2 · carpeta [`db/`](./db) |
| App móvil | React Native + Expo (SDK 57) | 🚧 Hito 3 · inicio en [`mobile/`](./mobile), conectado a la API |

Arquitectura: **monolito en tres capas** (presentación → negocio → datos).

## 📁 Estructura

```
backend/
  app/
    presentation/   Capa de presentación: routers (HTTP), schemas (validación), manejo de errores
    business/       Capa de negocio: generador de rutas y reglas de cada recurso
    data/           Capa de datos: modelos SQLAlchemy y repositorios (únicos con consultas)
    core/           Configuración, conexión, idiomas y errores de dominio
  scripts/          Crear la base y cargar o validar el catálogo
  tests/            Pruebas con pytest
db/
  schema.sql        Script de creación de la base
  modelo-datos.md   Diagrama entidad-relación y explicación de cada tabla
  catalogo/         lugares.csv + fotos con licencia libre
postman/            Colección y entorno para probar la API
mobile/             App móvil con Expo (Hito 3): pantallas, estado y cliente HTTP
docs/
  hito-1/           Propuesta, láminas, diagramas y anexos del Hito 1
  hito-2/           Tabla de la API y documento técnico
prototipo-web/      Prototipo navegable del Hito 1 (React + Vite)
```

## 🚀 Levantar el backend

### Requisitos

* **Python 3.12 o superior** (`python3 --version`)
* Una base **PostgreSQL**: el proyecto de Supabase del equipo o un PostgreSQL local
* **Git**

### 1. Clonar e instalar

```bash
git clone https://github.com/Sxnr/Rutia.git
cd Rutia/backend

python3 -m venv .venv
source .venv/bin/activate          # Windows (PowerShell): .venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### 2. Configurar la conexión

```bash
cp .env.example .env               # Windows: copy .env.example .env
```

Abre `backend/.env` y completa `DATABASE_URL`:

* **Supabase:** en el proyecto, *Connect* → *Session pooler* → copia la cadena (puerto 5432), reemplaza `[YOUR-PASSWORD]` por la contraseña de la base y agrega `?sslmode=require` al final. Usa el *Session pooler* y no la conexión directa, porque la directa solo funciona con IPv6.
* **PostgreSQL local:** `postgresql://usuario:clave@localhost:5432/rutia`

Si la contraseña tiene `@`, `:`, `/`, `#` o `?`, escríbelos codificados (por ejemplo, `@` se escribe `%40`).

### 3. Crear la base y cargar el catálogo

```bash
python -m scripts.crear_base       # BORRA y crea las tablas, y carga db/catalogo/lugares.csv
```

Si solo cambió el catálogo, no hace falta borrar nada: `python -m scripts.cargar_catalogo` actualiza los lugares existentes y agrega los nuevos.

### 4. Levantar el servicio

```bash
uvicorn app.main:app --reload
```

* API: http://localhost:8000/api/v1/health → `{"estado":"ok","base_de_datos":"ok"}`
* Documentación interactiva: http://localhost:8000/docs

Para que un celular en la misma red wifi vea el backend: `uvicorn app.main:app --host 0.0.0.0 --port 8000`, y en `.env` cambia `PUBLIC_BASE_URL` por la IP del notebook.

### 5. Probar

**Postman:** importa `postman/Rutia.postman_collection.json` y `postman/Rutia.postman_environment.json`, y elige el entorno *Rutia local*. La carpeta **Demo** tiene las 4 peticiones de la presentación en orden: crear, leer, actualizar y borrar un lugar.

**Pruebas automáticas:**

```bash
pytest                             # pruebas del generador de rutas (no necesitan base)
```

Las pruebas de la API completa necesitan una base **aparte**, porque la borran en cada ejecución. Agrega a `.env` una línea `TEST_DATABASE_URL=...` que apunte a un PostgreSQL local o a un segundo proyecto de Supabase, y vuelve a correr `pytest`. Nunca uses la base de la demo.

## 🔌 API

Tabla completa de rutas, parámetros, códigos de estado y ejemplos en **[docs/hito-2/API.md](./docs/hito-2/API.md)**.

| Recurso | Rutas |
|---|---|
| Lugares (CRUD) | `GET/POST /api/v1/lugares` · `GET/PUT/DELETE /api/v1/lugares/{id}` |
| Rutas guardadas (CRUD) | `POST /api/v1/rutas` · `GET/PUT/DELETE /api/v1/rutas/{id}` · `GET /api/v1/usuarios/{id}/rutas` |
| Generar ruta | `POST /api/v1/rutas/generar` |
| Usuarios | `POST /api/v1/usuarios` · `POST /api/v1/usuarios/login` · `GET /api/v1/usuarios/{id}` |
| Visitas | `POST/GET /api/v1/usuarios/{id}/visitas` · `DELETE /api/v1/visitas/{id}` |

Todas las respuestas están en español o en inglés según la cabecera `Accept-Language`.

## 🗂️ Catálogo de lugares

Los lugares viven en [`db/catalogo/lugares.csv`](./db/catalogo/lugares.csv) y sus fotos en `db/catalogo/fotos/`. Para revisar el CSV sin base de datos:

```bash
cd backend && python -m scripts.cargar_catalogo --validar
```

Las fotos provienen de Wikimedia Commons con licencias libres; autoría y licencia en [CREDITS.md](./CREDITS.md).

## ⚠️ Limitaciones conocidas (Hito 2)

* **Sin tokens de sesión.** El login verifica la contraseña, pero el cliente envía `usuario_id` en cada petición. En el Hito 3 se reemplaza por un token firmado.
* **El costo y el horario se verificaron a mano** y pueden cambiar; cada lugar guarda su fuente y la fecha de verificación.
* **El tiempo de traslado es una estimación** a pie (15 min por km en línea recta), no una ruta real por calles.

## 📱 App móvil (inicio del Hito 3)

Las pantallas del prototipo, en React Native con Expo y conectadas a esta API. Con el backend levantado con `--host 0.0.0.0`:

```bash
cd mobile
npm install
npx expo start                     # escanea el QR con Expo Go (misma red wifi)
```

Detalle, estructura y pendientes en [mobile/README.md](./mobile/README.md).

## 🖥️ Prototipo web (Hito 1)

```bash
cd prototipo-web
npm install
npm run dev                        # http://localhost:5173  ·  ?debug=1 muestra el recorrido por capas
```

* Deploy: https://rutia-prototipo.netlify.app/
* [Video de la demo (MP4)](./docs/hito-1/anexos/video/demo-rutia.mp4)

## 📄 Documentos

* Hito 1: [Propuesta (PDF)](./docs/hito-1/propuesta.pdf) · [Láminas (PDF)](./docs/hito-1/presentacion.pdf) · [Arquitectura técnica](./docs/hito-1/arquitectura-tecnica.png) · [Arquitectura de información](./docs/hito-1/Arquitectura-informacion.png)
* Hito 2: [Tabla de la API](./docs/hito-2/API.md) · [Modelo de datos](./db/modelo-datos.md) · Documento técnico (PDF, por subir)
