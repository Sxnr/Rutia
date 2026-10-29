"""Rutas HTTP de usuarios: registro, login y perfil.

TODO(Hito 3): el login devolverá un token; hoy devuelve los datos públicos del usuario.
"""
from typing import Annotated

from fastapi import APIRouter, Depends, Path, Response, status

from app.business.usuarios_service import UsuariosServicio
from app.presentation import conversores
from app.presentation.dependencias import servicio_usuarios
from app.presentation.schemas.comunes import respuestas_error
from app.presentation.schemas.usuarios import LoginEntrada, UsuarioEntrada, UsuarioSalida

router = APIRouter(tags=["Usuarios"])
Servicio = Annotated[UsuariosServicio, Depends(servicio_usuarios)]


@router.post("/usuarios", response_model=UsuarioSalida, status_code=status.HTTP_201_CREATED,
             summary="Registrar un usuario", responses=respuestas_error(400, 409))
def registrar(datos: UsuarioEntrada, servicio: Servicio, response: Response):
    usuario = servicio.registrar(datos.nombre, datos.email, datos.password, datos.idioma)
    response.headers["Location"] = f"/api/v1/usuarios/{usuario.id}"
    return conversores.usuario(usuario)


@router.post("/usuarios/login", response_model=UsuarioSalida, summary="Iniciar sesión",
             responses=respuestas_error(400, 401))
def iniciar_sesion(datos: LoginEntrada, servicio: Servicio):
    return conversores.usuario(servicio.iniciar_sesion(datos.email, datos.password))


@router.get("/usuarios/{usuario_id}", response_model=UsuarioSalida, summary="Obtener un usuario",
            responses=respuestas_error(400, 404))
def obtener(usuario_id: Annotated[int, Path(gt=0)], servicio: Servicio):
    return conversores.usuario(servicio.obtener(usuario_id))
