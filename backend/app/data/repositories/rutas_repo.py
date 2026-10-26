"""Repositorio de rutas guardadas y sus paradas."""
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.data.models import Ruta, RutaParada


class RutasRepositorio:
    def __init__(self, sesion: Session):
        self.sesion = sesion

    def obtener(self, ruta_id: int) -> Ruta | None:
        return self.sesion.get(Ruta, ruta_id)

    def listar_de_usuario(self, usuario_id: int) -> list[Ruta]:
        consulta = select(Ruta).where(Ruta.usuario_id == usuario_id).order_by(Ruta.creada_en.desc(), Ruta.id.desc())
        return list(self.sesion.scalars(consulta))

    def crear(self, datos: dict, paradas: list[dict]) -> Ruta:
        """Guarda la ruta y todas sus paradas en una sola transacción."""
        ruta = Ruta(**datos)
        ruta.paradas = [RutaParada(**p) for p in paradas]
        self.sesion.add(ruta)
        self.sesion.commit()
        self.sesion.refresh(ruta)
        return ruta

    def reemplazar(self, ruta: Ruta, datos: dict, paradas: list[dict]) -> Ruta:
        """Actualiza la ruta y reemplaza sus paradas por las nuevas."""
        for campo, valor in datos.items():
            setattr(ruta, campo, valor)
        # Primero se borran las paradas viejas para no chocar con la clave (ruta_id, orden)
        ruta.paradas.clear()
        self.sesion.flush()
        ruta.paradas.extend(RutaParada(**p) for p in paradas)
        self.sesion.commit()
        self.sesion.refresh(ruta)
        return ruta

    def borrar(self, ruta: Ruta) -> None:
        self.sesion.delete(ruta)
        self.sesion.commit()
