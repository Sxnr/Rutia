"""Repositorio de categorías: solo consultas, sin reglas de negocio."""
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.data.models import Categoria


class CategoriasRepositorio:
    def __init__(self, sesion: Session):
        self.sesion = sesion

    def listar(self) -> list[Categoria]:
        return list(self.sesion.scalars(select(Categoria).order_by(Categoria.id)))

    def obtener_por_codigo(self, codigo: str) -> Categoria | None:
        return self.sesion.scalar(select(Categoria).where(Categoria.codigo == codigo))

    def obtener_por_codigos(self, codigos: list[str]) -> list[Categoria]:
        return list(self.sesion.scalars(select(Categoria).where(Categoria.codigo.in_(codigos))))
