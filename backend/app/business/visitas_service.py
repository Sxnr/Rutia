"""Servicio de visitas: el turista marca los lugares que ya visitó.

Un mismo lugar puede tener varias visitas (el turista puede volver).
El generador de rutas usa estas visitas para no repetir lugares,
salvo los que tienen contenido rotativo.
"""
from sqlalchemy.orm import Session

from app.core.errores import DatosInvalidos, NoEncontrado
from app.data.models import Visita
from app.data.repositories.lugares_repo import LugaresRepositorio
from app.data.repositories.rutas_repo import RutasRepositorio
from app.data.repositories.usuarios_repo import UsuariosRepositorio
from app.data.repositories.visitas_repo import VisitasRepositorio


class VisitasServicio:
    def __init__(self, sesion: Session):
        self.visitas = VisitasRepositorio(sesion)
        self.usuarios = UsuariosRepositorio(sesion)
        self.lugares = LugaresRepositorio(sesion)
        self.rutas = RutasRepositorio(sesion)

    def registrar(self, usuario_id: int, lugar_id: int, ruta_id: int | None) -> Visita:
        self._usuario_existente(usuario_id)
        if self.lugares.obtener(lugar_id) is None:
            raise DatosInvalidos("LUGAR_NO_ENCONTRADO", id=lugar_id)
        if ruta_id is not None:
            ruta = self.rutas.obtener(ruta_id)
            if ruta is None:
                raise DatosInvalidos("RUTA_NO_ENCONTRADA", id=ruta_id)
            if ruta.usuario_id != usuario_id:
                raise DatosInvalidos("RUTA_NO_PERTENECE", ruta_id=ruta_id, usuario_id=usuario_id)
        return self.visitas.crear(usuario_id, lugar_id, ruta_id)

    def listar_de_usuario(self, usuario_id: int) -> list[Visita]:
        self._usuario_existente(usuario_id)
        return self.visitas.listar_de_usuario(usuario_id)

    def borrar(self, visita_id: int) -> None:
        visita = self.visitas.obtener(visita_id)
        if visita is None:
            raise NoEncontrado("VISITA_NO_ENCONTRADA", id=visita_id)
        self.visitas.borrar(visita)

    def _usuario_existente(self, usuario_id: int) -> None:
        if self.usuarios.obtener(usuario_id) is None:
            raise NoEncontrado("USUARIO_NO_ENCONTRADO", id=usuario_id)
