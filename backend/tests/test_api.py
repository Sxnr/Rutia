"""Pruebas de la API completa contra una base PostgreSQL real: lugares, rutas, visitas y errores.

Requieren TEST_DATABASE_URL (una base que se puede borrar). Ejemplo con PostgreSQL local:
    TEST_DATABASE_URL=postgresql://usuario:clave@localhost:5432/rutia_pruebas pytest
Sin esa variable, estas pruebas se saltan. Las de usuarios están en test_api_cuenta.py.
"""
import os

import pytest

pytestmark = pytest.mark.skipif(
    not os.getenv("TEST_DATABASE_URL"), reason="Define TEST_DATABASE_URL para probar la API con base real"
)

LUGAR_NUEVO = {
    "slug": "barrio-lastarria",
    "categoria": "patrimonio",
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
DANIEL = {"tiempo_horas": 4, "presupuesto_clp": 15000, "intereses": ["museos", "restaurantes"]}


def _generar(cliente, **cambios):
    r = cliente.post("/api/v1/rutas/generar", json={**DANIEL, **cambios})
    assert r.status_code == 200, r.text
    return r.json()


# ---------------------------------------------------------------- salud, categorías y errores generales

def test_health(cliente):
    assert cliente.get("/api/v1/health").json() == {"estado": "ok", "base_de_datos": "ok"}


def test_las_cuatro_categorias_en_dos_idiomas(cliente):
    es = cliente.get("/api/v1/categorias").json()
    en = cliente.get("/api/v1/categorias", headers={"Accept-Language": "en"}).json()
    assert [c["codigo"] for c in es] == ["museos", "parques", "patrimonio", "restaurantes"]
    assert [c["nombre"] for c in en] == ["Museums", "Parks", "Heritage", "Restaurants"]


def test_ruta_inexistente_responde_404_con_formato_comun(cliente):
    r = cliente.get("/api/v1/no-existe")
    assert r.status_code == 404
    assert r.json()["error"]["codigo"] == "RUTA_HTTP_NO_EXISTE"


def test_errores_en_ingles_con_accept_language(cliente):
    r = cliente.get("/api/v1/lugares/9999", headers={"Accept-Language": "en-US,en;q=0.9"})
    assert r.status_code == 404
    assert r.json()["error"]["mensaje"] == "There is no place with id 9999."


def test_formato_invalido_responde_400_con_detalle_por_campo(cliente):
    # Presentación: tipos y formato → 400 (documento del Hito 1)
    r = cliente.post("/api/v1/rutas/generar", json={"tiempo_horas": 0, "presupuesto_clp": -5, "intereses": []})
    assert r.status_code == 400
    assert r.json()["error"]["codigo"] == "VALIDACION"
    campos = {d["campo"] for d in r.json()["error"]["detalles"]}
    assert campos == {"tiempo_horas", "presupuesto_clp", "intereses"}


def test_json_mal_escrito_e_id_no_numerico_responden_400(cliente):
    r = cliente.post("/api/v1/lugares", content="{malo", headers={"Content-Type": "application/json"})
    assert r.status_code == 400 and r.json()["error"]["detalles"][0]["campo"] == "cuerpo"
    assert cliente.get("/api/v1/lugares/abc").status_code == 400


def test_docs_no_anuncian_422_para_errores_de_formato(cliente):
    esquema = cliente.get("/openapi.json").json()
    generar = esquema["paths"]["/api/v1/rutas/generar"]["post"]["responses"]
    assert "400" in generar
    assert generar.get("422", {}).get("description") != "Validation Error"
    assert "HTTPValidationError" not in esquema["components"]["schemas"]


# ---------------------------------------------------------------- lugares (flujo de la demo)

def test_crud_completo_de_lugar(cliente):
    r = cliente.post("/api/v1/lugares", json=LUGAR_NUEVO)
    assert r.status_code == 201, r.text
    lugar_id = r.json()["id"]
    assert r.headers["location"] == f"/api/v1/lugares/{lugar_id}"

    assert cliente.get(f"/api/v1/lugares/{lugar_id}").json()["nombre"] == "Barrio Lastarria"
    en = cliente.get(f"/api/v1/lugares/{lugar_id}", headers={"Accept-Language": "en"}).json()
    assert en["nombre"] == "Lastarria Neighborhood"
    assert en["categoria"]["nombre"] == "Heritage"

    r = cliente.put(f"/api/v1/lugares/{lugar_id}", json={**LUGAR_NUEVO, "costo_clp": 2000, "duracion_min": 60})
    assert r.status_code == 200 and r.json()["costo_clp"] == 2000

    assert cliente.delete(f"/api/v1/lugares/{lugar_id}").status_code == 204
    assert cliente.get(f"/api/v1/lugares/{lugar_id}").status_code == 404
    assert cliente.delete(f"/api/v1/lugares/{lugar_id}").status_code == 404


def test_slug_duplicado_responde_409(cliente):
    r = cliente.post("/api/v1/lugares", json={**LUGAR_NUEVO, "slug": "museo-bellas-artes"})
    assert r.status_code == 409 and r.json()["error"]["codigo"] == "LUGAR_SLUG_DUPLICADO"


def test_regla_de_negocio_categoria_inexistente_responde_422(cliente):
    # Negocio: el formato es correcto, pero la regla no se cumple → 422
    r = cliente.post("/api/v1/lugares", json={**LUGAR_NUEVO, "slug": "otro", "categoria": "playas"})
    assert r.status_code == 422 and r.json()["error"]["codigo"] == "CATEGORIA_NO_EXISTE"


def test_campos_extra_no_permitidos(cliente):
    assert cliente.post("/api/v1/lugares", json={**LUGAR_NUEVO, "slug": "otro-mas", "hackeo": True}).status_code == 400


def test_filtros_y_paginacion(cliente):
    datos = cliente.get("/api/v1/lugares", params={"categoria": "museos", "costo_max": 0}).json()
    assert datos["total"] >= 1
    assert all(l["categoria"]["codigo"] == "museos" and l["costo_clp"] == 0 for l in datos["datos"])
    assert len(cliente.get("/api/v1/lugares", params={"limit": 2}).json()["datos"]) == 2


# ---------------------------------------------------------------- generar ruta y cantidad de lugares

def test_generar_ruta_caso_daniel(cliente):
    ruta = _generar(cliente)
    assert ruta["cantidad_objetivo"] == 4  # 4 horas → 4 lugares sugeridos
    assert len(ruta["paradas"]) == 4
    assert ruta["costo_total_clp"] == 5500
    assert ruta["duracion_total_min"] <= 240
    assert ruta["mensaje"] is None


def test_cantidad_elegida_por_el_turista(cliente):
    ruta = _generar(cliente, cantidad=2)
    assert ruta["cantidad_objetivo"] == 2 and len(ruta["paradas"]) == 2
    for fuera_de_rango in (1, 6):
        assert cliente.post("/api/v1/rutas/generar", json={**DANIEL, "cantidad": fuera_de_rango}).status_code == 400


def test_tiempo_disponible_hasta_8_horas_como_en_el_hito_1(cliente):
    assert _generar(cliente, tiempo_horas=8)["cantidad_objetivo"] == 5
    r = cliente.post("/api/v1/rutas/generar", json={**DANIEL, "tiempo_horas": 9})
    assert r.status_code == 400 and r.json()["error"]["detalles"][0]["campo"] == "tiempo_horas"


def test_avisa_cuando_caben_menos_lugares_que_los_buscados(cliente):
    ruta = _generar(cliente, intereses=["parques"], cantidad=3)  # hay un solo parque en el catálogo
    assert len(ruta["paradas"]) == 1
    assert ruta["mensaje"] == "Con tu tiempo y presupuesto caben 1 de los 3 lugares buscados."


def test_generar_sin_lugares_compatibles_entrega_mensaje(cliente):
    r = cliente.post("/api/v1/rutas/generar", json={"tiempo_horas": 0.2, "presupuesto_clp": 0, "intereses": ["museos"]},
                     headers={"Accept-Language": "en"})
    assert r.status_code == 200 and r.json()["paradas"] == []
    assert "Try increasing" in r.json()["mensaje"]


# ---------------------------------------------------------------- recalcular antes de guardar

def test_recalcular_una_ruta_reordenada(cliente):
    sugerida = _generar(cliente)
    ids = [p["lugar"]["id"] for p in sugerida["paradas"]]
    r = cliente.post("/api/v1/rutas/recalcular", json={"lugares": ids[::-1], "tiempo_horas": 4, "presupuesto_clp": 15000})
    assert r.status_code == 200, r.text
    datos = r.json()
    assert [p["lugar"]["id"] for p in datos["paradas"]] == ids[::-1]
    assert datos["paradas"][0]["traslado_min"] == 0
    assert datos["costo_total_clp"] == sugerida["costo_total_clp"]  # mismos lugares, mismo costo
    assert datos["excede_presupuesto"] is False


def test_recalcular_avisa_si_se_pasa_del_tiempo(cliente):
    sugerida = _generar(cliente)
    ids = [p["lugar"]["id"] for p in sugerida["paradas"]]
    datos = cliente.post("/api/v1/rutas/recalcular", json={"lugares": ids, "tiempo_horas": 1}).json()
    assert datos["excede_tiempo"] is True and datos["excede_presupuesto"] is False
    assert datos["mensaje"] == "Con este orden la ruta supera tu tiempo disponible."


def test_recalcular_valida_lugares(cliente):
    r = cliente.post("/api/v1/rutas/recalcular", json={"lugares": [1, 1]})
    assert r.status_code == 422 and r.json()["error"]["codigo"] == "LUGARES_REPETIDOS"
    r = cliente.post("/api/v1/rutas/recalcular", json={"lugares": [9999]})
    assert r.status_code == 422 and r.json()["error"]["codigo"] == "LUGAR_NO_ENCONTRADO"
    assert cliente.post("/api/v1/rutas/recalcular", json={"lugares": []}).status_code == 400


# ---------------------------------------------------------------- rutas guardadas

def test_crud_de_ruta_guardada_y_totales_del_servidor(cliente, nuevo_usuario):
    usuario = nuevo_usuario()
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

    r = cliente.put(f"/api/v1/rutas/{ruta['id']}", json={"nombre": "Más corta", "lugares": ids[:-1]})
    assert r.status_code == 200
    assert r.json()["nombre"] == "Más corta" and len(r.json()["paradas"]) == len(ids) - 1

    # Un lugar que está en una ruta guardada no se puede borrar
    r = cliente.delete(f"/api/v1/lugares/{ids[0]}")
    assert r.status_code == 409 and r.json()["error"]["codigo"] == "LUGAR_EN_USO"

    assert cliente.delete(f"/api/v1/rutas/{ruta['id']}").status_code == 204
    assert cliente.get(f"/api/v1/rutas/{ruta['id']}").status_code == 404


def test_ruta_con_lugares_repetidos_o_inexistentes(cliente, nuevo_usuario):
    usuario = nuevo_usuario()
    r = cliente.post("/api/v1/rutas", json={"usuario_id": usuario["id"], "nombre": "x", "lugares": [1, 1]})
    assert r.status_code == 422 and r.json()["error"]["codigo"] == "LUGARES_REPETIDOS"
    r = cliente.post("/api/v1/rutas", json={"usuario_id": usuario["id"], "nombre": "x", "lugares": [9999]})
    assert r.status_code == 422 and r.json()["error"]["codigo"] == "LUGAR_NO_ENCONTRADO"
    assert cliente.post("/api/v1/rutas", json={"usuario_id": 9999, "nombre": "x", "lugares": [1]}).status_code == 404


# ---------------------------------------------------------------- visitas y revisitas

def test_visitados_se_excluyen_salvo_contenido_rotativo(cliente, nuevo_usuario):
    usuario = nuevo_usuario()
    lugares = cliente.get("/api/v1/lugares", params={"limit": 100}).json()["datos"]
    rotativo = next(l for l in lugares if l["contenido_rotativo"] and l["categoria"]["codigo"] == "museos")
    fijo = next(l for l in lugares if not l["contenido_rotativo"] and l["categoria"]["codigo"] == "patrimonio")
    for lugar in (rotativo, fijo):
        assert cliente.post(f"/api/v1/usuarios/{usuario['id']}/visitas", json={"lugar_id": lugar["id"]}).status_code == 201

    cuerpo = {"intereses": ["museos", "patrimonio"], "tiempo_horas": 8, "presupuesto_clp": 50000, "cantidad": 5}
    sin_visitados = _generar(cliente, **cuerpo, usuario_id=usuario["id"])
    assert fijo["id"] not in {p["lugar"]["id"] for p in sin_visitados["paradas"]}

    assert _generar(cliente, **cuerpo, usuario_id=usuario["id"], incluir_visitados=True)["paradas"]

    solo_museos = _generar(cliente, intereses=["museos"], tiempo_horas=8, presupuesto_clp=50000, usuario_id=usuario["id"])
    assert rotativo["id"] in {p["lugar"]["id"] for p in solo_museos["paradas"]}


def test_visitas_listar_repetir_y_borrar(cliente, nuevo_usuario):
    usuario = nuevo_usuario()
    primera = cliente.post(f"/api/v1/usuarios/{usuario['id']}/visitas", json={"lugar_id": 1}).json()
    segunda = cliente.post(f"/api/v1/usuarios/{usuario['id']}/visitas", json={"lugar_id": 1})
    assert segunda.status_code == 201  # el turista puede volver al mismo lugar
    assert cliente.get(f"/api/v1/usuarios/{usuario['id']}/visitas").json()[0]["id"] == segunda.json()["id"]
    assert cliente.delete(f"/api/v1/visitas/{primera['id']}").status_code == 204
    assert cliente.delete(f"/api/v1/visitas/{primera['id']}").status_code == 404


def test_visita_con_ruta_de_otro_usuario_responde_422(cliente, nuevo_usuario):
    yo, otra = nuevo_usuario(), nuevo_usuario()
    ruta = cliente.post("/api/v1/rutas", json={"usuario_id": otra["id"], "nombre": "De otra", "lugares": [2]}).json()
    r = cliente.post(f"/api/v1/usuarios/{yo['id']}/visitas", json={"lugar_id": 2, "ruta_id": ruta["id"]})
    assert r.status_code == 422 and r.json()["error"]["codigo"] == "RUTA_NO_PERTENECE"
