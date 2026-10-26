"""Formato común de error de la API (se documenta en /docs)."""
from pydantic import BaseModel


class DetalleError(BaseModel):
    campo: str
    mensaje: str


class CuerpoError(BaseModel):
    codigo: str
    mensaje: str
    detalles: list[DetalleError] = []


class RespuestaError(BaseModel):
    error: CuerpoError


def respuestas_error(*codigos: int) -> dict:
    """Para documentar en /docs qué errores puede devolver cada ruta."""
    return {codigo: {"model": RespuestaError} for codigo in codigos}
