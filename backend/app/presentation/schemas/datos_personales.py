"""Schema de "descargar mis datos" (Ley 21.719, derecho de portabilidad)."""
from datetime import datetime

from pydantic import BaseModel

from app.presentation.schemas.rutas import RutaSalida
from app.presentation.schemas.usuarios import UsuarioSalida
from app.presentation.schemas.visitas import VisitaSalida


class DatosPersonalesSalida(BaseModel):
    exportado_en: datetime
    usuario: UsuarioSalida
    rutas: list[RutaSalida]
    visitas: list[VisitaSalida]
