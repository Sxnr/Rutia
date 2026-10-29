# Rutia · reglas del proyecto

App que arma en minutos una ruta turística por Santiago según tiempo, presupuesto e intereses.
Proyecto de INGT1003 (Universidad Mayor). Equipo: Francisco Carrera (@Sxnr) y Gerzon Toro (@gerzontoro).

## Stack fijo (firmado en el Hito 1, no proponer cambios)
- Backend: Python 3.12+, FastAPI, SQLAlchemy 2, psycopg 3
- Base: PostgreSQL en Supabase
- Fotos: archivos en db/catalogo/fotos, servidos por el backend en /fotos
- App móvil (Hito 3): React Native + Expo, en JavaScript
- Nada de MongoDB, Express ni Mongoose

## Arquitectura: monolito en 3 capas
- backend/app/presentation: routers y schemas. Sin SQL ni reglas de negocio.
- backend/app/business: reglas de Rutia. No importa FastAPI.
- backend/app/data: modelos y repositorios. Único lugar con consultas.
Cada capa solo llama a la de abajo.

## Convenciones
- Código y comentarios en español; nombres en español sin tildes.
- Todo texto visible al usuario es bilingüe ES/EN (cabecera Accept-Language).
- Errores con formato { "error": { "codigo", "mensaje", "detalles" } } y código HTTP correcto. Nunca 200 para un error.
- Prefijo de API: /api/v1.
- Simple y explicable antes que ingenioso: cualquier integrante debe poder explicar cualquier línea.

## Seguridad
- Nunca escribir credenciales en código ni en archivos versionados. Solo el .env de la raíz (ignorado).
- Nunca datos personales reales: usuarios de prueba ficticios.

## Git
- Ramas por funcionalidad; nunca commit directo a main.
- Commits pequeños, en español, con prefijo feat/fix/chore/docs/test.
- Nunca push, merge ni force-push sin confirmación.

## Comandos
- Backend: cd backend && source .venv/bin/activate && uvicorn app.main:app --reload
- Pruebas: cd backend && pytest
- Base desde cero: cd backend && python -m scripts.crear_base
- Prototipo: cd prototipo-web && npm run dev
