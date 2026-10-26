// Convierte cualquier error en un texto para mostrar al usuario.
// - Si la API respondió, su mensaje ya viene en el idioma pedido (Accept-Language).
// - Si no hubo respuesta (sin red, backend apagado), se usa un texto de la app.

export function mensajeDeError(error, t) {
  if (!error) return ''
  if (error.mensaje) return error.mensaje
  if (error.codigo === 'SIN_CONEXION') return t('errores.sinConexion')
  if (error.codigo === 'SIN_RESPUESTA') return t('errores.sinRespuesta')
  return t('errores.inesperado')
}
