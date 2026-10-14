import { validarPreferencias } from './routeSchema.js'
import { motorDeFiltrado } from './controller.js'

// Capa Servidor: Enrutador (Express) - sin Nginx/PM2, directo
// Flujo: HTTP POST /api/rutas/sugerir => Router -> Validator -> Controller
export async function postRutaSugerir(body) {
  // 1. Router recibe
  // 2. Validator (Zod)
  const parsed = validarPreferencias(body)
  if (!parsed.success) {
    const err = new Error("Validación fallida")
    err.status = 400
    err.details = parsed.error.flatten()
    throw err
  }

  // 3. Controller (Motor de Filtrado)
  const itinerario = await motorDeFiltrado(parsed.data)

  // 4. Repo -> ODM ya dentro del controller
  // 5. Router arma HTTP 200 JSON (sin Nginx)
  return {
    status: 200,
    data: itinerario
  }
}

export async function getPoiDetalle(id) {
  const { poisRepository } = await import('../data/repository.js')
  const poi = await poisRepository.findById(id)
  if (!poi) {
    const e = new Error("POI no encontrado")
    e.status = 404
    throw e
  }
  return { status: 200, data: poi }
}
