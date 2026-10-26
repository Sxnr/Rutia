"""Repositorio de visitas (lugares que el turista marcó como visitados)."""
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.data.models import Visita


class VisitasRepositorio:
    def __init__(self, sesion: Session):
        self.sesion = sesion

    def obtener(self, visita_id: int) -> Visita | None:
        return self.sesion.get(Visita, visita_id)

    def listar_de_usuario(self, usuario_id: int) -> list[Visita]:
        consulta = (
            select(Visita)
            .where(Visita.usuario_id == usuario_id)
            .order_by(Visita.visitado_en.desc(), Visita.id.desc())
        )
        return list(self.sesion.scalars(consulta))

    def ids_lugares_visitados(self, usuario_id: int) -> set[int]:
        consulta = select(Visita.lugar_id).where(Visita.usuario_id == usuario_id).distinct()
        return set(self.sesion.scalars(consulta))

    def crear(self, usuario_id: int, lugar_id: int, ruta_id: int | None) -> Visita:
        visita = Visita(usuario_id=usuario_id, lugar_id=lugar_id, ruta_id=ruta_id)
        self.sesion.add(visita)
        self.sesion.commit()
        self.sesion.refresh(visita)
        return visita

    def borrar(self, visita: Visita) -> None:
        self.sesion.delete(visita)
        self.sesion.commit()
