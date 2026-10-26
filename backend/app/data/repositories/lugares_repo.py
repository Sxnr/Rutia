"""Repositorio de lugares: el ÚNICO lugar del backend que consulta la tabla lugares."""
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.data.models import Categoria, Lugar, RutaParada


class LugaresRepositorio:
    def __init__(self, sesion: Session):
        self.sesion = sesion

    def listar(
        self,
        categoria_codigo: str | None,
        costo_max: int | None,
        duracion_max: int | None,
        limit: int,
        offset: int,
    ) -> tuple[list[Lugar], int]:
        """Devuelve una página de lugares activos y el total que cumple los filtros."""
        consulta = select(Lugar).where(Lugar.activo.is_(True))
        if categoria_codigo:
            consulta = consulta.join(Categoria).where(Categoria.codigo == categoria_codigo)
        if costo_max is not None:
            consulta = consulta.where(Lugar.costo_clp <= costo_max)
        if duracion_max is not None:
            consulta = consulta.where(Lugar.duracion_min <= duracion_max)

        total = self.sesion.scalar(select(func.count()).select_from(consulta.subquery()))
        pagina = self.sesion.scalars(consulta.order_by(Lugar.id).limit(limit).offset(offset))
        return list(pagina), total or 0

    def obtener(self, lugar_id: int) -> Lugar | None:
        return self.sesion.get(Lugar, lugar_id)

    def obtener_por_slug(self, slug: str) -> Lugar | None:
        return self.sesion.scalar(select(Lugar).where(Lugar.slug == slug))

    def obtener_varios(self, ids: list[int]) -> dict[int, Lugar]:
        """Trae varios lugares de una vez. Devuelve {id: lugar}."""
        lugares = self.sesion.scalars(select(Lugar).where(Lugar.id.in_(ids)))
        return {lugar.id: lugar for lugar in lugares}

    def buscar_candidatos(self, categoria_ids: list[int], presupuesto: int, duracion_max: int) -> list[Lugar]:
        """Lugares activos de esas categorías que, por sí solos, caben en tiempo y presupuesto."""
        consulta = (
            select(Lugar)
            .where(Lugar.activo.is_(True))
            .where(Lugar.categoria_id.in_(categoria_ids))
            .where(Lugar.costo_clp <= presupuesto)
            .where(Lugar.duracion_min <= duracion_max)
            .order_by(Lugar.id)
        )
        return list(self.sesion.scalars(consulta))

    def contar_rutas_que_lo_usan(self, lugar_id: int) -> int:
        consulta = select(func.count()).select_from(RutaParada).where(RutaParada.lugar_id == lugar_id)
        return self.sesion.scalar(consulta) or 0

    def crear(self, datos: dict) -> Lugar:
        lugar = Lugar(**datos)
        self.sesion.add(lugar)
        self.sesion.commit()
        self.sesion.refresh(lugar)
        return lugar

    def actualizar(self, lugar: Lugar, datos: dict) -> Lugar:
        for campo, valor in datos.items():
            setattr(lugar, campo, valor)
        self.sesion.commit()
        self.sesion.refresh(lugar)
        return lugar

    def borrar(self, lugar: Lugar) -> None:
        self.sesion.delete(lugar)
        self.sesion.commit()
