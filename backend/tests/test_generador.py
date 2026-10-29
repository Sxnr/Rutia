"""Pruebas del generador de rutas (capa de negocio pura, no necesitan base de datos)."""
import math
from types import SimpleNamespace

from app.business import generador_rutas
from app.business.generador_rutas import (
    CANTIDAD_MAX,
    calcular_itinerario,
    cantidad_sugerida,
    distancia_km,
    generar_ruta,
    minutos_traslado,
)


def lugar(id, costo, duracion, lat, lon, categoria="museos"):
    return SimpleNamespace(id=id, costo_clp=costo, duracion_min=duracion, latitud=lat, longitud=lon,
                           categoria=categoria)


# Los lugares de museos y restaurantes del catálogo inicial (mismos datos que db/catalogo/lugares.csv)
BELLAS_ARTES = lugar(1, 0, 60, -33.4353, -70.6438)
MAC = lugar(2, 1000, 50, -33.436, -70.643)
EMPORIO = lugar(3, 4500, 40, -33.433, -70.640, "restaurantes")
PATIO = lugar(4, 8000, 70, -33.425, -70.634, "restaurantes")
GAM = lugar(9, 0, 45, -33.443, -70.639)
CATALOGO_DANIEL = [BELLAS_ARTES, MAC, EMPORIO, PATIO, GAM]


# ---------------------------------------------------------------- cantidad de lugares

def test_cantidad_sugerida_segun_el_tiempo():
    # Tabla del equipo: hasta 2 h → 2; hasta 3 h → 3; hasta 5 h → 4; más de 5 h → 5
    assert cantidad_sugerida(60) == 2
    assert cantidad_sugerida(120) == 2
    assert cantidad_sugerida(150) == 3
    assert cantidad_sugerida(180) == 3
    assert cantidad_sugerida(240) == 4
    assert cantidad_sugerida(300) == 4
    assert cantidad_sugerida(330) == 5
    assert cantidad_sugerida(720) == 5


def test_nunca_supera_la_cantidad_pedida():
    # 10 lugares gratis y cortos en el mismo punto: caben todos, pero se respeta la cantidad
    muchos = [lugar(i, 0, 5, -33.44, -70.64) for i in range(1, 11)]
    for cantidad in (2, 3, CANTIDAD_MAX):
        resultado = generar_ruta(muchos, minutos_disponibles=600, presupuesto_clp=0, cantidad=cantidad)
        assert len(resultado.paradas) == cantidad


# ---------------------------------------------------------------- caso Daniel

def test_caso_daniel_4_horas_15000_museos_y_restaurantes():
    resultado = generar_ruta(CATALOGO_DANIEL, minutos_disponibles=240, presupuesto_clp=15000,
                             cantidad=cantidad_sugerida(240))

    ids = [p.lugar.id for p in resultado.paradas]
    assert ids == [1, 2, 3, 9]  # empieza por el gratis de menor id y sigue por cercanía
    assert resultado.costo_total_clp == 5500
    assert resultado.duracion_total_min <= 240
    assert resultado.paradas[0].traslado_min == 0
    assert [p.orden for p in resultado.paradas] == [1, 2, 3, 4]


def test_respeta_presupuesto_y_tiempo():
    resultado = generar_ruta(CATALOGO_DANIEL, minutos_disponibles=240, presupuesto_clp=15000, cantidad=5)
    suma = sum(p.traslado_min + p.lugar.duracion_min for p in resultado.paradas)
    assert suma == resultado.duracion_total_min <= 240
    assert sum(p.lugar.costo_clp for p in resultado.paradas) == resultado.costo_total_clp <= 15000


def test_presupuesto_cero_solo_incluye_lugares_gratis():
    resultado = generar_ruta(CATALOGO_DANIEL, minutos_disponibles=240, presupuesto_clp=0, cantidad=4)
    assert resultado.paradas, "debería encontrar lugares gratis"
    assert all(p.lugar.costo_clp == 0 for p in resultado.paradas)
    assert resultado.costo_total_clp == 0


def test_sin_candidatos_devuelve_ruta_vacia():
    resultado = generar_ruta([], minutos_disponibles=240, presupuesto_clp=15000, cantidad=4)
    assert resultado.paradas == []
    assert resultado.duracion_total_min == 0
    assert resultado.costo_total_clp == 0


def test_tiempo_insuficiente_devuelve_ruta_vacia():
    resultado = generar_ruta(CATALOGO_DANIEL, minutos_disponibles=30, presupuesto_clp=15000, cantidad=2)
    assert resultado.paradas == []


# ---------------------------------------------------------------- traslados

def test_distancia_haversine_conocida():
    # Plaza de Armas → La Moneda: ~0,6 km en línea recta
    plaza = lugar(1, 0, 30, -33.438, -70.650)
    moneda = lugar(2, 0, 40, -33.443, -70.653)
    assert 0.5 < distancia_km(plaza, moneda) < 0.7


def test_traslado_usa_factor_de_calles_y_4_km_por_hora():
    a = lugar(1, 0, 30, -33.438, -70.650)
    b = lugar(2, 0, 30, -33.443, -70.653)
    km_caminando = distancia_km(a, b) * 1.3
    assert minutos_traslado(a, b) == math.ceil(km_caminando / 4 * 60)
    assert minutos_traslado(None, b) == 0
    # 1 km en línea recta ≈ 19,5 minutos caminando
    assert generador_rutas.FACTOR_CALLES / generador_rutas.VELOCIDAD_CAMINATA_KMH * 60 == 19.5


def test_calcular_itinerario_respeta_el_orden_recibido():
    resultado = calcular_itinerario([GAM, BELLAS_ARTES, EMPORIO])
    assert [p.lugar.id for p in resultado.paradas] == [9, 1, 3]
    assert resultado.costo_total_clp == 4500
    traslados = sum(p.traslado_min for p in resultado.paradas)
    assert resultado.duracion_total_min == 45 + 60 + 40 + traslados
