"""Pruebas de usuarios: registro, login, límite de intentos y derechos de la Ley 21.719.

Requieren TEST_DATABASE_URL (ver test_api.py).
"""
import os

import pytest

from app.business.limite_intentos import LimitadorIntentos
from app.core.errores import DemasiadosIntentos

pytestmark = pytest.mark.skipif(
    not os.getenv("TEST_DATABASE_URL"), reason="Define TEST_DATABASE_URL para probar la API con base real"
)


def _login(cliente, email, password):
    return cliente.post("/api/v1/usuarios/login", json={"email": email, "password": password})


def _eliminar(cliente, usuario_id, password):
    # httpx no acepta json= en .delete(), por eso se usa .request()
    return cliente.request("DELETE", f"/api/v1/usuarios/{usuario_id}", json={"password": password})


def _descargar(cliente, usuario_id, password):
    return cliente.post(f"/api/v1/usuarios/{usuario_id}/datos", json={"password": password})


# ---------------------------------------------------------------- registro y login

def test_registro_normaliza_email_y_no_devuelve_contrasena(cliente):
    r = cliente.post("/api/v1/usuarios", json={
        "nombre": "Daniel", "email": "Daniel.Mayus@Ejemplo.com", "password": "clave-segura-123",
    })
    assert r.status_code == 201
    assert r.json()["email"] == "daniel.mayus@ejemplo.com"
    assert "password" not in r.json() and "password_hash" not in r.json()


def test_email_duplicado_responde_409(cliente, nuevo_usuario):
    usuario = nuevo_usuario()
    r = cliente.post("/api/v1/usuarios", json={"nombre": "Otro", "email": usuario["email"], "password": "otra-clave-123"})
    assert r.status_code == 409


def test_contrasena_corta_es_error_de_formato_400(cliente):
    r = cliente.post("/api/v1/usuarios", json={"nombre": "X", "email": "x@ejemplo.com", "password": "corta"})
    assert r.status_code == 400


def test_login(cliente, nuevo_usuario):
    usuario = nuevo_usuario()
    ok = _login(cliente, usuario["email"], "clave-segura-123")
    assert ok.status_code == 200 and ok.json()["id"] == usuario["id"]
    assert _login(cliente, usuario["email"], "incorrecta").status_code == 401
    assert _login(cliente, "nadie@ejemplo.com", "incorrecta").status_code == 401


# ---------------------------------------------------------------- límite de intentos (fuerza bruta)

def test_sexto_intento_fallido_responde_429_aunque_la_clave_sea_correcta(cliente, nuevo_usuario):
    usuario = nuevo_usuario()
    for _ in range(5):
        assert _login(cliente, usuario["email"], "incorrecta").status_code == 401
    r = _login(cliente, usuario["email"], "clave-segura-123")
    assert r.status_code == 429
    assert r.json()["error"]["codigo"] == "DEMASIADOS_INTENTOS"
    assert int(r.headers["retry-after"]) > 0


def test_un_login_correcto_reinicia_los_fallos(cliente, nuevo_usuario):
    usuario = nuevo_usuario()
    for _ in range(4):
        _login(cliente, usuario["email"], "incorrecta")
    assert _login(cliente, usuario["email"], "clave-segura-123").status_code == 200
    for _ in range(4):
        assert _login(cliente, usuario["email"], "incorrecta").status_code == 401  # contador en cero otra vez


def test_el_bloqueo_se_levanta_al_pasar_la_ventana():
    ahora = [0.0]
    limitador = LimitadorIntentos(maximo_fallos=2, ventana_segundos=60, reloj=lambda: ahora[0])
    limitador.registrar_fallo("a@b.cl")
    limitador.registrar_fallo("a@b.cl")
    with pytest.raises(DemasiadosIntentos):
        limitador.verificar("a@b.cl")
    ahora[0] = 61.0
    limitador.verificar("a@b.cl")  # ya no lanza


# ---------------------------------------------------------------- Ley 21.719: acceso, rectificación, supresión y portabilidad

def test_rectificar_nombre_correo_e_idioma(cliente, nuevo_usuario):
    usuario = nuevo_usuario()
    r = cliente.put(f"/api/v1/usuarios/{usuario['id']}", json={
        "nombre": "Daniel Miller", "email": "Nuevo.Correo@Ejemplo.com", "idioma": "en", "password": "clave-segura-123",
    })
    assert r.status_code == 200, r.text
    assert r.json()["email"] == "nuevo.correo@ejemplo.com" and r.json()["idioma"] == "en"
    assert cliente.get(f"/api/v1/usuarios/{usuario['id']}").json()["nombre"] == "Daniel Miller"
    assert _login(cliente, "nuevo.correo@ejemplo.com", "clave-segura-123").status_code == 200


def test_rectificar_con_correo_de_otro_responde_409(cliente, nuevo_usuario):
    yo, otra = nuevo_usuario(), nuevo_usuario()
    r = cliente.put(f"/api/v1/usuarios/{yo['id']}", json={
        "nombre": "Yo", "email": otra["email"], "idioma": "es", "password": "clave-segura-123",
    })
    assert r.status_code == 409


def test_rectificar_pide_la_contrasena_y_sin_ella_no_cambia_nada(cliente, nuevo_usuario):
    usuario = nuevo_usuario()
    datos = {"nombre": "Intruso", "email": "intruso@ejemplo.com", "idioma": "en"}
    url = f"/api/v1/usuarios/{usuario['id']}"
    assert cliente.put(url, json=datos).status_code == 400  # falta la contraseña: formato
    r = cliente.put(url, json={**datos, "password": "incorrecta"})
    assert r.status_code == 401 and r.json()["error"]["codigo"] == "CONTRASENA_INCORRECTA"
    sin_cambios = cliente.get(url).json()
    assert sin_cambios["email"] == usuario["email"] and sin_cambios["nombre"] == usuario["nombre"]


def test_descargar_mis_datos_en_json(cliente, nuevo_usuario):
    usuario = nuevo_usuario()
    cliente.post("/api/v1/rutas", json={"usuario_id": usuario["id"], "nombre": "Para exportar", "lugares": [1, 2]})
    cliente.post(f"/api/v1/usuarios/{usuario['id']}/visitas", json={"lugar_id": 1})

    r = _descargar(cliente, usuario["id"], "clave-segura-123")
    assert r.status_code == 200
    assert "attachment" in r.headers["content-disposition"]
    datos = r.json()
    assert datos["usuario"]["email"] == usuario["email"]
    assert [ruta["nombre"] for ruta in datos["rutas"]] == ["Para exportar"]
    assert len(datos["visitas"]) == 1
    assert "password_hash" not in r.text


def test_descargar_mis_datos_pide_la_contrasena(cliente, nuevo_usuario):
    usuario = nuevo_usuario()
    r = _descargar(cliente, usuario["id"], "incorrecta")
    assert r.status_code == 401 and r.json()["error"]["codigo"] == "CONTRASENA_INCORRECTA"
    assert cliente.post(f"/api/v1/usuarios/{usuario['id']}/datos", json={}).status_code == 400
    assert cliente.get(f"/api/v1/usuarios/{usuario['id']}/datos").status_code == 405  # ya no es GET


def test_eliminar_cuenta_pide_la_contrasena_y_borra_todo(cliente, nuevo_usuario):
    usuario = nuevo_usuario()
    ruta = cliente.post("/api/v1/rutas", json={"usuario_id": usuario["id"], "nombre": "Se borra", "lugares": [1]}).json()
    cliente.post(f"/api/v1/usuarios/{usuario['id']}/visitas", json={"lugar_id": 1})

    r = _eliminar(cliente, usuario["id"], "incorrecta")
    assert r.status_code == 401 and r.json()["error"]["codigo"] == "CONTRASENA_INCORRECTA"
    assert _eliminar(cliente, usuario["id"], "").status_code == 400  # contraseña vacía: formato

    assert _eliminar(cliente, usuario["id"], "clave-segura-123").status_code == 204
    assert cliente.get(f"/api/v1/usuarios/{usuario['id']}").status_code == 404
    assert cliente.get(f"/api/v1/rutas/{ruta['id']}").status_code == 404  # ON DELETE CASCADE
    assert _login(cliente, usuario["email"], "clave-segura-123").status_code == 401


def test_eliminar_cuenta_inexistente_responde_404(cliente):
    assert _eliminar(cliente, 99999, "lo-que-sea").status_code == 404
