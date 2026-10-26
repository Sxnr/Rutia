// Cliente HTTP de la app: el ÚNICO lugar que hace fetch.
// Agrega el idioma (Accept-Language), un tiempo máximo de espera y convierte
// cualquier problema en un ErrorApi con el mismo formato que usa el backend:
//   { error: { codigo, mensaje, detalles } }
// No depende de React Native: se prueba con Node contra el backend real.

export class ErrorApi extends Error {
  constructor({ status, codigo, mensaje, detalles = [] }) {
    super(mensaje || codigo)
    this.name = 'ErrorApi'
    this.status = status // 0 = no hubo respuesta del servidor
    this.codigo = codigo // ej: "LUGAR_NO_ENCONTRADO", "SIN_CONEXION"
    this.mensaje = mensaje // texto del backend, ya traducido (null si no hubo respuesta)
    this.detalles = detalles // errores por campo en un 422
  }
}

export function crearCliente({ baseUrl, obtenerIdioma = () => 'es', tiempoMaximoMs = 12000, fetchImpl = globalThis.fetch }) {
  async function pedir(metodo, ruta, cuerpo) {
    const controlador = new AbortController()
    const temporizador = setTimeout(() => controlador.abort(), tiempoMaximoMs)
    let respuesta
    try {
      respuesta = await fetchImpl(`${baseUrl}${ruta}`, {
        method: metodo,
        headers: {
          Accept: 'application/json',
          'Accept-Language': obtenerIdioma(),
          ...(cuerpo !== undefined ? { 'Content-Type': 'application/json' } : {}),
        },
        body: cuerpo !== undefined ? JSON.stringify(cuerpo) : undefined,
        signal: controlador.signal,
      })
    } catch (error) {
      const codigo = error?.name === 'AbortError' ? 'SIN_RESPUESTA' : 'SIN_CONEXION'
      throw new ErrorApi({ status: 0, codigo, mensaje: null })
    } finally {
      clearTimeout(temporizador)
    }

    if (respuesta.status === 204) return null
    const datos = await respuesta.json().catch(() => null)
    if (!respuesta.ok) {
      const error = datos?.error ?? {}
      throw new ErrorApi({
        status: respuesta.status,
        codigo: error.codigo ?? `HTTP_${respuesta.status}`,
        mensaje: error.mensaje ?? null,
        detalles: error.detalles ?? [],
      })
    }
    return datos
  }

  return {
    get: (ruta) => pedir('GET', ruta),
    post: (ruta, cuerpo) => pedir('POST', ruta, cuerpo ?? {}),
    put: (ruta, cuerpo) => pedir('PUT', ruta, cuerpo ?? {}),
    delete: (ruta) => pedir('DELETE', ruta),
  }
}
