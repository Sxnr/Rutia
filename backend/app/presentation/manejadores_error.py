"""Traduce errores a respuestas HTTP con el formato común:

    { "error": { "codigo": "...", "mensaje": "...", "detalles": [...] } }

Aquí, y solo aquí, se decide qué código HTTP corresponde a cada error de negocio.
"""
import logging

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.core.errores import Conflicto, DatosInvalidos, ErrorRutia, NoAutorizado, NoEncontrado
from app.core.i18n import idioma_desde_cabecera, mensaje, mensaje_validacion

log = logging.getLogger("rutia.errores")

# Error de negocio → código HTTP
CODIGO_HTTP = {
    NoEncontrado: 404,
    Conflicto: 409,
    DatosInvalidos: 422,
    NoAutorizado: 401,
}


def _idioma(request: Request) -> str:
    return idioma_desde_cabecera(request.headers.get("accept-language"))


def _respuesta(status: int, codigo: str, texto: str, detalles: list | None = None) -> JSONResponse:
    return JSONResponse(
        status_code=status,
        content={"error": {"codigo": codigo, "mensaje": texto, "detalles": detalles or []}},
    )


async def _error_rutia(request: Request, exc: ErrorRutia) -> JSONResponse:
    status = next((s for tipo, s in CODIGO_HTTP.items() if isinstance(exc, tipo)), 400)
    return _respuesta(status, exc.codigo, mensaje(exc.codigo, _idioma(request), **exc.datos))


async def _error_validacion(request: Request, exc: RequestValidationError) -> JSONResponse:
    idioma = _idioma(request)
    detalles = []
    for error in exc.errors():
        # loc = ("body", "tiempo_horas") → "tiempo_horas"; ("query", "limit") → "limit"
        partes = [str(p) for p in error.get("loc", []) if p not in ("body", "query", "path", "header")]
        if error.get("type") == "json_invalid":
            partes = []  # el problema es el cuerpo entero, no un campo
        detalles.append({
            "campo": ".".join(partes) or "cuerpo",
            "mensaje": mensaje_validacion(error.get("type", ""), idioma, error.get("ctx"), error.get("msg", "")),
        })
    return _respuesta(422, "VALIDACION", mensaje("VALIDACION", idioma), detalles)


async def _error_http(request: Request, exc: StarletteHTTPException) -> JSONResponse:
    idioma = _idioma(request)
    if exc.status_code == 404:
        return _respuesta(404, "RUTA_HTTP_NO_EXISTE", mensaje("RUTA_HTTP_NO_EXISTE", idioma))
    if exc.status_code == 405:
        return _respuesta(405, "METODO_NO_PERMITIDO", mensaje("METODO_NO_PERMITIDO", idioma))
    return _respuesta(exc.status_code, "ERROR_HTTP", str(exc.detail))


async def _error_inesperado(request: Request, exc: Exception) -> JSONResponse:
    # Se registra el detalle en el servidor, pero NUNCA se envía la traza al cliente
    log.exception("Error no controlado en %s %s", request.method, request.url.path)
    return _respuesta(500, "ERROR_INTERNO", mensaje("ERROR_INTERNO", _idioma(request)))


def registrar_manejadores(app: FastAPI) -> None:
    app.add_exception_handler(ErrorRutia, _error_rutia)
    app.add_exception_handler(RequestValidationError, _error_validacion)
    app.add_exception_handler(StarletteHTTPException, _error_http)
    app.add_exception_handler(Exception, _error_inesperado)
