"""Configuración del backend leída desde variables de entorno.

Los valores reales viven en backend/.env (ignorado por git).
backend/.env.example muestra qué variables hacen falta, sin valores reales.
"""
import os
from dataclasses import dataclass
from pathlib import Path

from dotenv import load_dotenv

# Rutas base: backend/ y la raíz del repositorio
RAIZ_BACKEND = Path(__file__).resolve().parents[2]
RAIZ_REPO = RAIZ_BACKEND.parent

# Carga backend/.env si existe. Las variables ya definidas en el sistema tienen prioridad.
load_dotenv(RAIZ_BACKEND / ".env")


@dataclass(frozen=True)
class Configuracion:
    database_url: str
    public_base_url: str
    cors_origins: list[str]
    log_level: str
    carpeta_fotos: Path


def _normalizar_url_base(url: str) -> str:
    """SQLAlchemy necesita saber qué driver usar: postgresql+psycopg://

    Supabase entrega la cadena como postgresql://..., así que la convertimos.
    """
    if url.startswith("postgres://"):
        url = "postgresql://" + url[len("postgres://"):]
    if url.startswith("postgresql://"):
        url = "postgresql+psycopg://" + url[len("postgresql://"):]
    return url


def cargar_configuracion() -> Configuracion:
    database_url = os.getenv("DATABASE_URL", "").strip()
    if not database_url:
        raise RuntimeError(
            "Falta DATABASE_URL. Copia backend/.env.example a backend/.env y completa la conexión."
        )
    origenes = os.getenv("CORS_ORIGINS", "http://localhost:8081,http://localhost:5173")
    return Configuracion(
        database_url=_normalizar_url_base(database_url),
        public_base_url=os.getenv("PUBLIC_BASE_URL", "http://localhost:8000").rstrip("/"),
        cors_origins=[o.strip() for o in origenes.split(",") if o.strip()],
        log_level=os.getenv("LOG_LEVEL", "INFO").upper(),
        carpeta_fotos=RAIZ_REPO / "db" / "catalogo" / "fotos",
    )


config = cargar_configuracion()
