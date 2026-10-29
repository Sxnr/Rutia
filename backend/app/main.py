"""Punto de entrada del backend de Rutia.

Levantar en desarrollo:  uvicorn app.main:app --reload
Documentación interactiva: http://localhost:8000/docs
"""
import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi
from fastapi.staticfiles import StaticFiles

from app.core.config import config
from app.presentation.manejadores_error import registrar_manejadores
from app.presentation.routers import lugares, rutas, salud, usuarios, visitas

logging.basicConfig(level=config.log_level, format="%(asctime)s %(levelname)s %(name)s: %(message)s")

PREFIJO_API = "/api/v1"

app = FastAPI(
    title="Rutia API",
    version="1.0.0",
    description=(
        "API de Rutia: arma rutas turísticas por Santiago según tiempo, presupuesto e intereses. "
        "Envía la cabecera `Accept-Language: en` para recibir las respuestas en inglés."
    ),
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=config.cors_origins,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Content-Type", "Accept-Language"],
)

registrar_manejadores(app)

for modulo in (salud, lugares, usuarios, rutas, visitas):
    app.include_router(modulo.router, prefix=PREFIJO_API)

# Fotos del catálogo (db/catalogo/fotos) en http://localhost:8000/fotos/<archivo>
config.carpeta_fotos.mkdir(parents=True, exist_ok=True)
app.mount("/fotos", StaticFiles(directory=config.carpeta_fotos), name="fotos")


def documentacion_openapi() -> dict:
    """Documentación de /docs ajustada a Rutia.

    FastAPI documenta por defecto los errores de formato como 422 "Validation Error";
    en Rutia esos errores responden 400 con el formato común (ver manejadores_error.py),
    así que se quita esa entrada para que /docs muestre lo que la API responde de verdad.
    """
    if app.openapi_schema:
        return app.openapi_schema
    esquema = get_openapi(title=app.title, version=app.version, description=app.description, routes=app.routes)
    for operaciones in esquema.get("paths", {}).values():
        for operacion in operaciones.values():
            respuestas = operacion.get("responses", {})
            if respuestas.get("422", {}).get("description") == "Validation Error":
                del respuestas["422"]
    for nombre in ("HTTPValidationError", "ValidationError"):
        esquema.get("components", {}).get("schemas", {}).pop(nombre, None)
    app.openapi_schema = esquema
    return esquema


app.openapi = documentacion_openapi


@app.get("/", include_in_schema=False)
def inicio():
    return {"servicio": "Rutia API", "version": app.version, "documentacion": "/docs", "api": PREFIJO_API}
