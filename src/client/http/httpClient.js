import { postRutaSugerir, postRutaRecalcular, getPoiDetalle, getLugares } from '../../server/presentation/router.js'

// Capa Cliente: Cliente HTTP simulado (sin backend real ni Axios)
// UI -> State -> HTTP == mock POST/GET ==> Router (según Arq. Técnica sin Infra)

// Latencia simulada de red
const LATENCIA_MS = 90
const espera = (ms = LATENCIA_MS) => new Promise(r => setTimeout(r, ms))

// Mock adapter: rutea cada URL al Router simulado de la capa de presentación
async function mockPost(url, data) {
  await espera()
  if (url.includes("/api/v1/routes/generate")) return postRutaSugerir(data)
  if (url.includes("/api/v1/routes/recalculate")) return postRutaRecalcular(data)
  throw new Error("Ruta no mockeada: " + url)
}
async function mockGet(url) {
  await espera()
  if (url.includes("/api/v1/places")) return getLugares()
  if (url.includes("/pois/")) {
    const id = url.split("/").pop()
    return getPoiDetalle(id)
  }
  throw new Error("GET no mockeado: " + url)
}

export const api = {
  // 1. Petición POST al Router (sin Nginx)
  async sugerirRuta(preferencias) {
    const res = await mockPost("/api/v1/routes/generate", preferencias)
    // 7. Respuesta -> HTTP -> State -> UI
    return res.data
  },
  // Recalcula duración y costo de una ruta ya armada (capa de negocio)
  async recalcularRuta(ids) {
    const res = await mockPost("/api/v1/routes/recalculate", { paradas: ids.map(id => ({ id })) })
    return res.data
  },
  async listarLugares() {
    const res = await mockGet("/api/v1/places")
    return res.data
  },
  async getPoi(id) {
    const res = await mockGet(`/pois/${id}`)
    return res.data
  },
}
