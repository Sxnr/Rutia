"""Configuración común de pytest.

Las pruebas de la API (test_api*.py) usan una base SEPARADA, indicada en
TEST_DATABASE_URL (en el sistema o en el .env de la raíz), porque la recrean
desde cero en cada ejecución. NUNCA la apuntes a la base de la demo.
"""
import os
import uuid
from pathlib import Path

import pytest
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parents[2] / ".env")

URL_PRUEBAS = os.getenv("TEST_DATABASE_URL")
if URL_PRUEBAS:
    if URL_PRUEBAS == os.getenv("DATABASE_URL"):
        raise RuntimeError("TEST_DATABASE_URL no puede ser la misma base que DATABASE_URL: las pruebas la borran.")
    # Se define antes de importar la app, para que se conecte a la base de pruebas
    os.environ["DATABASE_URL"] = URL_PRUEBAS
else:
    # Las pruebas del generador no usan base; basta con un valor para importar la configuración
    os.environ.setdefault("DATABASE_URL", "postgresql://sin-base/solo-pruebas")


@pytest.fixture(scope="session")
def cliente():
    """Cliente HTTP de pruebas sobre la base de TEST_DATABASE_URL, recreada desde cero."""
    from fastapi.testclient import TestClient

    from app.main import app
    from scripts import cargar_catalogo, crear_base

    crear_base.ejecutar_schema()
    lugares, errores = cargar_catalogo.leer_y_validar()
    assert not errores, errores
    cargar_catalogo.cargar(lugares)
    with TestClient(app) as c:
        yield c


@pytest.fixture()
def nuevo_usuario(cliente):
    """Fábrica: cada llamada registra un usuario con un correo distinto."""

    def crear(password="clave-segura-123", idioma="es"):
        email = f"prueba-{uuid.uuid4().hex[:10]}@ejemplo.com"
        r = cliente.post("/api/v1/usuarios", json={
            "nombre": "Daniel Prueba", "email": email, "password": password, "idioma": idioma,
        })
        assert r.status_code == 201, r.text
        return r.json()

    return crear
