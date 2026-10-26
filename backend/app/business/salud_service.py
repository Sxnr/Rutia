"""Servicio de salud: indica si el backend y la base de datos responden."""
from sqlalchemy.orm import Session

from app.data.repositories.salud_repo import base_responde


class SaludServicio:
    def __init__(self, sesion: Session):
        self.sesion = sesion

    def base_de_datos_ok(self) -> bool:
        return base_responde(self.sesion)
