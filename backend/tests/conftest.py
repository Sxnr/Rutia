"""Configuración común de pytest.

Las pruebas de la API (test_api.py) usan una base SEPARADA, indicada en
TEST_DATABASE_URL (en el sistema o en el .env de la raíz), porque la recrean
desde cero en cada ejecución. NUNCA la apuntes a la base de la demo.
"""
import os
from pathlib import Path

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
