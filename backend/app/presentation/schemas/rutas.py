"""Schemas de rutas: generar una sugerencia y administrar rutas guardadas."""
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.presentation.schemas.lugares import LugarSalida


class GenerarRutaEntrada(BaseModel):
    model_config = ConfigDict(extra="forbid")

    tiempo_horas: float = Field(gt=0, le=12, examples=[4])
    presupuesto_clp: int = Field(ge=0, le=1_000_000, examples=[15000])
    intereses: list[str] = Field(min_length=1, max_length=4, examples=[["museos", "restaurantes"]])
    usuario_id: int | None = Field(default=None, examples=[None])  # TODO(Hito 3): sale del token
    incluir_visitados: bool = False


class ParadaSalida(BaseModel):
    orden: int
    traslado_min: int
    lugar: LugarSalida


class RutaGeneradaSalida(BaseModel):
    tiempo_disponible_min: int
    presupuesto_clp: int
    duracion_total_min: int
    costo_total_clp: int
    paradas: list[ParadaSalida]
    mensaje: str | None = None


class RutaEntrada(BaseModel):
    """Cuerpo de POST /rutas. Los totales NO se reciben: los calcula el servidor."""

    model_config = ConfigDict(extra="forbid")

    usuario_id: int = Field(examples=[1])  # TODO(Hito 3): sale del token
    nombre: str = Field(min_length=1, max_length=80, examples=["Mi tarde en el centro"])
    lugares: list[int] = Field(min_length=1, max_length=10, examples=[[1, 2, 3]])
    tiempo_horas: float | None = Field(default=None, gt=0, le=12, examples=[4])
    presupuesto_clp: int | None = Field(default=None, ge=0, le=1_000_000, examples=[15000])


class RutaActualizar(BaseModel):
    """Cuerpo de PUT /rutas/{id}: renombrar, reordenar o quitar paradas."""

    model_config = ConfigDict(extra="forbid")

    nombre: str = Field(min_length=1, max_length=80)
    lugares: list[int] = Field(min_length=1, max_length=10)
    tiempo_horas: float | None = Field(default=None, gt=0, le=12)
    presupuesto_clp: int | None = Field(default=None, ge=0, le=1_000_000)


class RutaResumen(BaseModel):
    id: int
    usuario_id: int
    nombre: str
    duracion_total_min: int
    costo_total_clp: int
    cantidad_paradas: int
    creada_en: datetime


class RutaSalida(BaseModel):
    id: int
    usuario_id: int
    nombre: str
    tiempo_disponible_min: int | None
    presupuesto_clp: int | None
    duracion_total_min: int
    costo_total_clp: int
    creada_en: datetime
    actualizada_en: datetime | None
    paradas: list[ParadaSalida]
