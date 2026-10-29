"""Convierte modelos de la base en respuestas JSON, en el idioma pedido.

Es trabajo de presentación: elegir nombre_es o nombre_en y armar la URL
pública de la foto no son reglas de negocio, son formato de respuesta.
"""
from datetime import datetime

from app.business.generador_rutas import ResultadoRuta
from app.business.rutas_service import RutaCalculada
from app.core.config import config
from app.core.i18n import mensaje
from app.data.models import Categoria, Lugar, Ruta, Usuario, Visita
from app.presentation.schemas.datos_personales import DatosPersonalesSalida
from app.presentation.schemas.lugares import CategoriaSalida, ImagenSalida, LugarSalida
from app.presentation.schemas.rutas import (
    ParadaSalida,
    RutaGeneradaSalida,
    RutaRecalculadaSalida,
    RutaResumen,
    RutaSalida,
)
from app.presentation.schemas.usuarios import UsuarioSalida
from app.presentation.schemas.visitas import VisitaSalida


def _segun_idioma(objeto, campo: str, idioma: str):
    """Devuelve objeto.campo_en o objeto.campo_es; si falta el inglés, usa el español."""
    valor = getattr(objeto, f"{campo}_{idioma}", None)
    return valor if valor else getattr(objeto, f"{campo}_es")


def categoria(c: Categoria, idioma: str) -> CategoriaSalida:
    return CategoriaSalida(codigo=c.codigo, nombre=_segun_idioma(c, "nombre", idioma))


def lugar(l: Lugar, idioma: str) -> LugarSalida:
    imagen = None
    if l.imagen_archivo:
        imagen = ImagenSalida(
            url=f"{config.public_base_url}/fotos/{l.imagen_archivo}",
            autor=l.imagen_autor,
            licencia=l.imagen_licencia,
            fuente_url=l.imagen_fuente_url,
        )
    return LugarSalida(
        id=l.id,
        slug=l.slug,
        categoria=categoria(l.categoria, idioma),
        nombre=_segun_idioma(l, "nombre", idioma),
        descripcion=_segun_idioma(l, "descripcion", idioma) or "",
        direccion=l.direccion,
        comuna=l.comuna,
        latitud=l.latitud,
        longitud=l.longitud,
        costo_clp=l.costo_clp,
        duracion_min=l.duracion_min,
        horario=_segun_idioma(l, "horario", idioma),
        contenido_rotativo=l.contenido_rotativo,
        imagen=imagen,
        verificado_en=l.verificado_en,
    )


def _paradas(resultado: ResultadoRuta, idioma: str) -> list[ParadaSalida]:
    return [
        ParadaSalida(orden=p.orden, traslado_min=p.traslado_min, lugar=lugar(p.lugar, idioma))
        for p in resultado.paradas
    ]


def _mensaje(r: RutaCalculada, idioma: str) -> str | None:
    return mensaje(r.mensaje_codigo, idioma, **r.mensaje_datos) if r.mensaje_codigo else None


def ruta_generada(r: RutaCalculada, idioma: str) -> RutaGeneradaSalida:
    return RutaGeneradaSalida(
        tiempo_disponible_min=r.tiempo_disponible_min,
        presupuesto_clp=r.presupuesto_clp,
        cantidad_objetivo=r.cantidad_objetivo,
        duracion_total_min=r.resultado.duracion_total_min,
        costo_total_clp=r.resultado.costo_total_clp,
        paradas=_paradas(r.resultado, idioma),
        mensaje=_mensaje(r, idioma),
    )


def ruta_recalculada(r: RutaCalculada, idioma: str) -> RutaRecalculadaSalida:
    return RutaRecalculadaSalida(
        tiempo_disponible_min=r.tiempo_disponible_min,
        presupuesto_clp=r.presupuesto_clp,
        duracion_total_min=r.resultado.duracion_total_min,
        costo_total_clp=r.resultado.costo_total_clp,
        excede_tiempo=r.excede_tiempo,
        excede_presupuesto=r.excede_presupuesto,
        paradas=_paradas(r.resultado, idioma),
        mensaje=_mensaje(r, idioma),
    )


def ruta(r: Ruta, idioma: str) -> RutaSalida:
    return RutaSalida(
        id=r.id,
        usuario_id=r.usuario_id,
        nombre=r.nombre,
        tiempo_disponible_min=r.tiempo_disponible_min,
        presupuesto_clp=r.presupuesto_clp,
        duracion_total_min=r.duracion_total_min,
        costo_total_clp=r.costo_total_clp,
        creada_en=r.creada_en,
        actualizada_en=r.actualizada_en,
        paradas=[
            ParadaSalida(orden=p.orden, traslado_min=p.traslado_min, lugar=lugar(p.lugar, idioma))
            for p in r.paradas
        ],
    )


def ruta_resumen(r: Ruta) -> RutaResumen:
    return RutaResumen(
        id=r.id,
        usuario_id=r.usuario_id,
        nombre=r.nombre,
        duracion_total_min=r.duracion_total_min,
        costo_total_clp=r.costo_total_clp,
        cantidad_paradas=len(r.paradas),
        creada_en=r.creada_en,
    )


def usuario(u: Usuario) -> UsuarioSalida:
    return UsuarioSalida(id=u.id, nombre=u.nombre, email=u.email, idioma=u.idioma, creado_en=u.creado_en)


def visita(v: Visita, idioma: str) -> VisitaSalida:
    return VisitaSalida(
        id=v.id, usuario_id=v.usuario_id, ruta_id=v.ruta_id,
        visitado_en=v.visitado_en, lugar=lugar(v.lugar, idioma),
    )


def datos_personales(u: Usuario, rutas: list[Ruta], visitas: list[Visita], idioma: str,
                     exportado_en: datetime) -> DatosPersonalesSalida:
    return DatosPersonalesSalida(
        exportado_en=exportado_en,
        usuario=usuario(u),
        rutas=[ruta(r, idioma) for r in rutas],
        visitas=[visita(v, idioma) for v in visitas],
    )
