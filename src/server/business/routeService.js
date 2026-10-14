/**
 * routeService.js — CAPA DE NEGOCIO (Servicio de Rutas)
 * Responsabilidad: decidir CÓMO se arma la ruta sugerida.
 *  - NO conoce HTTP (no usa req, res).
 *  - NO conoce MongoDB (pide datos al repositorio).
 * Adaptado al prototipo: campos reales son id, categoria, costo, tiempoMin, coords, imagen.
 */
import { poisRepository } from '../data/repository.js'

const MINUTOS_TRASLADO_POR_KM = 15
const MAX_PARADAS = 6

function toLonLat(poi) {
  // prototipo usa coords: [lat, lon]  → GeoJSON necesita [lon, lat]
  if (poi.ubicacion?.coordinates) return poi.ubicacion.coordinates
  if (Array.isArray(poi.coords)) return [poi.coords[1], poi.coords[0]]
  return null
}

function distanciaKm(a, b) {
  const ca = toLonLat(a)
  const cb = toLonLat(b)
  if (!ca || !cb) return 0
  const [lon1, lat1] = ca
  const [lon2, lat2] = cb
  const rad = (g) => (g * Math.PI) / 180
  const dLat = rad(lat2 - lat1)
  const dLon = rad(lon2 - lon1)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLon / 2) ** 2
  return 6371 * 2 * Math.asin(Math.sqrt(h))
}

function coincidencias(poi, intereses) {
  const categorias = Array.isArray(poi.categoria) ? poi.categoria : [poi.categoria]
  return categorias.filter((c) => intereses.includes(c)).length
}

/**
 * Construye una ruta sugerida.
 * @param {{ tiempo: number, presupuesto: number, intereses: string[] }} prefs
 * @returns {Promise<{ duracionTotalMin: number, costoTotalClp: number, paradas: object[], mensaje?: string }>}
 */
export async function sugerirRuta({ tiempo, presupuesto, intereses }) {
  const minutosDisponibles = Math.round(tiempo * 60)

  const candidatos = await poisRepository.buscarCandidatos({
    intereses,
    presupuesto,
    duracionMaxMin: minutosDisponibles,
  })

  if (candidatos.length === 0) {
    return {
      duracionTotalMin: 0,
      costoTotalClp: 0,
      paradas: [],
      mensaje: 'No encontramos lugares compatibles. Prueba ampliando tu tiempo o tu presupuesto.',
    }
  }

  const pendientes = [...candidatos].sort(
    (a, b) => coincidencias(b, intereses) - coincidencias(a, intereses) || a.costo - b.costo
  )

  const paradas = []
  let minutosRestantes = minutosDisponibles
  let dineroRestante = presupuesto
  let actual = null

  while (pendientes.length > 0 && paradas.length < MAX_PARADAS) {
    let mejorIndice = -1
    let mejorCosteTiempo = Infinity

    pendientes.forEach((poi, i) => {
      const traslado = actual ? Math.ceil(distanciaKm(actual, poi) * MINUTOS_TRASLADO_POR_KM) : 0
      const tiempoNecesario = traslado + poi.tiempoMin
      const cabe = tiempoNecesario <= minutosRestantes && poi.costo <= dineroRestante
      const criterio = actual ? traslado : i
      if (cabe && criterio < mejorCosteTiempo) {
        mejorCosteTiempo = criterio
        mejorIndice = i
      }
    })

    if (mejorIndice === -1) break

    const elegido = pendientes.splice(mejorIndice, 1)[0]
    const traslado = actual ? Math.ceil(distanciaKm(actual, elegido) * MINUTOS_TRASLADO_POR_KM) : 0

    minutosRestantes -= traslado + elegido.tiempoMin
    dineroRestante -= elegido.costo
    paradas.push({
      orden: paradas.length + 1,
      poiId: String(elegido.id),
      nombre: elegido.nombre,
      duracionMin: elegido.tiempoMin,
      trasladoMin: traslado,
      costoClp: elegido.costo,
      // preserva datos del POI para enriquecer en controller
      _poi: elegido,
    })
    actual = elegido
  }

  return {
    duracionTotalMin: minutosDisponibles - minutosRestantes,
    costoTotalClp: presupuesto - dineroRestante,
    paradas,
  }
}

/**
 * Recalcula duración (incluye traslados por coordenadas reales) y costo
 * de una ruta ya armada, reconsultando cada lugar en la capa de datos.
 * NO filtra ni ordena: respeta el orden de `paradas` recibido.
 * @param {{ paradas: Array<{ id: string }> }} params paradas en orden (solo se usa el id)
 * @returns {Promise<{ duracionTotalMin: number, costoTotalClp: number, paradas: object[] }>}
 */
export async function recalcularItinerario({ paradas }) {
  const pois = []
  for (const p of paradas) {
    const id = typeof p === 'string' ? p : (p.id || p.poiId)
    const poi = await poisRepository.findById(id) // capa de datos
    if (poi) pois.push(poi)
  }

  const paradasOut = []
  let minutosTotales = 0
  let costoTotal = 0
  let anterior = null

  for (let i = 0; i < pois.length; i++) {
    const poi = pois[i]
    const traslado = anterior ? Math.ceil(distanciaKm(anterior, poi) * MINUTOS_TRASLADO_POR_KM) : 0
    minutosTotales += traslado + poi.tiempoMin
    costoTotal += poi.costo
    paradasOut.push({
      orden: i + 1,
      poiId: String(poi.id),
      nombre: poi.nombre,
      duracionMin: poi.tiempoMin,
      trasladoMin: traslado,
      costoClp: poi.costo,
      _poi: poi,
    })
    anterior = poi
  }

  return { duracionTotalMin: minutosTotales, costoTotalClp: costoTotal, paradas: paradasOut }
}

// Listado simple de lugares (la capa de negocio consulta a la de datos)
export async function listarLugares() {
  return poisRepository.findAll()
}

export { distanciaKm }
