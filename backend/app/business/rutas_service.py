"""Servicio de rutas: generar una ruta sugerida y administrar las rutas guardadas."""
import math
from dataclasses import dataclass

from sqlalchemy.orm import Session

from app.business import generador_rutas
from app.business.generador_rutas import ResultadoRuta
from app.core.errores import DatosInvalidos, NoEncontrado
from app.data.models import Ruta
from app.data.repositories.categorias_repo import CategoriasRepositorio
from app.data.repositories.lugares_repo import LugaresRepositorio
from app.data.repositories.rutas_repo import RutasRepositorio
from app.data.repositories.usuarios_repo import UsuariosRepositorio
from app.data.repositories.visitas_repo import VisitasRepositorio


@dataclass
class RutaGenerada:
    resultado: ResultadoRuta
    tiempo_disponible_min: int
    presupuesto_clp: int
    mensaje_codigo: str | None = None  # código de i18n cuando no hay paradas


class RutasServicio:
    def __init__(self, sesion: Session):
        self.rutas = RutasRepositorio(sesion)
        self.lugares = LugaresRepositorio(sesion)
        self.categorias = CategoriasRepositorio(sesion)
        self.usuarios = UsuariosRepositorio(sesion)
        self.visitas = VisitasRepositorio(sesion)

    # ------------------------------------------------------------------
    # Generar ruta sugerida (no se guarda)
    # ------------------------------------------------------------------
    def generar(self, tiempo_horas: float, presupuesto_clp: int, intereses: list[str],
                usuario_id: int | None, incluir_visitados: bool) -> RutaGenerada:
        minutos_disponibles = math.floor(tiempo_horas * 60)
        categorias = self._categorias_validas(intereses)
        if usuario_id is not None:
            self._usuario_existente(usuario_id)

        # 1. La capa de datos entrega los lugares que, por sí solos, caben
        candidatos = self.lugares.buscar_candidatos(
            [c.id for c in categorias], presupuesto_clp, minutos_disponibles
        )

        # 2. Regla de revisitas: se descartan los ya visitados, salvo los de contenido rotativo
        if usuario_id is not None and not incluir_visitados:
            visitados = self.visitas.ids_lugares_visitados(usuario_id)
            candidatos = [l for l in candidatos if l.id not in visitados or l.contenido_rotativo]

        # 3. El generador elige y ordena las paradas
        resultado = generador_rutas.generar_ruta(candidatos, minutos_disponibles, presupuesto_clp)
        mensaje = "SIN_LUGARES_COMPATIBLES" if not resultado.paradas else None
        return RutaGenerada(resultado, minutos_disponibles, presupuesto_clp, mensaje)

    # ------------------------------------------------------------------
    # Rutas guardadas
    # ------------------------------------------------------------------
    def obtener(self, ruta_id: int) -> Ruta:
        ruta = self.rutas.obtener(ruta_id)
        if ruta is None:
            raise NoEncontrado("RUTA_NO_ENCONTRADA", id=ruta_id)
        return ruta

    def listar_de_usuario(self, usuario_id: int) -> list[Ruta]:
        self._usuario_existente(usuario_id)
        return self.rutas.listar_de_usuario(usuario_id)

    def crear(self, usuario_id: int, nombre: str, lugar_ids: list[int],
              tiempo_horas: float | None, presupuesto_clp: int | None) -> Ruta:
        self._usuario_existente(usuario_id)
        datos, paradas = self._armar(nombre, lugar_ids, tiempo_horas, presupuesto_clp)
        datos["usuario_id"] = usuario_id
        return self.rutas.crear(datos, paradas)

    def actualizar(self, ruta_id: int, nombre: str, lugar_ids: list[int],
                   tiempo_horas: float | None, presupuesto_clp: int | None) -> Ruta:
        ruta = self.obtener(ruta_id)
        datos, paradas = self._armar(nombre, lugar_ids, tiempo_horas, presupuesto_clp)
        return self.rutas.reemplazar(ruta, datos, paradas)

    def borrar(self, ruta_id: int) -> None:
        self.rutas.borrar(self.obtener(ruta_id))

    # ------------------------------------------------------------------
    # Ayudantes internos
    # ------------------------------------------------------------------
    def _armar(self, nombre: str, lugar_ids: list[int], tiempo_horas: float | None,
               presupuesto_clp: int | None) -> tuple[dict, list[dict]]:
        """Valida los lugares y recalcula traslados y totales en el servidor."""
        repetidos = sorted({i for i in lugar_ids if lugar_ids.count(i) > 1})
        if repetidos:
            raise DatosInvalidos("LUGARES_REPETIDOS", ids=", ".join(map(str, repetidos)))

        encontrados = self.lugares.obtener_varios(lugar_ids)
        for lugar_id in lugar_ids:
            if lugar_id not in encontrados:
                raise DatosInvalidos("LUGAR_NO_ENCONTRADO", id=lugar_id)

        itinerario = generador_rutas.calcular_itinerario([encontrados[i] for i in lugar_ids])
        datos = {
            "nombre": nombre.strip(),
            "tiempo_disponible_min": math.floor(tiempo_horas * 60) if tiempo_horas else None,
            "presupuesto_clp": presupuesto_clp,
            "duracion_total_min": itinerario.duracion_total_min,
            "costo_total_clp": itinerario.costo_total_clp,
        }
        paradas = [
            {"orden": p.orden, "lugar_id": p.lugar.id, "traslado_min": p.traslado_min}
            for p in itinerario.paradas
        ]
        return datos, paradas

    def _categorias_validas(self, codigos: list[str]):
        codigos = list(dict.fromkeys(codigos))  # quita repetidos manteniendo el orden
        categorias = self.categorias.obtener_por_codigos(codigos)
        encontrados = {c.codigo for c in categorias}
        for codigo in codigos:
            if codigo not in encontrados:
                validas = ", ".join(c.codigo for c in self.categorias.listar())
                raise DatosInvalidos("CATEGORIA_NO_EXISTE", codigo=codigo, validas=validas)
        return categorias

    def _usuario_existente(self, usuario_id: int) -> None:
        if self.usuarios.obtener(usuario_id) is None:
            raise NoEncontrado("USUARIO_NO_ENCONTRADO", id=usuario_id)
