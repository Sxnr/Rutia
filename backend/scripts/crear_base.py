"""Crea la base de datos desde cero con db/schema.sql y carga el catálogo.

Uso (desde la carpeta backend/):
    python -m scripts.crear_base          # pide confirmación
    python -m scripts.crear_base --si     # sin preguntar (CUIDADO: borra todos los datos)
"""
import argparse
import sys
from pathlib import Path

import psycopg

from app.core.config import config

RAIZ_REPO = Path(__file__).resolve().parents[2]
ARCHIVO_SQL = RAIZ_REPO / "db" / "schema.sql"


def ejecutar_schema() -> None:
    # psycopg necesita la URL sin el "+psycopg" que usa SQLAlchemy
    url = config.database_url.replace("postgresql+psycopg://", "postgresql://", 1)
    with psycopg.connect(url) as conexion:
        conexion.execute(ARCHIVO_SQL.read_text(encoding="utf-8"))
    print("✓ Tablas creadas desde db/schema.sql")


def main() -> int:
    parser = argparse.ArgumentParser(description="Crea la base desde cero (borra los datos)")
    parser.add_argument("--si", action="store_true", help="no pedir confirmación")
    parser.add_argument("--sin-catalogo", action="store_true", help="no cargar db/catalogo/lugares.csv")
    args = parser.parse_args()

    if not args.si:
        respuesta = input("Esto BORRA todas las tablas y datos de la base configurada. ¿Continuar? (s/N): ")
        if respuesta.strip().lower() not in ("s", "si", "sí"):
            print("Cancelado.")
            return 1

    ejecutar_schema()
    if args.sin_catalogo:
        return 0

    from scripts import cargar_catalogo

    lugares, errores = cargar_catalogo.leer_y_validar()
    if errores:
        print("✗ El catálogo tiene errores; corrige y ejecuta: python -m scripts.cargar_catalogo")
        for error in errores:
            print("  -", error)
        return 1
    creados, _ = cargar_catalogo.cargar(lugares)
    print(f"✓ Catálogo cargado: {creados} lugares")
    return 0


if __name__ == "__main__":
    sys.exit(main())
