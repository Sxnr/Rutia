"""Pruebas de la API completa contra una base PostgreSQL real.

Requieren TEST_DATABASE_URL (una base que se puede borrar). Ejemplo con PostgreSQL local:
    TEST_DATABASE_URL=postgresql://usuario:clave@localhost:5432/rutia_pruebas pytest
Sin esa variable, estas pruebas se saltan.
"""
import os

import pytest

pytestmark = pytest.mark.skipif(
    not os.getenv("TEST_DATABASE_URL"), reason="Define TEST_DATABASE_URL para probar la API con base real"
)

LUGAR_NUEVO = {
    "slug": "barrio-lastarria",
    "categoria": "historico",
    "nombre_es": "Barrio Lastarria",
    "nombre_en": "Lastarria Neighborhood",
    "descripcion_es": "Barrio patrimonial con cafés y librerías.",
    "descripcion_en": "Heritage neighborhood with cafés and bookshops.",
    "comuna": "Santiago",
    "latitud": -33.4372,
    "longitud": -70.6386,
    "costo_clp": 0,
    "duracion_min": 45,
    "horario_es": "Lun-Dom 10:00-20:00",
    "horario_en": "Mon-Sun 10:00-20:00",
}


@pytest.fixture(scope="module")
def cliente():
    from fastapi.testclient import TestClient

    from app.main import app
    from scripts import cargar_catalogo, crear_base

    crear_base.ejecutar_schema()
    lugares, errores = cargar_catalogo.leer_y_validar()
    assert not errores, errores
    cargar_catalogo.cargar(lugares)
    with TestClient(app) as c:
        yield c


@pytest.fixture(scope="module")
def usuario(cliente):
    r = cliente.post("/api/v1/usuarios", json={
        "nombre": "Daniel Prueba", "email": "Daniel@Ejemplo.com", "password": "clave-segura-123", "idioma": "en",
    })
    assert r.status_code == 201, r.text
    return r.json()


# ---------------------------------------------------------------- salud y errores generales

def test_health(cliente):
    assert cliente.get("/api/v1/health").json() == {"estado": "ok", "base_de_datos": "ok"}


def test_ruta_inexistente_responde_404_con_formato_comun(cliente):
    r = cliente.get("/api/v1/no-existe")
    assert r.status_code == 404
    assert r.json()["error"]["codigo"] == "RUTA_HTTP_NO_EXISTE"


def test_errores_en_ingles_con_accept_language(cliente):
    r = cliente.get("/api/v1/lugares/9999", headers={"Accept-Language": "en-US,en;q=0.9"})
    assert r.status_code == 404
    assert r.json()["error"]["mensaje"] == "There is no place with id 9999."


def test_validacion_devuelve_422_con_detalle_por_campo(cliente):
    r = cliente.post("/api/v1/rutas/generar", json={"tiempo_horas": 0, "presupuesto_clp": -5, "intereses": []})
    assert r.status_code == 422
    campos = {d["campo"] for d in r.json()["error"]["detalles"]}
    assert campos == {"tiempo_horas", "presupuesto_clp", "intereses"}


# ---------------------------------------------------------------- lugares (flujo de la demo)

def test_crud_completo_de_lugar(cliente):
    # Crear
    r = cliente.post("/api/v1/lugares", json=LUGAR_NUEVO)
    assert r.status_code == 201, r.text
    lugar_id = r.json()["id"]
    assert r.headers["location"] == f"/api/v1/lugares/{lugar_id}"

    # Leer (en español y en inglés)
    assert cliente.get(f"/api/v1/lugares/{lugar_id}").json()["nombre"] == "Barrio Lastarria"
    en = cliente.get(f"/api/v1/lugares/{lugar_id}", headers={"Accept-Language": "en"}).json()
    assert en["nombre"] == "Lastarria Neighborhood"
    assert en["categoria"]["nombre"] == "Historic sites"

    # Actualizar
    cambiado = {**LUGAR_NUEVO, "costo_clp": 2000, "duracion_min": 60}
    r = cliente.put(f"/api/v1/lugares/{lugar_id}", json=cambiado)
    assert r.status_code == 200
    assert r.json()["costo_clp"] == 2000

    # Borrar y comprobar que ya no existe
    assert cliente.delete(f"/api/v1/lugares/{lugar_id}").status_code == 204
    assert cliente.get(f"/api/v1/lugares/{lugar_id}").status_code == 404
    assert cliente.delete(f"/api/v1/lugares/{lugar_id}").status_code == 404


def test_slug_duplicado_responde_409(cliente):
    duplicado = {**LUGAR_NUEVO, "slug": "museo-bellas-artes"}
    r = cliente.post("/api/v1/lugares", json=duplicado)
    assert r.status_code == 409
    assert r.json()["error"]["codigo"] == "LUGAR_SLUG_DUPLICADO"


def test_categoria_inexistente_responde_422(cliente):
    r = cliente.post("/api/v1/lugares", json={**LUGAR_NUEVO, "slug": "otro", "categoria": "playas"})
    assert r.status_code == 422
    assert r.json()["error"]["codigo"] == "CATEGORIA_NO_EXISTE"


def test_campos_extra_no_permitidos(cliente):
    r = cliente.post("/api/v1/lugares", json={**LUGAR_NUEVO, "slug": "otro-mas", "hackeo": True})
    assert r.status_code == 422


def test_filtros_y_paginacion(cliente):
    r = cliente.get("/api/v1/lugares", params={"categoria": "museos", "costo_max": 0})
    datos = r.json()
    assert r.status_code == 200
    assert datos["total"] >= 1
    assert all(l["categoria"]["codigo"] == "museos" and l["costo_clp"] == 0 for l in datos["datos"])
    pagina = cliente.get("/api/v1/lugares", params={"limit": 2, "offset": 0}).json()
    assert len(pagina["datos"]) == 2


# ---------------------------------------------------------------- usuarios

def test_registro_normaliza_email_y_no_devuelve_contrasena(usuario):
    assert usuario["email"] == "daniel@ejemplo.com"
    assert "password" not in usuario and "password_hash" not in usuario


def test_email_duplicado_responde_409(cliente, usuario):
    r = cliente.post("/api/v1/usuarios", json={
        "nombre": "Otro", "email": "daniel@ejemplo.com", "password": "otra-clave-123",
    })
    assert r.status_code == 409


def test_login(cliente, usuario):
    ok = cliente.post("/api/v1/usuarios/login", json={"email": "daniel@ejemplo.com", "password": "clave-segura-123"})
    assert ok.status_code == 200 and ok.json()["id"] == usuario["id"]
    malo = cliente.post("/api/v1/usuarios/login", json={"email": "daniel@ejemplo.com", "password": "incorrecta"})
    assert malo.status_code == 401
    nadie = cliente.post("/api/v1/usuarios/login", json={"email": "nadie@ejemplo.com", "password": "incorrecta"})
    assert nadie.status_code == 401


# ---------------------------------------------------------------- rutas

def _generar(cliente, **extra):
    cuerpo = {"tiempo_horas": 4, "presupuesto_clp": 15000, "intereses": ["museos", "gastronomia"], **extra}
    r = cliente.post("/api/v1/rutas/generar", json=cuerpo)
    assert r.status_code == 200, r.text
    return r.json()


def test_generar_ruta_caso_daniel(cliente):
    ruta = _generar(cliente)
    assert 1 <= len(ruta["paradas"]) <= 6
    assert ruta["costo_total_clp"] <= 15000
    assert ruta["duracion_total_min"] <= 240
    assert ruta["mensaje"] is None


def test_generar_sin_lugares_compatibles_entrega_mensaje(cliente):
    r = cliente.post("/api/v1/rutas/generar", json={"tiempo_horas": 0.2, "presupuesto_clp": 0, "intereses": ["museos"]},
                     headers={"Accept-Language": "en"})
    assert r.status_code == 200
    assert r.json()["paradas"] == []
    assert "Try increasing" in r.json()["mensaje"]


def test_crud_de_ruta_guardada_y_totales_del_servidor(cliente, usuario):
    sugerida = _generar(cliente)
    ids = [p["lugar"]["id"] for p in sugerida["paradas"]]

    r = cliente.post("/api/v1/rutas", json={
        "usuario_id": usuario["id"], "nombre": "Mi tarde", "lugares": ids, "tiempo_horas": 4, "presupuesto_clp": 15000,
    })
    assert r.status_code == 201, r.text
    ruta = r.json()
    assert ruta["costo_total_clp"] == sugerida["costo_total_clp"]
    assert ruta["duracion_total_min"] == sugerida["duracion_total_min"]

    listado = cliente.get(f"/api/v1/usuarios/{usuario['id']}/rutas").json()
    assert any(x["id"] == ruta["id"] and x["cantidad_paradas"] == len(ids) for x in listado)

    # Quitar la última parada y renombrar: el servidor recalcula
    r = cliente.put(f"/api/v1/rutas/{ruta['id']}", json={"nombre": "Más corta", "lugares": ids[:-1]})
    assert r.status_code == 200
    assert r.json()["nombre"] == "Más corta"
    assert len(r.json()["paradas"]) == len(ids) - 1

    # Un lugar que está en una ruta guardada no se puede borrar
    r = cliente.delete(f"/api/v1/lugares/{ids[0]}")
    assert r.status_code == 409
    assert r.json()["error"]["codigo"] == "LUGAR_EN_USO"

    assert cliente.delete(f"/api/v1/rutas/{ruta['id']}").status_code == 204
    assert cliente.get(f"/api/v1/rutas/{ruta['id']}").status_code == 404


def test_ruta_con_lugares_repetidos_o_inexistentes(cliente, usuario):
    r = cliente.post("/api/v1/rutas", json={"usuario_id": usuario["id"], "nombre": "x", "lugares": [1, 1]})
    assert r.status_code == 422 and r.json()["error"]["codigo"] == "LUGARES_REPETIDOS"
    r = cliente.post("/api/v1/rutas", json={"usuario_id": usuario["id"], "nombre": "x", "lugares": [9999]})
    assert r.status_code == 422 and r.json()["error"]["codigo"] == "LUGAR_NO_ENCONTRADO"
    r = cliente.post("/api/v1/rutas", json={"usuario_id": 9999, "nombre": "x", "lugares": [1]})
    assert r.status_code == 404


# ---------------------------------------------------------------- visitas y revisitas

def test_visitados_se_excluyen_salvo_contenido_rotativo(cliente, usuario):
    lugares = cliente.get("/api/v1/lugares", params={"limit": 100}).json()["datos"]
    rotativo = next(l for l in lugares if l["contenido_rotativo"] and l["categoria"]["codigo"] == "museos")
    fijo = next(l for l in lugares if not l["contenido_rotativo"] and l["categoria"]["codigo"] == "historico")

    for lugar in (rotativo, fijo):
        r = cliente.post(f"/api/v1/usuarios/{usuario['id']}/visitas", json={"lugar_id": lugar["id"]})
        assert r.status_code == 201

    cuerpo = {"intereses": ["museos", "historico"], "tiempo_horas": 8, "presupuesto_clp": 50000}
    sin_visitados = _generar(cliente, **cuerpo, usuario_id=usuario["id"])
    ids = {p["lugar"]["id"] for p in sin_visitados["paradas"]}
    assert fijo["id"] not in ids  # visitado y sin novedades: no se repite

    con_visitados = _generar(cliente, **cuerpo, usuario_id=usuario["id"], incluir_visitados=True)
    assert con_visitados["paradas"]

    # El rotativo sigue siendo candidato aunque esté visitado
    solo_museos = _generar(cliente, intereses=["museos"], tiempo_horas=8, presupuesto_clp=50000, usuario_id=usuario["id"])
    assert rotativo["id"] in {p["lugar"]["id"] for p in solo_museos["paradas"]}


def test_visitas_listar_repetir_y_borrar(cliente, usuario):
    primera = cliente.post(f"/api/v1/usuarios/{usuario['id']}/visitas", json={"lugar_id": 1}).json()
    segunda = cliente.post(f"/api/v1/usuarios/{usuario['id']}/visitas", json={"lugar_id": 1})
    assert segunda.status_code == 201  # el turista puede volver al mismo lugar

    visitas = cliente.get(f"/api/v1/usuarios/{usuario['id']}/visitas").json()
    assert visitas[0]["id"] == segunda.json()["id"]  # más reciente primero

    assert cliente.delete(f"/api/v1/visitas/{primera['id']}").status_code == 204
    assert cliente.delete(f"/api/v1/visitas/{primera['id']}").status_code == 404


def test_visita_con_ruta_de_otro_usuario_responde_422(cliente, usuario):
    otro = cliente.post("/api/v1/usuarios", json={"nombre": "Otra", "email": "otra@ejemplo.com",
                                                   "password": "clave-otra-123"}).json()
    ruta = cliente.post("/api/v1/rutas", json={"usuario_id": otro["id"], "nombre": "De otra", "lugares": [2]}).json()
    r = cliente.post(f"/api/v1/usuarios/{usuario['id']}/visitas", json={"lugar_id": 2, "ruta_id": ruta["id"]})
    assert r.status_code == 422
    assert r.json()["error"]["codigo"] == "RUTA_NO_PERTENECE"
