"""Excepciones de dominio de Rutia.

La capa de negocio lanza estas excepciones SIN saber nada de HTTP.
La capa de presentación (app/presentation/manejadores_error.py) decide
qué código HTTP corresponde a cada una.
"""


class ErrorRutia(Exception):
    """Error de negocio con un código estable y datos para armar el mensaje."""

    # La "/" hace que codigo sea solo posicional, así un dato también puede llamarse "codigo"
    def __init__(self, codigo: str, /, **datos):
        super().__init__(codigo)
        self.codigo = codigo  # ej: "LUGAR_NO_ENCONTRADO" (clave en app/core/i18n.py)
        self.datos = datos    # ej: {"id": 7}, se usa para completar el mensaje


class NoEncontrado(ErrorRutia):
    """El recurso pedido no existe."""


class Conflicto(ErrorRutia):
    """La operación choca con el estado actual (dato duplicado, recurso en uso)."""


class DatosInvalidos(ErrorRutia):
    """Los datos tienen el formato correcto pero no cumplen una regla de negocio."""


class NoAutorizado(ErrorRutia):
    """Credenciales incorrectas."""
