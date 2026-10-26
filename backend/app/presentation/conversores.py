"""Convierte modelos de la base en respuestas JSON, en el idioma pedido.

Es trabajo de presentación: elegir nombre_es o nombre_en y armar la URL
pública de la foto no son reglas de negocio, son formato de respuesta.
"""
from app.business.generador_rutas import ResultadoRuta
from app.business.rutas_service import RutaGenerada
from app.core.config import config
from app.core.i18n import mensaje
from app.data.models import Categoria, Lugar, Ruta, Usuario, Visita
from app.presentation.schemas.lugares import CategoriaSalida, ImagenSalida, LugarSalida
from app.presentation.schemas.rutas import ParadaSalida, RutaGeneradaSalida, RutaResumen, RutaSalida
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


def ruta_generada(r: RutaGenerada, idioma: str) -> RutaGeneradaSalida:
    resultado: ResultadoRuta = r.resultado
    return RutaGeneradaSalida(
        tiempo_disponible_min=r.tiempo_disponible_min,
        presupuesto_clp=r.presupuesto_clp,
        duracion_total_min=resultado.duracion_total_min,
        costo_total_clp=resultado.costo_total_clp,
        paradas=[
            ParadaSalida(orden=p.orden, traslado_min=p.traslado_min, lugar=lugar(p.lugar, idioma))
            for p in resultado.paradas
        ],
        mensaje=mensaje(r.mensaje_codigo, idioma) if r.mensaje_codigo else None,
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
