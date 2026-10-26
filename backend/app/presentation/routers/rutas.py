"""Rutas HTTP de rutas turísticas: generar una sugerencia y CRUD de rutas guardadas."""
from typing import Annotated

from fastapi import APIRouter, Depends, Path, Response, status

from app.business.rutas_service import RutasServicio
from app.presentation import conversores
from app.presentation.dependencias import Idioma, servicio_rutas
from app.presentation.schemas.comunes import respuestas_error
from app.presentation.schemas.rutas import (
    GenerarRutaEntrada,
    RutaActualizar,
    RutaEntrada,
    RutaGeneradaSalida,
    RutaResumen,
    RutaSalida,
)

router = APIRouter(tags=["Rutas"])
Servicio = Annotated[RutasServicio, Depends(servicio_rutas)]
IdRuta = Annotated[int, Path(gt=0, description="Id de la ruta")]


@router.post("/rutas/generar", response_model=RutaGeneradaSalida,
             summary="Generar una ruta sugerida (no la guarda)", responses=respuestas_error(404, 422))
def generar_ruta(datos: GenerarRutaEntrada, servicio: Servicio, idioma: Idioma):
    generada = servicio.generar(
        datos.tiempo_horas, datos.presupuesto_clp, datos.intereses,
        datos.usuario_id, datos.incluir_visitados,
    )
    return conversores.ruta_generada(generada, idioma)


@router.post("/rutas", response_model=RutaSalida, status_code=status.HTTP_201_CREATED,
             summary="Guardar una ruta", responses=respuestas_error(404, 422))
def crear_ruta(datos: RutaEntrada, servicio: Servicio, idioma: Idioma, response: Response):
    ruta = servicio.crear(datos.usuario_id, datos.nombre, datos.lugares, datos.tiempo_horas, datos.presupuesto_clp)
    response.headers["Location"] = f"/api/v1/rutas/{ruta.id}"
    return conversores.ruta(ruta, idioma)


@router.get("/usuarios/{usuario_id}/rutas", response_model=list[RutaResumen],
            summary="Listar las rutas guardadas de un usuario", responses=respuestas_error(404))
def listar_rutas_de_usuario(usuario_id: Annotated[int, Path(gt=0)], servicio: Servicio):
    return [conversores.ruta_resumen(r) for r in servicio.listar_de_usuario(usuario_id)]


@router.get("/rutas/{ruta_id}", response_model=RutaSalida, summary="Obtener una ruta guardada",
            responses=respuestas_error(404))
def obtener_ruta(ruta_id: IdRuta, servicio: Servicio, idioma: Idioma):
    return conversores.ruta(servicio.obtener(ruta_id), idioma)


@router.put("/rutas/{ruta_id}", response_model=RutaSalida,
            summary="Renombrar, reordenar o quitar paradas", responses=respuestas_error(404, 422))
def actualizar_ruta(ruta_id: IdRuta, datos: RutaActualizar, servicio: Servicio, idioma: Idioma):
    ruta = servicio.actualizar(ruta_id, datos.nombre, datos.lugares, datos.tiempo_horas, datos.presupuesto_clp)
    return conversores.ruta(ruta, idioma)


@router.delete("/rutas/{ruta_id}", status_code=status.HTTP_204_NO_CONTENT,
               summary="Borrar una ruta guardada", responses=respuestas_error(404))
def borrar_ruta(ruta_id: IdRuta, servicio: Servicio):
    servicio.borrar(ruta_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
