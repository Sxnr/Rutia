"""Rutas HTTP de usuarios: registro, login, perfil y derechos sobre los datos (Ley 21.719).

TODO(Hito 3): el login devolverá un token; hoy devuelve los datos públicos del usuario.
"""
from datetime import datetime, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, Path, Response, status

from app.business.usuarios_service import UsuariosServicio
from app.presentation import conversores
from app.presentation.dependencias import Idioma, servicio_usuarios
from app.presentation.schemas.comunes import respuestas_error
from app.presentation.schemas.datos_personales import DatosPersonalesSalida
from app.presentation.schemas.usuarios import (
    EliminarCuentaEntrada,
    LoginEntrada,
    UsuarioActualizar,
    UsuarioEntrada,
    UsuarioSalida,
)

router = APIRouter(tags=["Usuarios"])
Servicio = Annotated[UsuariosServicio, Depends(servicio_usuarios)]
IdUsuario = Annotated[int, Path(gt=0)]


@router.post("/usuarios", response_model=UsuarioSalida, status_code=status.HTTP_201_CREATED,
             summary="Registrar un usuario", responses=respuestas_error(400, 409))
def registrar(datos: UsuarioEntrada, servicio: Servicio, response: Response):
    usuario = servicio.registrar(datos.nombre, datos.email, datos.password, datos.idioma)
    response.headers["Location"] = f"/api/v1/usuarios/{usuario.id}"
    return conversores.usuario(usuario)


@router.post("/usuarios/login", response_model=UsuarioSalida, summary="Iniciar sesión",
             responses=respuestas_error(400, 401, 429))
def iniciar_sesion(datos: LoginEntrada, servicio: Servicio):
    return conversores.usuario(servicio.iniciar_sesion(datos.email, datos.password))


@router.get("/usuarios/{usuario_id}", response_model=UsuarioSalida,
            summary="Obtener un usuario (derecho de acceso)", responses=respuestas_error(400, 404))
def obtener(usuario_id: IdUsuario, servicio: Servicio):
    return conversores.usuario(servicio.obtener(usuario_id))


@router.put("/usuarios/{usuario_id}", response_model=UsuarioSalida,
            summary="Corregir nombre, correo o idioma (derecho de rectificación)",
            responses=respuestas_error(400, 404, 409))
def actualizar(usuario_id: IdUsuario, datos: UsuarioActualizar, servicio: Servicio):
    return conversores.usuario(servicio.actualizar(usuario_id, datos.nombre, datos.email, datos.idioma))


@router.delete("/usuarios/{usuario_id}", status_code=status.HTTP_204_NO_CONTENT,
               summary="Eliminar la cuenta con sus rutas y visitas (derecho de supresión)",
               responses=respuestas_error(400, 401, 404, 429))
def eliminar(usuario_id: IdUsuario, datos: EliminarCuentaEntrada, servicio: Servicio):
    servicio.eliminar(usuario_id, datos.password)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/usuarios/{usuario_id}/datos", response_model=DatosPersonalesSalida,
            summary="Descargar todos mis datos en JSON (derecho de portabilidad)",
            responses=respuestas_error(400, 404))
def exportar(usuario_id: IdUsuario, servicio: Servicio, idioma: Idioma, response: Response):
    usuario, rutas, visitas = servicio.exportar(usuario_id)
    # El navegador o el celular lo ofrecen como archivo descargable
    response.headers["Content-Disposition"] = 'attachment; filename="rutia-mis-datos.json"'
    return conversores.datos_personales(usuario, rutas, visitas, idioma, datetime.now(timezone.utc))
