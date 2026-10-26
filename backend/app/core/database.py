"""Conexión a PostgreSQL con SQLAlchemy.

- engine: mantiene un grupo (pool) de conexiones abiertas con la base.
- SessionLocal: fábrica de sesiones; una sesión = una conversación con la base.
- obtener_sesion: dependencia de FastAPI que entrega una sesión por petición
  y la cierra al terminar, pase lo que pase.
"""
from collections.abc import Iterator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.core.config import config

engine = create_engine(
    config.database_url,
    pool_pre_ping=True,  # revisa que la conexión siga viva antes de usarla (útil con Supabase)
    pool_size=5,
    max_overflow=5,
)

SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


class Base(DeclarativeBase):
    """Clase base de todos los modelos SQLAlchemy (capa de datos)."""


def obtener_sesion() -> Iterator[Session]:
    sesion = SessionLocal()
    try:
        yield sesion
    except Exception:
        sesion.rollback()
        raise
    finally:
        sesion.close()
