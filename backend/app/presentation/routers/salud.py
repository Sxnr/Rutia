"""GET /health: permite comprobar que el servicio y la base responden.

También acepta HEAD, que es lo que usan los monitores de disponibilidad (como UptimeRobot).
"""
from typing import Annotated

from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse

from app.business.salud_service import SaludServicio
from app.core.i18n import mensaje
from app.presentation.dependencias import Idioma, servicio_salud

router = APIRouter(tags=["Salud"])


@router.api_route("/health", methods=["GET", "HEAD"], summary="Estado del servicio y de la base de datos")
def salud(servicio: Annotated[SaludServicio, Depends(servicio_salud)], idioma: Idioma):
    if servicio.base_de_datos_ok():
        return {"estado": "ok", "base_de_datos": "ok"}
    return JSONResponse(
        status_code=503,
        content={"error": {"codigo": "BASE_NO_DISPONIBLE", "mensaje": mensaje("BASE_NO_DISPONIBLE", idioma), "detalles": []}},
    )
