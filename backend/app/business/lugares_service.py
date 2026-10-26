"""Servicio de lugares y categorías: reglas de negocio del catálogo."""
from sqlalchemy.orm import Session

from app.core.errores import Conflicto, DatosInvalidos, NoEncontrado
from app.data.models import Categoria, Lugar
from app.data.repositories.categorias_repo import CategoriasRepositorio
from app.data.repositories.lugares_repo import LugaresRepositorio


class LugaresServicio:
    def __init__(self, sesion: Session):
        self.lugares = LugaresRepositorio(sesion)
        self.categorias = CategoriasRepositorio(sesion)

    # ---- Categorías ----
    def listar_categorias(self) -> list[Categoria]:
        return self.categorias.listar()

    def _categoria_por_codigo(self, codigo: str) -> Categoria:
        categoria = self.categorias.obtener_por_codigo(codigo)
        if categoria is None:
            validas = ", ".join(c.codigo for c in self.categorias.listar())
            raise DatosInvalidos("CATEGORIA_NO_EXISTE", codigo=codigo, validas=validas)
        return categoria

    # ---- Lugares ----
    def listar(self, categoria: str | None, costo_max: int | None, duracion_max: int | None,
               limit: int, offset: int) -> tuple[list[Lugar], int]:
        if categoria:
            self._categoria_por_codigo(categoria)  # 422 si la categoría no existe
        return self.lugares.listar(categoria, costo_max, duracion_max, limit, offset)

    def obtener(self, lugar_id: int) -> Lugar:
        lugar = self.lugares.obtener(lugar_id)
        if lugar is None:
            raise NoEncontrado("LUGAR_NO_ENCONTRADO", id=lugar_id)
        return lugar

    def crear(self, datos: dict) -> Lugar:
        datos = self._preparar(datos)
        if self.lugares.obtener_por_slug(datos["slug"]):
            raise Conflicto("LUGAR_SLUG_DUPLICADO", slug=datos["slug"])
        return self.lugares.crear(datos)

    def actualizar(self, lugar_id: int, datos: dict) -> Lugar:
        lugar = self.obtener(lugar_id)
        datos = self._preparar(datos)
        otro = self.lugares.obtener_por_slug(datos["slug"])
        if otro and otro.id != lugar_id:
            raise Conflicto("LUGAR_SLUG_DUPLICADO", slug=datos["slug"])
        return self.lugares.actualizar(lugar, datos)

    def borrar(self, lugar_id: int) -> None:
        lugar = self.obtener(lugar_id)
        rutas = self.lugares.contar_rutas_que_lo_usan(lugar_id)
        if rutas > 0:
            # Regla: no se borra un lugar que alguien tiene en una ruta guardada
            raise Conflicto("LUGAR_EN_USO", id=lugar_id, rutas=rutas)
        self.lugares.borrar(lugar)

    def _preparar(self, datos: dict) -> dict:
        """Convierte el código de categoría en su id y normaliza el slug."""
        datos = dict(datos)
        categoria = self._categoria_por_codigo(datos.pop("categoria"))
        datos["categoria_id"] = categoria.id
        datos["slug"] = datos["slug"].strip().lower()
        return datos
