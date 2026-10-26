"""Schemas de usuarios. La contraseña entra, pero nunca sale."""
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

# Validación simple de email: algo@algo.dominio (suficiente para este hito)
PATRON_EMAIL = r"^[^@\s]+@[^@\s]+\.[^@\s]+$"


class UsuarioEntrada(BaseModel):
    model_config = ConfigDict(extra="forbid")

    nombre: str = Field(min_length=1, max_length=80, examples=["Daniel Turista"])
    email: str = Field(max_length=254, pattern=PATRON_EMAIL, examples=["daniel@ejemplo.com"])
    password: str = Field(min_length=8, max_length=128, examples=["clave-segura-123"])
    idioma: Literal["es", "en"] = "es"


class LoginEntrada(BaseModel):
    model_config = ConfigDict(extra="forbid")

    email: str = Field(max_length=254, examples=["daniel@ejemplo.com"])
    password: str = Field(min_length=1, max_length=128, examples=["clave-segura-123"])


class UsuarioSalida(BaseModel):
    id: int
    nombre: str
    email: str
    idioma: str
    creado_en: datetime
