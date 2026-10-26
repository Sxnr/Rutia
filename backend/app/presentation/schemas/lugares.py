"""Schemas Pydantic de lugares y categorías.

Entrada: lo que el cliente puede enviar (Pydantic lo valida antes de llegar al servicio).
Salida: lo que la API responde, ya en el idioma pedido.
"""
from datetime import date

from pydantic import BaseModel, ConfigDict, Field


class CategoriaSalida(BaseModel):
    codigo: str = Field(examples=["museos"])
    nombre: str = Field(examples=["Museos"])


class LugarEntrada(BaseModel):
    """Cuerpo de POST /lugares y PUT /lugares/{id} (PUT reemplaza el lugar completo)."""

    model_config = ConfigDict(extra="forbid")

    slug: str = Field(min_length=3, max_length=80, pattern=r"^[a-z0-9]+(-[a-z0-9]+)*$",
                      examples=["barrio-lastarria"])
    categoria: str = Field(min_length=1, max_length=40, examples=["historico"])
    nombre_es: str = Field(min_length=1, max_length=120, examples=["Barrio Lastarria"])
    nombre_en: str = Field(min_length=1, max_length=120, examples=["Lastarria Neighborhood"])
    descripcion_es: str = Field(default="", max_length=600)
    descripcion_en: str = Field(default="", max_length=600)
    direccion: str | None = Field(default=None, max_length=200)
    comuna: str | None = Field(default=None, max_length=80, examples=["Santiago"])
    latitud: float = Field(ge=-90, le=90, examples=[-33.4372])
    longitud: float = Field(ge=-180, le=180, examples=[-70.6386])
    costo_clp: int = Field(ge=0, le=1_000_000, examples=[0])
    duracion_min: int = Field(gt=0, le=720, examples=[45])
    horario_es: str | None = Field(default=None, max_length=120, examples=["Lun-Dom 10:00-20:00"])
    horario_en: str | None = Field(default=None, max_length=120, examples=["Mon-Sun 10:00-20:00"])
    contenido_rotativo: bool = False
    imagen_archivo: str | None = Field(default=None, max_length=120)
    imagen_autor: str | None = Field(default=None, max_length=120)
    imagen_licencia: str | None = Field(default=None, max_length=60)
    imagen_fuente_url: str | None = Field(default=None, max_length=500)
    fuente_verificacion_url: str | None = Field(default=None, max_length=500)
    verificado_en: date | None = None


class ImagenSalida(BaseModel):
    url: str
    autor: str | None
    licencia: str | None
    fuente_url: str | None


class LugarSalida(BaseModel):
    id: int
    slug: str
    categoria: CategoriaSalida
    nombre: str
    descripcion: str
    direccion: str | None
    comuna: str | None
    latitud: float
    longitud: float
    costo_clp: int
    duracion_min: int
    horario: str | None
    contenido_rotativo: bool
    imagen: ImagenSalida | None
    verificado_en: date | None


class PaginaLugares(BaseModel):
    datos: list[LugarSalida]
    total: int
    limit: int
    offset: int
