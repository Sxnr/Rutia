// Instancia única de la API para toda la app.
// El idioma lo actualiza ProveedorIdioma; cada petición lo envía en Accept-Language.
import { API_URL } from '../config'
import { crearCliente } from './cliente'
import { crearApiRutia } from './rutia'

let idiomaActual = 'es'

export function establecerIdiomaApi(idioma) {
  idiomaActual = idioma
}

export const api = crearApiRutia(crearCliente({ baseUrl: API_URL, obtenerIdioma: () => idiomaActual }))

export { API_URL }
export { ErrorApi } from './cliente'
