"""Dependencias de FastAPI: piezas que cada ruta recibe ya listas.

FastAPI llama a estas funciones antes de cada petición y entrega el resultado
a la función de la ruta (inyección de dependencias).
"""
from typing import Annotated

from fastapi import Depends, Header
from sqlalchemy.orm import Session

from app.business.lugares_service import LugaresServicio
from app.business.rutas_service import RutasServicio
from app.business.salud_service import SaludServicio
from app.business.usuarios_service import UsuariosServicio
from app.business.visitas_service import VisitasServicio
from app.core.database import obtener_sesion
from app.core.i18n import idioma_desde_cabecera

SesionBD = Annotated[Session, Depends(obtener_sesion)]


def obtener_idioma(accept_language: Annotated[str | None, Header()] = None) -> str:
    return idioma_desde_cabecera(accept_language)


Idioma = Annotated[str, Depends(obtener_idioma)]


def servicio_lugares(sesion: SesionBD) -> LugaresServicio:
    return LugaresServicio(sesion)


def servicio_usuarios(sesion: SesionBD) -> UsuariosServicio:
    return UsuariosServicio(sesion)


def servicio_rutas(sesion: SesionBD) -> RutasServicio:
    return RutasServicio(sesion)


def servicio_visitas(sesion: SesionBD) -> VisitasServicio:
    return VisitasServicio(sesion)


def servicio_salud(sesion: SesionBD) -> SaludServicio:
    return SaludServicio(sesion)
