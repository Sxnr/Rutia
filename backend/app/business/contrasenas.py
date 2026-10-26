"""Hash de contraseñas con PBKDF2-SHA256 (biblioteca estándar de Python).

Nunca se guarda la contraseña: se guarda "pbkdf2_sha256$iteraciones$sal$hash".
- La sal es aleatoria por usuario: dos contraseñas iguales dan hashes distintos.
- 600.000 iteraciones es lo que recomienda OWASP (2023) para PBKDF2-SHA256,
  y hace muy lento probar contraseñas por fuerza bruta.
"""
import base64
import hashlib
import hmac
import secrets

ALGORITMO = "pbkdf2_sha256"
ITERACIONES = 600_000
BYTES_SAL = 16


def _b64(datos: bytes) -> str:
    return base64.b64encode(datos).decode("ascii")


def hashear(contrasena: str) -> str:
    sal = secrets.token_bytes(BYTES_SAL)
    digest = hashlib.pbkdf2_hmac("sha256", contrasena.encode("utf-8"), sal, ITERACIONES)
    return f"{ALGORITMO}${ITERACIONES}${_b64(sal)}${_b64(digest)}"


def verificar(contrasena: str, guardado: str) -> bool:
    try:
        algoritmo, iteraciones, sal_b64, digest_b64 = guardado.split("$")
    except ValueError:
        return False
    if algoritmo != ALGORITMO:
        return False
    sal = base64.b64decode(sal_b64)
    esperado = base64.b64decode(digest_b64)
    calculado = hashlib.pbkdf2_hmac("sha256", contrasena.encode("utf-8"), sal, int(iteraciones))
    # compare_digest compara en tiempo constante (evita ataques por tiempo de respuesta)
    return hmac.compare_digest(calculado, esperado)
