"""Rutas HTTP de visitas: marcar, listar y desmarcar lugares visitados."""
from typing import Annotated

from fastapi import APIRouter, Depends, Path, Response, status

from app.business.visitas_service import VisitasServicio
from app.presentation import conversores
from app.presentation.dependencias import Idioma, servicio_visitas
from app.presentation.schemas.comunes import respuestas_error
from app.presentation.schemas.visitas import VisitaEntrada, VisitaSalida

router = APIRouter(tags=["Visitas"])
Servicio = Annotated[VisitasServicio, Depends(servicio_visitas)]
IdUsuario = Annotated[int, Path(gt=0)]


@router.post("/usuarios/{usuario_id}/visitas", response_model=VisitaSalida,
             status_code=status.HTTP_201_CREATED, summary="Marcar un lugar como visitado",
             responses=respuestas_error(404, 422))
def registrar_visita(usuario_id: IdUsuario, datos: VisitaEntrada, servicio: Servicio,
                     idioma: Idioma, response: Response):
    visita = servicio.registrar(usuario_id, datos.lugar_id, datos.ruta_id)
    response.headers["Location"] = f"/api/v1/usuarios/{usuario_id}/visitas"
    return conversores.visita(visita, idioma)


@router.get("/usuarios/{usuario_id}/visitas", response_model=list[VisitaSalida],
            summary="Listar visitas de un usuario (más recientes primero)", responses=respuestas_error(404))
def listar_visitas(usuario_id: IdUsuario, servicio: Servicio, idioma: Idioma):
    return [conversores.visita(v, idioma) for v in servicio.listar_de_usuario(usuario_id)]


@router.delete("/visitas/{visita_id}", status_code=status.HTTP_204_NO_CONTENT,
               summary="Borrar una visita", responses=respuestas_error(404))
def borrar_visita(visita_id: Annotated[int, Path(gt=0)], servicio: Servicio):
    servicio.borrar(visita_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
