import { validarPreferencias, validarParadas } from './routeSchema.js'
import { motorDeFiltrado, recalcularItinerarioController } from './controller.js'
import { listarLugares } from '../business/routeService.js'
import { logPaso } from '../../shared/debug.js'

// Capa Servidor: Enrutador (Express) - sin Nginx/PM2, directo
// Flujo: HTTP POST /api/rutas/sugerir => Router -> Validator -> Controller
export async function postRutaSugerir(body) {
  // 1. Router recibe
  // 2. Validator (Zod)
  const parsed = validarPreferencias(body)
  logPaso(3, 'Capa de presentación', 'Recibe la solicitud y verifica tiempo, presupuesto e intereses', {
    router: 'POST /api/v1/routes/generate',
    validator: parsed.success ? 'OK' : 'inválido',
    detalle: parsed.success ? undefined : parsed.error.issues?.[0]?.message,
  })
  if (!parsed.success) {
    const err = new Error(parsed.error.issues?.[0]?.message || "Revisa el formulario")
    err.status = 400
    err.details = parsed.error.flatten()
    throw err
  }

  // 3. Controller (Motor de Filtrado)
  const itinerario = await motorDeFiltrado(parsed.data)

  // 4. Repo -> ODM ya dentro del controller
  // 5. Router arma HTTP 200 JSON (sin Nginx)
  logPaso(9, 'Capa de presentación', 'Escribe la ruta en formato JSON y envía la respuesta a la aplicación', {
    controller: 'motorDeFiltrado', http: 200,
  })
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

// Recálculo de ruta ya armada: Router -> Validator -> Controller(negocio->datos)
export async function postRutaRecalcular(body) {
  const parsed = validarParadas(body)
  if (!parsed.success) {
    const err = new Error("Validación fallida")
    err.status = 400
    err.details = parsed.error.flatten()
    throw err
  }
  const itinerario = await recalcularItinerarioController(parsed.data)
  return { status: 200, data: itinerario }
}

// Listado de lugares: Router -> negocio -> datos
export async function getLugares() {
  const lugares = await listarLugares()
  return { status: 200, data: lugares }
}
