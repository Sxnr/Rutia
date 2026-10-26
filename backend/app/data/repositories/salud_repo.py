"""Consulta mínima para saber si la base de datos responde."""
import logging

from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

log = logging.getLogger(__name__)


def base_responde(sesion: Session) -> bool:
    try:
        sesion.execute(text("SELECT 1"))
        return True
    except SQLAlchemyError:
        log.exception("La base de datos no responde")
        return False
