"""GET /health: permite comprobar que el servicio y la base responden."""
from typing import Annotated

from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse

from app.business.salud_service import SaludServicio
from app.core.i18n import mensaje
from app.presentation.dependencias import Idioma, servicio_salud

router = APIRouter(tags=["Salud"])


@router.get("/health", summary="Estado del servicio y de la base de datos")
def salud(servicio: Annotated[SaludServicio, Depends(servicio_salud)], idioma: Idioma):
    if servicio.base_de_datos_ok():
        return {"estado": "ok", "base_de_datos": "ok"}
    return JSONResponse(
        status_code=503,
        content={"error": {"codigo": "BASE_NO_DISPONIBLE", "mensaje": mensaje("BASE_NO_DISPONIBLE", idioma), "detalles": []}},
    )
