"""Schemas de visitas."""
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.presentation.schemas.lugares import LugarSalida


class VisitaEntrada(BaseModel):
    model_config = ConfigDict(extra="forbid")

    lugar_id: int = Field(examples=[1])
    ruta_id: int | None = Field(default=None, examples=[None])


class VisitaSalida(BaseModel):
    id: int
    usuario_id: int
    ruta_id: int | None
    visitado_en: datetime
    lugar: LugarSalida
