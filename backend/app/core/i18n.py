"""Mensajes bilingües (español / inglés) de la API.

El idioma lo elige el cliente con la cabecera Accept-Language.
Si no viene o no es inglés, se responde en español.
"""

IDIOMAS = ("es", "en")
IDIOMA_POR_DEFECTO = "es"

MENSAJES: dict[str, dict[str, str]] = {
    # Errores de recursos
    "LUGAR_NO_ENCONTRADO": {
        "es": "No existe un lugar con id {id}.",
        "en": "There is no place with id {id}.",
    },
    "LUGAR_SLUG_DUPLICADO": {
        "es": "Ya existe un lugar con el slug '{slug}'.",
        "en": "A place with slug '{slug}' already exists.",
    },
    "LUGAR_EN_USO": {
        "es": "No se puede borrar el lugar {id} porque está en {rutas} ruta(s) guardada(s).",
        "en": "Place {id} cannot be deleted because it is in {rutas} saved route(s).",
    },
    "CATEGORIA_NO_EXISTE": {
        "es": "La categoría '{codigo}' no existe. Usa una de: {validas}.",
        "en": "Category '{codigo}' does not exist. Use one of: {validas}.",
    },
    "USUARIO_NO_ENCONTRADO": {
        "es": "No existe un usuario con id {id}.",
        "en": "There is no user with id {id}.",
    },
    "EMAIL_YA_REGISTRADO": {
        "es": "El email {email} ya está registrado.",
        "en": "The email {email} is already registered.",
    },
    "CREDENCIALES_INVALIDAS": {
        "es": "Email o contraseña incorrectos.",
        "en": "Incorrect email or password.",
    },
    "RUTA_NO_ENCONTRADA": {
        "es": "No existe una ruta con id {id}.",
        "en": "There is no route with id {id}.",
    },
    "RUTA_NO_PERTENECE": {
        "es": "La ruta {ruta_id} no pertenece al usuario {usuario_id}.",
        "en": "Route {ruta_id} does not belong to user {usuario_id}.",
    },
    "LUGARES_REPETIDOS": {
        "es": "Una ruta no puede repetir lugares: {ids}.",
        "en": "A route cannot repeat places: {ids}.",
    },
    "VISITA_NO_ENCONTRADA": {
        "es": "No existe una visita con id {id}.",
        "en": "There is no visit with id {id}.",
    },
    "CONTRASENA_INCORRECTA": {
        "es": "La contraseña no es correcta.",
        "en": "The password is not correct.",
    },
    "DEMASIADOS_INTENTOS": {
        "es": "Demasiados intentos fallidos. Espera {minutos} minuto(s) e inténtalo de nuevo.",
        "en": "Too many failed attempts. Wait {minutos} minute(s) and try again.",
    },
    # Errores generales
    "VALIDACION": {
        "es": "Revisa el formato de los datos enviados.",
        "en": "Please check the format of the data you sent.",
    },
    "RUTA_HTTP_NO_EXISTE": {
        "es": "La dirección pedida no existe en la API.",
        "en": "The requested address does not exist in the API.",
    },
    "METODO_NO_PERMITIDO": {
        "es": "Este método HTTP no está permitido en esta dirección.",
        "en": "This HTTP method is not allowed on this address.",
    },
    "ERROR_INTERNO": {
        "es": "Ocurrió un error inesperado. Inténtalo de nuevo en unos minutos.",
        "en": "An unexpected error occurred. Please try again in a few minutes.",
    },
    "BASE_NO_DISPONIBLE": {
        "es": "La base de datos no responde.",
        "en": "The database is not responding.",
    },
    # Mensajes de negocio (no son errores)
    "SIN_LUGARES_COMPATIBLES": {
        "es": "No encontramos lugares compatibles. Prueba ampliando tu tiempo o tu presupuesto.",
        "en": "We found no matching places. Try increasing your time or budget.",
    },
    "MENOS_LUGARES_QUE_LOS_BUSCADOS": {
        "es": "Con tu tiempo y presupuesto caben {caben} de los {buscados} lugares buscados.",
        "en": "With your time and budget, {caben} of the {buscados} places fit.",
    },
    "RUTA_EXCEDE_TIEMPO": {
        "es": "Con este orden la ruta supera tu tiempo disponible.",
        "en": "In this order, the route exceeds your available time.",
    },
    "RUTA_EXCEDE_PRESUPUESTO": {
        "es": "La ruta supera tu presupuesto.",
        "en": "The route exceeds your budget.",
    },
    "RUTA_EXCEDE_TIEMPO_Y_PRESUPUESTO": {
        "es": "Con este orden la ruta supera tu tiempo disponible y tu presupuesto.",
        "en": "In this order, the route exceeds your available time and your budget.",
    },
}

# Traducción de los errores de validación de Pydantic (campo por campo).
# La clave es el "type" que entrega Pydantic.
MENSAJES_VALIDACION: dict[str, dict[str, str]] = {
    "missing": {"es": "Campo obligatorio.", "en": "Field required."},
    "greater_than_equal": {"es": "Debe ser mayor o igual a {ge}.", "en": "Must be greater than or equal to {ge}."},
    "greater_than": {"es": "Debe ser mayor que {gt}.", "en": "Must be greater than {gt}."},
    "less_than_equal": {"es": "Debe ser menor o igual a {le}.", "en": "Must be less than or equal to {le}."},
    "less_than": {"es": "Debe ser menor que {lt}.", "en": "Must be less than {lt}."},
    "string_too_short": {"es": "Debe tener al menos {min_length} caracter(es).", "en": "Must have at least {min_length} character(s)."},
    "string_too_long": {"es": "Debe tener como máximo {max_length} caracteres.", "en": "Must have at most {max_length} characters."},
    "too_short": {"es": "Debe tener al menos {min_length} elemento(s).", "en": "Must have at least {min_length} item(s)."},
    "too_long": {"es": "Debe tener como máximo {max_length} elementos.", "en": "Must have at most {max_length} items."},
    "int_parsing": {"es": "Debe ser un número entero.", "en": "Must be an integer."},
    "int_type": {"es": "Debe ser un número entero.", "en": "Must be an integer."},
    "int_from_float": {"es": "Debe ser un número entero, sin decimales.", "en": "Must be a whole number."},
    "float_parsing": {"es": "Debe ser un número.", "en": "Must be a number."},
    "float_type": {"es": "Debe ser un número.", "en": "Must be a number."},
    "bool_parsing": {"es": "Debe ser true o false.", "en": "Must be true or false."},
    "string_type": {"es": "Debe ser un texto.", "en": "Must be a string."},
    "list_type": {"es": "Debe ser una lista.", "en": "Must be a list."},
    "string_pattern_mismatch": {"es": "El formato no es válido.", "en": "Invalid format."},
    "literal_error": {"es": "Valor no permitido. Opciones: {expected}.", "en": "Value not allowed. Options: {expected}."},
    "date_from_datetime_parsing": {"es": "Debe ser una fecha AAAA-MM-DD.", "en": "Must be a date YYYY-MM-DD."},
    "date_parsing": {"es": "Debe ser una fecha AAAA-MM-DD.", "en": "Must be a date YYYY-MM-DD."},
    "json_invalid": {"es": "El cuerpo no es un JSON válido.", "en": "The body is not valid JSON."},
    "model_attributes_type": {"es": "Debe ser un objeto JSON.", "en": "Must be a JSON object."},
    "dict_type": {"es": "Debe ser un objeto JSON.", "en": "Must be a JSON object."},
    "extra_forbidden": {"es": "Campo no permitido.", "en": "Field not allowed."},
    "value_error": {"es": "Valor no válido.", "en": "Invalid value."},
}


def idioma_desde_cabecera(accept_language: str | None) -> str:
    """Convierte 'en-US,en;q=0.9' en 'en'. Cualquier otro caso → 'es'."""
    if not accept_language:
        return IDIOMA_POR_DEFECTO
    primero = accept_language.split(",")[0].strip().lower()[:2]
    return primero if primero in IDIOMAS else IDIOMA_POR_DEFECTO


def mensaje(codigo: str, idioma: str, /, **datos) -> str:
    plantillas = MENSAJES.get(codigo, MENSAJES["ERROR_INTERNO"])
    texto = plantillas.get(idioma, plantillas[IDIOMA_POR_DEFECTO])
    try:
        return texto.format(**datos)
    except (KeyError, IndexError):
        return texto


def _limpiar(valor):
    """0.0 → 0 y 1000000 → 1000000: los límites se muestran como los escribiría una persona."""
    return int(valor) if isinstance(valor, float) and valor.is_integer() else valor


def mensaje_validacion(tipo: str, idioma: str, contexto: dict | None, por_defecto: str) -> str:
    plantillas = MENSAJES_VALIDACION.get(tipo)
    if not plantillas:
        return por_defecto if idioma == "en" else "Valor no válido."
    datos = {clave: _limpiar(valor) for clave, valor in (contexto or {}).items()}
    try:
        return plantillas[idioma].format(**datos)
    except (KeyError, IndexError):
        return plantillas[idioma]
