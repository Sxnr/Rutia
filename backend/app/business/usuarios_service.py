"""Servicio de usuarios: registro y login.

TODO(Hito 3): el login todavía no entrega un token. Por ahora el cliente
envía usuario_id en cada petición; en el Hito 3 se reemplaza por un token
firmado (JWT) y el servidor sabrá quién es el usuario sin confiar en el cliente.
"""
from sqlalchemy.orm import Session

from app.business import contrasenas
from app.business.limite_intentos import LimitadorIntentos
from app.core.errores import Conflicto, NoAutorizado, NoEncontrado
from app.data.models import Usuario
from app.data.repositories.usuarios_repo import UsuariosRepositorio

# Hash de una contraseña al azar, para gastar el mismo tiempo cuando el email no existe
_HASH_FALSO = contrasenas.hashear("contrasena-que-nadie-usa")

# Uno solo para todo el servidor: así cuenta los intentos de todas las peticiones
limitador_login = LimitadorIntentos()


class UsuariosServicio:
    def __init__(self, sesion: Session):
        self.usuarios = UsuariosRepositorio(sesion)

    def registrar(self, nombre: str, email: str, contrasena: str, idioma: str) -> Usuario:
        email = email.strip().lower()
        if self.usuarios.obtener_por_email(email):
            raise Conflicto("EMAIL_YA_REGISTRADO", email=email)
        return self.usuarios.crear(nombre.strip(), email, contrasenas.hashear(contrasena), idioma)

    def iniciar_sesion(self, email: str, contrasena: str) -> Usuario:
        email = email.strip().lower()
        # Fuerza bruta: tras 5 contraseñas fallidas en 15 minutos, el correo queda bloqueado (429)
        limitador_login.verificar(email)
        usuario = self.usuarios.obtener_por_email(email)
        # Mismo error (y mismo tiempo de respuesta) si no existe el email o si la
        # contraseña es incorrecta: así no se revela qué emails están registrados.
        hash_guardado = usuario.password_hash if usuario else _HASH_FALSO
        contrasena_ok = contrasenas.verificar(contrasena, hash_guardado)
        if usuario is None or not contrasena_ok:
            limitador_login.registrar_fallo(email)
            raise NoAutorizado("CREDENCIALES_INVALIDAS")
        limitador_login.reiniciar(email)
        return usuario

    def obtener(self, usuario_id: int) -> Usuario:
        usuario = self.usuarios.obtener(usuario_id)
        if usuario is None:
            raise NoEncontrado("USUARIO_NO_ENCONTRADO", id=usuario_id)
        return usuario
