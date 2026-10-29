"""Límite simple de intentos fallidos (protección contra fuerza bruta en el login).

Regla: si un correo acumula MAXIMO_FALLOS contraseñas incorrectas dentro de
VENTANA_SEGUNDOS, se bloquea hasta que pase la ventana (HTTP 429).
Un login correcto borra los fallos de ese correo.

Limitación declarada: los intentos se guardan en la memoria del servidor, así que
se reinician si el servidor se reinicia. Para varios servidores habría que guardarlos
en la base o en un servicio como Redis (Hito 3 o más adelante).
"""
import threading
import time

from app.core.errores import DemasiadosIntentos

MAXIMO_FALLOS = 5
VENTANA_SEGUNDOS = 15 * 60


class LimitadorIntentos:
    def __init__(self, maximo_fallos: int = MAXIMO_FALLOS, ventana_segundos: int = VENTANA_SEGUNDOS, reloj=time.monotonic):
        self.maximo_fallos = maximo_fallos
        self.ventana_segundos = ventana_segundos
        self.reloj = reloj  # se puede reemplazar en las pruebas para no esperar 15 minutos
        self._fallos: dict[str, list[float]] = {}
        self._candado = threading.Lock()  # FastAPI atiende peticiones en paralelo

    def _recientes(self, clave: str, ahora: float) -> list[float]:
        recientes = [t for t in self._fallos.get(clave, []) if ahora - t < self.ventana_segundos]
        self._fallos[clave] = recientes
        return recientes

    def verificar(self, clave: str) -> None:
        """Lanza DemasiadosIntentos si la clave está bloqueada."""
        with self._candado:
            ahora = self.reloj()
            recientes = self._recientes(clave, ahora)
            if len(recientes) >= self.maximo_fallos:
                espera = int(self.ventana_segundos - (ahora - recientes[0])) + 1
                raise DemasiadosIntentos("DEMASIADOS_INTENTOS", segundos_espera=espera)

    def registrar_fallo(self, clave: str) -> None:
        with self._candado:
            ahora = self.reloj()
            self._recientes(clave, ahora).append(ahora)

    def reiniciar(self, clave: str) -> None:
        with self._candado:
            self._fallos.pop(clave, None)
