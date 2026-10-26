"""Rutas HTTP de lugares y categorías.

Cada función: recibe la petición ya validada por Pydantic, llama a UN método
del servicio y convierte el resultado en respuesta. No hay SQL ni reglas aquí.
"""
from typing import Annotated

from fastapi import APIRouter, Depends, Path, Query, Response, status

from app.business.lugares_service import LugaresServicio
from app.presentation import conversores
from app.presentation.dependencias import Idioma, servicio_lugares
from app.presentation.schemas.comunes import respuestas_error
from app.presentation.schemas.lugares import CategoriaSalida, LugarEntrada, LugarSalida, PaginaLugares

router = APIRouter(tags=["Lugares"])
Servicio = Annotated[LugaresServicio, Depends(servicio_lugares)]
IdLugar = Annotated[int, Path(gt=0, description="Id del lugar")]


@router.get("/categorias", response_model=list[CategoriaSalida], summary="Listar categorías")
def listar_categorias(servicio: Servicio, idioma: Idioma):
    return [conversores.categoria(c, idioma) for c in servicio.listar_categorias()]


@router.get("/lugares", response_model=PaginaLugares, summary="Listar lugares (con filtros)",
            responses=respuestas_error(422))
def listar_lugares(
    servicio: Servicio,
    idioma: Idioma,
    categoria: Annotated[str | None, Query(description="Código de categoría, ej: museos")] = None,
    costo_max: Annotated[int | None, Query(ge=0, description="Costo máximo en CLP")] = None,
    duracion_max: Annotated[int | None, Query(gt=0, description="Duración máxima en minutos")] = None,
    limit: Annotated[int, Query(ge=1, le=100)] = 50,
    offset: Annotated[int, Query(ge=0)] = 0,
):
    lugares, total = servicio.listar(categoria, costo_max, duracion_max, limit, offset)
    return PaginaLugares(
        datos=[conversores.lugar(l, idioma) for l in lugares], total=total, limit=limit, offset=offset
    )


@router.get("/lugares/{lugar_id}", response_model=LugarSalida, summary="Obtener un lugar",
            responses=respuestas_error(404))
def obtener_lugar(lugar_id: IdLugar, servicio: Servicio, idioma: Idioma):
    return conversores.lugar(servicio.obtener(lugar_id), idioma)


@router.post("/lugares", response_model=LugarSalida, status_code=status.HTTP_201_CREATED,
             summary="Crear un lugar", responses=respuestas_error(409, 422))
def crear_lugar(datos: LugarEntrada, servicio: Servicio, idioma: Idioma, response: Response):
    lugar = servicio.crear(datos.model_dump())
    response.headers["Location"] = f"/api/v1/lugares/{lugar.id}"
    return conversores.lugar(lugar, idioma)


@router.put("/lugares/{lugar_id}", response_model=LugarSalida,
            summary="Reemplazar un lugar completo", responses=respuestas_error(404, 409, 422))
def actualizar_lugar(lugar_id: IdLugar, datos: LugarEntrada, servicio: Servicio, idioma: Idioma):
    return conversores.lugar(servicio.actualizar(lugar_id, datos.model_dump()), idioma)


@router.delete("/lugares/{lugar_id}", status_code=status.HTTP_204_NO_CONTENT,
               summary="Borrar un lugar", responses=respuestas_error(404, 409))
def borrar_lugar(lugar_id: IdLugar, servicio: Servicio):
    servicio.borrar(lugar_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
