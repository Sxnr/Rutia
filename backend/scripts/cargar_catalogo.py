"""Valida y carga el catálogo de lugares desde db/catalogo/lugares.csv.

Uso (desde la carpeta backend/):
    python -m scripts.cargar_catalogo --validar   # solo revisa el CSV, NO necesita base de datos
    python -m scripts.cargar_catalogo             # revisa y carga en la base (DATABASE_URL de .env)

La carga se puede repetir sin duplicar: si el slug ya existe, el lugar se actualiza.
"""
import argparse
import csv
import sys
from pathlib import Path

from pydantic import ValidationError

from app.core.i18n import mensaje_validacion
from app.presentation.schemas.lugares import LugarEntrada

RAIZ_REPO = Path(__file__).resolve().parents[2]
ARCHIVO_CSV = RAIZ_REPO / "db" / "catalogo" / "lugares.csv"
CARPETA_FOTOS = RAIZ_REPO / "db" / "catalogo" / "fotos"

CATEGORIAS = {"museos", "gastronomia", "historico", "parques", "shopping", "vida_nocturna"}
COLUMNAS = [
    "slug", "categoria", "nombre_es", "nombre_en", "descripcion_es", "descripcion_en",
    "direccion", "comuna", "latitud", "longitud", "costo_clp", "duracion_min",
    "horario_es", "horario_en", "contenido_rotativo", "imagen_archivo", "imagen_autor",
    "imagen_licencia", "imagen_fuente_url", "fuente_verificacion_url", "verificado_en",
]
# Santiago y alrededores: sirve para detectar coordenadas invertidas o con error de tipeo
LATITUD_SANTIAGO = (-34.0, -33.0)
LONGITUD_SANTIAGO = (-71.2, -70.2)


def licencia_permitida(licencia: str) -> bool:
    """Solo licencias libres que permiten uso comercial y modificación."""
    texto = licencia.upper()
    if texto.startswith(("CC0", "DOMINIO PÚBLICO", "PUBLIC DOMAIN")):
        return True
    return texto.startswith("CC BY") and "NC" not in texto and "ND" not in texto


def _normalizar_planilla(datos: dict) -> None:
    """Corrige lo que suelen cambiar las planillas en español al exportar a CSV."""
    rotativo = (datos.get("contenido_rotativo") or "").lower()
    if rotativo in ("verdadero", "si", "sí"):
        datos["contenido_rotativo"] = "true"
    elif rotativo == "falso":
        datos["contenido_rotativo"] = "false"
    for columna in ("latitud", "longitud"):
        if datos.get(columna):
            datos[columna] = datos[columna].replace(",", ".")  # -33,4353 → -33.4353


def leer_y_validar() -> tuple[list[dict], list[str]]:
    """Devuelve (lugares válidos, lista de errores con número de fila)."""
    errores: list[str] = []
    lugares: list[dict] = []
    slugs: set[str] = set()

    # utf-8-sig: acepta también el CSV que exportan Excel y Google Sheets (con marca BOM)
    with open(ARCHIVO_CSV, encoding="utf-8-sig", newline="") as archivo:
        lector = csv.DictReader(archivo)
        faltantes = [c for c in COLUMNAS if c not in (lector.fieldnames or [])]
        if faltantes:
            return [], [f"Faltan columnas en el encabezado: {', '.join(faltantes)}"]

        for numero, fila in enumerate(lector, start=2):  # fila 1 = encabezado
            # Celdas vacías → None (excepto descripciones, que pueden ser texto vacío)
            datos = {c: ((fila.get(c) or "").strip() or None) for c in COLUMNAS}
            if not any(datos.values()):
                continue  # fila completamente vacía (las planillas suelen dejar algunas al final)
            _normalizar_planilla(datos)
            datos["descripcion_es"] = datos["descripcion_es"] or ""
            datos["descripcion_en"] = datos["descripcion_en"] or ""
            prefijo = f"Fila {numero} ({datos['slug'] or 'sin slug'})"

            try:
                lugar = LugarEntrada(**datos).model_dump()
            except ValidationError as e:
                for err in e.errors():
                    campo = ".".join(str(p) for p in err["loc"])
                    texto = mensaje_validacion(err["type"], "es", err.get("ctx"), err["msg"])
                    if campo in ("costo_clp", "duracion_min"):
                        texto += " Escribe solo dígitos, sin $ ni puntos de miles (ej: 4500)."
                    errores.append(f"{prefijo}: columna '{campo}': {texto}")
                continue

            if lugar["slug"] in slugs:
                errores.append(f"{prefijo}: el slug está repetido")
            slugs.add(lugar["slug"])
            if lugar["categoria"] not in CATEGORIAS:
                errores.append(f"{prefijo}: categoría '{lugar['categoria']}' no válida ({', '.join(sorted(CATEGORIAS))})")
            if not (LATITUD_SANTIAGO[0] <= lugar["latitud"] <= LATITUD_SANTIAGO[1]
                    and LONGITUD_SANTIAGO[0] <= lugar["longitud"] <= LONGITUD_SANTIAGO[1]):
                errores.append(f"{prefijo}: las coordenadas no caen en Santiago (¿latitud y longitud invertidas?)")
            if lugar["imagen_archivo"]:
                if not (CARPETA_FOTOS / lugar["imagen_archivo"]).is_file():
                    errores.append(f"{prefijo}: no existe la foto db/catalogo/fotos/{lugar['imagen_archivo']}")
                if not lugar["imagen_autor"] or not lugar["imagen_licencia"] or not lugar["imagen_fuente_url"]:
                    errores.append(f"{prefijo}: la foto necesita autor, licencia y URL de la fuente")
                elif not licencia_permitida(lugar["imagen_licencia"]):
                    errores.append(f"{prefijo}: licencia '{lugar['imagen_licencia']}' no permitida (CC0, dominio público, CC BY, CC BY-SA)")
            lugares.append(lugar)

    return lugares, errores


def cargar(lugares: list[dict]) -> tuple[int, int]:
    # Se importa aquí para que --validar funcione sin base de datos ni .env
    from app.business.lugares_service import LugaresServicio
    from app.core.database import SessionLocal
    from app.data.repositories.lugares_repo import LugaresRepositorio

    creados = actualizados = 0
    with SessionLocal() as sesion:
        servicio = LugaresServicio(sesion)
        repo = LugaresRepositorio(sesion)
        for lugar in lugares:
            existente = repo.obtener_por_slug(lugar["slug"])
            if existente:
                servicio.actualizar(existente.id, lugar)
                actualizados += 1
            else:
                servicio.crear(lugar)
                creados += 1
    return creados, actualizados


def main() -> int:
    parser = argparse.ArgumentParser(description="Valida y carga db/catalogo/lugares.csv")
    parser.add_argument("--validar", action="store_true", help="solo valida, no toca la base de datos")
    args = parser.parse_args()

    lugares, errores = leer_y_validar()
    if errores:
        print(f"✗ El catálogo tiene {len(errores)} error(es):")
        for error in errores:
            print("  -", error)
        return 1

    por_categoria: dict[str, int] = {}
    for lugar in lugares:
        por_categoria[lugar["categoria"]] = por_categoria.get(lugar["categoria"], 0) + 1
    sin_verificar = sum(1 for l in lugares if not l["verificado_en"])
    print(f"✓ {len(lugares)} lugares válidos: " + ", ".join(f"{k} {v}" for k, v in sorted(por_categoria.items())))
    if sin_verificar:
        print(f"  Aviso: {sin_verificar} lugar(es) sin fecha en verificado_en.")

    if args.validar:
        return 0

    creados, actualizados = cargar(lugares)
    print(f"✓ Carga lista: {creados} creados, {actualizados} actualizados.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
