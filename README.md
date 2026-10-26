# Rutia 🇨🇱

> Para el turista de larga distancia al que le cuesta decidir qué visitar en Santiago entre tantas alternativas, Rutia entrega en segundos una ruta con pocos lugares, elegidos según su tiempo, presupuesto e intereses.

## 👥 Integrantes

* **Francisco Carrera** - [@Sxnr](https://github.com/Sxnr)
* **Gerzon Toro** - [@gerzontoro](https://github.com/gerzontoro)

## 🧱 Stack (decisión firmada)

Fuente: [Propuesta Comercial (PDF)](./docs/hito-1/propuesta.pdf), sección 6.

| Capa | Tecnología | Propósito |
|---|---|---|
| **Frontend (app móvil)** | React Native + Expo | Aplicación móvil multiplataforma |
| **Backend** | Python + FastAPI | API del servidor (presentación, negocio y datos) |
| **Base de datos** | PostgreSQL | Persistencia de usuarios, rutas y lugares |

> El backend FastAPI y la base PostgreSQL **aún no están implementados en este repo**; se construyen en la siguiente etapa (Hito 2). Ver [Estado actual](#-estado-actual).

## 📱 Estado actual

Este repositorio contiene hoy un **prototipo web** (React + Vite, vista de **390 × 844 px**) que simula la app móvil para validar el flujo rápido. Su estructura interna sigue la arquitectura en capas del documento: **interfaz → cliente HTTP → presentación → negocio → datos**, implementadas como módulos locales en `src/`, con **9 lugares precargados**.

El prototipo **no** incluye aún React Native, FastAPI ni PostgreSQL; es el reemplazo temporal de la app móvil real descrita en la propuesta (sección 7.1).

## 🔗 Enlace al prototipo web

* **Prototipo navegable (deploy):** https://rutia-prototipo.netlify.app/
* **Prototipo local:** `npm run dev` → http://localhost:5173 (puerto por defecto de Vite)

## 🎬 Video de la demo

* [Demo en video (MP4)](./anexos/video/demo-rutia.mp4) — recorrido del flujo del caso Daniel (Explorar → ruta → guardados → perfil).

## 📄 Enlaces a los documentos

> Documentos en la carpeta del repositorio — no externos:

* [Propuesta Comercial (PDF)](./docs/hito-1/propuesta.pdf)
* [Láminas de Presentación (PDF)](./docs/hito-1/presentacion.pdf)
* [Diagrama Arquitectura Técnica (PNG)](./docs/hito-1/arquitectura-tecnica.png)
* [Diagrama Arquitectura Información (PNG)](./docs/hito-1/Arquitectura-informacion.png)

---

## ⚙️ Instalación y ejecución del prototipo web

### Requisitos (prototipo web de este repo)

* **Node.js** y **npm** — el repo no declara versión mínima (no hay `.nvmrc` ni `engines`); el flujo completo (install, dev, build, preview, `?debug=1`) se verificó con **Node.js v26** y **npm 12**.
* Navegar con un navegador moderno (Chrome/Edge/Firefox/Safari recientes).

Dependencias principales (según `package.json`): `react` 18, `react-dom` 18, `vite` 5, `@vitejs/plugin-react` 4, `tailwindcss` 3.4, `framer-motion` 11, `zod` 4; `playwright` (dev) para capturas y scripts de demo.

### Stack futuro (etapa de implementación — aún no incluido)

Se instalarán en la etapa de implementación, **no forman parte de este repo hoy**:

* Node.js + Expo CLI (React Native)
* Python 3 + FastAPI + Uvicorn
* PostgreSQL

### Estructura de carpetas (`src/`)

```
src/
├── client/
│   ├── ui/          # Pantallas (App, Explorar, Preferencias, RutaSugerida, …)
│   ├── http/        # Cliente HTTP simulado (httpClient.js)
│   └── state/       # Gestor de estado (store.jsx — RouteProvider)
├── server/
│   ├── presentation/# Router, validación (Zod) y controller
│   ├── business/    # Lógica de rutas (routeService.js)
│   └── data/        # Repositorio + db/poisCollection.js (9 lugares)
└── shared/          # Utilidades compartidas (debug.js)
```

### Pasos (verificados en esta sesión)

```bash
# 1. Clonar
git clone https://github.com/Sxnr/Rutia.git
cd Rutia

# 2. Instalar dependencias
npm install

# 3. Desarrollo (Vite imprime el puerto; por defecto 5173)
npm run dev
# → http://localhost:5173/

# 4. Build de producción
npm run build

# 5. Previsualizar el build (Vite; por defecto 4173)
npm run preview
# → http://localhost:4173/

# 6. Modo depuración (los 10 pasos del flujo por capas, sección 5.3 de la propuesta)
#    Abrir en el navegador:
#    http://localhost:5173/?debug=1
#    y abrir la consola del navegador (F12) para ver los pasos [RUTIA · debug].
```

### Créditos de imágenes

Las fotografías de los lugares provienen de **Wikimedia Commons** con licencias libres (CC0 / dominio público / CC BY / CC BY-SA). El detalle de autoría y licencia está en [CREDITS.md](./CREDITS.md).
