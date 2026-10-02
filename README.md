# Rutia 🇨🇱

> Para el turista en Santiago con tiempo y presupuesto acotados, Rutia genera rutas viables en segundos descartando lo impagable.

## 👥 Integrantes

* **Francisco Carrera** - [@Sxnr](https://github.com/Sxnr)
* **Francisco Carvajal** - [@Sn1k-12](https://github.com/Sn1k-12)
* **Gerzon Toro** - [@gerzontoro](https://github.com/gerzontoro)

## 🧱 Stack Principal

| Capa (Arquitectura Técnica) | Tecnología | Versión | Propósito |
|---|---|---|---|
| **Cliente - Interfaz P02** | React + Vite | 18 / 5.4 | UI móvil `max-w-md`, Framer Motion, Tailwind 3.4 |
| **Cliente - Estado** | React Context (RouteProvider) | — | `src/state/store.jsx` — Gestor de Estado |
| **Cliente - HTTP** | Axios | 1.x | `src/api/httpClient.js` — POST directo a Router sin Nginx |
| **Servidor - Router** | Express (simulado) | 4.x | `src/server/router.js` — `POST /api/rutas/sugerir` |
| **Servidor - Validación** | Zod | 4.x | `src/schemas/routeSchema.js` — valida tiempo/presupuesto/intereses |
| **Servidor - Lógica** | Motor de Filtrado | — | `src/server/controller.js` — arma itinerario hiper-local |
| **Servidor - Datos** | Mongoose ODM + Repositorio | 8.x | `src/server/repository.js` → `ODM.find()` |
| **Datos - Persistencia** | MongoDB NoSQL | 7.x | `db/` — colección `pois` esquemas variables |

> Código organizado por capas en `src/` según Anexo B. Infra (Nginx/PM2) omitida — hosting a definir (Vercel / Render).

## 🔗 Enlace al prototipo web

* **Prototipo navegable (deploy):** https://santiago-inteligenteprototipo.netlify.app
* **Prototipo local:** `npm run dev` → http://localhost:5173

## 📄 Enlaces a los documentos

> Documentos en la carpeta del repositorio (Anexo B) — no externos:

* [Propuesta Comercial (PDF)](./docs/hito-1/propuesta.pdf)
* [Láminas de Presentación (PDF)](./docs/hito-1/presentacion.pdf)
* [Diagrama Arquitectura Técnica (PNG)](./docs/hito-1/arquitectura-tecnica.png)
* [Diagrama Arquitectura Información (PNG)](./docs/hito-1/Arquitectura-informacion.png)

---

## ⚙️ Instalación y Ejecución

### Prerrequisitos
* Node.js v18+
* npm v9+
* MongoDB local o Atlas (ver `db/`)

### Estructura mínima (Anexo B)
```
.
├── README.md
├── docs/            # PDFs, diagramas e imágenes
├── db/              # modelo y script de creación
├── src/             # código fuente organizado por capas
├── .gitignore
└── .env.example
```

### Pasos
```bash
# 1. Clonar
git clone https://github.com/Sxnr/Santiago-Inteligente.git
cd Santiago-Inteligente

# 2. Variables de entorno
cp .env.example .env   # completar valores locales

# 3. Instalar dependencias
npm install

# 4. Crear datos (opcional)
# con mongosh: mongosh < db/script-creacion.js

# 5. Desarrollo
npm run dev

# 6. Build producción
npm run build
npm run preview
```


