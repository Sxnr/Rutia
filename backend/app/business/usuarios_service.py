"""Servicio de usuarios: registro, login y derechos sobre los datos personales (Ley 21.719).

Derechos implementados: acceso (GET /usuarios/{id}), rectificación (PUT),
supresión (DELETE, con contraseña) y portabilidad (GET /usuarios/{id}/datos).

TODO(Hito 3): el login todavía no entrega un token. Por ahora el cliente
envía usuario_id en cada petición; en el Hito 3 se reemplaza por un token
firmado (JWT) y el servidor sabrá quién es el usuario sin confiar en el cliente.
"""
from sqlalchemy.orm import Session

from app.business import contrasenas
from app.business.limite_intentos import LimitadorIntentos
from app.core.errores import Conflicto, NoAutorizado, NoEncontrado
from app.data.models import Ruta, Usuario, Visita
from app.data.repositories.rutas_repo import RutasRepositorio
from app.data.repositories.usuarios_repo import UsuariosRepositorio
from app.data.repositories.visitas_repo import VisitasRepositorio

# Hash de una contraseña al azar, para gastar el mismo tiempo cuando el email no existe
_HASH_FALSO = contrasenas.hashear("contrasena-que-nadie-usa")

# Uno solo para todo el servidor: así cuenta los intentos de todas las peticiones
limitador_login = LimitadorIntentos()


class UsuariosServicio:
    def __init__(self, sesion: Session):
        self.usuarios = UsuariosRepositorio(sesion)
        self.rutas = RutasRepositorio(sesion)
        self.visitas = VisitasRepositorio(sesion)

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

    def actualizar(self, usuario_id: int, nombre: str, email: str, idioma: str) -> Usuario:
        """Rectificación: el usuario corrige su nombre, correo o idioma."""
        usuario = self.obtener(usuario_id)
        email = email.strip().lower()
        otro = self.usuarios.obtener_por_email(email)
        if otro and otro.id != usuario_id:
            raise Conflicto("EMAIL_YA_REGISTRADO", email=email)
        return self.usuarios.actualizar(usuario, {"nombre": nombre.strip(), "email": email, "idioma": idioma})

    def eliminar(self, usuario_id: int, contrasena: str) -> None:
        """Supresión: borra la cuenta y, en cascada, sus rutas y visitas. Pide la contraseña."""
        usuario = self.obtener(usuario_id)
        limitador_login.verificar(usuario.email)  # la contraseña tampoco se puede adivinar por aquí
        if not contrasenas.verificar(contrasena, usuario.password_hash):
            limitador_login.registrar_fallo(usuario.email)
            raise NoAutorizado("CONTRASENA_INCORRECTA")
        limitador_login.reiniciar(usuario.email)
        self.usuarios.borrar(usuario)

    def exportar(self, usuario_id: int) -> tuple[Usuario, list[Ruta], list[Visita]]:
        """Portabilidad: todos los datos del usuario, para entregarlos en un archivo JSON."""
        usuario = self.obtener(usuario_id)
        return usuario, self.rutas.listar_de_usuario(usuario_id), self.visitas.listar_de_usuario(usuario_id)
