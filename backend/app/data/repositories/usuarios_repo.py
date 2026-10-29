"""Repositorio de usuarios."""
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.data.models import Usuario


class UsuariosRepositorio:
    def __init__(self, sesion: Session):
        self.sesion = sesion

    def obtener(self, usuario_id: int) -> Usuario | None:
        return self.sesion.get(Usuario, usuario_id)

    def obtener_por_email(self, email: str) -> Usuario | None:
        return self.sesion.scalar(select(Usuario).where(Usuario.email == email))

    def crear(self, nombre: str, email: str, password_hash: str, idioma: str) -> Usuario:
        usuario = Usuario(nombre=nombre, email=email, password_hash=password_hash, idioma=idioma)
        self.sesion.add(usuario)
        self.sesion.commit()
        self.sesion.refresh(usuario)
        return usuario

    def actualizar(self, usuario: Usuario, datos: dict) -> Usuario:
        for campo, valor in datos.items():
            setattr(usuario, campo, valor)
        self.sesion.commit()
        self.sesion.refresh(usuario)
        return usuario

    def borrar(self, usuario: Usuario) -> None:
        """Borra el usuario; la base borra en cascada sus rutas, paradas y visitas (ON DELETE CASCADE)."""
        self.sesion.delete(usuario)
        self.sesion.commit()
