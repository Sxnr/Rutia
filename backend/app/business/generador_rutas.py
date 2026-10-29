"""Generador de rutas: el corazón de la lógica de negocio de Rutia.

Portado de prototipo-web/src/server/business/routeService.js y ajustado a las
decisiones del equipo (Resumen integral del proyecto, sección 8).

Son funciones "puras": reciben lugares y números, devuelven un resultado.
No consultan la base ni saben de HTTP, por eso se pueden probar sin servidor.
Cualquier objeto con los atributos id, latitud, longitud, costo_clp y
duracion_min sirve como lugar (en la app real son modelos de SQLAlchemy).
"""
import math
from dataclasses import dataclass, field
from typing import Any

# Supuesto de traslado a pie por el centro de Santiago: 1 km ≈ 15 minutos (4 km/h).
MINUTOS_TRASLADO_POR_KM = 15

# --- Cantidad de lugares: la promesa de Rutia es "pocos lugares" ---
CANTIDAD_MIN = 2
CANTIDAD_MAX = 5
# Si el turista no elige la cantidad, se sugiere según su tiempo:
# hasta 2 h → 2 lugares; hasta 3 h → 3; hasta 5 h → 4; más de 5 h → 5.
TABLA_CANTIDAD = [(120, 2), (180, 3), (300, 4)]  # (hasta estos minutos, cantidad)

RADIO_TIERRA_KM = 6371


@dataclass
class Parada:
    orden: int
    lugar: Any
    traslado_min: int  # minutos desde la parada anterior (0 en la primera)


@dataclass
class ResultadoRuta:
    paradas: list[Parada] = field(default_factory=list)
    duracion_total_min: int = 0  # visitas + traslados
    costo_total_clp: int = 0


def cantidad_sugerida(minutos_disponibles: int) -> int:
    """Cuántos lugares conviene visitar según el tiempo disponible (tabla del equipo)."""
    for hasta_minutos, cantidad in TABLA_CANTIDAD:
        if minutos_disponibles <= hasta_minutos:
            return cantidad
    return CANTIDAD_MAX


def distancia_km(a, b) -> float:
    """Distancia en línea recta entre dos lugares (fórmula de Haversine)."""
    lat1, lon1 = math.radians(a.latitud), math.radians(a.longitud)
    lat2, lon2 = math.radians(b.latitud), math.radians(b.longitud)
    d_lat = lat2 - lat1
    d_lon = lon2 - lon1
    h = math.sin(d_lat / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin(d_lon / 2) ** 2
    return 2 * RADIO_TIERRA_KM * math.asin(math.sqrt(h))


def minutos_traslado(desde, hasta) -> int:
    if desde is None:
        return 0
    return math.ceil(distancia_km(desde, hasta) * MINUTOS_TRASLADO_POR_KM)


def generar_ruta(candidatos: list, minutos_disponibles: int, presupuesto_clp: int, cantidad: int) -> ResultadoRuta:
    """Arma una ruta de hasta `cantidad` lugares con un algoritmo goloso (greedy).

    1. Ordena los candidatos: primero los más baratos (empate: el de menor id).
    2. La primera parada es el primer candidato que cabe.
    3. Desde ahí, siempre agrega el lugar MÁS CERCANO que todavía cabe
       en el tiempo (visita + traslado) y en el presupuesto que quedan.
    4. Se detiene al llegar a la cantidad pedida o cuando ya nada cabe.
    """
    pendientes = sorted(candidatos, key=lambda lugar: (lugar.costo_clp, lugar.id))
    resultado = ResultadoRuta()
    minutos_restantes = minutos_disponibles
    dinero_restante = presupuesto_clp
    actual = None

    while pendientes and len(resultado.paradas) < cantidad:
        elegido = None
        mejor_traslado = None

        for lugar in pendientes:
            traslado = minutos_traslado(actual, lugar)
            cabe = (traslado + lugar.duracion_min <= minutos_restantes) and (lugar.costo_clp <= dinero_restante)
            if not cabe:
                continue
            if actual is None:
                # Primera parada: el primero de la lista ordenada que cabe
                elegido, mejor_traslado = lugar, 0
                break
            if mejor_traslado is None or traslado < mejor_traslado:
                elegido, mejor_traslado = lugar, traslado

        if elegido is None:
            break  # ya no cabe ningún lugar

        pendientes.remove(elegido)
        minutos_restantes -= mejor_traslado + elegido.duracion_min
        dinero_restante -= elegido.costo_clp
        resultado.paradas.append(Parada(orden=len(resultado.paradas) + 1, lugar=elegido, traslado_min=mejor_traslado))
        actual = elegido

    resultado.duracion_total_min = minutos_disponibles - minutos_restantes
    resultado.costo_total_clp = presupuesto_clp - dinero_restante
    return resultado


def calcular_itinerario(lugares_en_orden: list) -> ResultadoRuta:
    """Calcula traslados y totales de una ruta que ya viene ordenada (no reordena ni filtra).

    Se usa al guardar o editar una ruta: el servidor recalcula los totales
    en vez de confiar en lo que mande el cliente.
    """
    resultado = ResultadoRuta()
    anterior = None
    for orden, lugar in enumerate(lugares_en_orden, start=1):
        traslado = minutos_traslado(anterior, lugar)
        resultado.paradas.append(Parada(orden=orden, lugar=lugar, traslado_min=traslado))
        resultado.duracion_total_min += traslado + lugar.duracion_min
        resultado.costo_total_clp += lugar.costo_clp
        anterior = lugar
    return resultado
