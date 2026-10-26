"""Pruebas del generador de rutas (capa de negocio pura, no necesitan base de datos)."""
from types import SimpleNamespace

from app.business import generador_rutas
from app.business.generador_rutas import MAX_PARADAS, calcular_itinerario, distancia_km, generar_ruta


def lugar(id, costo, duracion, lat, lon, categoria="museos"):
    return SimpleNamespace(id=id, costo_clp=costo, duracion_min=duracion, latitud=lat, longitud=lon,
                           categoria=categoria)


# Los lugares de museos y gastronomía del catálogo inicial (mismos datos que db/catalogo/lugares.csv)
BELLAS_ARTES = lugar(1, 0, 60, -33.4353, -70.6438)
MAC = lugar(2, 1000, 50, -33.436, -70.643)
EMPORIO = lugar(3, 4500, 40, -33.433, -70.640, "gastronomia")
PATIO = lugar(4, 8000, 70, -33.425, -70.634, "gastronomia")
GAM = lugar(9, 0, 45, -33.443, -70.639)
CATALOGO_DANIEL = [BELLAS_ARTES, MAC, EMPORIO, PATIO, GAM]


def test_caso_daniel_4_horas_15000_museos_y_gastronomia():
    resultado = generar_ruta(CATALOGO_DANIEL, minutos_disponibles=240, presupuesto_clp=15000)

    ids = [p.lugar.id for p in resultado.paradas]
    assert ids == [1, 2, 3, 9]  # empieza por el gratis de menor id y sigue por cercanía
    assert resultado.costo_total_clp == 5500
    assert resultado.duracion_total_min <= 240
    assert resultado.paradas[0].traslado_min == 0
    assert [p.orden for p in resultado.paradas] == [1, 2, 3, 4]


def test_respeta_presupuesto_y_tiempo():
    resultado = generar_ruta(CATALOGO_DANIEL, minutos_disponibles=240, presupuesto_clp=15000)
    suma = sum(p.traslado_min + p.lugar.duracion_min for p in resultado.paradas)
    assert suma == resultado.duracion_total_min
    assert sum(p.lugar.costo_clp for p in resultado.paradas) == resultado.costo_total_clp


def test_presupuesto_cero_solo_incluye_lugares_gratis():
    resultado = generar_ruta(CATALOGO_DANIEL, minutos_disponibles=240, presupuesto_clp=0)
    assert resultado.paradas, "debería encontrar lugares gratis"
    assert all(p.lugar.costo_clp == 0 for p in resultado.paradas)
    assert resultado.costo_total_clp == 0


def test_sin_candidatos_devuelve_ruta_vacia():
    resultado = generar_ruta([], minutos_disponibles=240, presupuesto_clp=15000)
    assert resultado.paradas == []
    assert resultado.duracion_total_min == 0
    assert resultado.costo_total_clp == 0


def test_tiempo_insuficiente_devuelve_ruta_vacia():
    resultado = generar_ruta(CATALOGO_DANIEL, minutos_disponibles=30, presupuesto_clp=15000)
    assert resultado.paradas == []


def test_nunca_supera_el_maximo_de_paradas():
    # 10 lugares gratis y cortos en el mismo punto: caben todos, pero el tope es MAX_PARADAS
    muchos = [lugar(i, 0, 5, -33.44, -70.64) for i in range(1, 11)]
    resultado = generar_ruta(muchos, minutos_disponibles=600, presupuesto_clp=0)
    assert len(resultado.paradas) == MAX_PARADAS


def test_distancia_haversine_conocida():
    # Plaza de Armas → La Moneda: ~0,6 km en línea recta
    plaza = lugar(1, 0, 30, -33.438, -70.650)
    moneda = lugar(2, 0, 40, -33.443, -70.653)
    assert 0.5 < distancia_km(plaza, moneda) < 0.7


def test_traslado_usa_15_minutos_por_km():
    a = lugar(1, 0, 30, -33.438, -70.650)
    b = lugar(2, 0, 30, -33.443, -70.653)
    esperado = -(-distancia_km(a, b) * generador_rutas.MINUTOS_TRASLADO_POR_KM // 1)  # techo
    assert generador_rutas.minutos_traslado(a, b) == esperado
    assert generador_rutas.minutos_traslado(None, b) == 0


def test_calcular_itinerario_respeta_el_orden_recibido():
    resultado = calcular_itinerario([GAM, BELLAS_ARTES, EMPORIO])
    assert [p.lugar.id for p in resultado.paradas] == [9, 1, 3]
    assert resultado.costo_total_clp == 4500
    traslados = sum(p.traslado_min for p in resultado.paradas)
    assert resultado.duracion_total_min == 45 + 60 + 40 + traslados
